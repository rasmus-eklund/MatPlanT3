"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zName, type tName } from "~/zod/zodSchemas";
import { addIngredient } from "~/server/api/admin";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import type { GetAllIngredients } from "~/server/shared";

type Ingredient = GetAllIngredients[number];

type Props = {
  reset: (ing: Ingredient) => void;
  data: { categoryId: number; subcategoryId: number };
  uniques: string[];
  setSearch: (name: string) => void;
};

const AddIngredientForm = ({ data, reset, setSearch, uniques }: Props) => {
  const form = useForm<tName>({
    resolver: zodResolver(zName),
    defaultValues: { name: "" },
  });
  form.watch((data) => {
    if (data.name) {
      setSearch(data.name);
    }
  });

  const onSubmit = async ({ name }: tName) => {
    if (uniques.includes(name)) {
      form.setError("name", {
        message: `${name} finns redan som ingrediens`,
      });
      return;
    }
    const ing = await addIngredient({ name, ...data });
    reset(ing);
    toast.success(`${name} har lagts till!`);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingrediens</FormLabel>
              <FormControl>
                <Input placeholder="Apelsin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Lägg till</Button>
      </form>
    </Form>
  );
};

export default AddIngredientForm;
