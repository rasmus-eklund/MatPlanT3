"use client";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { ensureError } from "~/lib/utils";
import { z } from "zod";
import { useAdminIngredientStore } from "~/stores/admin-ingredient-store";

const SelectedIngredient = ({ uniques }: { uniques: string[] }) => {
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
  const { setSelectedIng } = useAdminIngredientStore();
  const selectedIng = useAdminIngredientStore((state) => state.selectedIng);
  const selectedCat = useAdminIngredientStore((state) => state.selectedCat);
  const selectedSub = useAdminIngredientStore((state) => state.selectedSub);
  const diffCat = useAdminIngredientStore((state) => state.diffCat);
  const diffSub = useAdminIngredientStore((state) => state.diffSub);
  const [deleting, setDeleting] = useState(false);
  const form = useForm<NameType>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: selectedIng?.name ?? "" },
    mode: "onChange",
  });
  if (!selectedIng) return null;
  const watchName = form.watch("name");
  const onSubmit = async ({ name }: NameType) => {
    if (!selectedCat || !selectedSub) {
      form.setError("name", {
        message: "Välj en kategori och underkategori först",
      });
      return;
    }
    const res = await updateIngredient({
      id: selectedIng.id,
      name: name.toLowerCase().trim(),
      categoryId: selectedCat.id,
      subcategoryId: selectedSub.id,
    });
    toast.success(`Sparade ändringar till ${res.name}`);
    setSelectedIng(null);
    form.reset({ name: res.name });
  };
  const onRemove = async () => {
    setDeleting(true);
    try {
      await removeIngredient(selectedIng.id);
      toast.success(`Tog bort ${selectedIng.name}`);
      setSelectedIng(null);
    } catch (error) {
      const err = ensureError(error);
      toast.error(err.message);
    }
    setDeleting(false);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border-c5 flex flex-col gap-2 rounded-md border p-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Ingrediens</FormLabel>
                <button onClick={() => setSelectedIng(null)}>
                  <Icon icon="close" className="fill-c5 w-10" />
                </button>
              </div>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <p>{selectedIng.name}</p>
                  {form.formState.isDirty && (
                    <>
                      <Icon
                        icon="arrowRight"
                        className="fill-c4 cursor-default"
                      />
                      <p>{watchName}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <p>{selectedIng.category.name}</p>
                  {diffCat && (
                    <>
                      <Icon
                        icon="arrowRight"
                        className="fill-c4 cursor-default"
                      />
                      <p>{selectedCat?.name}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <p>{selectedIng.subcategory.name}</p>
                  {diffSub && (
                    <>
                      <Icon
                        icon="arrowRight"
                        className="fill-c4 cursor-default"
                      />
                      <p>{selectedSub?.name}</p>
                    </>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          {(diffCat || diffSub || form.formState.isDirty) && (
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Spara ändring
            </Button>
          )}
          <button type="button" disabled={deleting} onClick={onRemove}>
            <Icon icon="delete" className="fill-c5 w-10" />
          </button>
        </div>
      </form>
    </Form>
  );
};

export default SelectedIngredient;
