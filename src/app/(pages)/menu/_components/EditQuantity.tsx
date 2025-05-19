"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import Icon from "~/icons/Icon";
import { updateMenuQuantity } from "~/server/api/menu";
import { type User } from "~/server/auth";

const formSchema = z.object({
  quantity: z.coerce.number().positive(),
});
type Props = { id: string; quantity: number; user: User };

const EditQuantity = ({ id, quantity, user }: Props) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity },
  });

  const onSubmit = async ({ quantity }: z.infer<typeof formSchema>) => {
    await updateMenuQuantity({ id, quantity, user });
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Icon icon="edit" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ändra kvantitet</DialogTitle>
          <DialogDescription>
            Detta kommer att skala om varorna i inköpslistan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="updateMenuQuantity"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kvantitet</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="flex flex-row justify-between md:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Avbryt
            </Button>
          </DialogClose>
          <Button
            disabled={form.formState.isSubmitting}
            form="updateMenuQuantity"
          >
            Spara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuantity;
