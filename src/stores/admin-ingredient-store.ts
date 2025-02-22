import { create } from "zustand";
import type { AllIngredients } from "~/server/shared";

type Ingredient = AllIngredients[number];

export const useAdminIngredientStore = create<{
  selectedIng: Ingredient | null;
  selectedCat: Ingredient["category"] | null;
  selectedSub: Ingredient["subcategory"] | null;
  setSelectedIng: (ing: Ingredient | null) => void;
  setSelectedCat: (cat: Ingredient["category"] | null) => void;
  setSelectedSub: (sub: Ingredient["subcategory"] | null) => void;
  setSearch: (search: string) => void;
  reset: () => void;
  diffCat: boolean;
  diffSub: boolean;
  search: string;
}>((set, get) => ({
  diffCat: false,
  diffSub: false,
  selectedIng: null,
  selectedCat: null,
  selectedSub: null,
  search: "",
  setSelectedIng: (ing: Ingredient | null) => set({ selectedIng: ing }),
  setSelectedCat: (cat: Ingredient["category"] | null) => {
    set({ diffCat: cat?.id !== get().selectedIng?.category.id });
    set({ selectedCat: cat });
  },
  setSelectedSub: (sub: Ingredient["subcategory"] | null) => {
    set({ diffSub: sub?.id !== get().selectedIng?.subcategory.id });
    set({ selectedSub: sub });
  },
  setSearch: (search: string) => set({ search }),
  reset: () =>
    set({
      selectedIng: null,
      selectedCat: null,
      selectedSub: null,
      search: "",
    }),
}));
