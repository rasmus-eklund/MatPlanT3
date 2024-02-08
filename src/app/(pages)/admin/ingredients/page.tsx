import ShowIngredients from "~/app/(pages)/admin/ingredients/_components/ShowIngredients";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";
import AdminHeader from "../_components/AdminHeader";

const Ingredients = async () => {
  const session = await getServerAuthSession();
  if (session && session.user.role !== "ADMIN") {
    return <p>Det finns inget för dig här.</p>;
  }
  const [ingredients, allCats] = await Promise.all([
    api.admin.getAll.query(),
    api.admin.categories.query(),
  ]);
  return (
    <div>
      <AdminHeader />
      <ShowIngredients ingredients={ingredients} allCats={allCats} />
    </div>
  );
};

export default Ingredients;
