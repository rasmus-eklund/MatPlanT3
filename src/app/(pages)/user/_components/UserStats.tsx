import { api } from "~/trpc/server";

const UserStats = async () => {
  const userStats = await api.users.getUserStats.query();
  return (
    <div>
      <ul className="p-1">
        <li>Recept: {userStats.recipesOwn}</li>
        <li>Delade: {userStats.recipesPublic}</li>
        <li>Meny: {userStats.menuItems}</li>
        <li>Inköpslista: {userStats.shoppingListItems}</li>
        <li>Affärer: {userStats.stores}</li>
      </ul>
    </div>
  );
};

export default UserStats;
