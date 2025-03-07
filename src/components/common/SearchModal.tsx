"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { capitalize } from "~/lib/utils";
import type { Unit } from "~/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import units from "~/lib/constants/units";
import { ClipLoader } from "react-spinners";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Icon from "~/icons/Icon";
import { DialogDescription } from "@radix-ui/react-dialog";

type Item = { id: string; name: string; quantity: number; unit: Unit };
type Data =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: { id: string; name: string }[] };

type Props = {
  title: "recept" | "vara";
  item?: { id: string; name: string; quantity?: number; unit?: Unit };
  excludeId?: string;
  onSearch: (data: {
    search: string;
    excludeId?: string;
  }) => Promise<{ id: string; name: string }[]>;
  onSubmit: (item: {
    name: string;
    id: string;
    quantity: number;
    unit: Unit;
  }) => Promise<void>;
  addIcon?: boolean;
};

const SearchModal = ({ addIcon = false, ...props }: Props) => {
  const { title, excludeId, onSearch, onSubmit } = props;
  const defaultProp = {
    quantity: props.item?.quantity ?? (title === "recept" ? 2 : 1),
    unit: props.item?.unit ?? (title === "recept" ? "port" : "st"),
  };
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Data>({
    status: "idle",
  });
  const [search, setSearch] = useState("");
  const [item, setItem] = useState<Item | null>(
    props.item ? { ...props.item, ...defaultProp } : null,
  );
  const [debouncedSearch] = useDebounceValue(search, 500);

  const handleSubmit = async () => {
    if (!item) return;
    setData({ status: "loading" });
    await onSubmit(item);
    setData({ status: "idle" });
    setOpen(false);
  };

  const handleSelect = ({ id, name }: { id: string; name: string }) => {
    setSearch("");
    setData({ status: "idle" });
    setItem({
      id,
      name,
      quantity: item?.quantity ?? defaultProp.quantity,
      unit: item?.unit ?? defaultProp.unit,
    });
  };

  useEffect(() => {
    if (!debouncedSearch) return setData({ status: "idle" });
    setData({ status: "loading" });
    onSearch({ search: debouncedSearch, excludeId })
      .then((data) => {
        setData({ status: "success", data });
      })
      .catch((error) => {
        console.log(error);
        setData({ status: "idle" });
        toast.error("Något gick fel...");
      });
  }, [debouncedSearch, excludeId, onSearch]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {props.item ? (
          <button>
            <Icon icon="edit" />
          </button>
        ) : addIcon ? (
          <Icon icon="plus" />
        ) : (
          <Button className="hover:cursor-pointer" variant="outline">
            Lägg till {title}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-2">
              {item ? (
                <p>{capitalize(item.name)}</p>
              ) : (
                <p>{capitalize(title)}</p>
              )}
              {data.status === "loading" && <ClipLoader size={20} />}
            </div>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <Command shouldFilter={false}>
          <CommandInput
            id="name"
            placeholder={`Sök ${title}`}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {data.status === "success" && !data.data.length && (
              <CommandEmpty>Hittade inget</CommandEmpty>
            )}
            {data.status === "success" &&
              data.data.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => handleSelect(item)}
                >
                  {capitalize(item.name)}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
        <DialogFooter>
          <div>
            <div className="flex items-center gap-2">
              <Select
                onValueChange={(unit) => setItem({ ...item, unit } as Item)}
                defaultValue={item?.unit ?? defaultProp.unit}
                disabled={!item}
              >
                <SelectTrigger>
                  <SelectValue />
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectTrigger>
              </Select>
              <Input
                disabled={!item}
                type="number"
                value={item?.quantity ?? defaultProp.quantity}
                onChange={({ target: { value } }) =>
                  setItem({ ...item, quantity: Number(value) } as Item)
                }
              />
              <Button
                disabled={!item || data.status === "loading"}
                onClick={() => handleSubmit()}
                type="button"
              >
                Spara
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
