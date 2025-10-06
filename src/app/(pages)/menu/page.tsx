import Link from "next/link";
import Icon from "~/components/common/Icon";
import { getMenu } from "~/server/api/menu";
import MenuItemComponent from "./_components/MenuItem";
import SearchModal from "~/components/common/SearchModal";
import { searchRecipeName } from "~/server/api/recipes";
import { addToMenu } from "~/server/api/menu";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";

const Page = async ({ user }: WithAuthProps) => {
  const items = await getMenu(user);
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 self-center pt-20">
        <p className="text-c2 text-xl">Här var det tomt.</p>
        <p className="text-center">
          Klicka på besticken för att lägga till ett recept:
        </p>
        <Link href="/recipes">
          <Icon className="text-c3 size-10" icon="Utensils" />
        </Link>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full justify-end pt-2 pr-3">
        <SearchModal
          user={user}
          title="recept"
          addIcon
          onSearch={searchRecipeName}
          onSubmit={addToMenu}
        />
      </div>
      <ul className="space-y-2 p-2">
        {items.map((item) => (
          <MenuItemComponent key={item.id} item={item} user={user} />
        ))}
      </ul>
    </div>
  );
};

export default WithAuth(Page, false);
