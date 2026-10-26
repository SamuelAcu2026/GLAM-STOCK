import { auth } from "@/auth";

// Middleware de seguridad: corre antes de renderizar cualquier ruta.
// Si el visitante no tiene sesión, lo manda al login. Protege TODA la app de una.
export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL("/login", req.nextUrl.origin));
  }
});

// El matcher excluye lo que NO debe pedir login: los endpoints de auth, la propia
// página de login, y los assets estáticos de Next.
export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
