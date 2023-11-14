"use client";
import { FormEvent, useState } from "react";
import { RouterOutputs } from "~/trpc/shared";
import SelectedIngredient from "./SelectedIngredient";
import Button from "~/app/_components/Button";
import toast from "react-hot-toast";
import { api } from "~/trpc/react";
import { zIngredientName } from "~/zod/zodSchemas";
import { useRouter } from "next/navigation";

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
  const [selIngredient, setSelIngredient] = useState<Ingredient | null>(null);
  const [selCat, setSelCat] = useState(categories[0]!);
  const { id, name } = subcategories.find((i) => i.categoryId === selCat.id)!;
  const [selSub, setSelSub] = useState({ id, name });
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { mutate: add } = api.admin.add.useMutation({
    onSuccess: () => {
      router.refresh();
      setSearch("");
      setSelIngredient(null);
    },
  });
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = zIngredientName.safeParse({
      name: search.toLowerCase().trim(),
    });
    if (!parsed.success) {
      toast.error(parsed.error.message);
      return;
    }
    if (ingredients.find((i) => i.name === search)) {
      toast.error("Ingrediensen finns redan");
      return;
    }
    add({
      name: parsed.data.name,
      categoryId: selCat.id,
      subcategoryId: selSub.id,
    });
  };

  return (
    <section className="flex flex-col gap-3 p-2 md:max-w-sm">
      <form onSubmit={onSubmit} className="flex flex-col">
        <div className="flex gap-2">
          <input
            className="grow"
            value={search}
            onChange={({ target: { value } }) => setSearch(value)}
          />
          <Button>Lägg till</Button>
        </div>
      </form>
      <div className="flex flex-col gap-1 md:flex-row">
        <List name="Ingredienser">
          {[
            ...ingredients.filter((ing) => {
              if (!!search) {
                return ing.name.includes(search.toLowerCase().trim());
              }
              return (
                (ing.category.id === selCat.id &&
                  ing.subcategory.id === selSub.id) ||
                selIngredient?.id === ing.id
              );
            }),
          ]
            .sort((a, b) => a.name.length - b.name.length)
            .map((i) => (
              <li
                key={i.id}
                onClick={() => {
                  setSearch("");
                  setSelIngredient((p) => {
                    if (p && i.id === p.id) {
                      return null;
                    }
                    setSelCat(i.category);
                    setSelSub(i.subcategory);
                    console.log(p);
                    return i;
                  });
                }}
                className={`flex cursor-pointer select-none gap-1 px-2 md:hover:bg-c3 ${
                  i.id === selIngredient?.id && "bg-c4"
                }`}
              >
                <p>{i.name}</p>
                <p>({i.count})</p>
              </li>
            ))}
        </List>
        <List name="Kategori">
          {categories.map((category) => (
            <li
              onClick={() => {
                setSelCat(category);
              }}
              className={`cursor-pointer select-none px-2 md:hover:bg-c4 ${
                category.id === selIngredient?.category.id && "bg-c3"
              } ${category.id === selCat.id && "bg-c4"}`}
              key={category.name + category.id}
            >
              {category.name}
            </li>
          ))}
        </List>
        <List name="Underkategori">
          {subcategories
            .filter((subcat) => subcat.categoryId === selCat.id)
            .map((subcategory) => (
              <li
                onClick={() => setSelSub(subcategory)}
                key={subcategory.name + subcategory.id}
                className={`cursor-pointer select-none px-2 md:hover:bg-c3 ${
                  subcategory.id === selIngredient?.subcategory.id && "bg-c3"
                } ${subcategory.id === selSub.id && "bg-c4"}`}
              >
                {subcategory.name}
              </li>
            ))}
        </List>
      </div>
      {selIngredient && (
        <SelectedIngredient
          ing={selIngredient}
          selCat={selCat}
          selSub={selSub}
          setSelectedIng={(ing) => setSelIngredient(ing)}
          onDelete={() => setSelIngredient(ingredients[0]!)}
        />
      )}
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
