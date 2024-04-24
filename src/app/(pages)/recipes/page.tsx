import React from "react";
import SearchRecipeForm from "./_components/SearchRecipe";

type Props = {
  searchParams?: { search?: string; page?: number; shared?: "true" | "false" };
};

const page = ({ searchParams }: Props) => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <SearchRecipeForm />
      recipes
    </div>
  );
};

export default page;
