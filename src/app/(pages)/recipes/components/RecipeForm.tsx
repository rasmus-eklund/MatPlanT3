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
    recipe: { id, instruction, name, portions, isPublic },
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
    defaultValues: { instruction, name, portions, id, isPublic },
    resolver: zodResolver(zRecipe),
  });
  const { ref, ...rest } = register("instruction");
  const instructionRef = useRef<HTMLTextAreaElement>(null);
  const instructionWatch = watch("instruction");
  useImperativeHandle(ref, () => instructionRef.current);
  useAutosizeTextArea(instructionRef.current, instructionWatch);
  const className = {
    label: "text-c4 text-xl font-semibold",
  };
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
        <div className="flex flex-col">
          <label className={className.label} htmlFor="recipe-form-name">
            Namn
          </label>
          <input
            id="recipe-form-name"
            className="rounded-md bg-c2 px-2 text-lg font-bold text-c5 outline-none focus:bg-c1"
            {...register("name")}
          />
        </div>
        <FormError error={errors.name} />
        <div className="flex justify-between">
          <label className={className.label} htmlFor="recipe-form-isPublic">
            Publikt
          </label>
          <input
            id="recipe-form-isPublic"
            type="checkbox"
            {...register("isPublic")}
          />
        </div>
        <div className="flex justify-between">
          <label className={className.label} htmlFor="recipe-form-portions">
            Portioner
          </label>
          <input
            id="recipe-form-portions"
            className="w-10 rounded-md bg-c2 px-2 text-center text-c5 outline-none focus:bg-c1"
            {...register("portions")}
          />
          <FormError error={errors.portions} />
        </div>
      </form>
      <div className="flex flex-col gap-2 rounded-md bg-c3 p-2">
        <label className={className.label}>Ingredienser</label>
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
        <label className={className.label}>Recept</label>
        <RecipeInsideRecipeForm recipes={recipes} setRecipes={setRecipes} />
      </div>
      <div className="flex flex-col gap-2 rounded-md bg-c3 p-2">
        <label className={className.label}>Instruktion</label>
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
