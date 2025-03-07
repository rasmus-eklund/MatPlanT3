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
import { Label } from "~/components/ui/label";
import type { Recipe } from "~/server/shared";
import type { IngredientGroup, RecipeFormSubmit } from "~/types";
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
import { addGroup } from "./dnd/helpers";
import AddGroup from "./AddGroup";
import { groupIngredients } from "~/lib/utils";
import Example from "./dnd/test";

type Props = {
  recipe: Recipe;
  onSubmit: (recipe: RecipeFormSubmit) => Promise<void>;
};

// const ggroupIngrediest = (ingredients: Recipe["ingredients"]) => {
//   const recipeGroup = crypto.randomUUID();
//   const groups: Record<string, Recipe["ingredients"][number][]> = {};
//   const groupOrder: string[] = [];
//   for (const ing of ingredients) {
//     if (!ing.group) ing.groupId = recipeGroup;
//     const group = groups[ing.groupId];
//     if (group) {
//       group.push(ing);
//     }
//     groups[ing.groupId] = [ing];
//   }
//   return groups;
// };

const RecipeForm = ({ recipe, onSubmit }: Props) => {
  const _groups = groupIngredients(recipe.ingredients);
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState(
    !!_groups.length
      ? _groups
      : [{ id: "recept", ingredients: [], name: "recept", order: 0 }],
  );
  const [recipes, setRecipes] = useState(recipe.contained);

  const handleSubmit = async (data: RecipeType) => {
    setIsLoading(true);
    await onSubmit({
      id: recipe.id,
      ...data,
      contained: recipes,
      groups,
    });
    setIsLoading(false);
  };

  const recipeEdited = () => {
    const originalGroups = recipe.groups.map(({ name, order }) => ({
      name,
      order,
    }));
    const stateGroups = groups.map(({ name, order }) => ({ name, order }));
    const originalIngredients = dropGroup(recipe.ingredients).sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const stateIngredients = dropGroup(
      groups.flatMap((g) => g.ingredients),
    ).sort((a, b) => a.id.localeCompare(b.id));
    const [rec, grps, ings] = [
      hasChanged(recipe.contained, recipes),
      hasChanged(originalGroups, stateGroups),
      hasChanged(originalIngredients, stateIngredients),
    ];
    return form.formState.isDirty || rec || grps || ings;
  };

  const form = useForm<RecipeType>({
    defaultValues: { ...recipe },
    resolver: zodResolver(recipeSchema),
  });

  if (isLoading) {
    return (
      <div className="bg-c4/80 flex h-full w-full flex-col items-center justify-center">
        <p className="text-c2 text-center text-2xl">Sparar</p>
        <ClipLoader size={80} />
      </div>
    );
  }
  return (
    <div className="bg-c4 relative flex flex-col gap-3 p-2">
      <Form {...form}>
        <form
          id="recipeForm"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="bg-c3 rounded-md p-4">
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
              <FormItem className="bg-c3 flex justify-between rounded-md p-4">
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
          <div className="bg-c3 flex gap-2 rounded-md p-4">
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
              <FormItem className="bg-c3 rounded-md p-4">
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
      <div className="bg-c3 space-y-2 rounded-md p-4">
        <Label>Ingredienser</Label>
        <SortableIngredients
          recipeId={recipe.id}
          groups={groups}
          setGroups={setGroups}
        />
        <AddGroup
          onSubmit={({ name }) => setGroups(addGroup(name, groups))}
          groups={groups.map((i) => i.name)}
        />
      </div>
      <RecipeInsideRecipeForm
        recipes={recipes}
        setRecipes={setRecipes}
        parentId={recipe.id}
      />
      <div className="flex justify-between p-2">
        <BackButton />
      </div>
      <div className="sticky bottom-4 self-end">
        {recipeEdited() && (
          <Button form="recipeForm" type="submit">
            Spara
          </Button>
        )}
      </div>
      <Example />
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

const dropGroup = (items: IngredientGroup["ingredients"]) => {
  return items.map(({ group: _, ...rest }) => rest);
};

export default RecipeForm;
