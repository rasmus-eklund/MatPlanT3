import { getServerAuthSession } from "~/server/auth";
import Settings from "./_components/Settings";
import Tabs from "./_components/Tabs";
import UserProfile from "./_components/UserProfile";
import UserStats from "./_components/UserStats";
import { redirect } from "next/navigation";

const UserPage = async () => {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/");
  }
  return (
    <main className="flex h-full flex-col">
      <UserProfile user={session.user} />
      <Tabs
        tabs={[
          { name: "Statistik", tab: <UserStats /> },
          { name: "Inställningar", tab: <Settings name={session.user.name} /> },
        ]}
      />
    </main>
  );
};

export default UserPage;
