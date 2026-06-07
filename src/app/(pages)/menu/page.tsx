import Link from "next/link";
import Icon from "~/components/common/Icon";
import { getMenu } from "~/server/api/menu";
import MenuItemComponent from "./_components/MenuItem";
import SearchModal from "~/components/common/SearchModal";
import { nrOfRecipes, searchRecipeName } from "~/server/api/recipes";
import { addToMenu } from "~/server/api/menu";
import { WithAuth } from "~/components/common/withAuth";

const Page = async () => {
  const [items, nRecipes] = await Promise.all([getMenu(), nrOfRecipes()]);
  if (items.length === 0) {
    return <EmptyMenu nRecipes={nRecipes} />;
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-2 py-1 md:px-3">
        <h2 className="text-c2 text-lg">Meny</h2>
        <SearchModal
          addIcon
          title="recept"
          onSearch={searchRecipeName}
          onSubmit={addToMenu}
        />
      </div>
      <ul className="space-y-2 px-1 md:px-2">
        {items.map((item) => (
          <MenuItemComponent key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
};

const EmptyMenu = ({ nRecipes }: { nRecipes: number }) => (
  <div className="flex flex-col items-center gap-4 self-center pt-20">
    <p className="text-c2 text-xl">Här var det tomt.</p>
    {nRecipes !== 0 && (
      <>
        <p className="text-center">
          Du har {nRecipes} {nRecipes > 1 ? "sparade" : "sparat"} recept. Tryck
          på plus-ikonen för att lägga till ett recept till menyn
        </p>
        <SearchModal
          title="recept"
          addIcon
          onSearch={searchRecipeName}
          onSubmit={addToMenu}
        />
      </>
    )}
    <p className="text-center">
      Tryck på besticken för att skapa ett nytt recept eller kopiera ett delat
      recept
    </p>
    <Link href="/recipes">
      <Icon className="text-c3 size-10" icon="Utensils" />
    </Link>
  </div>
);

export default WithAuth(Page, false);
