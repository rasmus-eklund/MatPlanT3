import ShowIngredients from "~/app/(pages)/admin/ingredients/_components/ShowIngredients";
import { getAllIngredients, getAllCategories } from "~/server/api/admin";

const Ingredients = async () => {
  const [ingredients, allCats] = await Promise.all([
    getAllIngredients(),
    getAllCategories(),
  ]);
  return <ShowIngredients ingredients={ingredients} allCats={allCats} />;
};

export default Ingredients;
