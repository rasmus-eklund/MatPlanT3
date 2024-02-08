import Settings from "./_components/Settings";
import Tabs from "./_components/Tabs";
import UserProfile from "./_components/UserProfile";
import UserStats from "./_components/UserStats";

const UserPage = () => {
  return (
    <main className="flex h-full flex-col">
      <UserProfile />
      <Tabs
        tabs={[
          { name: "Statistik", tab: <UserStats /> },
          { name: "Inställningar", tab: <Settings /> },
        ]}
      />
    </main>
  );
};

export default UserPage;
