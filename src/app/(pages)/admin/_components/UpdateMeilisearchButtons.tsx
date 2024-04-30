"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { updateAllIngredients } from "~/server/meilisearch/seedIngredients";
import { updateAllRecipes } from "~/server/meilisearch/seedRecipes";

export const UpdateMeiliRecipes = () => {
  const [updating, setUpdating] = useState(false);
  const update = async () => {
    setUpdating(true);
    await updateAllRecipes();
    setUpdating(false);
  };
  return (
    <Button disabled={updating} onClick={update}>
      Uppdatera Meilisearch Recept
    </Button>
  );
};

export const UpdateMeiliIngredients = () => {
  const [updating, setUpdating] = useState(false);
  const update = async () => {
    setUpdating(true);
    await updateAllIngredients();
    setUpdating(false);
  };
  return (
    <Button disabled={updating} onClick={update}>
      Uppdatera Meilisearch Ingredienser
    </Button>
  );
};
