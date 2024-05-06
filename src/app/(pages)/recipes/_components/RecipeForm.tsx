"use client";
import { useForm } from "react-hook-form";
import { type RecipeType, recipeSchema } from "~/zod/zodSchemas";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import RecipeInsideRecipeForm from "./RecipeInsideRecipeForm";
import { ClipLoader } from "react-spinners";
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
import type { CreateRecipeInput, IngredientGroup } from "~/types";
import SortableIngredients from "./dnd/SortableIngredients";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import units, { unitsAbbr } from "~/lib/constants/units";
import BackButton from "~/components/common/BackButton";
import {
  addGroup,
  groupIngredients,
  insertIngredientToGroup,
  newIng,
} from "./dnd/helpers";
import AddGroup from "./AddGroup";

type Props = {
  recipe: Recipe;
  onSubmit: (recipe: CreateRecipeInput) => Promise<void>;
};

const RecipeForm = ({ recipe, onSubmit }: Props) => {
  const { id } = recipe;
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState(groupIngredients(recipe.ingredients));
  const [recipes, setRecipes] = useState(recipe.contained);

  // const handleSubmit = async (recipe: RecipeType) => {
  //   setIsLoading(true);
  //   try {
  //     await onSubmit({ id, ...recipe, contained: recipes, ingredients: ings });
  //     setError("");
  //   } catch (error) {
  //     setError("Något gick fel. Försök igen.");
  //   }
  //   setIsLoading(false);
  // };

  const form = useForm<RecipeType>({
    defaultValues: { ...recipe },
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
    <div className="relative flex flex-col gap-3 bg-c4 p-2">
      <Form {...form}>
        <form
          id="recipeForm"
          // onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="rounded-md bg-c3 p-4">
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
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex justify-between rounded-md bg-c3 p-4">
                <div className="space-y-0.5">
                  <FormLabel>Dela recept</FormLabel>
                  <FormDescription>
                    Andra användare kan se och kopiera ditt recept.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 rounded-md bg-c3 p-4">
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
          </div>
          <FormField
            control={form.control}
            name="instruction"
            render={({ field }) => (
              <FormItem className="rounded-md bg-c3 p-4">
                <FormLabel>Instruktion</FormLabel>
                <FormDescription>
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
      <div className="space-y-2 rounded-md bg-c3 p-4">
        <div className="flex w-full gap-2">
          <div className="grow space-y-2">
            <Label>Ingredienser</Label>
            <SearchItem
              onSubmit={({ name, ingredientId }) => {
                insertIngredientToGroup(
                  newIng({ ingredientId, name, recipeId: id }),
                  setGroups,
                );
              }}
            />
          </div>
          <div className="grow">
            <AddGroup
              onSubmit={({ name }) => setGroups(addGroup(name, groups))}
              groups={groups.map((i) => i.name)}
            />
          </div>
        </div>
        <SortableIngredients groups={groups} setGroups={setGroups} />
      </div>
      <RecipeInsideRecipeForm
        recipes={recipes}
        setRecipes={setRecipes}
        parentId={id}
      />
      <div className="flex justify-between p-2">
        <BackButton />
      </div>
      <div className="sticky bottom-4 self-end">
        {(form.formState.isDirty || hasChanged(recipe.contained, recipes)) && (
          <Button form="recipeForm" type="submit">
            Spara
          </Button>
        )}
      </div>
    </div>
  );
};

const hasChanged = <T,>(a: T[], b: T[]) => {
  if (a.length !== b.length) {
    return true;
  }
  for (let i = 0; i < a.length; i++) {
    const keys = Object.keys(a[i]!) as (keyof T)[];
    for (const key of keys) {
      if (a[i]![key] !== b[i]![key]) {
        return true;
      }
    }
  }
  return false;
};

export default RecipeForm;
