"use client";
import { useState } from "react";
import Button from "../Button";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { type tStoreName } from "~/zod/zodSchemas";
import LoadingSpinner from "../LoadingSpinner";
import { useRouter } from "next/navigation";

type Props = { name: string; id: string };

const StoreName = ({ name, id }: Props) => {
  const [editName, setEditName] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<{ name: tStoreName }>({
    defaultValues: { name },
  });

  const { mutate: renameStore } = api.store.rename.useMutation({
    onSuccess: () => {
      setEditName(false);
      router.refresh();
    },
    onError: ({ data }) => {
      if (data?.zodError?.fieldErrors.name) {
        const msgs = data?.zodError.fieldErrors.name;
        for (const msg of msgs) {
          toast.error(msg);
        }
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const onSubmit = ({ name }: { name: string }) => {
    renameStore({ name, id });
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {!editName && (
        <>
          <h2 className="text-xl font-bold text-c5">{name}</h2>
          <Button onClick={() => setEditName(true)}>Ändra namn</Button>
        </>
      )}
      {editName && (
        <form
          className="flex w-full items-center justify-between gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            {...register("name")}
            type="text"
            placeholder="Lägg till ny affär"
            className="min-w-0 px-2"
          />
          {errors.name && (
            <p className="absolute top-full bg-c5 p-1 text-sm text-c1">
              {errors.name?.message}
            </p>
          )}
          <div className="flex gap-5">
            <button className="h-8 w-8" disabled={isSubmitting} type="submit">
              {isSubmitting ? <LoadingSpinner className="h-6 w-6" /> : "Spara"}
            </button>
            <Button onClick={() => setEditName(false)}>Avbryt</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StoreName;
