"use client";
import { useSession } from "next-auth/react";
import ShowIngredients from "~/app/(pages)/admin/ingredients/_components/ShowIngredients";
import { api } from "~/trpc/react";

const Ingredients = () => {
  const { data: session } = useSession();
  if (session && session.user.role !== "ADMIN") {
    return (
      <>
        <p>Det finns inget för dig här.</p>
      </>
    );
  }

  const { data: ingredients, isSuccess: gotIngs } = api.admin.getAll.useQuery();
  const { data: allCats, isSuccess: gotCats } = api.admin.categories.useQuery();
  return (
    <>
      {gotIngs && gotCats && (
        <ShowIngredients ingredients={ingredients} allCats={allCats} />
      )}
    </>
  );
};

export default Ingredients;
