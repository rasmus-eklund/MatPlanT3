import Link from "next/link";
import DatePicker from "~/components/common/DatePicker";
import DeleteButton from "~/components/common/DeleteButton";
import { removeMenuItem } from "~/server/api/menu";
// import {  useState } from "react";
import { type MenuItem } from "~/server/shared";

type Props = {
  item: MenuItem;
};

const MenuItemComponent = ({ item }: Props) => {
  // const [portions, setPortions] = useState(item.quantity);
  // const debouncedPortions = useDebounce(portions, 1000);
  const {
    id,
    recipe: { name },
  } = item;

  return (
    <li className="flex flex-col gap-2 rounded-md bg-c2 px-2 font-bold text-c5">
      <div>
        <Link href={`/menu/${id}`}>{name}</Link>
      </div>
      <div className="flex w-full select-none items-center gap-2 py-2 md:justify-between">
        <DatePicker />
        <div className="flex items-center gap-1">Ändra kvantitet</div>
        <form
          action={async () => {
            "use server";
            await removeMenuItem(id);
          }}
        >
          <DeleteButton />
        </form>
      </div>
    </li>
  );
};

export default MenuItemComponent;
