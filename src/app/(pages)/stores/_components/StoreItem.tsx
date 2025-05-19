import Link from "next/link";
import RemoveItemDialog from "~/components/common/DeleteModal";
import { deleteStore } from "~/server/api/stores";
import { type User } from "~/server/auth";
import type { Store } from "~/server/shared";

type Props = { store: Store[number]; deleteable: boolean; user: User };
const StoreItem = ({ store: { id, name }, deleteable, user }: Props) => {
  return (
    <li className="bg-c2 flex h-10 items-center justify-between rounded-md p-2">
      <Link className="text-c5 md:hover:text-c3 text-xl" href={`/stores/${id}`}>
        {name}
      </Link>
      {deleteable && (
        <RemoveItemDialog
          icon
          info={{
            name: "din affär",
            description:
              "Detta kommer att ta bort din affär och ordningen som du sparat.",
          }}
          action={async () => {
            "use server";
            await deleteStore({ id, user });
          }}
        />
      )}
    </li>
  );
};

export default StoreItem;
