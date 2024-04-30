import { type Dispatch, type SetStateAction, useState } from "react";

import { useForm } from "react-hook-form";
import Icon from "~/icons/Icon";
import { zodResolver } from "@hookform/resolvers/zod";
import { crudFactory } from "~/lib/utils";
import type { MeilRecipe } from "~/types";
import { Input } from "~/components/ui/input";
import { searchRecipeInsideRecipe } from "~/server/api/recipes";
import { type Recipe } from "~/server/shared";
import { z } from "zod";
import { Label } from "~/components/ui/label";

type Status = "loading" | "error" | "success";

type FormProps = {
  recipes: Recipe["contained"];
  setRecipes: Dispatch<SetStateAction<Recipe["contained"]>>;
  parentId: string;
};

const RecipeInsideRecipeForm = ({
  recipes,
  setRecipes,
  parentId,
}: FormProps) => {
  const { add, update, remove } = crudFactory(setRecipes);
  const [{ status, data }, setFoundRecipes] = useState<{
    status: Status;
    data: MeilRecipe[];
  }>({ status: "success", data: [] });
  const [search, setSearch] = useState("");
  const searchRecipes = async (search: string) => {
    setFoundRecipes({ status: "loading", data: [] });
    try {
      const data = await searchRecipeInsideRecipe(search);
      setFoundRecipes({ status: "success", data });
    } catch (error) {
      setFoundRecipes({ status: "error", data: [] });
    }
  };

  return (
    <div className="relative flex flex-col gap-2 rounded-md bg-c3 p-4">
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await searchRecipes(search);
        }}
      >
        <Label>Recept</Label>
        <Input
          className="w-full rounded-md bg-c2 px-4 py-2 outline-none focus:bg-c1"
          placeholder="Lägg till recept..."
          autoComplete="off"
          value={search}
          onChange={({ target: { value } }) => setSearch(value)}
        />
      </form>
      {status === "success" && !!data.length && (
        <SearchResults
          parentId={parentId}
          data={data}
          addItem={(item) => {
            setSearch("");
            add({
              name: item.name,
              id: crypto.randomUUID(),
              quantity: 1,
              recipeId: item.id,
              containerId: parentId,
            });
            setFoundRecipes({ status: "success", data: [] });
          }}
        />
      )}
      {!!recipes.length && (
        <ul className="flex flex-col gap-1 rounded-md bg-c4 p-1">
          {recipes.map((rec) => (
            <RecipeItem
              key={rec.id}
              item={rec}
              remove={remove}
              update={update}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

type SearchResultsProps = {
  data: MeilRecipe[];
  parentId: string;
  addItem: (item: MeilRecipe) => void;
};

const SearchResults = ({ data, parentId, addItem }: SearchResultsProps) => {
  return (
    <ul className="absolute top-full z-10 flex w-full max-w-sm flex-col border border-c5">
      {data
        .filter((r) => r.id !== parentId)
        .map((r) => (
          <li
            className="flex items-center justify-between bg-c2 p-1 text-sm md:text-base"
            key={r.id}
          >
            <p className="overflow-hidden overflow-ellipsis whitespace-nowrap ">
              {r.name}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Icon icon="plus" onClick={() => addItem(r)} />
            </div>
          </li>
        ))}
    </ul>
  );
};

type ItemProps = {
  item: Recipe["contained"][number];
  remove: ({ id }: { id: string }) => void;
  update: (recipe: Recipe["contained"][number]) => void;
};
const RecipeItem = ({
  item: { id, name, quantity, recipeId, containerId },
  remove,
  update,
}: ItemProps) => {
  const quantitySchema = z.object({ quantity: z.coerce.number().positive() });
  const form = useForm<z.infer<typeof quantitySchema>>({
    defaultValues: { quantity },
    resolver: zodResolver(quantitySchema),
  });
  const [edit, setEdit] = useState(false);

  return (
    <li
      key={id}
      className="relative flex h-8 items-center justify-between rounded-md bg-c2 p-1 text-c5"
    >
      <p>{name}</p>
      <div className="flex gap-2">
        {edit ? (
          <form
            onSubmit={form.handleSubmit(({ quantity }) => {
              update({ id, name, quantity, recipeId, containerId });
              setEdit(false);
            })}
            className="flex gap-2"
          >
            <input className="w-20 min-w-0" {...form.register("quantity")} />
            <button>
              <Icon icon="check" />
            </button>
            <Icon icon="close" onClick={() => setEdit(false)} />
          </form>
        ) : (
          <>
            <p>{quantity} port</p>
            <Icon icon="edit" onClick={() => setEdit(true)} />
            <Icon icon="delete" onClick={() => remove({ id })} />
          </>
        )}
      </div>
    </li>
  );
};

export default RecipeInsideRecipeForm;
