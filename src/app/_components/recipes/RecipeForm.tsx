"use client";

import { useForm } from "react-hook-form";
import { RouterOutputs } from "~/trpc/shared";
import {
  tFullRecipe,
  tIngredient,
  tRecipe,
  zFullRecipe,
  zRecipe,
} from "~/zod/zodSchemas";
import FormError from "../FormError";
import { ReactNode, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import SearchIngredients from "../SearchIngredient";
import EditIngredient from "../EditIngredient";
import Button from "../buttons/Button";

type Recipe = RouterOutputs["recipe"]["getById"];
type Props = {
  recipe: Recipe;
  onSubmit: ({ recipe, id }: { recipe: tFullRecipe; id: string }) => void;
  children: ReactNode;
};

const RecipeForm = ({
  recipe: { contained, id, ingredients, instruction, name, portions },
  children,
  onSubmit,
}: Props) => {
  const [ings, setIngs] = useState(
    ingredients.map((i) => {
      const { recipeId, ...rest } = i;
      return rest;
    }),
  );
  const {
    handleSubmit,
    formState: { errors, isDirty },
    register,
  } = useForm<tRecipe>({
    defaultValues: { instruction, name, portions },
    resolver: zodResolver(zRecipe),
  });

  const handleEditIngredient = (ing: tIngredient) => {
    setIngs((prev) => {
      const index = prev.findIndex((i) => i.id === ing.id);
      const newIngs = [...prev];
      newIngs[index] = ing;
      return newIngs;
    });
  };

  const handleRemoveIngredient = (id: string) => {
    setIngs((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="flex flex-col gap-5 rounded-md bg-c3 p-2">
      <form
        id="recipe-form"
        className="flex flex-col gap-2"
        onSubmit={handleSubmit((recipe) =>
          onSubmit({ id, recipe: { recipe, ingredients: ings } }),
        )}
      >
        <input
          className="rounded-md bg-c1 px-2 text-2xl font-bold text-c5"
          {...register("name")}
        />
        <FormError error={errors.name} />
        <div className="flex justify-between">
          <h2 className="text- text-c5">Portioner</h2>
          <input
            className="w-10 rounded-md bg-c1 px-2 text-center text-c5"
            {...register("portions")}
          />
          <FormError error={errors.portions} />
        </div>
        <h2 className="text-c5">Instruktion</h2>
        <textarea
          className="rounded-md bg-c1 p-2 text-c5"
          {...register("instruction")}
        />
        <div className="flex self-end"></div>
      </form>
      <div className="flex flex-col gap-2">
        <h2 className="text-c5">Ingredienser</h2>

        <SearchIngredients
          onSubmit={(ing) => {
            const { name, ingredientId } = ing;
            setIngs((prev) => [
              ...prev,
              {
                name,
                quantity: 1,
                unit: "st",
                ingredientId,
                id: crypto.randomUUID(),
              },
            ]);
          }}
        />
        <ul className="flex flex-col gap-1">
          {ings.map((i) => (
            <EditIngredient
              key={i.id}
              ingredient={i}
              onEdit={handleEditIngredient}
              onRemove={handleRemoveIngredient}
            />
          ))}
        </ul>
      </div>
      {(isDirty || ings !== ingredients) && children}
    </div>
  );
};

export default RecipeForm;
