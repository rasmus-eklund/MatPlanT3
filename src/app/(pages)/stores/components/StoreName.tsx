"use client";
import { useState } from "react";
import Button from "~/app/_components/Button";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { type tName } from "~/zod/zodSchemas";
import FormError from "~/app/_components/FormError";

type Props = { name: string; id: string };

const StoreName = ({ name, id }: Props) => {
  const [editName, setEditName] = useState(false);
  const utils = api.useUtils();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<{ name: tName }>({
    defaultValues: { name },
  });

  const { mutate: renameStore } = api.store.rename.useMutation({
    onSuccess: () => {
      setEditName(false);
      utils.store.getById.invalidate();
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

  const onSubmit = ({ name: newName }: { name: string }) => {
    if (newName === name) {
      setEditName(false);
      return;
    }
    renameStore({ name: newName, id });
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
          <FormError error={errors.name} />
          <div className="flex gap-2">
            <Button disabled={isSubmitting} type="submit">
              Spara
            </Button>
            <Button type="button" onClick={() => setEditName(false)}>
              Avbryt
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StoreName;