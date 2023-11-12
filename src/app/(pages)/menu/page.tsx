"use client";
import LoadingSpinner from "~/app/_components/LoadingSpinner";
import MenuItemComponent from "~/app/_components/menu/MenuItemComponent";
import days from "~/app/constants/days";
import sortByName from "~/app/helpers/sortByName";
import { api } from "~/trpc/react";

const Menu = () => {
  const {
    data: menu,
    refetch,
    isSuccess,
    isLoading,
  } = api.menu.getAll.useQuery();
  return (
    <ul className="flex flex-col gap-2 p-2">
      {days.map((day) => (
        <li key={day} className="flex flex-col rounded-md bg-c3 p-2">
          <h2 className="rounded-md p-2 text-xl font-bold text-c5">{day}</h2>
          <ul className="flex flex-col gap-2">
            {isSuccess &&
              sortByName(menu.filter((i) => i.day === day)).map((item) => (
                <MenuItemComponent
                  key={item.id}
                  item={item}
                  update={() => refetch()}
                />
              ))}
            {isLoading && <LoadingSpinner />}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default Menu;
