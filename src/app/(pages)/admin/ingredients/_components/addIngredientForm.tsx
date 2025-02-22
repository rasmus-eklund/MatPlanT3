"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { z } from "zod";
import { useAdminIngredientStore } from "~/stores/admin-ingredient-store";
import Icon from "~/icons/Icon";

type Props = {
  uniques: string[];
};

const AddIngredientForm = ({ uniques }: Props) => {
  const { selectedCat, selectedSub, setSearch, reset } =
    useAdminIngredientStore();
  const nameSchema = z
    .object({ name: z.string().min(2, "Minst 2 tecken.") })
    .refine(
      (v) =>
        !uniques.map((i) => i.toLowerCase()).includes(v.name.toLowerCase()),
      (v) => ({
        message: `${v.name} finns redan som ingrediens`,
        path: ["name"],
      }),
    );
  type NameType = z.infer<typeof nameSchema>;
  const form = useForm<NameType>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
    mode: "all",
  });

  form.watch((data) => {
    data.name ? setSearch(data.name) : setSearch("");
  });

  const onSubmit = async ({ name }: NameType) => {
    if (uniques.includes(name)) {
      form.setError("name", {
        message: `${name} finns redan som ingrediens`,
      });
      return;
    }
    if (!selectedCat || !selectedSub) {
      form.setError("name", {
        message: "Välj en kategori och underkategori först",
      });
      return;
    }
    await addIngredient({
      name: name.toLowerCase().trim(),
      categoryId: selectedCat.id,
      subcategoryId: selectedSub.id,
    });
    reset();
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
                <div className="relative">
                  <Input placeholder="Apelsin" {...field} />
                  <button
                    type="button"
                    onClick={() => {
                      form.reset();
                      reset();
                    }}
                    className="absolute top-1/2 right-0 -translate-y-1/2"
                  >
                    <Icon icon="close" className="fill-c5 w-10" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting || !form.formState.isValid}
          type="submit"
        >
          Lägg till
        </Button>
      </form>
    </Form>
  );
};

export default AddIngredientForm;
