import { randomUUID } from "crypto";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

// Procesa y guarda la imagen subida de un producto.
// La redimensiona a un máximo de 800px de ancho y la convierte a WebP para que el
// archivo quede liviano (una foto de celular de varios MB termina en ~100KB).
// En la base de datos se guarda solo la ruta pública que devuelve esta función.
export async function saveProductImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.webp`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadsDir, { recursive: true });
  await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(uploadsDir, filename));

  return `/uploads/${filename}`;
}
