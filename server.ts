import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const server = new McpServer({
  name: 'Test',
  version: '1.0',
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
});

console.log(server);
