"use client";

import { addStore } from "~/server/api/stores";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type tName, zName } from "~/zod/zodSchemas";
import { Button } from "~/components/ui/button";
import { ClipLoader } from "react-spinners";

const AddNewStore = () => {
  const form = useForm<tName>({
    resolver: zodResolver(zName),
    defaultValues: { name: "" },
  });
  const onSubmit = async (name: tName) => {
    await addStore(name);
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
              <FormDescription>Detta är namnet på butiken.</FormDescription>
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
