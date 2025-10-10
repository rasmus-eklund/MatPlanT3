"use client";

import { addStore } from "~/server/api/stores";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type NameType, nameSchema } from "~/zod/zodSchemas";
import { Button } from "~/components/ui/button";
import { type User } from "~/server/auth";
import { Spinner } from "~/components/ui/spinner";

type Props = { stores: string[]; user: User };
const AddNewStore = ({ stores, user }: Props) => {
  const form = useForm<NameType>({
    mode: "onChange",
    resolver: zodResolver(
      nameSchema.refine((v) => !stores.includes(v.name), {
        message: "Detta affär finns redan",
        path: ["name"],
      }),
    ),
    defaultValues: { name: "" },
  });

  const onSubmit = async ({ name }: NameType) => {
    if (stores.includes(name)) {
      form.setError("name", {
        message: `${name} finns redan som affär.`,
      });
      return;
    }
    await addStore({ name, user });
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lägg till en ny butik</FormLabel>
              <FormControl>
                <Input placeholder="Ny butik" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-28"
          type="submit"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              Vänta
              <Spinner className="mr-2" />
            </>
          ) : (
            <>Lägg till</>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AddNewStore;
