import Link from "next/link";
import RemoveItemDialog from "~/components/common/DeleteModal";
import Icon from "~/components/common/Icon";
import ServerFormSubmit from "~/components/common/ServerFormSubmit";
import { deleteStore, setDefaultStore } from "~/server/api/stores";
import { type User } from "~/server/auth";
import type { Stores } from "~/server/shared";

type Props = { store: Stores[number]; deleteable: boolean; user: User };
const StoreItem = ({
  store: { id, name, default: isDefault },
  deleteable,
  user,
}: Props) => {
  return (
    <li className="bg-c2 flex h-10 items-center rounded-md p-2">
      {isDefault ? (
        <Icon className="fill-c5 mx-2.5" icon="Star" />
      ) : (
        <form
          action={async () => {
            "use server";
            await setDefaultStore({ id, user });
          }}
        >
          <ServerFormSubmit icon="Star" />
        </form>
      )}
      <Link className="text-c5 md:hover:text-c3 text-xl" href={`/stores/${id}`}>
        {name}
      </Link>
      {deleteable && (
        <RemoveItemDialog
          className="ml-auto"
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
