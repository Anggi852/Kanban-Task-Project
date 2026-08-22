/**
 * Lightweight typed-ish mock of PrismaService for unit tests. Every model
 * method is a jest.fn(), and `$transaction` supports both forms the codebase
 * uses: callback (`$transaction(async (tx) => …)`, where `tx` is this same
 * mock) and array (`$transaction([…])`).
 */
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
  const prisma = {
    user: modelMock(),
    board: modelMock(),
    column: modelMock(),
    task: modelMock(),
    activity: modelMock(),
    refreshToken: modelMock(),
  } as Record<string, ReturnType<typeof modelMock>> & {
    $transaction: jest.Mock;
  };

  prisma.$transaction = jest.fn((arg: unknown) =>
    typeof arg === 'function'
      ? (arg as (tx: typeof prisma) => unknown)(prisma)
      : Promise.all(arg as unknown[]),
  );

  return prisma;
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;
