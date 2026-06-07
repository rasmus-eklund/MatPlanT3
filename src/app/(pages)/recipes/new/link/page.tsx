import { WithAuth } from "~/components/common/withAuth";
import GetByLink from "./_components/GetByLink";

const UserPage = async () => {
  return <GetByLink />;
};

export default WithAuth(UserPage, false, async () => "/recipes/new/link");
