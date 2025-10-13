import AdminHeader from "./_components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-c3 flex h-full flex-col">
      <AdminHeader />
      {children}
    </div>
  );
}
