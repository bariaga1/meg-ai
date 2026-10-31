import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const agentBin = fileURLToPath(
  new URL("../node_modules/@grok/agent-sdk/dist/bin/agent-serve.js", import.meta.url),
);

const agent = spawn(
  process.execPath,
  [
    agentBin,
    "serve",
    "--dir",
    ".",
    "--mode",
    "single",
    "--dev",
    "--port",
    "3001",
    "--allow-anonymous",
  ],
  { stdio: "inherit" },
);

const next = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  env: {
    ...process.env,
    AGENT_BASE_URL: process.env.AGENT_BASE_URL?.trim() || "http://127.0.0.1:3001",
  },
});

let stopping = false;

function stop() {
  if (stopping) return;
  stopping = true;
  agent.kill("SIGTERM");
  next.kill("SIGTERM");
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

function finish(code) {
  stop();
  process.exit(code ?? 0);
}

agent.on("exit", (code) => {
  if (!stopping) finish(code);
});
next.on("exit", (code) => {
  if (!stopping) finish(code);
});
