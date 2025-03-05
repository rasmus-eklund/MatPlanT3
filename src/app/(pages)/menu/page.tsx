import Link from "next/link";
import Icon from "~/icons/Icon";
import { getMenu } from "~/server/api/menu";
import MenuItemComponent from "./_components/MenuItem";
import SearchModal from "~/components/common/SearchModal";
import { searchRecipeName } from "~/server/api/recipes";
import { addToMenu } from "~/server/api/menu";

const page = async () => {
  const items = await getMenu();
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 self-center pt-20">
        <p className="text-c2 text-xl">Här var det tomt.</p>
        <p className="text-center">
          Klicka på besticken för att lägga till ett recept:
        </p>
        <Link href="/recipes">
          <Icon className="fill-c3 size-10" icon="recipes" />
        </Link>
      </div>
    );
  }
  return (
    <div className="relative flex h-full flex-col gap-2">
      <div className="absolute right-2 bottom-2">
        <SearchModal
          title="recept"
          onSearch={searchRecipeName}
          onSubmit={addToMenu}
        />
      </div>
      <ul className="space-y-2 p-2">
        {items.map((item) => (
          <MenuItemComponent key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
};

export default page;
