import Link from "next/link";
import PaginationNav from "./PaginationNav";
import { searchRecipes } from "~/server/api/recipes";
import type { SearchRecipeParams } from "~/types";
import AddToMenu from "./AddToMenu";
import Icon from "~/components/common/Icon";
import { type User } from "~/server/auth";

type Props = {
  user: User;
  params: SearchRecipeParams;
};

const FoundRecipes = async ({ params, user }: Props) => {
  const recipes = await searchRecipes({ params, user });
  return (
    <section className="bg-c3 flex flex-col rounded-md p-2">
      <ul className="flex flex-col gap-2">
        {!recipes.length && params.search && (
          <p className="text-c4">Hittade inga recept...</p>
        )}
        {!!recipes.length &&
          recipes.map(({ id, name, isPublic }) => (
            <li className="bg-c2 text-c5 flex flex-col rounded-md p-1" key={id}>
              <div className="flex items-center gap-2">
                <Link
                  href={`/recipes/${id}`}
                  className="text-c5 w-fit font-semibold"
                >
                  {name}
                </Link>
                {isPublic && (
                  <Icon className="cursor-default" icon="HandHelping" />
                )}
              </div>
              <div className="flex w-full justify-end">
                {!params.shared && <AddToMenu id={id} user={user} />}
              </div>
            </li>
          ))}
      </ul>
      <PaginationNav results={recipes.length} params={params} />
    </section>
  );
};

export default FoundRecipes;
