import { getServerAuthSession } from "~/server/auth";

const Menu = async () => {
  const session = await getServerAuthSession();
  console.log(session);
  return <p>{`menu, logged in: ${session?.user.name}`}</p>;
};

export default Menu;
