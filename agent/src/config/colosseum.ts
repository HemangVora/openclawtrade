/**
 * Colosseum Hackathon integration
 * Handles heartbeat, project registration, and forum interaction
 */

const API_BASE = "https://agents.colosseum.com/api";

export class ColosseumClient {
  private apiKey: string;
  private agentId: number;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.apiKey = process.env.COLOSSEUM_API_KEY || "";
    this.agentId = Number(process.env.COLOSSEUM_AGENT_ID || "0");
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /** Send heartbeat to stay active in the hackathon */
  async heartbeat() {
    try {
      const res = await fetch(`${API_BASE}/agents/${this.agentId}/heartbeat`, {
        method: "POST",
        headers: this.headers(),
      });
      const data = await res.json();
      console.log("[colosseum] heartbeat sent", data);
      return data;
    } catch (err) {
      console.error("[colosseum] heartbeat error:", err);
    }
  }

  /** Start periodic heartbeat (every 30 minutes) */
  startHeartbeat() {
    this.heartbeat();
    this.heartbeatInterval = setInterval(() => this.heartbeat(), 30 * 60 * 1000);
    console.log("[colosseum] heartbeat loop started (every 30 min)");
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  /** Create or update the hackathon project */
  async upsertProject(project: {
    name: string;
    description: string;
    repoUrl: string;
    tags: string[];
  }) {
    const res = await fetch(`${API_BASE}/agents/${this.agentId}/projects`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(project),
    });
    const data = await res.json();
    console.log("[colosseum] project created/updated:", data);
    return data;
  }

  /** Submit the project (locks it for judging) */
  async submitProject(projectId: string) {
    const res = await fetch(
      `${API_BASE}/agents/${this.agentId}/projects/${projectId}/submit`,
      {
        method: "POST",
        headers: this.headers(),
      }
    );
    return res.json();
  }

  /** Post to the hackathon forum */
  async forumPost(post: {
    title: string;
    content: string;
    tags: string[];
  }) {
    const res = await fetch(`${API_BASE}/forum/posts`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(post),
    });
    return res.json();
  }
}
