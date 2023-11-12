"use client";
import { useState } from "react";
import capitalize from "~/app/helpers/capitalize";
import { RouterOutputs } from "~/trpc/shared";
import SelectedIngredient from "./SelectedIngredient";
import Button from "../Button";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import FormError from "../FormError";
import { zodResolver } from "@hookform/resolvers/zod";
import { tIngredientName, zIngredientName } from "~/zod/zodSchemas";

type Ingredient = RouterOutputs["admin"]["getAll"][number];
type AllCats = RouterOutputs["admin"]["categories"];

type Props = {
  ingredients: Ingredient[];
  allCats: AllCats;
};
const ShowIngredients = ({
  ingredients,
  allCats: { categories, subcategories },
}: Props) => {
  const [selIngredient, setSelIngredient] = useState(ingredients[0]!);
  const [selCat, setSelCat] = useState(selIngredient.category);
  const [selSub, setSelSub] = useState(selIngredient.subcategory);
  const utils = api.useUtils();
  const { mutate: add } = api.admin.add.useMutation({
    onSuccess: () => {
      utils.admin.getAll.invalidate();
      utils.ingredient.invalidate();
    },
  });
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<tIngredientName>({
    resolver: zodResolver(zIngredientName),
    defaultValues: { name: ingredients[0]!.name },
  });
  const onSubmit = ({ name }: tIngredientName) => {
    if (ingredients.find((i) => i.name === name)) {
      toast.error("Ingrediensen finns redan");
      return;
    }
    add({ name, categoryId: 1, subcategoryId: 1 });
  };
  const [search] = watch(["name"]);
  return (
    <section className="flex flex-col gap-3 p-2 md:max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="flex gap-2">
          <input className="grow" {...register("name")} />
          <Button>Lägg till</Button>
        </div>
        <FormError error={errors.name} />
      </form>
      <div className="flex flex-col gap-1 md:flex-row">
        <List name="Ingredienser">
          {[...ingredients.filter((ing) => ing.name.includes(search))]
            .sort((a, b) => a.name.length - b.name.length)
            .map((i) => (
              <li
                key={i.id}
                onClick={() => {
                  setSelIngredient(i);
                  setSelCat(i.category);
                  setSelSub(i.subcategory);
                }}
                className={`cursor-pointer px-2 md:hover:bg-c3 ${
                  i.id === selIngredient.id && "bg-c4"
                }`}
              >
                {capitalize(i.name)}
              </li>
            ))}
        </List>
        <List name="Kategori">
          {categories.map((category) => (
            <li
              onClick={() => setSelCat(category)}
              className={`cursor-pointer px-2 md:hover:bg-c4 ${
                category.id === selIngredient.category.id && "bg-c3"
              } ${category.id === selCat.id && "bg-c4"}`}
              key={category.name + category.id}
            >
              {capitalize(category.name)}
            </li>
          ))}
        </List>
        <List name="Underkategori">
          {subcategories
            .filter((subcat) => subcat.categoryId === selIngredient.category.id)
            .map((subcategory) => (
              <li
                onClick={() => setSelSub(subcategory)}
                key={subcategory.name + subcategory.id}
                className={`cursor-pointer px-2 md:hover:bg-c3 ${
                  subcategory.id === selIngredient.subcategory.id && "bg-c3"
                } ${subcategory.id === selSub.id && "bg-c4"}`}
              >
                {capitalize(subcategory.name)}
              </li>
            ))}
        </List>
      </div>
      <SelectedIngredient ing={selIngredient} selCat={selCat} selSub={selSub} />
    </section>
  );
};

type ListProps = {
  name: string;
  children: React.ReactNode;
};
const List = ({ children, name }: ListProps) => {
  return (
    <div className="flex flex-col">
      <h2 className="self-center text-xl">{name}</h2>
      <ul className="h-28 overflow-y-auto border-2 border-c5 bg-c1 md:h-96 md:w-52">
        {children}
      </ul>
    </div>
  );
};

export default ShowIngredients;
