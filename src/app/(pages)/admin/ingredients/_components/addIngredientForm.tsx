"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { nameSchema, type NameType } from "~/zod/zodSchemas";
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
import type { AllIngredients } from "~/server/shared";

type Ingredient = AllIngredients[number];

type Props = {
  reset: (ing: Ingredient) => void;
  data: { categoryId: number; subcategoryId: number };
  uniques: string[];
  setSearch: (name: string) => void;
};

const AddIngredientForm = ({ data, reset, setSearch, uniques }: Props) => {
  const form = useForm<NameType>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });
  form.watch((data) => {
    if (data.name) {
      setSearch(data.name);
    }
  });

  const onSubmit = async ({ name }: NameType) => {
    if (uniques.includes(name)) {
      form.setError("name", {
        message: `${name} finns redan som ingrediens`,
      });
      return;
    }
    const ing = await addIngredient({
      name: name.toLowerCase().trim(),
      ...data,
    });
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
        <Button disabled={form.formState.isSubmitting} type="submit">
          Lägg till
        </Button>
      </form>
    </Form>
  );
};

export default AddIngredientForm;
