import { RecipeSearch, SearchParams } from "@/types";
import { FC, useState } from "react";
import SearchRecipeForm from "./SearchRecipeForm";
import { SearchRecipeByFilter } from "@/app/server-side/recipes";
import DeleteButton from "../buttons/DeleteButton";
import PlusIcon from "../icons/PlusIcon";
import EditButton from "../buttons/EditButton";
import SaveButton from "../buttons/SaveButton";
import CloseButton from "../buttons/CloseButton";

type RecipeInsideRecipeFormProps = {
  recipes: RecipeSearch[];
  handleAddRecipe: (recipe: RecipeSearch) => void;
  handleRemoveRecipe: (id: string) => void;
  handleUpdatePortions: (recipe: RecipeSearch) => void;
};

const RecipeInsideRecipeForm: FC<RecipeInsideRecipeFormProps> = ({
  recipes,
  handleAddRecipe,
  handleRemoveRecipe,
  handleUpdatePortions,
}) => {
  const [recipeSearchResult, setRecipeSearchResult] = useState<RecipeSearch[]>(
    [],
  );

  const handleSearchRecipe = (params: SearchParams) => {
    SearchRecipeByFilter(params).then((res) => {
      setRecipeSearchResult(res);
    });
    return true;
  };

  const handleAddSearchItem = (item: RecipeSearch) => {
    handleAddRecipe(item);
    setRecipeSearchResult([]);
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-c2 text-lg">Recept</h2>
      <div className="flex flex-col gap-2 bg-c3 p-2 rounded-md">
        <SearchRecipeForm handleSearch={handleSearchRecipe} onlySearch={true} />
        {recipeSearchResult.length !== 0 && (
          <ul className="flex flex-col gap-2 bg-c4 p-2 rounded-md">
            {recipeSearchResult
              .filter((i) => !recipes.some((r) => r.id === i.id))
              .map((r) => (
                <li
                  onClick={() => handleAddSearchItem(r)}
                  className="flex px-2 text-c5 font-bold bg-c2 rounded-md cursor-pointer items-center justify-between hover:bg-c5 hover:text-c2 group"
                  key={r.id + "searchResult"}
                >
                  <p className="overflow-hidden whitespace-nowrap overflow-ellipsis text-sm md:text-base">
                    {r.name}
                  </p>
                  <div className="flex gap-2 items-center shrink-0">
                    <p className="text-sm md:text-base">{r.portions} Port</p>
                    <PlusIcon className="fill-c5 h-5 group-hover:fill-c2" />
                  </div>
                </li>
              ))}
          </ul>
        )}
        <ul className="flex flex-col gap-1 py-2">
          {recipes.map((rec) => (
            <RecipeItem
              key={rec.id}
              handleRemoveRecipe={handleRemoveRecipe}
              handleUpdatePortions={handleUpdatePortions}
              item={rec}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

type RecipeItemProps = {
  item: RecipeSearch;
  handleRemoveRecipe: (id: string) => void;
  handleUpdatePortions: (recipe: RecipeSearch) => void;
};
const RecipeItem: FC<RecipeItemProps> = ({
  item: { id, name, portions },
  handleRemoveRecipe,
  handleUpdatePortions,
}) => {
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(portions);
  const handleSave = () => {
    handleUpdatePortions({ name, id, portions: value });
    setEdit(false);
  };
  return (
    <li
      key={id + "contained"}
      className="flex px-2 h-8 text-c5 font-bold bg-c2 rounded-md items-center justify-between"
    >
      <p>{name}</p>
      <div className="flex gap-2">
        {edit ? (
          <>
            <input
              className="w-10 text-center"
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
            <SaveButton callback={handleSave} />
            <CloseButton callback={() => setEdit(false)} />
          </>
        ) : (
          <>
            <p>{portions} port</p>
            <EditButton callback={() => setEdit(true)} />
            <DeleteButton callback={() => handleRemoveRecipe(id)} />
          </>
        )}
      </div>
    </li>
  );
};

export default RecipeInsideRecipeForm;
