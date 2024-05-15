"use client";

import units from "~/lib/constants/units";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import Icon from "~/icons/Icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { itemSchema, type Item } from "~/zod/zodSchemas";
import SearchItem from "./SearchItem";
import { useState } from "react";

type Props = {
  item: Item;
  onUpdate: (item: Item) => Promise<void>;
};
const EditItem = ({ item, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const form = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: item,
  });
  const onSubmit = async (item: Item) => {
    await onUpdate(item);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Icon icon="edit" className="size-6 fill-c5" />
      </DialogTrigger>
      <DialogContent className="flex h-full flex-col md:h-auto">
        <DialogHeader className="h-10 md:h-auto">
          <DialogTitle>Ändra ingrediens</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="editIngredientForm"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full grow flex-col gap-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 md:flex-col">
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
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enhet</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SearchItem
              onSubmit={(item) => {
                form.setValue("ingredientId", item.ingredientId);
                form.setValue("name", item.name);
              }}
              title="Ändra vara"
            />
          </form>
        </Form>
        <DialogFooter className="gap-2">
          <Button form="editIngredientForm" type="submit">
            Updatera
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" type="button">
              Avbryt
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItem;
