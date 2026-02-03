"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AVAILABLE_SKILLS = [
  { id: "swap", name: "Token Swap", icon: "\u21C4", color: "blue" },
  { id: "stake", name: "Liquid Staking", icon: "\u2630", color: "green" },
  { id: "lend", name: "Lending", icon: "\u26F7", color: "purple" },
  { id: "lp", name: "Liquidity Provision", icon: "\u25D1", color: "cyan" },
  { id: "snipe", name: "Token Sniper", icon: "\u2316", color: "red" },
  { id: "sentiment", name: "Sentiment Analysis", icon: "\u235F", color: "yellow" },
  { id: "on-chain-intel", name: "On-Chain Intel", icon: "\u25C9", color: "orange" },
  { id: "hedge", name: "Hedge Positions", icon: "\u2694", color: "indigo" },
];

const STRATEGIES = [
  { id: "momentum", label: "momentum", desc: "follow trends, ride waves" },
  { id: "arbitrage", label: "arbitrage", desc: "capture price gaps across DEXs" },
  { id: "sentiment", label: "sentiment", desc: "trade on social signals" },
  { id: "degen", label: "degen", desc: "ape everything, no mercy" },
  { id: "custom", label: "custom", desc: "build your own playbook" },
];

const SKILL_COLORS: Record<string, string> = {
  blue: "border-blue-400/30 bg-blue-400/5 text-blue-400",
  green: "border-green-400/30 bg-green-400/5 text-green-400",
  purple: "border-purple-400/30 bg-purple-400/5 text-purple-400",
  cyan: "border-cyan-400/30 bg-cyan-400/5 text-cyan-400",
  red: "border-red-400/30 bg-red-400/5 text-red-400",
  yellow: "border-yellow-400/30 bg-yellow-400/5 text-yellow-400",
  orange: "border-orange-400/30 bg-orange-400/5 text-orange-400",
  indigo: "border-indigo-400/30 bg-indigo-400/5 text-indigo-400",
};

export default function CreateAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState("degen");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployedAgent, setDeployedAgent] = useState<{
    id: string;
    apiKey: string;
    walletAddress: string;
    status: string;
  } | null>(null);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedSkills(AVAILABLE_SKILLS.map((s) => s.id));
  };

  async function handleDeploy() {
    setDeploying(true);
    setDeployError(null);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          strategy,
          skills: selectedSkills,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setDeployError(data.error || "Failed to deploy agent");
        return;
      }

      const agent = await res.json();
      setDeployedAgent({
        id: agent.id,
        apiKey: agent.apiKey,
        walletAddress: agent.walletAddress,
        status: agent.status,
      });

      // Redirect after brief pause to show credentials
      setTimeout(() => {
        router.push(`/agent/${agent.id}`);
      }, 3000);
    } catch {
      setDeployError("Failed to deploy agent. Please try again.");
    } finally {
      setDeploying(false);
    }
  }

  // Post-deploy success screen
  if (deployedAgent) {
    return (
      <div className="mx-auto max-w-lg space-y-6 pt-8">
        <div className="rounded-lg border border-arena-accent/30 bg-arena-accent/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-arena-accent text-arena-bg font-bold text-sm">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-arena-accent">{name}</h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-arena-accent opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-arena-accent" />
                </span>
                <span className="text-xs text-arena-accent">LIVE</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="text-[10px] text-arena-muted uppercase tracking-wider mb-1">api key</div>
              <code className="block rounded bg-arena-bg border border-arena-border px-3 py-2 text-xs text-arena-text font-mono break-all">
                {deployedAgent.apiKey}
              </code>
              <p className="text-[10px] text-arena-red mt-1">save this. it won&apos;t be shown again.</p>
            </div>

            <div>
              <div className="text-[10px] text-arena-muted uppercase tracking-wider mb-1">wallet address</div>
              <code className="block rounded bg-arena-bg border border-arena-border px-3 py-2 text-xs text-arena-text font-mono break-all">
                {deployedAgent.walletAddress}
              </code>
            </div>
          </div>

          <p className="text-xs text-arena-muted text-center pt-2">
            redirecting to agent dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">deploy agent</h1>
        <p className="text-sm text-arena-muted mt-1">
          name it. arm it. launch it. no guardrails.
        </p>
      </div>

      {/* curl API docs */}
      <div className="rounded-lg border border-arena-border bg-arena-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-arena-accent uppercase tracking-wider font-semibold">agent mode</span>
          <span className="text-[10px] text-arena-muted">deploy via API</span>
        </div>
        <pre className="rounded bg-arena-bg border border-arena-border p-3 text-xs text-arena-text font-mono overflow-x-auto whitespace-pre">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/agents \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "MyAgent",
    "strategy": "degen",
    "skills": ["swap", "snipe", "sentiment"]
  }'`}
        </pre>
        <p className="text-[10px] text-arena-muted">
          returns API key + wallet address. agent starts immediately. use the API key for heartbeats.
        </p>
      </div>

      <div className="rounded-lg border border-arena-border bg-arena-card p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="text-xs text-arena-muted block mb-2">agent name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. DeathSwap, RubySniper, SentinelX"
            className="w-full rounded border border-arena-border bg-arena-bg px-3 py-2 text-sm text-arena-text placeholder:text-arena-muted/50 focus:border-arena-accent/50 focus:outline-none"
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label className="text-xs text-arena-muted block mb-2">
            description <span className="text-arena-muted/50">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="what does your agent do? leave blank for auto-generated."
            rows={2}
            className="w-full rounded border border-arena-border bg-arena-bg px-3 py-2 text-sm text-arena-text placeholder:text-arena-muted/50 focus:border-arena-accent/50 focus:outline-none resize-none"
          />
        </div>

        {/* Strategy */}
        <div>
          <label className="text-xs text-arena-muted block mb-2">strategy</label>
          <div className="grid grid-cols-5 gap-2">
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStrategy(s.id)}
                className={`rounded border p-2 text-center transition-all ${
                  strategy === s.id
                    ? "border-arena-accent/50 bg-arena-accent/5 text-arena-accent"
                    : "border-arena-border text-arena-muted hover:border-arena-accent/20"
                }`}
              >
                <div className="text-xs font-semibold">{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-arena-muted">
              skills ({selectedSkills.length}/{AVAILABLE_SKILLS.length})
            </label>
            <button
              onClick={selectAll}
              className="text-[10px] text-arena-accent hover:underline"
            >
              select all
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {AVAILABLE_SKILLS.map((skill) => (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className={`rounded-lg border p-2.5 text-center transition-all ${
                  selectedSkills.includes(skill.id)
                    ? SKILL_COLORS[skill.color]
                    : "border-arena-border text-arena-muted hover:border-arena-accent/20"
                }`}
              >
                <div className="text-lg">{skill.icon}</div>
                <div className="text-[10px] font-semibold mt-1">{skill.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Deploy error */}
        {deployError && (
          <p className="text-[10px] text-arena-red text-center">{deployError}</p>
        )}

        {/* Deploy button */}
        <button
          onClick={handleDeploy}
          disabled={deploying || !name || selectedSkills.length === 0}
          className="w-full rounded bg-arena-accent py-3 text-sm font-bold text-arena-bg transition-all hover:bg-arena-accent/90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {deploying ? "deploying..." : "deploy agent"}
        </button>

        <p className="text-[10px] text-arena-muted text-center">
          deploys instantly. generates API key + wallet. starts trading immediately.
          no risk limits. no drawdown caps. fully autonomous.
        </p>
      </div>
    </div>
  );
}
