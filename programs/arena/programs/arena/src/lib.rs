use anchor_lang::prelude::*;

declare_id!("ArenaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod arena {
    use super::*;

    /// Register a new trading agent on-chain
    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        name: String,
        strategy: String,
        skills: Vec<String>,
        risk_tolerance: u8,
        max_drawdown_bps: u16,
        max_trade_size_bps: u16,
        creator_fee_bps: u16,
    ) -> Result<()> {
        require!(name.len() <= 32, ArenaError::NameTooLong);
        require!(skills.len() <= 8, ArenaError::TooManySkills);
        require!(risk_tolerance <= 10, ArenaError::InvalidRiskTolerance);
        require!(max_drawdown_bps <= 10000, ArenaError::InvalidBps);
        require!(max_trade_size_bps <= 5000, ArenaError::InvalidBps);
        require!(creator_fee_bps <= 3000, ArenaError::FeeTooHigh); // max 30%

        let agent = &mut ctx.accounts.agent;
        agent.authority = ctx.accounts.creator.key();
        agent.name = name;
        agent.strategy = strategy;
        agent.skills = skills;
        agent.risk_tolerance = risk_tolerance;
        agent.max_drawdown_bps = max_drawdown_bps;
        agent.max_trade_size_bps = max_trade_size_bps;
        agent.creator_fee_bps = creator_fee_bps;
        agent.total_deposited = 0;
        agent.current_value = 0;
        agent.total_pnl = 0;
        agent.trade_count = 0;
        agent.investor_count = 0;
        agent.is_active = true;
        agent.created_at = Clock::get()?.unix_timestamp;
        agent.bump = ctx.bumps.agent;

        Ok(())
    }

    /// Investor deposits SOL into an agent's vault
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, ArenaError::ZeroAmount);
        require!(ctx.accounts.agent.is_active, ArenaError::AgentInactive);

        // Transfer SOL from investor to vault
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.investor.key(),
            &ctx.accounts.vault.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.investor.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update investor position
        let position = &mut ctx.accounts.position;
        if position.deposited == 0 {
            position.investor = ctx.accounts.investor.key();
            position.agent = ctx.accounts.agent.key();
            position.bump = ctx.bumps.position;

            let agent = &mut ctx.accounts.agent;
            agent.investor_count += 1;
        }
        position.deposited += amount;
        position.last_deposit_at = Clock::get()?.unix_timestamp;

        // Update agent totals
        let agent = &mut ctx.accounts.agent;
        agent.total_deposited += amount;
        agent.current_value += amount;

        Ok(())
    }

    /// Investor withdraws SOL from an agent's vault
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, ArenaError::ZeroAmount);

        let position = &mut ctx.accounts.position;
        require!(position.deposited >= amount, ArenaError::InsufficientFunds);

        // Calculate proportional share of vault value
        let agent = &ctx.accounts.agent;
        let share = (amount as u128)
            .checked_mul(agent.current_value as u128)
            .unwrap()
            .checked_div(agent.total_deposited as u128)
            .unwrap() as u64;

        // Transfer from vault to investor
        let agent_key = ctx.accounts.agent.key();
        let seeds = &[
            b"vault",
            agent_key.as_ref(),
            &[ctx.accounts.vault.bump],
        ];
        let signer = &[&seeds[..]];

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= share;
        **ctx.accounts.investor.to_account_info().try_borrow_mut_lamports()? += share;

        // Update position
        position.deposited -= amount;

        // Update agent
        let agent = &mut ctx.accounts.agent;
        agent.total_deposited -= amount;
        agent.current_value -= share;
        if position.deposited == 0 {
            agent.investor_count -= 1;
        }

        Ok(())
    }

    /// Record a trade (called by agent's Privy wallet via backend)
    pub fn record_trade(
        ctx: Context<RecordTrade>,
        pnl: i64,
        skill_used: String,
        tx_signature: String,
    ) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        require!(
            ctx.accounts.authority.key() == agent.authority,
            ArenaError::Unauthorized
        );

        agent.trade_count += 1;
        agent.total_pnl += pnl;

        // Update current value based on PnL
        if pnl >= 0 {
            agent.current_value += pnl as u64;
        } else {
            let loss = (-pnl) as u64;
            agent.current_value = agent.current_value.saturating_sub(loss);
        }

        // Emit trade event
        emit!(TradeRecorded {
            agent: agent.key(),
            pnl,
            skill_used,
            tx_signature,
            trade_number: agent.trade_count,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Halt agent trading (emergency stop)
    pub fn halt_agent(ctx: Context<HaltAgent>) -> Result<()> {
        let agent = &mut ctx.accounts.agent;
        require!(
            ctx.accounts.authority.key() == agent.authority,
            ArenaError::Unauthorized
        );
        agent.is_active = false;
        Ok(())
    }
}

// ── Accounts ──

#[derive(Accounts)]
#[instruction(name: String)]
pub struct RegisterAgent<'info> {
    #[account(
        init,
        payer = creator,
        space = AgentAccount::SPACE,
        seeds = [b"agent", creator.key().as_ref(), name.as_bytes()],
        bump,
    )]
    pub agent: Account<'info, AgentAccount>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub agent: Account<'info, AgentAccount>,
    #[account(
        init_if_needed,
        payer = investor,
        space = InvestorPosition::SPACE,
        seeds = [b"position", agent.key().as_ref(), investor.key().as_ref()],
        bump,
    )]
    pub position: Account<'info, InvestorPosition>,
    #[account(
        mut,
        seeds = [b"vault", agent.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub investor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub agent: Account<'info, AgentAccount>,
    #[account(
        mut,
        seeds = [b"position", agent.key().as_ref(), investor.key().as_ref()],
        bump = position.bump,
    )]
    pub position: Account<'info, InvestorPosition>,
    #[account(
        mut,
        seeds = [b"vault", agent.key().as_ref()],
        bump = vault.bump,
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub investor: Signer<'info>,
}

