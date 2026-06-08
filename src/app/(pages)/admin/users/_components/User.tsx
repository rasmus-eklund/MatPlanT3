import DeleteUser from "./DeleteUser";
import Icon from "~/components/common/Icon";
import type { AllUsers } from "~/server/shared";
import BigImage from "./BigImage";
import { formatRelativeActivity } from "~/lib/formatRelativeActivity";

type Props = {
  userData: AllUsers[number];
};

const User = ({
  userData: {
    email,
    image,
    name,
    id,
    createdAt,
    lastActiveAt,
    lastAuditAt,
    count: { items, menu, recipe, store },
  },
}: Props) => {
  return (
    <li className="bg-c2 flex items-center justify-between gap-2 rounded-md p-2">
      <div className="flex items-center gap-2">
        <BigImage image={image} />
        <DeleteUser id={id} name={name} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-end gap-1 text-xs text-nowrap md:gap-2 md:text-base">
          <p className="truncate">{email}</p>
          <p>Skapad: {createdAt.toLocaleDateString("sv-SE")}</p>
          <p>Aktiv: {formatRelativeActivity(lastActiveAt)}</p>
          <p>Ändring: {formatRelativeActivity(lastAuditAt)}</p>
        </div>
        <div className="flex items-center gap-2 self-end">
          <Icon icon="Utensils" className="w-3.5" />
          <p className="text-xs">{recipe}</p>
          <Icon icon="MenuSquare" className="w-3.5" />
          <p className="text-xs">{menu}</p>
          <Icon icon="ShoppingCart" className="w-3.5" />
          <p className="text-xs">{items}</p>
          <Icon icon="Store" className="w-3.5" />
          <p className="text-xs">{store}</p>
        </div>
      </div>
    </li>
  );
};

export default User;
