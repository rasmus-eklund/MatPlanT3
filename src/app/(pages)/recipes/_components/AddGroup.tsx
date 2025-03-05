"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

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
    mode: "onSubmit",
    criteriaMode: "all",
    shouldFocusError: true,
  });
  const handleSubmit = ({ name }: NameType) => {
    if (groups.includes(name.trim().toLowerCase())) {
      form.setError("name", { message: "Delmoment finns redan" });
      return;
    }
    onSubmit({ name: name.toLowerCase() });
    toast.success("Lade till delmoment " + name);
    form.reset();
  };
  return (
    <Form {...form}>
      <form
        className="flex items-end gap-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
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
        <Button type="submit">Lägg till</Button>
      </form>
    </Form>
  );
};

export default AddGroup;
