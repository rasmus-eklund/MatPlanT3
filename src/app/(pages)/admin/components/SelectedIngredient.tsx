"use client";
import capitalize from "~/app/helpers/capitalize";
import { RouterOutputs } from "~/trpc/shared";
import Button from "../../../_components/Button";
import Icon from "../../../assets/icons/Icon";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { tIngredientName, zIngredientName } from "~/zod/zodSchemas";
import FormError from "../../../_components/FormError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
type Ingredient = RouterOutputs["admin"]["getAll"][number];

type Props = {
  ing: Ingredient;
  selCat: Ingredient["category"];
  selSub: Ingredient["subcategory"];
};
const SelectedIngredient = ({ ing, selCat, selSub }: Props) => {
  const utils = api.useUtils();
  const {
    register,
    formState: { errors, isDirty },
    setValue,
    watch,
    handleSubmit,
  } = useForm<tIngredientName>({
    resolver: zodResolver(zIngredientName),
  });
  const name = watch("name");
  const { mutate: update, isLoading: updating } = api.admin.update.useMutation({
    onSuccess: () => {
      utils.admin.getAll.invalidate();
    },
  });
  const { mutate: remove, isLoading: deleting } = api.admin.remove.useMutation({
    onSuccess: () => {
      utils.admin.getAll.invalidate();
    },
  });
  const onSubmit = ({ name }: tIngredientName) => {
    update({
      id: ing.id,
      ing: {
        categoryId: selCat.id,
        subcategoryId: selSub.id,
        name: name.toLowerCase().trim(),
      },
    });
  };
  const differentCat = ing.category.id !== selCat.id;
  const differentSub = ing.subcategory.id !== selSub.id;
  useEffect(() => {
    setValue("name", ing.name);
  }, [ing.name]);
  return (
    <form
      className="flex flex-col gap-2 bg-c3 p-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input {...register("name")} className="text-xl" />
      <FormError error={errors.name} />
      <div className="flex gap-2">
        <p>{capitalize(ing.name)}</p>
        {differentCat && <p>{` ---> ${name}`}</p>}
      </div>
      <div className="flex gap-2">
        <p>{capitalize(ing.category.name)}</p>
        {differentCat && <p>{` ---> ${selCat.name}`}</p>}
      </div>
      <div className="flex gap-2">
        <p>{capitalize(ing.subcategory.name)}</p>
        {differentSub && <p>{` ---> ${selSub.name}`}</p>}
      </div>
      <div className="flex justify-between">
        {(differentCat || differentSub || isDirty) && (
          <Button type="submit" disabled={updating}>
            Spara ändring
          </Button>
        )}
        <button
          type="button"
          disabled={deleting}
          onClick={() => remove({ id: ing.id })}
        >
          <Icon icon="delete" className="w-10 fill-c5" />
        </button>
      </div>
    </form>
  );
};

export default SelectedIngredient;
