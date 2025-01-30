import Link from "next/link";
import Icon from "~/icons/Icon";
import { getMenu } from "~/server/api/menu";
import MenuItemComponent from "./_components/MenuItem";
export const dynamic = "force-dynamic";

const page = async () => {
  const items = await getMenu();
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 self-center pt-20">
        <p className="text-xl text-c2">Här var det tomt.</p>
        <p className="text-center">
          Klicka på besticken för att lägga till ett recept:
        </p>
        <Link href="/recipes">
          <Icon className="size-10 fill-c3" icon="recipes" />
        </Link>
      </div>
    );
  }
  return (
    <ul className="space-y-2 p-2">
      {items.map((item) => (
        <MenuItemComponent key={item.id} item={item} />
      ))}
    </ul>
  );
};

export default page;
