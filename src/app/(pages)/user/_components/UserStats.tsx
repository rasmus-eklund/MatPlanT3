import Icon from "~/components/common/Icon";
import type { UserStats } from "~/server/shared";

const UserStats = async ({ recipe, menu, item, store }: UserStats["count"]) => {
  return (
    <div className="bg-c3">
      <ul className="flex flex-col gap-2 p-1">
        <li className="flex items-center gap-2">
          <Icon icon="Utensils" className="size-5" />
          <span>Recept: {recipe}</span>
        </li>
        <li className="flex items-center gap-2">
          <Icon icon="MenuSquare" className="size-5" />
          <span>Meny: {menu}</span>
        </li>
        <li className="flex items-center gap-2">
          <Icon icon="ShoppingCart" className="size-5" />
          <span>Inköpslista: {item}</span>
        </li>
        <li className="flex items-center gap-2">
          <Icon icon="Store" className="size-5" />
          <span>Affärer: {store}</span>
        </li>
      </ul>
    </div>
  );
};

export default UserStats;
