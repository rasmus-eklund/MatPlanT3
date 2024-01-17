import SearchRecipeForm from "~/app/(pages)/recipes/search/_components/SearchRecipeForm";
import { parseSearch } from "./helpers/searchUrl";
import FoundRecipes from "./_components/FoundRecipes";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const RecipePage = ({ searchParams }: Props) => {
  const parsed = parseSearch({ searchParams });
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm query={parsed} />
      <FoundRecipes parsed={parsed} />
    </div>
  );
};

export default RecipePage;
