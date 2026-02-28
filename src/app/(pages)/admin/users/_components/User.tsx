import DeleteUser from "./DeleteUser";
import Icon from "~/components/common/Icon";
import type { AllUsers } from "~/server/shared";
import type { User } from "~/server/auth";
import BigImage from "./BigImage";

type Props = {
  userData: AllUsers[number];
  user: User;
};

const User = ({
  userData: {
    email,
    image,
    name,
    id,
    createdAt,
    count: { items, menu, recipe, store },
  },
  user,
}: Props) => {
  return (
    <li className="bg-c2 flex items-center justify-between gap-2 rounded-md p-2">
      <div className="flex items-center gap-2">
        <BigImage image={image} />
        <DeleteUser id={id} name={name ?? "Inget namn"} user={user} />
      </div>
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex flex-col items-end gap-2 text-xs text-nowrap md:flex-row md:text-base">
          <p className="truncate">{email}</p>
          <p>{createdAt.toLocaleDateString("sv-SE")}</p>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
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
