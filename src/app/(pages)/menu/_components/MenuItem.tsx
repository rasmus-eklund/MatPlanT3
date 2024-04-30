import Link from "next/link";
import DatePicker from "~/components/common/DatePicker";
import DeleteButton from "~/components/common/DeleteButton";
import { unitsAbbr } from "~/lib/constants/units";
import { updateMenuDate, removeMenuItem } from "~/server/api/menu";
import { type MenuItem } from "~/server/shared";
import EditQuantity from "./EditQuantity";

type Props = {
  item: MenuItem;
};

const MenuItemComponent = ({
  item: {
    id,
    quantity,
    day,
    recipe: { name, unit },
  },
}: Props) => {
  return (
    <li className="flex flex-col gap-2 rounded-md bg-c2 px-2 font-bold text-c5">
      <div>
        <Link href={`/menu/${id}`}>{name}</Link>
      </div>
      <div className="flex w-full select-none items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2">
          <DatePicker
            date={day ? new Date(day) : undefined}
            setDate={async (date) => {
              "use server";
              await updateMenuDate(id, date);
            }}
          />
          <div className="flex items-center gap-2">
            <span>
              {quantity} {unitsAbbr[unit]}
            </span>
            <EditQuantity id={id} quantity={quantity} />
          </div>
        </div>
        <form
          className="flex items-center"
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
