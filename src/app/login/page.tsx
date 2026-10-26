import { Sparkles } from "lucide-react";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

// Página de login. Único punto de entrada: iniciar sesión con Google.
// El acceso real lo decide la allowlist de emails en auth.ts.
export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Sparkles className="size-6" />
        </span>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Glam Stock</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Ingresá con tu cuenta de Google para administrar el stock.
        </p>

        {/* El signIn de Auth.js se dispara como Server Action desde este form */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/productos" });
          }}
        >
          <Button type="submit" className="w-full" size="lg">
            Entrar con Google
          </Button>
        </form>
      </div>
    </div>
  );
}
