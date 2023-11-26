"use client";
import { useForm } from "react-hook-form";
import { RouterOutputs } from "~/trpc/shared";
import { tFullRecipe, tRecipe, zRecipe } from "~/zod/zodSchemas";
import {
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import RecipeInsideRecipeForm from "./RecipeInsideRecipeForm";
import crudFactory from "~/app/helpers/stateCrud";
import Button from "~/app/_components/Button";
import { useRouter } from "next/navigation";
import FormError from "~/app/_components/FormError";
import SearchIngredients from "~/app/_components/SearchIngredient";
import SortableIngredients from "./SortableIngredients";

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
    watch,
  } = useForm<tRecipe>({
    defaultValues: { instruction, name, portions, id },
    resolver: zodResolver(zRecipe),
  });
  const { ref, ...rest } = register("instruction");
  const instructionRef = useRef<HTMLTextAreaElement>(null);
  const instructionWatch = watch("instruction");
  useImperativeHandle(ref, () => instructionRef.current);
  useAutosizeTextArea(instructionRef.current, instructionWatch);

  return (
    <div className="flex flex-col gap-3 bg-c4 p-2">
      <form
        id="recipe-form"
        className="flex flex-col gap-2 rounded-md bg-c3 p-2"
        onSubmit={handleSubmit((recipe) =>
          onSubmit({
            recipe,
            ingredients: ings.map((i, order) => ({ ...i, order })),
            contained: recipes,
          }),
        )}
      >
        <input
          className="rounded-md bg-c2 px-2 text-2xl font-bold text-c5 outline-none focus:bg-c1"
          {...register("name")}
        />
        <FormError error={errors.name} />
        <div className="flex justify-between">
          <h2 className="text-c5">Portioner</h2>
          <input
            className="w-10 rounded-md bg-c2 px-2 text-center text-c5 outline-none focus:bg-c1"
            {...register("portions")}
          />
          <FormError error={errors.portions} />
        </div>
      </form>
      <div className="flex flex-col gap-2 rounded-md bg-c3 p-2">
        <h2 className="text-lg font-semibold text-c5">Ingredienser</h2>
        <SearchIngredients
          onSubmit={({ name, ingredientId }) =>
            add({
              name,
              ingredientId,
              quantity: 1,
              unit: "st",
              id: crypto.randomUUID(),
              order: 0,
            })
          }
        />
        <SortableIngredients
          items={ings}
          setItems={setIngs}
          crud={{ update, remove }}
        />
      </div>
      <div className="flex flex-col gap-2 rounded-md bg-c3 p-2">
        <h2 className="text-lg font-semibold text-c5">Recept</h2>
        <RecipeInsideRecipeForm recipes={recipes} setRecipes={setRecipes} />
      </div>
      <div className="flex flex-col gap-2 rounded-md bg-c3 p-2">
        <h2 className="text-c5">Instruktion</h2>
        <textarea
          form="recipe-form"
          className="resize-none rounded-md bg-c1 p-2 text-c5"
          {...rest}
          ref={instructionRef}
          rows={1}
        />
      </div>
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

const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
) => {
  useEffect(() => {
    if (textAreaRef) {
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;
      textAreaRef.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
};

export default RecipeForm;
