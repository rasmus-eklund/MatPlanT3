"use client";

import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";

const UpdateMeilisearchButton = () => {
  const { mutate, isLoading } = api.admin.updateMeilisearch.useMutation();
  return (
    <Button disabled={isLoading} onClick={() => mutate()}>
      Update Meilisearch Recipes
    </Button>
  );
};

export default UpdateMeilisearchButton;
