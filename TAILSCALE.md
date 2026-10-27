# Usar Glam Stock sin VPS (una compu + Tailscale)

Esta guía deja el sistema corriendo en UNA compu (el "servidor") y accesible de forma
segura desde el celular o la compu de la usuaria, desde cualquier wifi o datos móviles.
Costo: $0. Requisito: la compu-servidor tiene que estar prendida cuando se use el sistema.

## Parte A — En la compu que hace de servidor

1. **Instalar Tailscale** → https://tailscale.com/download
   Crear una cuenta gratis (con Google) e iniciar sesión en la app.

2. **Activar HTTPS en la cuenta de Tailscale** (una sola vez):
   - En https://login.tailscale.com/admin/dns → activar **MagicDNS** y **HTTPS Certificates**.
   - Ahí vas a ver el nombre de tu red, algo como `tuusuario.ts.net`.
   - El nombre completo del servidor será: `<nombre-de-la-compu>.<tuusuario>.ts.net`
     (lo ves con el comando `tailscale status`).

3. **Levantar el sistema** (en la carpeta del proyecto):
   ```bash
   cp .env.example .env
   ```
   Editar `.env` y completar (ver detalle abajo), luego:
   ```bash
   docker compose -f docker-compose.local.yml up -d --build
   ```

4. **Exponer la app por Tailscale con HTTPS**:
   ```bash
   tailscale serve --bg 3000
   ```
   (Si el comando cambió, revisá `tailscale serve --help`. La idea: servir
   `http://localhost:3000` sobre HTTPS en el dominio de la máquina.)
   Luego `tailscale serve status` te muestra la URL final
   `https://<compu>.<tuusuario>.ts.net`.

## Parte B — Valores del `.env`

```
POSTGRES_USER=glam
POSTGRES_PASSWORD=una_clave_fuerte
POSTGRES_DB=glamstock
DATABASE_URL=postgresql://glam:una_clave_fuerte@db:5432/glamstock?schema=public

AUTH_SECRET=        # generar: openssl rand -base64 33
AUTH_URL=https://<compu>.<tuusuario>.ts.net   # la URL de Tailscale del paso A4
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
ALLOWED_EMAILS=correo-de-ella@gmail.com,tu-correo@gmail.com
```

## Parte C — Google Cloud Console

Agregar al cliente OAuth el redirect URI de producción:
```
https://<compu>.<tuusuario>.ts.net/api/auth/callback/google
```

## Parte D — En el celular / compu de la usuaria

1. Instalar la app de **Tailscale** e iniciar sesión con la MISMA cuenta.
   (O compartir el dispositivo/máquina desde el panel admin de Tailscale.)
2. Abrir en el navegador: `https://<compu>.<tuusuario>.ts.net`
3. Entrar con Google. Listo: funciona desde cualquier red.

## Día a día
- Prendés la compu-servidor y Docker arranca solo (los contenedores tienen `restart`).
- Si reiniciás, `tailscale serve` recuerda la config.
- Para actualizar a una versión nueva:
  ```bash
  git pull
  docker compose -f docker-compose.local.yml up -d --build
  ```
