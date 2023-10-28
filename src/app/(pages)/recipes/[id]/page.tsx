"use client";
import {
  deleteRecipe,
  getRecipeById,
  updateRecipe,
} from "@/app/server-side/recipes";
import { Day, Recipe } from "@/types";
import { useEffect, useState } from "react";

import DaysDropDown from "@/app/components/DaysDropDown";
import { useRouter } from "next/navigation";
import ShowRecipe from "@/app/components/recipes/ShowRecipe";
import RecipeForm from "@/app/components/recipes/RecipeForm";
import { addRecipeToMenu } from "@/app/server-side/menu";
import Button from "@/app/components/buttons/Button";
import Loading from "@/app/components/Loading";

const Recipe = ({ params }: { params: { id: string } }) => {
  const [recipe, setRecipe] = useState<Recipe>();
  const [hideForm, setHideForm] = useState(true);
  const { push } = useRouter();
  const id = params.id;

  useEffect(() => {
    getRecipeById(id).then((res) => setRecipe(res));
  }, [id]);

  const handleDeleteRecipe = () => {
    deleteRecipe(id).then(() => {
      push("/recipes");
    });
  };

  const handleUpdate = (recipe: Recipe) => {
    updateRecipe(recipe).then(() => {
      setHideForm(true);
      setRecipe(recipe);
    });
  };

  const handleAddToMenu = (recipe: Recipe, day: Day) => {
    addRecipeToMenu(recipe, day);
  };

  return (
    <>
      {recipe ? (
        <div className="flex flex-col rounded-md gap-5">
          {hideForm ? (
            <ShowRecipe recipe={recipe}>
              <Button
                name="Lägg till meny"
                callback={() => handleAddToMenu(recipe, "Obestämd")}
              />
              <div className="flex gap-4 items-center py-2">
                <Button name="Ändra" callback={() => setHideForm(false)} />
                <Button name="Ta bort" callback={handleDeleteRecipe} />
              </div>
            </ShowRecipe>
          ) : (
            <RecipeForm
              recipe={recipe}
              update={handleUpdate}
              closeForm={() => setHideForm(true)}
            />
          )}
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Recipe;
