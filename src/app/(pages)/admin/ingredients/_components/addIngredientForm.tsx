"use client";

import { toast } from "sonner";
import { addIngredient } from "~/server/api/admin";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAdminIngredientStore } from "~/stores/admin-ingredient-store";
import Icon from "~/icons/Icon";
import { useState } from "react";
import type { AllIngredients } from "~/server/shared";

type Ingredient = AllIngredients[number];
type Props = {
  items: Ingredient[];
};

const AddIngredientForm = ({ items }: Props) => {
  const uniques = items.map((i) => i.name);
  const { selectedCat, selectedSub, setSearch, reset, search } =
    useAdminIngredientStore();
  const [loading, setLoading] = useState(false);

  const isUnique = !uniques.includes(search.toLowerCase());
  const hasCat = !!selectedCat && !!selectedSub;
  const isMin = search.length > 1;

  const isValid = isUnique && hasCat && isMin;

  const onSubmit = async () => {
    setLoading(true);
    if (uniques.includes(search.toLowerCase())) {
      toast.error("Ingrediens finns redan");
      return;
    }
    if (!selectedCat || !selectedSub) {
      toast.error("Välj en kategori och underkategori först");
      return;
    }
    try {
      await addIngredient({
        name: search.toLowerCase().trim(),
        categoryId: selectedCat.id,
        subcategoryId: selectedSub.id,
      });
      toast.success(`${search} har lagts till!`);
      reset();
    } catch (error) {
      toast.error("Kunde inte lägga till ingrediens");
      return;
    }
    setLoading(false);
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit();
      }}
      className="space-y-2"
    >
      <div className="flex gap-2">
        <div className="relative">
          <Input
            placeholder="Apelsin"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                reset();
              }}
              className="absolute top-1/2 right-0 -translate-y-1/2"
            >
              <Icon icon="close" className="fill-c5 w-10" />
            </button>
          )}
        </div>
        <Button disabled={loading || !isValid} type="submit">
          Lägg till
        </Button>
      </div>
      {!hasCat && search && (
        <ErrorMessage text="Välj en kategori och underkategori" />
      )}
      {!isMin && search && <ErrorMessage text="Minst 2 tecken" />}
    </form>
  );
};

const ErrorMessage = ({ text }: { text: string }) => {
  return <p className="text-red-500">{text}</p>;
};

export default AddIngredientForm;
