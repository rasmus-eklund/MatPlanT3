"use client";
import MenuItemComponent from "~/app/(pages)/menu/components/MenuItemComponent";
import days from "~/constants/days";
import sortByName from "~/app/helpers/sortByName";
import { api } from "~/trpc/react";
import Icon from "~/icons/Icon";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

const Menu = () => {
  const router = useRouter();
  const { data: menu, isSuccess, isLoading } = api.menu.getAll.useQuery();
  return (
    <ul className="flex flex-col gap-2 p-2">
      {isSuccess &&
        days.map((day) => {
          const menuItems = menu.filter((i) => i.day === day);
          if (!!menuItems.length) {
            return (
              <li key={day} className="flex flex-col rounded-md bg-c3 p-2">
                <h2 className="rounded-md p-2 text-xl font-bold text-c5">
                  {day}
                </h2>
                <ul className="flex flex-col gap-2">
                  {sortByName(menuItems).map((item) => (
                    <MenuItemComponent key={item.id} item={item} />
                  ))}
                </ul>
              </li>
            );
          }
        })}
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <ClipLoader size={100} />
        </div>
      )}
      {isSuccess && !menu.length && (
        <li
          key="only-child"
          className="flex flex-col items-center gap-1 self-center pt-20"
        >
          <p className="text-xl text-c2">Här var det tomt.</p>
          <p className="text-center">
            Klicka på besticken för att lägga till ett recept:
          </p>
          <button onClick={() => router.push("/recipes/search")}>
            <Icon className="h-10 animate-pulse fill-c3" icon="recipes" />
          </button>
        </li>
      )}
    </ul>
  );
};

export default Menu;
