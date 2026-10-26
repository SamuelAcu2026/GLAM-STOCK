# syntax=docker/dockerfile:1

# --- Base común: Node 24 sobre Alpine (imagen chica) ---
FROM node:24-alpine AS base
# libc6-compat ayuda a que binarios nativos (sharp) funcionen en Alpine.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- deps: instala dependencias una sola vez (se cachea si no cambian) ---
FROM base AS deps
COPY package.json package-lock.json ./
# --ignore-scripts: evita que el postinstall (prisma generate) corra sin el schema;
# la generación se hace explícita en la etapa builder, que ya tiene el código.
RUN npm ci --ignore-scripts

# --- builder: genera el cliente de Prisma y compila Next en modo standalone ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- runner: imagen final de producción, mínima y sin dependencias de build ---
FROM base AS runner
ENV NODE_ENV=production
# Usuario sin privilegios: si alguien vulnera la app, no es root dentro del contenedor.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Salida standalone de Next: trae solo lo necesario para correr (incluye el cliente Prisma).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Carpeta de imágenes subidas: se monta un volumen acá para que persistan.
RUN mkdir -p ./public/uploads && chown -R nextjs:nodejs ./public/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# server.js es el entrypoint que genera Next con output: "standalone".
CMD ["node", "server.js"]
