"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { updateAllRecipes } from "~/server/meilisearch/seedRecipes";

const UpdateMeilisearchButton = () => {
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

export default UpdateMeilisearchButton;
