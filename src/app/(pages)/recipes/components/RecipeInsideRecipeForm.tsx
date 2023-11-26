import { Dispatch, SetStateAction, useState } from "react";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import Icon from "~/icons/Icon";
import crudFactory from "~/app/helpers/stateCrud";
import {
  tContained,
  tPortions,
  zPortions,
} from "~/zod/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import IconStyle from "~/icons/standardIconStyle";
import FormError from "~/app/_components/FormError";
import { useDebounce } from "usehooks-ts";

type RecipeSearch = RouterOutputs["recipe"]["search"][number];

type FormProps = {
  recipes: tContained[];
  setRecipes: Dispatch<SetStateAction<tContained[]>>;
};

const RecipeInsideRecipeForm = ({ recipes, setRecipes }: FormProps) => {
  const { add, update, remove } = crudFactory(setRecipes);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          className="w-full rounded-md bg-c2 px-4 py-2 outline-none focus:bg-c1"
          placeholder="Lägg till recept..."
          autoComplete="off"
          value={search}
          onChange={({ target: { value } }) => setSearch(value)}
        />
        <Results
          search={debouncedSearch}
          addItem={({ id, name, portions }) => {
            setSearch("");
            add({
              containedRecipeId: id,
              name,
              portions,
              id: crypto.randomUUID(),
            });
          }}
        />
      </form>
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
    </>
  );
};

type ResultsProps = {
  search: string;
  addItem: (item: RecipeSearch) => void;
};

const Results = ({ search, addItem }: ResultsProps) => {
  if (!!search) {
    const { data, isLoading, isError, isSuccess } = api.recipe.search.useQuery({
      search,
      shared: "false",
    });
    return (
      <ul className="flex max-w-sm flex-col border border-c5">
        {isSuccess &&
          data.map((r) => (
            <li
              className="flex items-center justify-between bg-c2 p-1 text-sm md:text-base"
              key={r.id + "searchResult"}
            >
              <p className="overflow-hidden overflow-ellipsis whitespace-nowrap ">
                {r.name}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <p>{r.portions} Port</p>
                <Icon
                  className={IconStyle}
                  icon="plus"
                  onClick={() => addItem(r)}
                />
              </div>
            </li>
          ))}
        {isLoading && <li>Söker...</li>}
        {isError && <li>Något gick fel...</li>}
      </ul>
    );
  }
};

type ItemProps = {
  item: tContained;
  remove: ({ id }: { id: string }) => void;
  update: (recipe: tContained) => void;
};
const RecipeItem = ({
  item: { id, name, portions, containedRecipeId },
  remove,
  update,
}: ItemProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<tPortions>({
    mode: "onChange",
    defaultValues: { portions },
    resolver: zodResolver(zPortions),
  });
  const [edit, setEdit] = useState(false);

  return (
    <li
      key={id}
      className="relative flex h-8 items-center justify-between rounded-md bg-c2 p-1 text-c5"
    >
      <FormError
        error={errors.portions}
        className="absolute right-0 top-full"
      />
      <p>{name}</p>
      <div className="flex gap-2">
        {edit ? (
          <form
            onSubmit={handleSubmit(({ portions }) => {
              setEdit(false);
              update({ id, name, portions, containedRecipeId });
            })}
            className="flex gap-2"
          >
            <input className="w-20 min-w-0" {...register("portions")} />
            <button>
              <Icon className={IconStyle} icon="check" />
            </button>
            <Icon
              icon="close"
              className={IconStyle}
              onClick={() => setEdit(false)}
            />
          </form>
        ) : (
          <>
            <p>{portions} port</p>
            <Icon
              className={IconStyle}
              icon="edit"
              onClick={() => setEdit(true)}
            />
            <Icon
              className={IconStyle}
              icon="delete"
              onClick={() => remove({ id })}
            />
          </>
        )}
      </div>
    </li>
  );
};

export default RecipeInsideRecipeForm;
