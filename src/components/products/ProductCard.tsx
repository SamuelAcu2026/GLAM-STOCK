"use client";

import Image from "next/image";
import { useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Pencil, ImageOff, Package, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatARS } from "@/lib/format";
import { CATEGORY_LABELS, type ProductDTO } from "@/lib/products";
import { toggleProductActive, adjustStock } from "@/app/productos/actions";

type Props = {
  product: ProductDTO;
  onEdit: (product: ProductDTO) => void;
};

// Card de producto estilo ecommerce: imagen, datos, precio y acciones (editar, activar).
export function ProductCard({ product, onEdit }: Props) {
  const reduceMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  // Llama al Server Action para activar/desactivar sin recargar la página.
  function handleToggleActive() {
    startTransition(() => {
      void toggleProductActive(product.id);
    });
  }

  // Ajusta el stock desde la card (+1 / -1): sirve para descontar al vender.
  function handleAdjustStock(delta: number) {
    startTransition(() => {
      void adjustStock(product.id, delta);
    });
  }

  const isLocalImage = product.imagePath?.startsWith("/");

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        !product.isActive && "opacity-60"
      )}
    >
      {/* Contenedor de imagen con aspecto fijo: reserva el espacio y evita saltos de layout (CLS) */}
      <div className="relative aspect-square bg-muted">
        {product.imagePath ? (
          isLocalImage ? (
            <Image
              src={product.imagePath}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            // Imagen remota (URL pegada): <img> con lazy load para no configurar dominios externos.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imagePath}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-10" />
          </div>
        )}

        {/* Botón chico de editar, arriba a la derecha */}
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => onEdit(product)}
          aria-label={`Editar ${product.name}`}
          className="absolute right-2 top-2 size-9 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Pencil className="size-4" />
        </Button>

        {!product.isActive && (
          <Badge variant="secondary" className="absolute left-2 top-2">
            Inactivo
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="font-normal">
            {CATEGORY_LABELS[product.category]}
          </Badge>
          <span className="text-xs text-muted-foreground">#{product.code}</span>
        </div>

        <h3 className="font-heading text-base font-semibold leading-tight">
          {product.name}
        </h3>

        {product.section && (
          <span className="text-xs text-muted-foreground">
            Sección: {product.section}
          </span>
        )}

        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <p className="font-heading text-xl font-bold">
            {formatARS(product.salePrice)}
          </p>

          <div className="flex items-center justify-between gap-2">
            {/* Control de stock: − y + descuentan o suman unidades (ej: al vender) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleAdjustStock(-1)}
                disabled={isPending || product.quantity === 0}
                aria-label="Restar stock"
                className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="flex min-w-14 items-center justify-center gap-1 text-sm font-medium">
                <Package className="size-3.5 text-muted-foreground" />
                {product.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleAdjustStock(1)}
                disabled={isPending}
                aria-label="Sumar stock"
                className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            {/* Toggle activo/inactivo: reemplaza al borrado */}
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isPending}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                product.isActive
                  ? "bg-brand/10 text-brand hover:bg-brand/20"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              )}
            >
              {product.isActive ? "Activo" : "Inactivo"}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
