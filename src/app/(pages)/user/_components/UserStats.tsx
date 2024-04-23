import Icon from "~/icons/Icon";
import type { UserStats } from "~/server/shared";

const UserStats = async ({
  recipe,
  shared,
  menu,
  item,
  store,
}: UserStats["count"]) => {
  return (
    <div className="bg-c3">
      <ul className="flex flex-col gap-2 p-1">
        <li className="flex items-center gap-2">
          <Icon icon="recipes" className="size-10 fill-c5" />
          <span>Recept: {recipe}</span>
        </li>
        <li className="flex items-center gap-2">
          <Icon
            icon="recipes"
            className="size-10 rounded-full border border-c5 fill-c5"
          />
          <span>Delade: {shared}</span>
        </li>
        <li className="flex items-center gap-2">
          <Icon icon="home" className="size-10 fill-c5" />
          <span>Meny: {menu}</span>
        </li>
        <li className="flex items-center gap-2">
          <Icon icon="cart" className="size-10 fill-c5" />
          <span>Inköpslista: {item}</span>
        </li>
        <li className="flex items-center gap-2">
          <Icon icon="store" className="size-10 fill-c5" />
          <span>Affärer: {store}</span>
        </li>
      </ul>
    </div>
  );
};

export default UserStats;
