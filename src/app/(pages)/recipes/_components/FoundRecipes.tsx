import Link from "next/link";
import PaginationNav from "./PaginationNav";
import { searchRecipes } from "~/server/api/recipes";
import type { SearchRecipeParams, MeilRecipe } from "~/types";
import { type User } from "~/server/auth";
import MenuItemActions from "./MenuItemActions";

type Props = {
  user: User;
  params: SearchRecipeParams;
};

const FoundRecipes = async ({ params, user }: Props) => {
  const { hits: recipes, total } = await searchRecipes({ params, user });
  const totalPages = Math.max(1, Math.ceil(total / params.limit));

  return (
    <section className="bg-c3 flex min-h-0 flex-1 flex-col gap-2 rounded-md p-2">
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        {!recipes.length && (
          <p className="text-c4">
            {params.search ? "Hittade inga recept..." : "Här var det tomt..."}
          </p>
        )}
        {!!recipes.length &&
          recipes.map((recipe) => (
            <FoundRecipe key={recipe.id} {...recipe} {...params} />
          ))}
      </ul>
      <PaginationNav
        key={`${params.page}-${params.limit}-${params.search}-${params.shared}`}
        results={recipes.length}
        totalPages={totalPages}
        params={params}
      />
    </section>
  );
};

const FoundRecipe = ({
  id,
  name,
  isPublic,
  shared,
}: MeilRecipe & SearchRecipeParams) => (
  <li className="bg-c2 text-c5 flex flex-col gap-1 rounded-md p-1" key={id}>
    <div className="flex items-center gap-2">
      <Link
        href={`/recipes/${id}`}
        className="text-c5 w-fit truncate text-sm font-semibold"
      >
        {name}
      </Link>
    </div>
    <MenuItemActions id={id} name={name} shared={shared} isPublic={isPublic} />
  </li>
);

export default FoundRecipes;
