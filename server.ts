import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs/promises';

const server = new McpServer({
  name: 'Test',
  version: '1.0',
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
});

server.tool(
  'create-user',
  'Create a new user in the database',
  {
    name: z.string(),
    email: z.string(),
    address: z.string(),
    phone: z.string(),
  },
  {
    title: 'Create User',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true, // External database
  },
  async (params) => {
    try {
      const id = await createUser(params);

      console.log(id);

      return {
        content: [{ type: 'text', text: `User ${id} created successfully` }],
      };
    } catch (err: unknown) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to save user ${err as string}`,
          },
        ],
      };
    }
  },
);

const createUser = async (user: {
  name: string;
  email: string;
  address: string;
  phone: string;
}) => {
  const usersFilePath = './data/users.json';

  const users = await import(usersFilePath, {
    with: { type: 'json' },
  }).then((m) => m.default);

  const id = users.length + 1;

  users.push({ id, ...user });

  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

  return id;
};

const main = async () => {
  const transport = new StdioServerTransport();

  await server.connect(transport);
};

main();
