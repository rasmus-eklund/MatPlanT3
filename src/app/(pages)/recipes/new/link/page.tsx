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
import EditItem from "~/components/common/EditItem";
import { type Item } from "~/zod/zodSchemas";
import { toast } from "sonner";
import { createRecipe } from "~/server/api/recipes";

const urlSchema = z.object({ url: z.string().url() });
type UrlSchema = z.infer<typeof urlSchema>;

const GetByLink = () => {
  const [recipe, setRecipe] = useState<ExternalRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const form = useForm<UrlSchema>({
    defaultValues: { url: "" },
    resolver: zodResolver(urlSchema),
    mode: "onChange",
  });
  const handleFetch = async ({ url }: UrlSchema) => {
    setLoading(true);
    setRecipe(null);
    try {
      const res = await getRecipe({ url });

      if (!res.ok) {
        setRecipe(null);
        form.setError("url", { message: res.message });
        setLoading(false);
        return;
      }
      setRecipe(res.recipe);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setRecipe(null);
      form.setError("url", { message: "Kunde inte läsa recept" });
      setLoading(false);
    }
  };
  const updateItem = async ({
    id,
    quantity,
    unit,
    name,
    ingredientId,
  }: Item) => {
    setRecipe((p) => {
      if (!p) return p;
      const newIngredients = p.ingredients.map((i) => {
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
      return { ...p, ingredients: newIngredients };
    });
  };

  const addItem = async (ing: Item) => {
    if (!recipe) return;
    const match = {
      ...ing,
      recipeId: recipe.recipeId,
      groupId: null,
      order: 0,
    };
    setRecipe((p) => {
      if (!p) return p;
      const newIngredients = p.ingredients.map((i) => {
        if (i.id === ing.id) {
          return { ...i, match };
        }
        return i;
      });
      return { ...p, ingredients: newIngredients };
    });
  };

  const saveRecipe = async () => {
    if (!recipe) return;
    setLoading(true);
    const newRecipe: CreateRecipeInput = {
      id: recipe.recipeId,
      name: recipe.name,
      quantity: recipe.quantity,
      unit: recipe.unit,
      instruction: recipe.instruction,
      isPublic: false,
      ingredients: recipe.ingredients.map((i, order) => ({
        ...i.match,
        order,
      })),
      groups: [],
      contained: [],
    };
    await createRecipe(newRecipe);
    setLoading(false);
    toast.success("Lade till recept");
  };

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
      {loading && <ClipLoader size={80} />}
      {recipe ? (
        <div>
          <Comparison
            recipe={recipe}
            updateItem={updateItem}
            addItem={addItem}
          />
          <div className="flex justify-end gap-2">
            <Button disabled={loading} onClick={saveRecipe}>
              Spara
            </Button>
            <Button onClick={() => setRecipe(null)}>Avbryt</Button>
          </div>
        </div>
      ) : (
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
      )}
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
  const { ingredients, instruction, name } = recipe;

  return (
    <div className="bg-c3 flex flex-col gap-4 p-3">
      <h2 className="text-c5 text-2xl">{name}</h2>
      {ingredients.map(({ id, input, match }) => {
        return (
          <div className="flex gap-2" key={id}>
            <p>{input}</p>
            --&gt;
            {match.name ? (
              <div className="flex items-center gap-2">
                <p>{match.quantity}</p>
                <p>{match.unit}</p>
                <p>{match.name}</p>
                <EditItem item={match} onUpdate={updateItem} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-c1">Kunde inte matcha ingrediens</p>
                <EditItem item={match} onUpdate={addItem} add />
              </div>
            )}
          </div>
        );
      })}
      <h3 className="text-c5 text-lg">Instruktion</h3>
      <ol>
        {instruction.split("\n\n").map((i, n) => (
          <li key={`instruction-${n}`}>{i}</li>
        ))}
      </ol>
    </div>
  );
};

export default GetByLink;
