import Link from "next/link";
import RemoveItemDialog from "~/components/common/DeleteModal";
import { deleteStore } from "~/server/api/stores";
import type { Store } from "~/server/shared";

type Props = { store: Store[number]; deleteable: boolean };
const StoreItem = ({ store: { id, name }, deleteable }: Props) => {
  return (
    <li className="flex h-10 items-center justify-between rounded-md bg-c2 p-2">
      <Link className="text-xl text-c5 md:hover:text-c3" href={`/stores/${id}`}>
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
            await deleteStore(id);
          }}
        />
      )}
    </li>
  );
};

export default StoreItem;
