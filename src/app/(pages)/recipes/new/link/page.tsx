import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";
import GetByLink from "./_components/GetByLink";

const UserPage = async ({ user }: WithAuthProps) => {
  return <GetByLink user={user} />;
};

export default WithAuth(UserPage, false);
