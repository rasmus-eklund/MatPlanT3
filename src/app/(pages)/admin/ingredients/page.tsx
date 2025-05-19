import ShowIngredients from "~/app/(pages)/admin/ingredients/_components/ShowIngredients";
import { WithAuth } from "~/components/common/withAuth";
import { getAllIngredients, getAllCategories } from "~/server/api/admin";

const page = async () => {
  const [ingredients, allCats] = await Promise.all([
    getAllIngredients(),
    getAllCategories(),
  ]);
  return <ShowIngredients ingredients={ingredients} allCats={allCats} />;
};

export default WithAuth(page, true);
