import { getAllStores, getStoreBySlugOrFirst } from "~/server/api/stores";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import { getAllItems } from "~/server/api/items";
import ItemTabs from "./_components/ItemTabs";
import type { SearchItemParams } from "~/types";
import { getMenu } from "~/server/api/menu";

type Props = { searchParams: Promise<SearchItemParams> };
const page = async (props: WithAuthProps & Props) => {
  const { user } = props;
  const searchParams = await props.searchParams;
  const [store, stores, items, menu] = await Promise.all([
    getStoreBySlugOrFirst({ slug: searchParams?.store, user }),
    getAllStores({ user }),
    getAllItems({ user, menuId: searchParams?.menuId }),
    getMenu(user),
  ]);

  return (
    <ItemTabs
      items={items}
      user={user}
      store={store}
      stores={stores}
      menu={menu}
      searchParams={searchParams}
    />
  );
};

export default WithAuth(page, false);
