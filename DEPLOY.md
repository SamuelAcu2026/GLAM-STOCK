# Deploy a un VPS (Docker)

Glam Stock se despliega con Docker: app (Next.js) + PostgreSQL + Caddy (HTTPS automático).

## Requisitos en el VPS
- Docker y Docker Compose instalados.
- Un dominio apuntando (registro A) al IP del VPS.
- Puertos 80 y 443 abiertos.

## Pasos

1. **Clonar el repo**
   ```bash
   git clone <url-del-repo> glam-stock && cd glam-stock
   ```

2. **Crear el `.env` de producción** a partir de la plantilla:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` y completar:
   - `POSTGRES_PASSWORD` y el mismo valor dentro de `DATABASE_URL` (host = `db`).
   - `AUTH_SECRET` → generar con `openssl rand -base64 33`.
   - `AUTH_URL` y `DOMAIN` → tu dominio (ej: `https://stock.midominio.com`).
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` / `ALLOWED_EMAILS`.
   - `TLS_EMAIL` → tu email (Let's Encrypt).

3. **En Google Cloud Console**, agregar el redirect URI de producción al cliente OAuth:
   ```
   https://TU-DOMINIO/api/auth/callback/google
   ```

4. **Levantar el stack**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
   Esto: levanta Postgres, corre las migraciones (servicio `migrate`), arranca la app y
   Caddy saca el certificado HTTPS solo.

5. **Verificar**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   docker compose -f docker-compose.prod.yml logs -f app
   ```
   Entrar a `https://TU-DOMINIO` → debería pedir login con Google.

## Actualizar a una versión nueva
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```
Las migraciones nuevas se aplican solas al reiniciar (servicio `migrate`).

## Datos que persisten (volúmenes)
- `pgdata` → base de datos.
- `uploads` → imágenes de productos.
- `caddy_data` → certificados HTTPS.
