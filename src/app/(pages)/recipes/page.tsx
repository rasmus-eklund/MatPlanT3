"use client";
import { useEffect, useState } from "react";
import { Recipe, RecipeSearch, SearchParams } from "@/types";
import SearchRecipeForm from "../components/recipes/SearchRecipeForm";
import FoundRecipes from "../components/recipes/FoundRecipes";
import { SearchRecipeByFilter, addRecipe } from "../server-side/recipes";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import RecipeForm from "../components/recipes/RecipeForm";
import Loading from "../components/Loading";

enum Filter {
  name = "name",
  ingredients = "ingredient",
  instruction = "instruction",
}

const SearchRecipeComponent = () => {
  const [results, setResults] = useState<RecipeSearch[]>();
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringEnum<Filter>(Object.values(Filter)).withDefault(Filter.name),
  );
  const [formHidden, setFormHidden] = useState(true);

  useEffect(() => {
    SearchRecipeByFilter({ filter, search }).then((res) => setResults(res));
  }, [filter, search]);

  const handleSearch = ({ search, filter }: SearchParams) => {
    setSearch(search);
    setFilter(filter as Filter);
    SearchRecipeByFilter({ search, filter }).then((res) => setResults(res));
    return false;
  };

  const createNewRecipe = (recipe: Recipe) => {
    addRecipe(recipe)
      .then(() => SearchRecipeByFilter({ search, filter }))
      .then((res) => setResults(res));
    setFormHidden(true);
  };

  const emptyRecipe: Recipe = {
    instruction: "Instruktion",
    name: "Nytt recept",
    portions: 2,
    ingredients: [],
    children: [],
    id: crypto.randomUUID(),
  };

  return (
    <div className="flex flex-col gap-2">
      {formHidden && (
        <SearchRecipeForm handleSearch={handleSearch} onlySearch={false} />
      )}
      {!formHidden && (
        <RecipeForm
          recipe={emptyRecipe}
          update={createNewRecipe}
          closeForm={() => setFormHidden(true)}
        />
      )}
      {formHidden && (
        <>
          <button
            onClick={() => setFormHidden(!formHidden)}
            className="bg-c2 rounded-md text-xl h-10 px-6"
          >
            Nytt recept
          </button>
          {results ? <FoundRecipes recipeResult={results} /> : <Loading />}
        </>
      )}
    </div>
  );
};

export default SearchRecipeComponent;
