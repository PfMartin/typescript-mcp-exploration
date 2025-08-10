import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'Test',
  version: '1.0',
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
});

const main = async () => {
  const transport = new StdioServerTransport();

  await server.connect(transport);
};

main();
