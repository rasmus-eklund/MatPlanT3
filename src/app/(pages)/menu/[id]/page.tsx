import capitalize from "~/app/helpers/capitalize";
import { api } from "~/trpc/server";
import { RouterOutputs } from "~/trpc/shared";

type Recipe = RouterOutputs["menu"]["getById"][number];

type Props = { params: { id: string } };

const MenuRecipes = async ({ params: { id } }: Props) => {
  const recipes = await api.menu.getById.query({ id });
  return (
    <div className="flex flex-col gap-5">
      {recipes.map((recipe) => (
        <Recipe key={recipe.recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

type RecipeProps = { recipe: Recipe };
const Recipe = ({ recipe: { recipe, ingredients } }: RecipeProps) => {
  return (
    <section className="flex flex-col gap-2 bg-c3 p-2">
      <h1 className="rounded-md bg-c2 px-1 text-xl font-bold text-c5">
        {recipe.name}
      </h1>
      <div className="flex justify-between">
        <h2 className="text-lg text-c5">Portioner:</h2>
        <p className="w-10 rounded-md bg-c2 text-center text-c5">
          {recipe.portions}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg text-c5">Ingredienser</h2>
        <ul className="flex flex-col gap-1 rounded-md bg-c4 p-1">
          {ingredients.map(({ name, quantity, unit, id }) => (
            <li className="rounded-md bg-c2 p-1" key={id}>
              <div className="flex justify-between text-c4">
                <p>{capitalize(name)}</p>
                <div className="flex gap-1">
                  <p>{quantity}</p>
                  <p> {unit}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default MenuRecipes;
