import Image from "next/image";
import DeleteUser from "./DeleteUser";
import Icon from "~/icons/Icon";
import type { GetAllUsersReturnType } from "~/server/api/users";

type Props = {
  user: GetAllUsersReturnType[number];
};

const User = ({
  user: {
    email,
    image,
    name,
    id,
    count: { items, menu, recipe, store },
  },
}: Props) => {
  return (
    <li className="bg-c2 flex items-center justify-between rounded-md p-2">
      <div className="flex items-center gap-2">
        {image ? (
          <Image
            className="h-8 w-8"
            src={image}
            height={250}
            width={250}
            alt={"Profilbild"}
          />
        ) : (
          <div className="bg-c5 h-8 w-8"></div>
        )}
        <DeleteUser id={id} name={name ?? "Inget namn"} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs">{email}</p>
        <div className="flex justify-end gap-2">
          <div className="flex gap-1">
            <Icon icon="recipes" className="fill-c5 w-4" />
            <p className="text-sm">{recipe}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="home" className="fill-c5 w-4" />
            <p className="text-sm">{menu}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="cart" className="fill-c5 w-4" />
            <p className="text-sm">{items}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="store" className="fill-c5 w-4" />
            <p className="text-sm">{store}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default User;
