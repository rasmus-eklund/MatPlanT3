import MenuItemComponent from "~/app/_components/menu/MenuItemComponent";
import days from "~/app/constants/days";
import sortByName from "~/app/helpers/sortByName";
import { api } from "~/trpc/server";

const Menu = async () => {
  const menu = await api.menu.getAll.query();
  return (
    <ul className="flex flex-col gap-2 p-2">
      {days.map((day) => (
        <li key={day} className="flex flex-col rounded-md bg-c3 p-2">
          <h2 className="rounded-md p-2 text-xl font-bold text-c5">{day}</h2>
          <ul className="flex flex-col gap-2">
            {sortByName(menu.filter((i) => i.day === day)).map((item) => (
              <MenuItemComponent key={item.id} item={item} />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default Menu;
