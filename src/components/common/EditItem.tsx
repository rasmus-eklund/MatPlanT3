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

type Props = {
  item: Item;
  onUpdate: (item: Item) => Promise<void>;
};
const EditItem = ({ item, onUpdate }: Props) => {
  const form = useForm<Item>({
    resolver: zodResolver(itemSchema),
    defaultValues: item,
  });
  const onSubmit = async (item: Item) => {
    await onUpdate(item);
  };
  return (
    <Dialog>
      <DialogTrigger>
        <Icon icon="edit" className="size-6 fill-c5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ändra ingrediens</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="editIngredientForm"
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
            <SearchItem
              onSubmit={(item) =>
                form.setValue("ingredientId", item.ingredientId)
              }
            />
          </form>
        </Form>
        <DialogFooter>
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
