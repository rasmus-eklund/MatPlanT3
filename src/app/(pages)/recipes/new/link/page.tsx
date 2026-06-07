import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import GetByLink from "./_components/GetByLink";

const UserPage = async ({}: WithAuthProps) => {
  return <GetByLink />;
};

export default WithAuth(UserPage, false, async () => "/recipes/new/link");
