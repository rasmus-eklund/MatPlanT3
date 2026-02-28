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
    <li className="bg-c2 grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md p-2">
      <div className="flex items-center gap-2">
        <BigImage image={image} />
        <DeleteUser id={id} name={name ?? "Inget namn"} user={user} />
      </div>
      <div className="flex flex-col">
        <p className="truncate text-xs">{email}</p>
        <p className="text-xs text-nowrap md:text-base">
          {createdAt.toLocaleDateString("sv-SE")}
        </p>

        <div className="grid grid-cols-4 items-center gap-2">
          <div className="flex items-center gap-1">
            <Icon icon="Utensils" className="w-3.5" />
            <p className="text-xs">{recipe}</p>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="MenuSquare" className="w-3.5" />
            <p className="text-xs">{menu}</p>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="ShoppingCart" className="w-3.5" />
            <p className="text-xs">{items}</p>
          </div>
          <div className="flex items-center gap-1">
            <Icon icon="Store" className="w-3.5" />
            <p className="text-xs">{store}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default User;
