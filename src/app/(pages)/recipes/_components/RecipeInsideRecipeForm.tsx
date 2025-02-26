import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import Icon from "~/icons/Icon";
import { zodResolver } from "@hookform/resolvers/zod";
import { crudFactory } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { searchRecipeInsideRecipe } from "~/server/api/recipes";
import type { RecipeSearch, Recipe } from "~/server/shared";
import { z } from "zod";
import { Label } from "~/components/ui/label";
import { unitsAbbr } from "~/lib/constants/units";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { ClipLoader } from "react-spinners";

type Data =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: RecipeSearch };

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
  const [data, setData] = useState<Data>({
    status: "idle",
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounceValue(search, 1000);

  useEffect(() => {
    if (!debouncedSearch) return setData({ status: "idle" });
    setData({ status: "loading" });
    searchRecipeInsideRecipe(debouncedSearch, parentId)
      .then((data) => {
        setData({ status: "success", data });
      })
      .catch((error) => {
        console.log(error);
        setData({ status: "idle" });
        toast.error("Kunde inte hitta recept");
      });
  }, [debouncedSearch, parentId]);

  return (
    <div className="bg-c3 relative flex flex-col gap-2 rounded-md p-4">
      <div className="space-y-2">
        <Label>Recept</Label>
        <div className="relative flex items-center">
          <Input
            className="bg-c2 focus:bg-c1 w-full rounded-md px-4 py-2 outline-hidden"
            placeholder="Lägg till recept..."
            autoComplete="off"
            value={search}
            onChange={({ target: { value } }) => setSearch(value)}
          />
          {data.status === "loading" && (
            <ClipLoader className="absolute right-1" size={20} />
          )}
        </div>
      </div>
      {data.status === "success" && (
        <SearchResults
          data={data.data}
          addItem={(item) => {
            setSearch("");
            add({
              name: item.name,
              id: crypto.randomUUID(),
              quantity: 1,
              recipeId: item.id,
              containerId: parentId,
              unit: item.unit,
            });
            setData({ status: "success", data: [] });
          }}
        />
      )}
      {!!recipes.length && (
        <ul className="bg-c4 flex flex-col gap-1 rounded-md p-1">
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
  data: RecipeSearch;
  addItem: (item: RecipeSearch[number]) => void;
};

const SearchResults = ({ data, addItem }: SearchResultsProps) => {
  return (
    <ul className="border-c5 absolute top-full z-10 flex w-full max-w-sm flex-col border">
      {data.map((r) => (
        <li
          className="bg-c2 hover:bg-c4 flex cursor-pointer items-center justify-between overflow-hidden p-1 text-sm text-ellipsis whitespace-nowrap md:text-base"
          key={r.id}
          onClick={() => addItem(r)}
        >
          {r.name}
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
  item: { id, name, quantity, recipeId, containerId, unit },
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
      className="bg-c2 text-c5 relative flex flex-col rounded-md p-1"
    >
      <div className="flex justify-between">
        <p>{name}</p>
        <Icon icon="delete" onClick={() => remove({ id })} />
      </div>

      {edit ? (
        <form
          onSubmit={form.handleSubmit(({ quantity }) => {
            update({ id, name, quantity, recipeId, containerId, unit });
            setEdit(false);
          })}
          className="flex w-full gap-2"
        >
          <input className="w-20 min-w-0" {...form.register("quantity")} />
          <button>
            <Icon icon="check" />
          </button>
          <Icon icon="close" onClick={() => setEdit(false)} />
        </form>
      ) : (
        <div className="flex gap-2">
          <p>
            {quantity} {unitsAbbr[unit]}
          </p>
          <Icon icon="edit" onClick={() => setEdit(true)} />
        </div>
      )}
    </li>
  );
};

export default RecipeInsideRecipeForm;
