"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatARS } from "@/lib/format";
import { computeSalePrice, type PricingMode } from "@/lib/pricing";
import { CATEGORIES, CATEGORY_LABELS, type ProductDTO } from "@/lib/products";
import { saveProduct, type SaveState } from "@/app/productos/actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductDTO | null; // null = cargar nuevo; con datos = editar
  sections: string[]; // secciones existentes, para autocompletar
};

const initialState: SaveState = { ok: false };

// Formulario de carga/edición de producto. Se usa el mismo para ambos casos:
// si recibe un product, precarga los campos y envía su id (modo edición).
export function ProductFormDialog({ open, onOpenChange, product, sections }: Props) {
  const [state, formAction, pending] = useActionState(saveProduct, initialState);

  const [mode, setMode] = useState<PricingMode>(
    product?.markupPercentage != null ? "percentage" : "direct"
  );
  const [costPrice, setCostPrice] = useState(product ? String(product.costPrice) : "");
  const [markup, setMarkup] = useState(
    product?.markupPercentage != null ? String(product.markupPercentage) : ""
  );
  const [direct, setDirect] = useState(
    product && product.markupPercentage == null ? String(product.salePrice) : ""
  );
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0]);
  const [active, setActive] = useState(product?.isActive ?? true);

  // Cierra el modal cuando el guardado fue exitoso.
  useEffect(() => {
    if (state.ok) onOpenChange(false);
  }, [state.ok, onOpenChange]);

  // Preview en vivo del precio de venta usando la MISMA lógica que el servidor.
  let preview: number | null = null;
  const cost = parseFloat(costPrice);
  if (!Number.isNaN(cost)) {
    try {
      preview = computeSalePrice({
        costPrice: cost,
        pricingMode: mode,
        markupPercentage: mode === "percentage" ? parseFloat(markup) : null,
        directSalePrice: mode === "direct" ? parseFloat(direct) : null,
      }).salePrice;
    } catch {
      preview = null;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {product ? "Editar producto" : "Cargar producto"}
          </DialogTitle>
          <DialogDescription>
            Completá los datos del producto o insumo.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4">
          {product && <input type="hidden" name="id" value={product.id} />}
          {/* El Select de Radix envía su valor por este name */}
          <input type="hidden" name="pricingMode" value={mode} />

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="code">Código</Label>
              <Input id="code" name="code" defaultValue={product?.code} required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                defaultValue={product?.quantity ?? 0}
                required
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={product?.name} required />
          </div>

          <div className="grid gap-1.5">
            <Label>Categoría</Label>
            <Select name="category" value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger>
                <SelectValue placeholder="Elegí una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="section">Sección</Label>
            <Input
              id="section"
              name="section"
              list="sections-list"
              placeholder="Ej: torno, pestañas, esmaltes"
              defaultValue={product?.section ?? ""}
            />
            {/* Autocompletado con las secciones que ya existen */}
            <datalist id="sections-list">
              {sections.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="costPrice">Precio de costo</Label>
            <Input
              id="costPrice"
              name="costPrice"
              type="number"
              step="0.01"
              min={0}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              required
            />
          </div>

          {/* Switch de modo de precio: por margen % o precio de venta directo */}
          <div className="grid gap-1.5">
            <Label>Precio de venta</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("percentage")}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  mode === "percentage"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Por margen %
              </button>
              <button
                type="button"
                onClick={() => setMode("direct")}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  mode === "direct"
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Precio directo
              </button>
            </div>

            {mode === "percentage" ? (
              <Input
                name="markupPercentage"
                type="number"
                step="0.01"
                min={0}
                placeholder="Margen (%)"
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
              />
            ) : (
              <Input
                name="directSalePrice"
                type="number"
                step="0.01"
                min={0}
                placeholder="Precio de venta"
                value={direct}
                onChange={(e) => setDirect(e.target.value)}
              />
            )}

            {preview != null && (
              <p className="text-sm text-muted-foreground">
                Precio de venta:{" "}
                <span className="font-semibold text-foreground">{formatARS(preview)}</span>
              </p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              rows={3}
            />
          </div>

          {/* Estado del producto: activo (visible) o inactivo (oculto de la vista por defecto) */}
          <div className="grid gap-1.5">
            <Label>Estado</Label>
            <input type="hidden" name="isActive" value={active ? "true" : "false"} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActive(true)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Activo
              </button>
              <button
                type="button"
                onClick={() => setActive(false)}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  !active
                    ? "border-foreground/30 bg-secondary text-secondary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Inactivo
              </button>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="imageFile">Imagen (archivo)</Label>
            <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
            <Input name="imageUrl" type="url" placeholder="o pegá una URL de imagen" />
          </div>

          {state.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={pending}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {product ? "Guardar cambios" : "Cargar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
