import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import UserProfile from "./_components/UserProfile";
import UserStats from "./_components/UserStats";
import { getUserStats } from "~/server/api/users";
import Settings from "./_components/Settings";

const UserPage = async () => {
  const stats = await getUserStats();
  return (
    <div className="flex flex-col gap-2">
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
          <Settings {...stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPage;
