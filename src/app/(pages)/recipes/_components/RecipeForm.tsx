"use client";
import { useForm } from "react-hook-form";
import { type RecipeType, recipeSchema } from "~/zod/zodSchemas";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import RecipeInsideRecipeForm from "./RecipeInsideRecipeForm";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import crudFactory from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import SearchItem from "~/components/common/SearchItem";
import { Label } from "~/components/ui/label";
import type { Recipe } from "~/server/shared";
import type { CreateRecipeInput } from "~/types";
import SortableIngredients from "./SortableIngredients";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "~/components/ui/select";
import units, { unitsAbbr } from "~/lib/constants/units";

type Props = {
  recipe: Recipe;
  onSubmit: (recipe: CreateRecipeInput) => Promise<void>;
  loading?: boolean;
};

const RecipeForm = ({
  recipe: {
    contained,
    ingredients,
    id,
    name,
    instruction,
    isPublic,
    quantity,
    unit,
  },
  onSubmit,
  loading = false,
}: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(loading);
  const [error, setError] = useState("");
  const [ings, setIngs] = useState(ingredients);
  const { add, remove, update } = crudFactory(setIngs);
  const [recipes, setRecipes] = useState(contained);

  const handleSubmit = async (recipe: RecipeType) => {
    setIsLoading(true);
    try {
      await onSubmit({ id, ...recipe, contained: recipes, ingredients: ings });
      setError("");
    } catch (error) {
      setError("Något gick fel. Försök igen.");
    }
    setIsLoading(false);
  };

  const form = useForm<RecipeType>({
    defaultValues: { instruction, isPublic, name, quantity, unit },
    resolver: zodResolver(recipeSchema),
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-c4/80">
        <p className="text-center text-2xl text-c2">Sparar</p>
        <ClipLoader size={80} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 bg-c4 p-2">
      {!!error && <p>{error}</p>}
      <Form {...form}>
        <form
          id="recipeForm"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Namn</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kvantitet</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enhet</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem value={unit} key={unit}>
                          {unitsAbbr[unit]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instruction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instruktion</FormLabel>
                <FormDescription className="text-c1">
                  Tryck Enter två gånger mellan delmoment för att skapa punkter
                  som kan bockas av.
                </FormDescription>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex flex-col gap-2 rounded-md bg-c3 p-2">
        <Label>Ingredienser</Label>
        <SearchItem
          onSubmit={({ name, ingredientId }) =>
            add({
              recipeId: id,
              groupId: null,
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
        <Label>Recept</Label>
        <RecipeInsideRecipeForm
          recipes={recipes}
          setRecipes={setRecipes}
          parentId={id}
        />
      </div>

      <div className="flex justify-between">
        <Button
          onClick={() =>
            router.push(
              `${
                id === "placeholder"
                  ? "/recipes/"
                  : `/recipes/${id}`
              }`,
            )
          }
        >
          Tillbaka
        </Button>
        {(form.formState.isDirty ||
          isDiffIng(ings, ingredients) ||
          isDiffRec(contained, recipes)) && (
          <Button form="recipeForm" type="submit">
            Spara
          </Button>
        )}
      </div>
    </div>
  );
};

const isDiffRec = <T extends { name: string; quantity: number }>(
  a: T[],
  b: T[],
) =>
  a.map(({ name, quantity }) => `${name}${quantity}`).join("") !==
  b.map(({ name, quantity }) => `${name}${quantity}`).join("");
const isDiffIng = <T extends { name: string; quantity: number; unit: string }>(
  a: T[],
  b: T[],
) =>
  a.map(({ name, quantity, unit }) => `${name}${quantity}${unit}`).join("") !==
  b.map(({ name, quantity, unit }) => `${name}${quantity}${unit}`).join("");

export default RecipeForm;
