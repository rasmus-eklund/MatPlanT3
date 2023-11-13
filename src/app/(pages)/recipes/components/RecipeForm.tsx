"use client";

import { useForm } from "react-hook-form";
import { RouterOutputs } from "~/trpc/shared";
import { tFullRecipe, tRecipe, zRecipe } from "~/zod/zodSchemas";
import FormError from "../../../_components/FormError";
import { ReactNode, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import SearchIngredients from "../../../_components/SearchIngredient";
import EditIngredient from "../../../_components/EditIngredient";
import RecipeInsideRecipeForm from "./RecipeInsideRecipeForm";
import crudFactory from "~/app/helpers/stateCrud";
import Button from "~/app/_components/Button";
import { useRouter } from "next/navigation";

type Recipe = RouterOutputs["recipe"]["getById"];
type Props = {
  recipe: Recipe;
  onSubmit: (recipe: tFullRecipe) => void;
  children: ReactNode;
};

const RecipeForm = ({
  recipe: {
    contained,
    ingredients,
    recipe: { id, instruction, name, portions },
  },
  children,
  onSubmit,
}: Props) => {
  const router = useRouter();
  const [ings, setIngs] = useState(ingredients);
  const { add, remove, update } = crudFactory(setIngs);
  const [recipes, setRecipes] = useState(contained);

  const {
    handleSubmit,
    formState: { errors, isDirty },
    register,
  } = useForm<tRecipe>({
    defaultValues: { instruction, name, portions, id },
    resolver: zodResolver(zRecipe),
  });

  return (
    <div className="flex flex-col gap-2 bg-c3 p-2">
      <form
        id="recipe-form"
        className="flex flex-col gap-1"
        onSubmit={handleSubmit((recipe) =>
          onSubmit({ recipe, ingredients: ings, contained: recipes }),
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
      </form>
      <div className="flex flex-col gap-2">
        <h2 className="text-c5">Ingredienser</h2>
        <SearchIngredients
          onSubmit={({ name, ingredientId }) =>
            add({
              name,
              ingredientId,
              quantity: 1,
              unit: "st",
              id: crypto.randomUUID(),
            })
          }
        />
        <ul className="flex flex-col gap-1 rounded-md bg-c4 p-1">
          {ings.map((i) => (
            <EditIngredient
              key={i.id}
              ingredient={i}
              onEdit={update}
              onRemove={remove}
            />
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-c5">Recept</h2>
        <RecipeInsideRecipeForm recipes={recipes} setRecipes={setRecipes} />
      </div>
      <h2 className="text-c5">Instruktion</h2>
      <textarea
        form="recipe-form"
        className="rounded-md bg-c1 p-2 text-c5"
        {...register("instruction")}
      />
      <div className="flex justify-between">
        <Button
          onClick={() =>
            router.push(
              `${
                id === "placeholder"
                  ? "/recipes/search"
                  : `/recipes/search/${id}`
              }`,
            )
          }
        >
          Tillbaka
        </Button>
        {(isDirty || ings !== ingredients || contained !== recipes) && children}
      </div>
    </div>
  );
};

export default RecipeForm;
