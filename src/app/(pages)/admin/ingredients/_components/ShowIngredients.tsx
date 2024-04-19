"use client";
import { useState } from "react";
import SelectedIngredient from "./SelectedIngredient";
import AddIngredientForm from "./addIngredientForm";
import type { AllCategories, AllIngredients } from "~/server/shared";

type Ingredient = AllIngredients[number];

type Props = {
  ingredients: Ingredient[];
  allCats: AllCategories;
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

  const reset = (ing: Ingredient) => {
    setSearch("");
    setSelIngredient(ing);
  };
  return (
    <section className="flex flex-col gap-3 p-5 md:max-w-sm">
      <AddIngredientForm
        reset={reset}
        data={{ categoryId: selCat.id, subcategoryId: selSub.id }}
        uniques={ingredients.map((i) => i.name)}
        setSearch={(name) => setSearch(name)}
      />
      <div className="flex flex-col gap-1 md:flex-row">
        <List name="Ingredienser">
          {[
            ...ingredients.filter((ing) => {
              if (search) {
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
                    return i;
                  });
                }}
                className={`md:hover:bg-c3 flex cursor-pointer select-none gap-1 px-2 ${
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
              className={`md:hover:bg-c4 cursor-pointer select-none px-2 ${
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
                className={`md:hover:bg-c3 cursor-pointer select-none px-2 ${
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
      <ul className="border-c5 bg-c1 h-28 overflow-y-auto border-2 md:h-96 md:w-52">
        {children}
      </ul>
    </div>
  );
};

export default ShowIngredients;
