"use client";
import { useForm } from "react-hook-form";
import { type RecipeType, recipeSchema } from "~/zod/zodSchemas";
import { type ReactNode, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import RecipeInsideRecipeForm from "./RecipeInsideRecipeForm";
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
import type { RecipeFormSubmit } from "~/types";
import Select from "~/components/common/Select";
import { Switch } from "~/components/ui/switch";
import units, { unitsAbbr } from "~/lib/constants/units";
import BackButton from "~/components/common/BackButton";
import Icon from "~/components/common/Icon";
import SortableIngredients from "./SortableIngredients";
import { Spinner } from "~/components/ui/spinner";
import RecipeDropdownMenu from "./RecipeDropdownMenu";

type Props = {
  recipe: Recipe;
  onSubmit: (recipe: RecipeFormSubmit, old: Recipe) => Promise<void>;
  isSaved?: boolean;
  deleteDescription?: ReactNode;
};

const RecipeForm = ({ recipe, onSubmit, isSaved = true, deleteDescription }: Props) => {
  const [groups, setGroups] = useState(
    Object.fromEntries(recipe.groups.map((g) => [g.id, g.ingredients])),
  );
  const [groupsOrder, setGroupsOrder] = useState(
    recipe.groups.map((g) => ({ name: g.name, id: g.id })),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState(recipe.contained);

  const handleSubmit = async (data: RecipeType) => {
    setIsLoading(true);
    await onSubmit(
      {
        id: recipe.id,
        ...data,
        contained: recipes,
        groups: groupsOrder.map((i, order) => {
          const group = groups[i.id];
          if (!group) {
            throw new Error("Group not found");
          }
          return {
            name: i.name,
            ingredients: group.map((i, order) => ({ ...i, order })),
            order,
            id: i.id,
            recipeId: recipe.id,
          };
        }),
      },
      recipe,
    );
    setIsLoading(false);
  };

  const recipeEdited = ({
    recipe,
    groups,
    groupsOrder,
  }: {
    recipe: Recipe;
    groups: Record<string, Recipe["groups"][number]["ingredients"]>;
    groupsOrder: { id: string; name: string }[];
  }) => {
    const originalGroups = recipe.groups.map(({ id }) => id);
    const stateGroups = groupsOrder.map(({ id }) => id);
    const originalIngredients = recipe.groups.flatMap((group) =>
      group.ingredients.map((i) => ({
        id: i.id,
        name: i.ingredient.name,
        quantity: i.quantity,
        unit: i.unit,
        order: i.order,
      })),
    );
    const stateIngredients = Object.values(groups).flatMap((ings) =>
      ings.map((i) => ({
        id: i.id,
        name: i.ingredient.name,
        quantity: i.quantity,
        unit: i.unit,
        order: i.order,
      })),
    );
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

  const isEdited = recipeEdited({ recipe, groups, groupsOrder });

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-c4/80">
        <p className="text-center text-2xl text-c2">Sparar</p>
        <Spinner className="size-30" />
      </div>
    );
  }
  return (
    <div className="relative flex flex-col gap-3 bg-c4 p-2 pb-6">
      <Form {...form}>
        <form
          id="recipeForm"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-3"
        >
          <div className="sticky top-0 z-10 flex items-center gap-2 rounded-md border border-c3 bg-c2 p-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormControl>
                    <Input placeholder="Namn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-1">
              <BackButton variant="ghost" size="icon" aria-label="Tillbaka">
                <Icon icon="ArrowLeft" />
              </BackButton>
              <Button form="recipeForm" type="submit" disabled={!isEdited || isLoading}>
                Spara
              </Button>
              {isSaved && (
                <RecipeDropdownMenu
                  recipe={recipe}
                  deleteDescription={deleteDescription}
                  hideEdit={true}
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
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
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                        value={field.value}
                        options={units.map((i) => ({
                          key: i,
                          value: i,
                          label: unitsAbbr[i],
                        }))}
                      />
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
                    Tryck Enter två gånger mellan delmoment för att skapa punkter som kan bockas av.
                  </FormDescription>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2 rounded-md bg-c3 p-4">
            <Label>Ingredienser</Label>
            <SortableIngredients
              groups={groups}
              setGroups={setGroups}
              groupsOrder={groupsOrder}
              setGroupsOrder={setGroupsOrder}
            />
          </div>
          <RecipeInsideRecipeForm recipes={recipes} setRecipes={setRecipes} parentId={recipe.id} />
        </form>
      </Form>
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
