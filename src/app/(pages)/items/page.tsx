import { getAllStores, getStoreBySlugOrFirst } from "~/server/api/stores";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { getAllItems } from "~/server/api/items";
import ItemTabs from "./_components/ItemTabs";
import type { SearchItemParams } from "~/types";

type Props = { searchParams: Promise<SearchItemParams> };
const page = async (props: WithAuthProps & Props) => {
  const { user } = props;
  const searchParams = await props.searchParams;
  const [store, stores, items] = await Promise.all([
    getStoreBySlugOrFirst({ slug: searchParams?.store, user }),
    getAllStores({ user }),
    getAllItems({ user, menuId: searchParams?.menuId }),
  ]);

  return (
    <ItemTabs
      items={items}
      user={user}
      store={store}
      stores={stores}
      searchParams={searchParams}
    />
  );
};

export default WithAuth(page, false);
