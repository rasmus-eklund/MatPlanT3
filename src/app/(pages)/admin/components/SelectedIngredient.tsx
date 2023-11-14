"use client";
import capitalize from "~/app/helpers/capitalize";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { tIngredientName, zIngredientName } from "~/zod/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import FormError from "~/app/_components/FormError";
import Button from "~/app/_components/Button";
import Icon from "~/app/assets/icons/Icon";
import { useRouter } from "next/navigation";
type Ingredient = RouterOutputs["admin"]["getAll"][number];

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
  const router = useRouter();

  const {
    register,
    formState: { errors, isDirty },
    setValue,
    watch,
    handleSubmit,
  } = useForm<tIngredientName>({
    resolver: zodResolver(zIngredientName),
    defaultValues: {name: ing.name}
  });
  const watchName = watch("name");
  const { mutate: update, isLoading: updating } = api.admin.update.useMutation({
    onSuccess: (ing) => {
      router.refresh();
      setSelectedIng(ing);
    },
  });
  const { mutate: remove, isLoading: deleting } = api.admin.remove.useMutation({
    onSuccess: () => {
      router.refresh();
      onDelete();
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
      <div className="flex gap-2 items-center">
        <p>{ing.name}</p>
        {isDirty && (
          <>
            <Icon icon="arrowRight" className="w-6 fill-c4" />
            <p>{watchName}</p>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <p>{ing.category.name}</p>
        {differentCat && <p>{` ---> ${selCat.name}`}</p>}
      </div>
      <div className="flex gap-2">
        <p>{ing.subcategory.name}</p>
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
