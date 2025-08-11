import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs/promises';

interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
}

const server = new McpServer({
  name: 'Test',
  version: '1.0',
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
});

server.resource(
  'users',
  'users://all',
  {
    description: 'Get all users data from the database',
    title: 'Users',
    mimeType: 'application/json',
  },
  async (uri) => {
    const usersFilePath = './data/users.json';
    const users = await import(usersFilePath, {
      with: { type: 'json' },
    }).then((m) => m.default);

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users),
          mimeType: 'application/json',
        },
      ],
    };
  },
);

server.resource(
  'user-details',
  new ResourceTemplate('users://{userId}/profile', { list: undefined }),
  {
    description: 'Get a users details from the database',
    title: 'Users Details',
    mimeType: 'application/json',
  },
  async (uri, { userId }) => {
    const usersFilePath = './data/users.json';
    const users = await import(usersFilePath, {
      with: { type: 'json' },
    }).then((m) => m.default);

    const user = users.find((u: User) => u.id === parseInt(userId as string));

    if (!user) {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({
              error: `Could not find user with id ${userId}`,
            }),
            mimeType: 'application/json',
          },
        ],
      };
    }

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(user),
          mimeType: 'application/json',
        },
      ],
    };
  },
);

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
