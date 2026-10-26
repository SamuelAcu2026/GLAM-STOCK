import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

// Cliente de Prisma como singleton.
// En desarrollo Next.js recarga módulos en caliente; sin esto se crearía una conexión
// nueva en cada recarga hasta agotar el pool de Postgres. Reutilizar la instancia en
// globalThis evita ese problema.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// En Prisma 7 el cliente necesita un driver adapter para conectarse a Postgres.
// PrismaPg acepta directamente la connection string del .env.
function createPrismaClient() {
  const adapter = new PrismaPg(process.env.DATABASE_URL as string);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
