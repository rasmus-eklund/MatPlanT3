import { tItemFilter } from "types";
import Filters from "~/app/_components/shoppingList/Filter";
import { api } from "~/trpc/server";

const ShoppingListPage = async () => {
  const stores = await api.store.getAll.query();
  const filter: tItemFilter = {
    group: false,
    hideRecipe: false,
    selectedStore: stores[0]!,
  };
  return (
    <div className="flex flex-col gap-2 p-2">
      <Filters filter={filter} stores={stores} />
    </div>
  );
};

export default ShoppingListPage;
