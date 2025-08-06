import { MCPServer } from "mcp-framework";

export * from "../common/types";

const githubToken = process.env.GITHUB_TOKEN;
if (!githubToken) {
  throw new Error("GITHUB_TOKEN environment variable is required");
}

const server = new MCPServer({
  name: "sablier-mcp-server",
  transport: {
    type: "stdio",
  },
  version: "1.0.0",
});

server.start().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await server.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await server.stop();
  process.exit(0);
});
