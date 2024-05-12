import ShowIngredients from "~/app/(pages)/admin/ingredients/_components/ShowIngredients";
import { getAllIngredients, getAllCategories } from "~/server/api/admin";

const page = async () => {
  const [ingredients, allCats] = await Promise.all([
    getAllIngredients(),
    getAllCategories(),
  ]);
  return <ShowIngredients ingredients={ingredients} allCats={allCats} />;
};

export default page;
