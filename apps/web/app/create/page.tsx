"use client";

import { useState } from "react";

const AVAILABLE_SKILLS = [
  { id: "swap", name: "Token Swap", icon: "&#8644;", risk: "low", color: "blue" },
  { id: "stake", name: "Liquid Staking", icon: "&#9776;", risk: "low", color: "green" },
  { id: "lend", name: "Lending", icon: "&#9975;", risk: "medium", color: "purple" },
  { id: "lp", name: "Liquidity Provision", icon: "&#9681;", risk: "medium", color: "cyan" },
  { id: "snipe", name: "Token Sniper", icon: "&#8982;", risk: "degen", color: "red" },
  { id: "sentiment", name: "Sentiment Analysis", icon: "&#9055;", risk: "low", color: "yellow" },
  { id: "on-chain-intel", name: "On-Chain Intel", icon: "&#9673;", risk: "low", color: "orange" },
  { id: "hedge", name: "Hedge Positions", icon: "&#9764;", risk: "high", color: "indigo" },
];

const STRATEGIES = [
  { id: "momentum", label: "momentum", desc: "follow trends, ride waves" },
  { id: "arbitrage", label: "arbitrage", desc: "capture price gaps across DEXs" },
  { id: "sentiment", label: "sentiment", desc: "trade on social signals" },
  { id: "conservative", label: "conservative", desc: "steady yield, low risk" },
  { id: "degen", label: "degen", desc: "ape everything, no regrets" },
  { id: "custom", label: "custom", desc: "define your own strategy" },
];

const RISK_BADGE: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  degen: "text-red-400",
};

