"use client";
import { Button } from "~/components/ui/button";
import { getRecipe } from "./actions/getRecipe";
import { Input } from "~/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { useState } from "react";
import type { CreateRecipeInput, ExternalRecipe } from "~/types";
import { ClipLoader } from "react-spinners";
import { type Item } from "~/zod/zodSchemas";
import { toast } from "sonner";
import { createRecipe } from "~/server/api/recipes";
import SearchModal from "~/components/common/SearchModal";
import { searchItem } from "~/server/api/items";

const urlSchema = z.object({ url: z.string().url() });
type UrlSchema = z.infer<typeof urlSchema>;

type RecipeState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; recipe: ExternalRecipe };

const GetByLink = () => {
  const [data, setData] = useState<RecipeState>({ state: "idle" });
  const form = useForm<UrlSchema>({
    defaultValues: { url: "" },
    resolver: zodResolver(urlSchema),
    mode: "onChange",
  });
  const handleFetch = async ({ url }: UrlSchema) => {
    setData({ state: "loading" });
    try {
      const res = await getRecipe({ url });
      if (!res.ok) {
        setData({ state: "idle" });
        form.setError("url", { message: res.message });
        return;
      }
      setData({ state: "success", recipe: res.recipe });
    } catch (error) {
      setData({ state: "idle" });
      form.setError("url", { message: "Kunde inte läsa recept" });
    }
  };

  const updateItem = async ({
    id,
    quantity,
    unit,
    name,
    ingredientId,
  }: Item) => {
    if (data.state !== "success") return;
    const { recipe } = data;
    const newIngredients = recipe.ingredients.map((i) => {
      if (i.id === id) {
        if (!i.match) return i;
        const match: CreateRecipeInput["ingredients"][number] = {
          ...i.match,
          quantity,
          unit,
          name,
          ingredientId,
        };
        return { ...i, match };
      }
      return i;
    });
    setData({
      state: "success",
      recipe: { ...recipe, ingredients: newIngredients },
    });
  };

  const addItem = async (ing: Item) => {
    if (data.state !== "success") return;
    const { recipe } = data;
    const match = {
      ...ing,
      recipeId: recipe.recipeId,
      groupId: recipe.groupId,
      order: 0,
    };
    const newIngredients: ExternalRecipe["ingredients"] =
      recipe.ingredients.map((i, order) =>
        i.id === ing.id ? { ...i, match, order } : i,
      );
    setData({
      state: "success",
      recipe: { ...recipe, ingredients: newIngredients },
    });
  };

  const saveRecipe = async () => {
    if (data.state !== "success") return;
    const { recipe } = data;
    setData({ state: "loading" });
    const newRecipe: CreateRecipeInput = {
      id: recipe.recipeId,
      name: recipe.name,
      quantity: recipe.quantity,
      unit: recipe.unit,
      instruction: recipe.instruction,
      isPublic: false,
      ingredients: recipe.ingredients.map((i) => ({
        ...i.match,
        groupId: recipe.groupId,
      })),
      groups: [
        {
          id: recipe.groupId,
          name: "recept",
          recipeId: recipe.recipeId,
          order: 0,
        },
      ],
      contained: [],
    };
    try {
      await createRecipe(newRecipe);
    } catch (error) {
      setData({ state: "idle" });
      form.setError("url", { message: "Kunde inte spara recept" });
      return;
    }
    setData({ state: "idle" });
    toast.success("Lade till recept");
  };
  if (data.state === "loading")
    return (
      <div className="bg-c3 flex h-full flex-col items-center justify-center gap-10 p-3">
        <h2 className="text-c5 text-2xl">Läser in recept...</h2>
        <ClipLoader size={80} />
      </div>
    );
  if (data.state === "success") {
    return (
      <div className="bg-c3 flex flex-col gap-2 p-3">
        <Comparison
          recipe={data.recipe}
          updateItem={updateItem}
          addItem={addItem}
        />
        <div className="flex justify-end gap-2">
          <Button disabled={data.state !== "success"} onClick={saveRecipe}>
            Spara
          </Button>
          <Button onClick={() => setData({ state: "idle" })}>Avbryt</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-c3 flex flex-col gap-2 p-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFetch)} className="space-y-8">
          <h1 className="text-c5 text-2xl">Läs recept från en länk</h1>
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={form.formState.isSubmitting} type="submit">
              Läs recept
            </Button>
          </div>
          <FormDescription>Hämta recept från en länk.</FormDescription>
        </form>
      </Form>
      <div>
        <h2>Sidor som kan användas för att läsa recept</h2>
        <ul>
          {links.map(({ name, url }) => (
            <li className="text-c1" key={url}>
              <a href={url} target="_blank">
                {name}
              </a>
            </li>
          ))}
          <li>Med flera...</li>
        </ul>
      </div>
    </div>
  );
};

const links: { name: string; url: string }[] = [
  { name: "Recept.se", url: "https://recept.se/" },
  { name: "Köket.se", url: "https://www.koket.se/" },
  { name: "ICA.se", url: "https://www.ica.se/recept/" },
  { name: "Arla.se", url: "https://www.arla.se/recept/" },
  { name: "Zeta.nu", url: "https://www.zeta.nu/recept/" },
  { name: "Godare.se", url: "https://www.godare.se/recept" },
  { name: "Mathem.se", url: "https://www.mathem.se/se/recipes/" },
  { name: "Tasteline.se", url: "https://www.tasteline.com/recept/" },
  {
    name: "AlltOmMat.expressen.se",
    url: "https://alltommat.expressen.se/recept/",
  },
];

const Comparison = ({
  recipe,
  updateItem,
  addItem,
}: {
  recipe: ExternalRecipe;
  updateItem: (item: Item) => Promise<void>;
  addItem: (item: Item) => Promise<void>;
}) => {
  const { ingredients, instruction, name, quantity, unit } = recipe;
  return (
    <div className="bg-c3 flex flex-col gap-4 p-3">
      <h3 className="text-c5 text-2xl">{name}</h3>
      <div className="flex items-center gap-2">
        <p>{quantity}</p>
        <p>{unit}</p>
      </div>
      <ul className="flex w-full flex-col gap-4">
        {ingredients.map(({ id, input, match }) => {
          return (
            <li
              className="bg-c4 flex flex-col gap-2 rounded-md p-2 md:flex-row"
              key={id}
            >
              <p>{input}</p>
              <div className="flex items-center gap-2">
                --&gt;
                {match.name ? (
                  <div className="flex items-center gap-2">
                    <p>{match.quantity}</p>
                    <p>{match.unit}</p>
                    <p>{match.name}</p>
                    <SearchModal
                      title="vara"
                      onSearch={searchItem}
                      item={{
                        ...match,
                        id: match.ingredientId,
                      }}
                      onSubmit={(i) =>
                        updateItem({ ...i, id, ingredientId: i.id })
                      }
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-c1">Kunde inte matcha ingrediens</p>
                    <SearchModal
                      title="vara"
                      onSearch={searchItem}
                      addIcon
                      onSubmit={(i) =>
                        addItem({ ...i, id, ingredientId: i.id })
                      }
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <h3 className="text-c5 text-lg">Instruktion</h3>
      <ol className="flex flex-col gap-2">
        {instruction.split("\n\n").map((i, n) => (
          <li key={`instruction-${n}`}>{i}</li>
        ))}
      </ol>
    </div>
  );
};

export default GetByLink;
