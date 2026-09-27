"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import RemoveItemDialog from "~/components/common/DeleteModal";
import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/spinner";
import { deleteStore, setDefaultStore } from "~/server/api/stores";
import type { Stores } from "~/server/shared";

type Props = { store: Stores[number]; deleteable: boolean };
const StoreItem = ({ store: { id, name, default: isDefault }, deleteable }: Props) => {
  return (
    <li className="flex h-10 items-center rounded-md bg-c2 p-2">
      <Favorite id={id} isDefault={isDefault} />
      <Link className="text-xl text-c5 md:hover:text-c3" href={`/stores/${id}`}>
        {name}
      </Link>
      {deleteable && (
        <RemoveItemDialog
          className="ml-auto"
          icon
          info={{
            name: "din affär",
            description: "Detta kommer att ta bort din affär och ordningen som du sparat.",
          }}
          action={() => deleteStore({ id, name })}
        />
      )}
    </li>
  );
};

const Favorite = ({ isDefault, id }: { isDefault: boolean; id: string }) => {
  const [loading, setLoading] = useState(false);
  const onSetDefaultStore = async () => {
    setLoading(true);
    try {
      await setDefaultStore({ id });
    } catch (e) {
      console.error(e);
      toast.error("Något gick fel...");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <Spinner className="mx-1" />;
  }
  if (isDefault) {
    return <Icon className="mx-1 fill-c5" icon="Star" />;
  }
  return (
    <Button variant="ghost" size="icon" disabled={loading} onClick={onSetDefaultStore}>
      <Icon icon="Star" />
    </Button>
  );
};

export default StoreItem;
