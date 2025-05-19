import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import UserProfile from "./_components/UserProfile";
import UserStats from "./_components/UserStats";
import { getUserStats } from "~/server/api/users";
import Settings from "./_components/Settings";
import { WithAuth, type WithAuthProps } from "~/components/common/withAuth";

const UserPage = async ({ user }: WithAuthProps) => {
  const stats = await getUserStats({ user });
  return (
    <div className="flex flex-col">
      <UserProfile {...stats} />
      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats">Statistik</TabsTrigger>
          <TabsTrigger value="settings">Inställningar</TabsTrigger>
        </TabsList>
        <TabsContent value="stats">
          <UserStats {...stats.count} />
        </TabsContent>
        <TabsContent value="settings">
          <Settings id={stats.id} name={stats.name} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WithAuth(UserPage, false);