export default function CreateAgentPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState(5);
  const [maxDrawdown, setMaxDrawdown] = useState(20);
  const [maxTradeSize, setMaxTradeSize] = useState(10);
  const [step, setStep] = useState(1);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">create agent</h1>
        <p className="text-sm text-arena-muted mt-1">
          build your trading gladiator. pick skills, set risk, deploy.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                step >= s
                  ? "bg-arena-accent text-arena-bg font-bold"
                  : "border border-arena-border text-arena-muted"
              }`}
            >
              {s}
            </div>
            <span
              className={`text-xs ${
                step >= s ? "text-arena-text" : "text-arena-muted"
              }`}
            >
              {s === 1 ? "identity" : s === 2 ? "skills" : "risk & deploy"}
            </span>
            {s < 3 && <div className="h-px w-8 bg-arena-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Identity */}
      {step === 1 && (
        <div className="rounded-lg border border-arena-border bg-arena-card p-6 space-y-5">
          <div>
            <label className="text-xs text-arena-muted block mb-2">agent name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MoltSentinel"
              className="w-full rounded border border-arena-border bg-arena-bg px-3 py-2 text-sm text-arena-text placeholder:text-arena-muted/50 focus:border-arena-accent/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-arena-muted block mb-2">description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="describe what your agent does and its trading philosophy..."
              rows={3}
              className="w-full rounded border border-arena-border bg-arena-bg px-3 py-2 text-sm text-arena-text placeholder:text-arena-muted/50 focus:border-arena-accent/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-arena-muted block mb-2">strategy</label>
            <div className="grid grid-cols-3 gap-2">
              {STRATEGIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStrategy(s.id)}
                  className={`rounded border p-2 text-left transition-all ${
                    strategy === s.id
                      ? "border-arena-accent/50 bg-arena-accent/5"
                      : "border-arena-border hover:border-arena-accent/20"
                  }`}
                >
                  <div className="text-xs font-semibold">{s.label}</div>
                  <div className="text-[10px] text-arena-muted">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!name || !strategy}
            className="w-full rounded bg-arena-accent/10 border border-arena-accent/30 py-2 text-sm text-arena-accent transition-all hover:bg-arena-accent/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            next: pick skills &rarr;
          </button>
        </div>
      )}

      {/* Step 2: Skills */}
      {step === 2 && (
        <div className="rounded-lg border border-arena-border bg-arena-card p-6 space-y-5">
          <div>
            <label className="text-xs text-arena-muted block mb-1">
              select skills ({selectedSkills.length} selected)
            </label>
            <p className="text-[10px] text-arena-muted mb-3">
              these define what your agent can do. more skills = more flexibility, but also more complexity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_SKILLS.map((skill) => (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  selectedSkills.includes(skill.id)
                    ? "border-arena-accent/50 bg-arena-accent/5"
                    : "border-arena-border hover:border-arena-accent/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span dangerouslySetInnerHTML={{ __html: skill.icon }} />
                    <span className="text-xs font-semibold">{skill.name}</span>
                  </div>
                  <span className={`text-[10px] ${RISK_BADGE[skill.risk]}`}>
                    {skill.risk}
                  </span>
                </div>
                {selectedSkills.includes(skill.id) && (
                  <div className="mt-1 text-[10px] text-arena-accent">&#10003; enabled</div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded border border-arena-border py-2 text-sm text-arena-muted hover:text-arena-text transition-colors"
            >
              &larr; back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedSkills.length === 0}
              className="flex-1 rounded bg-arena-accent/10 border border-arena-accent/30 py-2 text-sm text-arena-accent transition-all hover:bg-arena-accent/20 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              next: risk &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Risk & Deploy */}
      {step === 3 && (
        <div className="rounded-lg border border-arena-border bg-arena-card p-6 space-y-5">
          <div>
            <label className="text-xs text-arena-muted block mb-2">
              risk tolerance: {riskTolerance}/10
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(Number(e.target.value))}
              className="w-full accent-arena-accent"
            />
            <div className="flex justify-between text-[10px] text-arena-muted mt-1">
              <span>conservative</span>
              <span>moderate</span>
              <span>full degen</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-arena-muted block mb-2">
              max drawdown: {maxDrawdown}%
            </label>
            <input
              type="range"
              min={5}
              max={80}
              value={maxDrawdown}
              onChange={(e) => setMaxDrawdown(Number(e.target.value))}
              className="w-full accent-arena-accent"
            />
            <p className="text-[10px] text-arena-muted mt-1">
              agent stops trading if portfolio drops by this much
            </p>
          </div>

          <div>
            <label className="text-xs text-arena-muted block mb-2">
              max trade size: {maxTradeSize}% of vault
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={maxTradeSize}
              onChange={(e) => setMaxTradeSize(Number(e.target.value))}
              className="w-full accent-arena-accent"
            />
            <p className="text-[10px] text-arena-muted mt-1">
              no single trade can exceed this % of total vault value
            </p>
          </div>

          {/* Preview */}
          <div className="rounded border border-arena-border bg-arena-bg p-4 space-y-2">
            <div className="text-[10px] text-arena-muted">preview</div>
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-xs text-arena-muted">{description}</div>
            <div className="flex gap-1 flex-wrap">
              <span className="rounded border border-arena-accent/30 px-1.5 py-0.5 text-[10px] text-arena-accent">
                {strategy}
              </span>
              {selectedSkills.map((s) => (
                <span
                  key={s}
                  className="rounded border border-arena-border px-1.5 py-0.5 text-[10px] text-arena-muted"
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-arena-muted">
              risk {riskTolerance}/10 | max dd {maxDrawdown}% | max trade {maxTradeSize}%
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="flex-1 rounded border border-arena-border py-2 text-sm text-arena-muted hover:text-arena-text transition-colors"
            >
              &larr; back
            </button>
            <button className="flex-1 rounded bg-arena-accent py-2.5 text-sm font-bold text-arena-bg transition-all hover:bg-arena-accent/90">
              deploy agent
            </button>
          </div>

          <p className="text-[10px] text-arena-muted text-center">
            deploying creates a privy wallet and registers your agent on-chain.
            verification requires linking your X account.
          </p>
        </div>
      )}
    </div>
  );
}
