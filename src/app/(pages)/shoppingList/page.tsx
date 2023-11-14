import Filters from "~/app/(pages)/shoppingList/components/Filter";
import { api } from "~/trpc/server";

const ShoppingListPage = async () => {
  const stores = await api.store.getAll.query();
  return (
    <div className="flex flex-col gap-2 p-2">
      <Filters stores={stores} />
    </div>
  );
};

export default ShoppingListPage;
