import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Lista blanca de emails autorizados (desde ALLOWED_EMAILS en el .env, separados por coma).
// Solo estos correos pueden entrar; cualquier otro queda afuera aunque tenga cuenta de Google.
const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google], // lee AUTH_GOOGLE_ID y AUTH_GOOGLE_SECRET del entorno
  session: { strategy: "jwt" }, // sin tabla de sesiones: el token vive en una cookie firmada
  pages: { signIn: "/login" },
  callbacks: {
    // Se ejecuta en cada intento de login: solo deja pasar si el email está en la allowlist.
    signIn({ profile, user }) {
      const email = (profile?.email ?? user?.email)?.toLowerCase();
      return Boolean(email && allowedEmails.includes(email));
    },
  },
});
