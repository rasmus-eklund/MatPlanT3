"use client";
import { useForm } from "react-hook-form";
import { type NameType, nameSchema } from "~/zod/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { removeIngredient, updateIngredient } from "~/server/api/admin";
import Icon from "~/icons/Icon";
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
import { useState } from "react";
import type { AllIngredients } from "~/server/shared";
import { toast } from "sonner";
import { ensureError } from "~/lib/utils";
type Ingredient = AllIngredients[number];

type Props = {
  ing: Ingredient;
  selCat: Ingredient["category"];
  selSub: Ingredient["subcategory"];
  setSelectedIng: (ing: Ingredient) => void;
  onDelete: () => void;
};
const SelectedIngredient = ({
  ing,
  selCat,
  selSub,
  setSelectedIng,
  onDelete,
}: Props) => {
  const [deleting, setDeleting] = useState(false);
  const form = useForm<NameType>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: ing.name },
  });
  const watchName = form.watch("name");
  const onSubmit = async ({ name }: NameType) => {
    const res = await updateIngredient({
      id: ing.id,
      name: name.toLowerCase().trim(),
      categoryId: selCat.id,
      subcategoryId: selSub.id,
    });
    setSelectedIng(res);
    form.reset({ name: res.name });
  };
  const onRemove = async () => {
    setDeleting(true);
    try {
      await removeIngredient(ing.id);
      onDelete();
      toast.success(`Tog bort ${ing.name}`);
    } catch (error) {
      const err = ensureError(error);
      toast.error(err.message);
    }
    setDeleting(false);
  };
  const differentCat = ing.category.id !== selCat.id;
  const differentSub = ing.subcategory.id !== selSub.id;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 rounded-md border border-c5 p-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ingrediens</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <p>{ing.name}</p>
                  {form.formState.isDirty && (
                    <>
                      <Icon icon="arrowRight" className="w-6 fill-c4" />
                      <p>{watchName}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <p>{ing.category.name}</p>
                  {differentCat && (
                    <>
                      <Icon icon="arrowRight" className="w-6 fill-c4" />
                      <p>{selCat.name}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <p>{ing.subcategory.name}</p>
                  {differentSub && (
                    <>
                      <Icon icon="arrowRight" className="w-6 fill-c4" />
                      <p>{selSub.name}</p>
                    </>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          {(differentCat || differentSub || form.formState.isDirty) && (
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Spara ändring
            </Button>
          )}
          <Button type="button" disabled={deleting} onClick={onRemove}>
            <Icon icon="delete" className="w-10 fill-c5" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SelectedIngredient;
