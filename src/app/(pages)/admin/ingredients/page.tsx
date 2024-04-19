import ShowIngredients from "~/app/(pages)/admin/ingredients/_components/ShowIngredients";
import { getServerAuthSession } from "~/server/auth";
import { getAllIngredients, getAllCategories } from "~/server/api/admin";

const Ingredients = async () => {
  const user = await getServerAuthSession();
  if (!user?.admin) {
    return <p>Det finns inget för dig här.</p>;
  }
  const [ingredients, allCats] = await Promise.all([
    getAllIngredients(),
    getAllCategories(),
  ]);
  return <ShowIngredients ingredients={ingredients} allCats={allCats} />;
};

export default Ingredients;
