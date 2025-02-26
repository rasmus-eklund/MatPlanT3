"use client";
import { cn } from "~/lib/utils";
import SelectedIngredient from "./SelectedIngredient";
import AddIngredientForm from "./addIngredientForm";
import type { AllCategories, AllIngredients } from "~/server/shared";
import { useAdminIngredientStore } from "~/stores/admin-ingredient-store";

type Ingredient = AllIngredients[number];

type Props = {
  ingredients: Ingredient[];
  allCats: AllCategories;
};
const ShowIngredients = ({
  ingredients,
  allCats: { categories, subcategories },
}: Props) => {
  const {
    selectedIng,
    selectedCat,
    selectedSub,
    setSelectedCat,
    setSelectedSub,
    setSelectedIng,
    search,
    setSearch,
  } = useAdminIngredientStore();

  return (
    <section className="flex flex-col gap-3 p-5 md:max-w-sm">
      <AddIngredientForm items={ingredients} />
      <div className="flex flex-col gap-1 md:flex-row">
        <List name={`Ingredienser ${ingredients.length}`}>
          {ingredients
            .filter((ing) => {
              if (search) {
                return ing.name.includes(search.toLowerCase().trim());
              }
              if (selectedCat && !selectedSub) {
                return ing.category.id === selectedCat.id;
              }
              if (selectedSub) {
                return ing.subcategory.id === selectedSub.id;
              }
              return true;
            })
            .sort((a, b) => a.name.localeCompare(b.name, "sv"))
            .map((i) => (
              <li
                key={i.id}
                onClick={() => {
                  setSearch("");
                  if (i.id === selectedIng?.id) {
                    setSelectedIng(null);
                    setSelectedCat(null);
                    setSelectedSub(null);
                    return;
                  }
                  setSelectedIng(i);
                  setSelectedCat(i.category);
                  setSelectedSub(i.subcategory);
                }}
                className={cn(
                  "md:hover:bg-c3 flex cursor-pointer gap-1 px-2 select-none",
                  i.id === selectedIng?.id && "bg-c4",
                )}
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
                if (category.id === selectedCat?.id) {
                  setSelectedCat(null);
                  setSelectedSub(null);
                  return;
                }
                if (category.id === selectedIng?.category.id) {
                  setSelectedSub(selectedIng.subcategory);
                } else {
                  setSelectedSub(
                    subcategories.filter(
                      (i) => i.categoryId === category.id,
                    )[0] ?? null,
                  );
                }
                setSelectedCat(category);
              }}
              className={cn(
                "md:hover:bg-c4 cursor-pointer px-2 select-none",
                category.id === selectedIng?.category.id && "bg-c3",
                category.id === selectedCat?.id && "bg-c4",
              )}
              key={category.name + category.id}
            >
              {category.name}
            </li>
          ))}
        </List>
        <List name="Underkategori">
          {subcategories
            .filter((subcat) => subcat.categoryId === selectedCat?.id)
            .map((subcategory) => (
              <li
                onClick={() => {
                  if (subcategory.id === selectedSub?.id) {
                    setSelectedSub(null);
                    return;
                  }
                  setSelectedSub(subcategory);
                }}
                key={subcategory.name + subcategory.id}
                className={cn(
                  "md:hover:bg-c3 cursor-pointer px-2 select-none",
                  subcategory.id === selectedIng?.subcategory.id && "bg-c3",
                  subcategory.id === selectedSub?.id && "bg-c4",
                )}
              >
                {subcategory.name}
              </li>
            ))}
        </List>
      </div>
      {selectedIng && (
        <SelectedIngredient
          uniques={ingredients
            .filter((i) => i.name !== selectedIng.name)
            .map((i) => i.name)}
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
