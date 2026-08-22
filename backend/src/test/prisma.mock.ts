import { jest } from '@jest/globals';

function modelMock() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };
}

export function createPrismaMock() {
  const models = {
    user: modelMock(),
    board: modelMock(),
    column: modelMock(),
    task: modelMock(),
    activity: modelMock(),
    refreshToken: modelMock(),
  };

  const prisma = {
    ...models,
    $transaction: jest.fn((arg: unknown) =>
      typeof arg === 'function'
        ? (arg as (tx: typeof prisma) => unknown)(prisma)
        : Promise.all(arg as unknown[]),
    ),
  };

  return prisma as unknown as typeof models & {
    $transaction: jest.Mock;
  };
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;
