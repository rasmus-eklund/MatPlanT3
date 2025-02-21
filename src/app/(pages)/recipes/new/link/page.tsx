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
import type { ExternalRecipe } from "~/types";

const urlSchema = z.object({ url: z.string().url() });
type UrlSchema = z.infer<typeof urlSchema>;

const GetByLink = () => {
  const [recipe, setRecipe] = useState<ExternalRecipe | null>(null);
  const form = useForm<UrlSchema>({
    defaultValues: { url: "" },
    resolver: zodResolver(urlSchema),
    mode: "onChange",
  });
  const handleFetch = async ({ url }: UrlSchema) => {
    const res = await getRecipe({ url });
    if (!res.ok) {
      setRecipe(null);
      form.setError("url", { message: res.message });
      return;
    }
    setRecipe(res.recipe);
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
      {recipe ? (
        <Comparison recipe={recipe} />
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
  { name: "Zeta.nu", url: "https://www.zeta.nu/recept/" },
  { name: "Godare.se", url: "https://www.godare.se/recept" },
  { name: "Mathem.se", url: "https://www.mathem.se/se/recipes/" },
  {
    name: "AlltOmMat.expressen.se",
    url: "https://alltommat.expressen.se/recept/",
  },
];

const Comparison = ({ recipe }: { recipe: ExternalRecipe }) => {
  const { ingredients, instruction, name } = recipe;
  return (
    <div className="bg-c3 flex flex-col gap-2 p-3">
      <h2>{name}</h2>
      {ingredients.map(({ input, match }) => {
        const { name, quantity, unit, id } = match;
        return (
          <div className="flex gap-2" key={id}>
            <p>{input}</p>
            --&gt;
            <div className="flex items-center gap-2">
              <p>{name}</p>
              <p>{quantity}</p>
              <p>{unit}</p>
            </div>
          </div>
        );
      })}
      <h3>Instruktion</h3>
      <ol>
        {instruction.split("\n\n").map((i, n) => (
          <li key={`instruction-${n}`}>{i}</li>
        ))}
      </ol>
    </div>
  );
};

export default GetByLink;
