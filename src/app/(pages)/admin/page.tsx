"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ShowIngredients from "~/app/(pages)/admin/components/ShowIngredients";
import { api } from "~/trpc/react";

const Admin = () => {
  const router = useRouter();
  const { data: session } = useSession();
  if (session && session.user.role !== "ADMIN") {
    router.push("/");
  }

  const { data: ingredients, isSuccess: gotIngs } = api.admin.getAll.useQuery();
  const { data: allCats, isSuccess: gotCats } = api.admin.categories.useQuery();
  return (
    <main>
      {gotIngs && gotCats && (
        <ShowIngredients ingredients={ingredients} allCats={allCats} />
      )}
    </main>
  );
};

export default Admin;
