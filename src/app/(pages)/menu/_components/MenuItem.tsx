import Link from "next/link";
import DatePicker from "~/components/common/DatePicker";
import DeleteButton from "~/components/common/DeleteButton";
import { unitsAbbr } from "~/lib/constants/units";
import { updateMenuDate, removeMenuItem } from "~/server/api/menu";
import { type MenuItem } from "~/server/shared";
import EditQuantity from "./EditQuantity";
import { type User } from "~/server/auth";

type Props = {
  item: MenuItem;
  user: User;
};

const MenuItemComponent = ({
  user,
  item: {
    id,
    quantity,
    day,
    recipe: { name, unit },
  },
}: Props) => {
  return (
    <li className="bg-c2 text-c5 flex flex-col gap-2 rounded-md px-2 font-bold">
      <div>
        <Link href={`/menu/${id}`}>{name}</Link>
      </div>
      <div className="flex w-full items-center justify-between gap-2 py-2 select-none">
        <div className="flex items-center gap-2">
          <DatePicker
            date={day ? new Date(day) : undefined}
            setDate={async (day) => {
              "use server";
              await updateMenuDate({ id, day, user, name });
            }}
          />
          <div className="flex items-center gap-2">
            <span>
              {quantity} {unitsAbbr[unit]}
            </span>
            <EditQuantity id={id} quantity={quantity} user={user} />
          </div>
        </div>
        <form
          className="flex items-center"
          action={async () => {
            "use server";
            await removeMenuItem({ id, name, user });
          }}
        >
          <DeleteButton />
        </form>
      </div>
    </li>
  );
};

export default MenuItemComponent;
