import Filters from "~/app/(pages)/shoppingList/components/Filter";
import { api } from "~/trpc/server";

const ShoppingListPage = async () => {
  const stores = await api.store.getAll.query();
  return <Filters stores={stores} />;
};

export default ShoppingListPage;
