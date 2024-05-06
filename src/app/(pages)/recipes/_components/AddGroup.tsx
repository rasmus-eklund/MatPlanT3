"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { type NameType, nameSchema } from "~/zod/zodSchemas";

type Props = { onSubmit: (data: NameType) => void; groups: string[] };
const AddGroup = ({ onSubmit, groups }: Props) => {
  const form = useForm<NameType>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });
  const handleSubmit = ({ name }: NameType) => {
    if (groups.includes(name.toLowerCase())) {
      form.setError("name", { message: "Delmoment finns redan" });
      return;
    }
    onSubmit({ name: name.toLowerCase() });
    form.reset();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delmoment</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default AddGroup;
