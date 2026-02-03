use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111112");

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
        require!(strategy.len() <= 64, ArenaError::StrategyTooLong);
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

    /// Initialize the vault PDA for an agent (must be called after register_agent)
    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.agent = ctx.accounts.agent.key();
        vault.bump = ctx.bumps.vault;
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
        let is_new_investor = position.deposited == 0;
        if is_new_investor {
            position.investor = ctx.accounts.investor.key();
            position.agent = ctx.accounts.agent.key();
            position.bump = ctx.bumps.position;
        }
        position.deposited += amount;
        position.last_deposit_at = Clock::get()?.unix_timestamp;

        // Update agent totals
        let agent = &mut ctx.accounts.agent;
        if is_new_investor {
            agent.investor_count += 1;
        }
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
        let total_deposited = ctx.accounts.agent.total_deposited;
        require!(total_deposited > 0, ArenaError::InsufficientFunds);

        let current_value = ctx.accounts.agent.current_value;
        let share = (amount as u128)
            .checked_mul(current_value as u128)
            .ok_or(ArenaError::MathOverflow)?
            .checked_div(total_deposited as u128)
            .ok_or(ArenaError::MathOverflow)? as u64;

        // Transfer from vault to investor via direct lamport manipulation
        // This is safe because the vault account is owned by this program (it is an Account<VaultAccount>)
        let vault_lamports = ctx.accounts.vault.to_account_info().lamports();
        let rent = Rent::get()?;
        let min_vault_balance = rent.minimum_balance(VaultAccount::SPACE);
        require!(
            vault_lamports.saturating_sub(share) >= min_vault_balance,
            ArenaError::InsufficientFunds
        );

        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= share;
        **ctx.accounts.investor.to_account_info().try_borrow_mut_lamports()? += share;

        // Update position
        position.deposited -= amount;

        // Update agent
        let agent = &mut ctx.accounts.agent;
        agent.total_deposited -= amount;
        agent.current_value = agent.current_value.saturating_sub(share);
        if position.deposited == 0 {
            agent.investor_count = agent.investor_count.saturating_sub(1);
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
        agent.total_pnl = agent.total_pnl.saturating_add(pnl);

        // Update current value based on PnL
        if pnl >= 0 {
            agent.current_value = agent.current_value.saturating_add(pnl as u64);
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
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = VaultAccount::SPACE,
        seeds = [b"vault", agent.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(
        has_one = authority,
    )]
    pub agent: Account<'info, AgentAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
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
    /// CHECK: The vault PDA holds lamports for the agent. Seeds constraint ensures correct PDA.
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
        + (4 + 32)  // name (4-byte len prefix + max 32 chars)
        + (4 + 64)  // strategy (4-byte len prefix + max 64 chars)
        + (4 + 8 * (4 + 16))  // skills (vec len prefix + 8 items * (len prefix + 16 chars))
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
    #[msg("Strategy must be 64 characters or less")]
    StrategyTooLong,
    #[msg("Maximum 8 skills allowed")]
    TooManySkills,
    #[msg("Risk tolerance must be between 0 and 10")]
    InvalidRiskTolerance,
    #[msg("Invalid basis points value")]
    InvalidBps,
    #[msg("Creator fee cannot exceed 30%")]
    FeeTooHigh,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Agent is not currently active")]
    AgentInactive,
    #[msg("Insufficient funds to withdraw")]
    InsufficientFunds,
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Math overflow")]
    MathOverflow,
}
