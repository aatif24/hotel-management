// lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined
}


const prisma =
  global.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
       log: ['query'],
    }),
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
