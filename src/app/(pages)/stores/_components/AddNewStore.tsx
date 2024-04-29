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
import { ClipLoader } from "react-spinners";
import { capitalize } from "~/lib/utils";

type Props = { stores: string[] };
const AddNewStore = ({ stores }: Props) => {
  const form = useForm<NameType>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async ({ name }: NameType) => {
    if (stores.includes(name)) {
      form.setError("name", {
        message: `${capitalize(name)} finns redan som affär.`,
      });
      return;
    }
    await addStore({ name });
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
        {form.formState.isSubmitting ? (
          <Button className="w-28" type="button" disabled>
            <ClipLoader color="white" size={20} className="mr-2" />
            Vänta
          </Button>
        ) : (
          <Button className="w-28" type="submit">
            Lägg till
          </Button>
        )}
      </form>
    </Form>
  );
};

export default AddNewStore;
