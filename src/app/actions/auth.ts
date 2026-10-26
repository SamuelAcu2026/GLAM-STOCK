"use server";

import { signOut } from "@/auth";

// Cierra la sesión y vuelve al login. Se usa desde el botón "Salir" del header.
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
