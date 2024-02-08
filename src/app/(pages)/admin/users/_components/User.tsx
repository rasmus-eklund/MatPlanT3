import Image from "next/image";
import { RouterOutputs } from "~/trpc/shared";
import DeleteUser from "./DeleteUser";
import Icon from "~/icons/Icon";
type User = RouterOutputs["users"]["getAll"][number];
type Props = {
  user: User;
};

const User = ({
  user: { email, image, recipe, store, menu, id, shoppingListItem },
}: Props) => {
  return (
    <li
      className="flex items-center justify-between rounded-md bg-c2 p-2"
      key={email}
    >
      <div className="flex gap-2">
        {image ? (
          <Image
            className="h-8 w-8"
            src={image}
            height={250}
            width={250}
            alt={"Profilbild"}
          />
        ) : (
          <div className="h-8 w-8 bg-c5"></div>
        )}
        <DeleteUser id={id} name={email ?? "Inget namn"} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs">{email}</p>
        <div className="flex justify-end gap-2">
          <div className="flex gap-1">
            <Icon icon="recipes" className="w-4 fill-c5" />
            <p className="text-sm">{recipe}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="home" className="w-4 fill-c5" />
            <p className="text-sm">{menu}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="cart" className="w-4 fill-c5" />
            <p className="text-sm">{shoppingListItem}</p>
          </div>
          <div className="flex gap-1">
            <Icon icon="store" className="w-4 fill-c5" />
            <p className="text-sm">{store}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default User;
