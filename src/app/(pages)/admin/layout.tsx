import AdminHeader from "./_components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-c3">
      <AdminHeader />
      {children}
    </div>
  );
}