#[derive(Accounts)]
pub struct RecordTrade<'info> {
    #[account(mut)]
    pub agent: Account<'info, AgentAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct HaltAgent<'info> {
    #[account(mut)]
    pub agent: Account<'info, AgentAccount>,
    pub authority: Signer<'info>,
}

// ── State ──

#[account]
pub struct AgentAccount {
    pub authority: Pubkey,
    pub name: String,
    pub strategy: String,
    pub skills: Vec<String>,
    pub risk_tolerance: u8,
    pub max_drawdown_bps: u16,
    pub max_trade_size_bps: u16,
    pub creator_fee_bps: u16,
    pub total_deposited: u64,
    pub current_value: u64,
    pub total_pnl: i64,
    pub trade_count: u64,
    pub investor_count: u32,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl AgentAccount {
    pub const SPACE: usize = 8  // discriminator
        + 32  // authority
        + (4 + 32)  // name
        + (4 + 32)  // strategy
        + (4 + 8 * (4 + 16))  // skills (vec of strings)
        + 1   // risk_tolerance
        + 2   // max_drawdown_bps
        + 2   // max_trade_size_bps
        + 2   // creator_fee_bps
        + 8   // total_deposited
        + 8   // current_value
        + 8   // total_pnl
        + 8   // trade_count
        + 4   // investor_count
        + 1   // is_active
        + 8   // created_at
        + 1;  // bump
}

#[account]
pub struct InvestorPosition {
    pub investor: Pubkey,
    pub agent: Pubkey,
    pub deposited: u64,
    pub last_deposit_at: i64,
    pub bump: u8,
}

impl InvestorPosition {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 8 + 1;
}

#[account]
pub struct VaultAccount {
    pub agent: Pubkey,
    pub bump: u8,
}

impl VaultAccount {
    pub const SPACE: usize = 8 + 32 + 1;
}

// ── Events ──

#[event]
pub struct TradeRecorded {
    pub agent: Pubkey,
    pub pnl: i64,
    pub skill_used: String,
    pub tx_signature: String,
    pub trade_number: u64,
    pub timestamp: i64,
}

// ── Errors ──

#[error_code]
pub enum ArenaError {
    #[msg("Agent name must be 32 characters or less")]
    NameTooLong,
    #[msg("Maximum 8 skills allowed")]
    TooManySkills,
    #[msg("Risk tolerance must be between 0 and 10")]
    InvalidRiskTolerance,
    #[msg("Invalid basis points value")]
    InvalidBps,
    #[msg("Creator fee cannot exceed 30%")]
    FeeTooHigh,
    #[msg("Deposit amount must be greater than zero")]
    ZeroAmount,
    #[msg("Agent is not currently active")]
    AgentInactive,
    #[msg("Insufficient funds to withdraw")]
    InsufficientFunds,
    #[msg("Unauthorized action")]
    Unauthorized,
}
