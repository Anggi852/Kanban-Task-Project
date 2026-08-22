import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      // KITA GANTI BARIS INI SEMENTARA:
      connectionString: "postgresql://postgres:Anggi1234@localhost:5432/kanban_dev?schema=public",
    });
    super({ adapter });
  }
}