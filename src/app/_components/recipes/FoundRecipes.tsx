import { RecipeSearch } from "@/types";
import Link from "next/link";
import { addRecipeToMenu } from "../../server-side/menu";
import { getRecipeById } from "@/app/server-side/recipes";
import Button from "../buttons/Button";

type Props = {
  recipeResult: RecipeSearch[];
};

const FoundRecipes = ({ recipeResult }: Props) => {
  const addRecipe = ({ id }: RecipeSearch) => {
    getRecipeById(id).then((rec) => addRecipeToMenu(rec, "Obestämd"));
  };
  return (
    <section className="flex flex-col bg-c3 p-2 gap-2 rounded-md">
      <h2 className="text-xl text-c5">Recept:</h2>
      <ul className="flex flex-col gap-2">
        {recipeResult.map((r) => (
          <li
            className="flex justify-between px-2 py-1 text-c5
             font-bold bg-c2 rounded-md items-center"
            key={r.id}
          >
            <Link className="overflow-hidden text-ellipsis whitespace-nowrap" href={`/recipes/${r.id}`}>{r.name}</Link>
            <div className="flex items-center gap-4 shrink-0">
              <Button name="Lägg till" callback={() => addRecipe(r)} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FoundRecipes;
