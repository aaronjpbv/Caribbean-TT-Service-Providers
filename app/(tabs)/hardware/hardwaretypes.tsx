// app/hardware/types.ts

export interface HardwareItem {
  id: string;
  provider_id: string;
  name: string;
  category: string;        // one of CATEGORY ids below
  price: number;
  stock_quantity: number;
  description: string;
  photo_urls: string[];    // public URLs, first is the cover photo
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string; // Ionicons name
}

// Matches the categories shown in the JobSite mockup (Cement & Concrete,
// Tools, Electrical, Plumbing, Paint & Supplies) with a couple of sensible
// extras. Edit freely — this is the single source of truth for category
// chips across both the listing form and the search/filter screens.
export const CATEGORIES: Category[] = [
  { id: "cement_concrete", label: "Cement & Concrete", icon: "layers-outline" },
  { id: "tools",           label: "Tools",             icon: "hammer-outline" },
  { id: "electrical",      label: "Electrical",        icon: "flash-outline" },
  { id: "plumbing",        label: "Plumbing",          icon: "water-outline" },
  { id: "paint_supplies",  label: "Paint & Supplies",  icon: "color-palette-outline" },
  { id: "hardware_misc",   label: "General Hardware",  icon: "construct-outline" },
];

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function getCategoryIcon(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.icon ?? "cube-outline";
} 