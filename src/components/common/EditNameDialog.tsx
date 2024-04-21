"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type tName, zName } from "~/zod/zodSchemas";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
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
import { toast } from "sonner";
import { renameUser } from "~/server/api/users";
import { useState } from "react";
import { capitalize } from "~/lib/utils";

type Props = { name: string; info: { title: string; description: string } };

const EditNameDialog = ({ name, info: { title, description } }: Props) => {
  const [open, setOpen] = useState(false);
  const form = useForm<tName>({
    resolver: zodResolver(zName),
    defaultValues: { name },
  });
  const onSubmit = async ({ name }: tName) => {
    await renameUser(name);
    setOpen(false);
    toast.success("Det gick bra!");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Byt {title}</Button>
      </DialogTrigger>
      <DialogContent className="bg-c2">
        <DialogHeader>
          <DialogTitle>Byt {title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{capitalize(title)}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>{description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Avbryt
                </Button>
              </DialogClose>
              <Button disabled={form.formState.isSubmitting} type="submit">
                Ok
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNameDialog;
