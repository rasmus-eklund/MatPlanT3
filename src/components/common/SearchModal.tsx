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
  | {
      status: "success";
      data: Item[];
    };

type Props = {
  title: "recept" | "vara";
  item?: Item;
  defaultValue?: { quantity: number; unit: Unit };
  excludeId?: string;
  onSearch: (data: { search: string; excludeId?: string }) => Promise<Item[]>;
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
  const [open, setOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [data, setData] = useState<Data>({
    status: "idle",
  });
  const [search, setSearch] = useState("");
  const [item, setItem] = useState<Item | null>(props.item ?? null);
  const [debouncedSearch] = useDebounceValue(search, 500);

  const handleSubmit = async () => {
    if (!item) return;
    if (item.quantity <= 0) {
      toast.error("Måste vara större än 0");
      return;
    }
    setData({ status: "loading" });
    await onSubmit(item);
    setData({ status: "idle" });
    setOpen(false);
    setItem(null);
  };

  const handleSelect = (item: Item) => {
    setSearch("");
    setData({ status: "idle" });
    setItem(item);
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
    <Dialog
      onOpenChange={(value) => {
        setSelectOpen(false);
        setOpen(value);
        if (!value) setItem(null);
      }}
      open={open}
    >
      <DialogTrigger autoFocus={open} asChild>
        {props.item ? (
          <button>
            <Icon icon="edit" />
          </button>
        ) : addIcon ? (
          <button>
            <Icon icon="plus" />
          </button>
        ) : (
          <Button className="hover:cursor-pointer" variant="outline">
            Lägg till {title}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
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
              <Input
                disabled={!item}
                type="number"
                min={0}
                value={props.defaultValue?.quantity ?? item?.quantity ?? 1}
                onChange={({ target: { value } }) =>
                  setItem({ ...item, quantity: Number(value) } as Item)
                }
              />
              <Select
                onOpenChange={setSelectOpen}
                open={selectOpen}
                onValueChange={(unit) => setItem({ ...item, unit } as Item)}
                defaultValue={props.defaultValue?.unit ?? item?.unit ?? "st"}
                value={props.defaultValue?.unit ?? item?.unit ?? "st"}
                disabled={!item || title === "recept"}
              >
                <SelectTrigger>
                  <SelectValue />
                  <SelectContent className="max-h-50 overflow-y-auto md:max-h-100">
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectTrigger>
              </Select>
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
