import type { UserStats } from "~/server/shared";

const UserStats = async ({
  recipe,
  shared,
  menu,
  item,
  store,
}: UserStats["count"]) => {
  return (
    <div>
      <ul className="p-1">
        <li>Recept: {recipe}</li>
        <li>Delade: {shared}</li>
        <li>Meny: {menu}</li>
        <li>Inköpslista: {item}</li>
        <li>Affärer: {store}</li>
      </ul>
    </div>
  );
};

export default UserStats;
