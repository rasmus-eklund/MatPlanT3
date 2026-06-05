"use client";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
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
import type { Unit } from "~/types";
import units, { unitsAbbr } from "~/lib/constants/units";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Icon from "~/components/common/Icon";
import { DialogDescription } from "@radix-ui/react-dialog";
import { type User } from "~/server/auth";
import { Spinner } from "../ui/spinner";
import Select from "~/components/common/Select";

type Item = { id: string; name: string; quantity: number; unit: Unit };

type Data =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      data: Item[];
    };

type Props = {
  user: User;
  title: "recept" | "vara";
  item?: Item;
  defaultValue?: { quantity: number; unit: Unit };
  excludeId?: string;
  onSearch: (data: {
    search: string;
    excludeId?: string;
    user: User;
  }) => Promise<Item[]>;
  onSubmit: (item: {
    user: User;
    name: string;
    id: string;
    quantity: number;
    unit: Unit;
  }) => Promise<void>;
  addIcon?: boolean;
};

const SearchModal = ({
  addIcon = false,
  defaultValue,
  item: initialItem,
  ...props
}: Props) => {
  const { title, excludeId, onSearch, onSubmit, user } = props;
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Data>({ status: "idle" });
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    initialItem ?? null,
  );
  const defaultQuantity = defaultValue?.quantity;
  const defaultUnit = defaultValue?.unit;

  const resetSearch = () => {
    debouncedSearch.cancel();
    setData({ status: "idle" });
    setSearch("");
  };

  const resetAddState = () => {
    resetSearch();
    setSelectedItem(null);
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;
    if (selectedItem.quantity <= 0) {
      toast.error("Måste vara större än 0");
      return;
    }
    setData({ status: "loading" });
    try {
      await onSubmit({ ...selectedItem, user });
      setOpen(false);
      if (!initialItem) resetAddState();
    } catch {
      toast.error("Något gick fel...");
    } finally {
      setData({ status: "idle" });
    }
  };

  const handleSelect = useCallback(
    (item: Item) => {
      setSearch("");
      setData({ status: "idle" });
      setSelectedItem((prevItem) => {
        const { quantity, unit } =
          prevItem ??
          (defaultQuantity !== undefined && defaultUnit !== undefined
            ? { quantity: defaultQuantity, unit: defaultUnit }
            : item);
        return { ...item, quantity, unit };
      });
    },
    [defaultQuantity, defaultUnit],
  );

  const runSearch = useCallback(
    async (value: string) => {
      setData({ status: "loading" });
      try {
        const data = await onSearch({ search: value, excludeId, user });
        const exactMatch = data.find(
          (i) => i.name.toLowerCase() === value.trim().toLowerCase(),
        );
        if (exactMatch) {
          handleSelect(exactMatch);
          return;
        }
        setData({ status: "success", data });
      } catch (error) {
        console.log(error);
        setData({ status: "idle" });
        toast.error("Något gick fel...");
      }
    },
    [excludeId, handleSelect, onSearch, user],
  );
  const debouncedSearch = useDebounceCallback(runSearch, 500);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (!value) {
      debouncedSearch.cancel();
      setData({ status: "idle" });
      return;
    }
    void debouncedSearch(value);
  };

  const handleSearchSelect = (item: Item) => {
    debouncedSearch.cancel();
    handleSelect(item);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (initialItem) {
      setSelectedItem(initialItem);
      return;
    }
    if (!value) resetAddState();
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger autoFocus={open} asChild>
        {initialItem ? (
          <button>
            <Icon icon="Pencil" />
          </button>
        ) : addIcon ? (
          <button>
            <Icon
              icon="Plus"
              className="bg-c3 rounded-full transition-transform hover:rotate-90 md:size-5"
            />
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
              <p className="first-letter:capitalize">
                {selectedItem ? selectedItem.name : title}
              </p>
              {data.status === "loading" && <Spinner />}
            </div>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <Command shouldFilter={false}>
          <CommandInput
            id="name"
            placeholder={`Sök ${title}`}
            value={search}
            onValueChange={handleSearchChange}
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
                  onSelect={() => handleSearchSelect(item)}
                  className="first-letter:capitalize"
                >
                  {item.name}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
        <DialogFooter className="flex flex-row items-center gap-2">
          <Input
            disabled={!selectedItem}
            type="number"
            min={0}
            value={selectedItem?.quantity ?? defaultQuantity ?? 1}
            onChange={({ target: { value } }) => {
              setSelectedItem((item) =>
                item ? { ...item, quantity: Number(value) } : item,
              );
            }}
          />
          <Select
            onValueChange={(unit) => {
              setSelectedItem((item) =>
                item ? { ...item, unit: unit as Unit } : item,
              );
            }}
            defaultValue={selectedItem?.unit ?? defaultUnit ?? "st"}
            value={selectedItem?.unit ?? defaultUnit ?? "st"}
            disabled={!selectedItem || title === "recept"}
            options={units.map((i) => ({
              key: i,
              value: i,
              label: unitsAbbr[i],
            }))}
          />
          <Button
            disabled={!selectedItem || data.status === "loading"}
            onClick={() => handleSubmit()}
            type="button"
          >
            Spara
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
