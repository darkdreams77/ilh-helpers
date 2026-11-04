import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Les migrations ont besoin d'une connexion directe : le pooler Neon
    // (PgBouncer) ne supporte pas le verrou consultatif de `migrate deploy`.
    // DATABASE_URL_UNPOOLED si elle est définie, sinon DATABASE_URL sans
    // `-pooler` dans l'hôte (l'adresse directe chez Neon).
    url:
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.DATABASE_URL?.replace("-pooler.", "."),
  },
})
