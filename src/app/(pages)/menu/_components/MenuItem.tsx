"use client";
import Link from "next/link";
import DatePicker from "~/components/common/DatePicker";
import { updateMenuDate, removeMenuItem } from "~/server/api/menu";
import { type MenuItem } from "~/server/shared";
import EditQuantity from "./EditQuantity";
import { Button } from "~/components/ui/button";
import Icon from "~/components/common/Icon";
import { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "~/components/ui/spinner";

type Props = {
  item: MenuItem;
};

const MenuItemComponent = ({ item }: Props) => {
  const { id, recipe, day } = item;
  const { name } = recipe;

  const [deleting, setDeleting] = useState(false);

  const handleRemoveMenuItem = async () => {
    setDeleting(true);
    try {
      await removeMenuItem({ id, name });
    } catch {
      toast.error("Något gick fel...");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateMenuDate = async (day: string | null) =>
    await updateMenuDate({ id, day, name });

  return (
    <li className="bg-c2 text-c5 flex flex-col gap-2 rounded-md px-2 font-bold">
      <Link className="truncate text-sm" href={`/menu/${id}`}>
        {name}
      </Link>
      <div className="flex w-full items-center justify-between gap-2 py-2 select-none">
        <div className="flex items-center gap-2">
          <DatePicker
            date={day ? new Date(day) : undefined}
            setDate={handleUpdateMenuDate}
          />
          <EditQuantity item={item} />
        </div>
        <Button onClick={handleRemoveMenuItem} size="sm" variant="ghost">
          {deleting ? <Spinner /> : <Icon icon="Trash" />}
        </Button>
      </div>
    </li>
  );
};

export default MenuItemComponent;
