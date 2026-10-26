// Configuración de Prisma 7. El CLI la autocarga.
// Acá vive la URL de conexión (se lee del .env vía dotenv), que ya no va en el schema.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
