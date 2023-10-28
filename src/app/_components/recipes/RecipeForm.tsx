"use client";
import { IngredientCat, Recipe, RecipeIngredient, RecipeSearch } from "@/types";
import { FC, useState } from "react";
import SearchIngredients from "@/app/components/SearchIngredient";
import EditIngredient from "@/app/components/EditIngredient";
import Button from "../buttons/Button";
import RecipeInsideRecipeForm from "./RecipeInsideRecipeForm";

type RecipeFormProp = {
  recipe: Recipe;
  update: (recipe: Recipe) => void;
  closeForm: () => void;
};

const RecipeForm: FC<RecipeFormProp> = ({
  recipe: incomingRecipe,
  update,
  closeForm,
}) => {
  const [recipe, setRecipe] = useState<Recipe>(incomingRecipe);

  const handleAddIngredient = (ing: IngredientCat) => {
    const ingredient: RecipeIngredient = {
      name: ing.name,
      quantity: 1,
      unit: "st",
      id: crypto.randomUUID(),
      recipeId: recipe.id,
    };
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...recipe.ingredients, ingredient],
    }));
  };

  const handleDeleteIngredient = (ing: RecipeIngredient) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((i) => i.id !== ing.id),
    }));
  };

  const handleUpdateIngredient = (ing: RecipeIngredient) => {
    setRecipe((prev) => {
      const oldIngs = prev.ingredients.filter((i) => i.id !== ing.id);
      return { ...prev, ingredients: [...oldIngs, ing] };
    });
  };

  const handleAddRecipe = (recipe: RecipeSearch) => {
    setRecipe((prev) => ({ ...prev, children: [...prev.children, recipe] }));
  };

  const handleRemoveRecipe = (id: string) => {
    setRecipe((prev) => ({
      ...prev,
      children: prev.children.filter((r) => r.id !== id),
    }));
  };

  const handleUpdatePortions = (item: RecipeSearch) => {
    setRecipe((prev) => {
      const oldItems = prev.children.filter((i) => i.id !== item.id);
      return { ...prev, children: [...oldItems, item] };
    });
  };

  return (
    <section className="flex flex-col rounded-md bg-c3 gap-5 p-5">
      <input
        className="text-c5 bg-c3 text-2xl font-bold"
        type="text"
        value={recipe.name}
        onChange={(e) =>
          setRecipe((prev) => ({ ...prev, name: e.target.value }))
        }
      />
      <div className="rounded-md bg-c4 p-2 flex flex-col gap-2">
        <div className="flex justify-between">
          <h2 className="text-c2 text-md">Portioner</h2>
          <input
            className="rounded-md w-10 text-center text-c5 bg-c3"
            type="number"
            value={recipe.portions}
            onChange={(e) =>
              setRecipe((prev) => ({
                ...prev,
                portions: Number(e.target.value),
              }))
            }
          />
        </div>
        <div className="flex flex-col bg-c4">
          <h2 className="text-c2 text-lg">Ingredienser</h2>
          <div className="bg-c3 p-2 rounded-md">
            <SearchIngredients callback={handleAddIngredient} />
            <ul className="flex flex-col gap-1 py-2">
              {recipe.ingredients.map((ing) => (
                <EditIngredient<RecipeIngredient>
                  ingredientIn={ing}
                  remove={handleDeleteIngredient}
                  update={handleUpdateIngredient}
                  key={ing.id}
                  editable={true}
                />
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-c2 text-lg">Instruktion</h2>
          <textarea
            className="bg-c3 text-c5 rounded-md p-2"
            value={recipe.instruction}
            onChange={(e) =>
              setRecipe((prev) => ({ ...prev, instruction: e.target.value }))
            }
          />
        </div>
        <RecipeInsideRecipeForm
          recipes={recipe.children}
          handleAddRecipe={handleAddRecipe}
          handleRemoveRecipe={handleRemoveRecipe}
          handleUpdatePortions={handleUpdatePortions}
        />
      </div>
      <div className="self-end flex gap-2">
        <Button name="Spara" callback={() => update(recipe)} />
        <Button name="Stäng" callback={closeForm} />
      </div>
    </section>
  );
};

export default RecipeForm;
