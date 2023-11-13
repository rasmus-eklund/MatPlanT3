import { redirect } from "next/navigation";
import ShowIngredients from "~/app/(pages)/admin/components/ShowIngredients";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

const Admin = async () => {
  const session = await getServerAuthSession();
  if (session && session.user.role !== "ADMIN") {
    redirect("/");
  }

  const ingredients = await api.admin.getAll.query();
  const allCats = await api.admin.categories.query();
  return <ShowIngredients ingredients={ingredients} allCats={allCats} />;
};

export default Admin;
