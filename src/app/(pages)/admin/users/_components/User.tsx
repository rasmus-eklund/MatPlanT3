import Image from "next/image";
import DeleteUser from "./DeleteUser";
import Icon from "~/components/common/Icon";
import type { AllUsers } from "~/server/shared";
import type { User } from "~/server/auth";

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
    <li className="bg-c2 flex items-center justify-between rounded-md p-2">
      <div className="flex items-center gap-2">
        {image ? (
          <Image
            className="size-8"
            src={image}
            height={250}
            width={250}
            alt={"Profilbild"}
          />
        ) : (
          <div className="bg-c5 size-8"></div>
        )}
        <DeleteUser id={id} name={name ?? "Inget namn"} user={user} />
      </div>
      <p>{createdAt.toLocaleDateString("sv-SE")}</p>
      <div className="flex flex-col gap-2">
        <p className="text-xs">{email}</p>
        <div className="flex justify-end gap-2">
          <div className="flex gap-1">
            <Icon icon="Utensils" className="w-4" />
            <p className="text-sm">{recipe}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="MenuSquare" className="w-4" />
            <p className="text-sm">{menu}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="ShoppingCart" className="w-4" />
            <p className="text-sm">{items}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="Store" className="w-4" />
            <p className="text-sm">{store}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default User;
