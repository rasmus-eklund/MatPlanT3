import NavMenu from "./NavMenu";
import { getServerAuthSession } from "~/server/auth";

const Header = async () => {
  const user = await getServerAuthSession();
  if (user) {
    return <NavMenu admin={user.admin} />;
  }
  return null;
};

export default Header;
