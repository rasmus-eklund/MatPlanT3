"use client";
import { useCallback, useRef, useState } from "react";
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
import { Spinner } from "../ui/spinner";
import Select from "~/components/common/Select";
import DecimalInput from "~/components/common/DecimalInput";

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

const SearchModal = ({
  addIcon = false,
  defaultValue,
  item: initialItem,
  ...props
}: Props) => {
  const { title, excludeId, onSearch, onSubmit } = props;
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Data>({ status: "idle" });
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isQuantityValid, setIsQuantityValid] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItemState, setSelectedItemState] = useState<Item | null>(
    initialItem ?? null,
  );
  const selectedItemRef = useRef<Item | null>(initialItem ?? null);
  const defaultQuantity = defaultValue?.quantity;
  const defaultUnit = defaultValue?.unit;
  const selectedItem = selectedItemState;

  const setSelectedItem = useCallback((item: Item | null) => {
    selectedItemRef.current = item;
    setSelectedItemState(item);
  }, []);

  const selectItem = useCallback(
    (item: Item) => {
      const previousItem = selectedItemRef.current;
      const { quantity, unit } =
        previousItem ??
        (defaultQuantity !== undefined && defaultUnit !== undefined
          ? { quantity: defaultQuantity, unit: defaultUnit }
          : item);

      setSelectedItem({ ...item, quantity, unit });
    },
    [defaultQuantity, defaultUnit, setSelectedItem],
  );

  const changeQuantity = useCallback(
    (quantity: number) => {
      const item = selectedItemRef.current;

      if (item) {
        setSelectedItem({ ...item, quantity });
      }
    },
    [setSelectedItem],
  );

  const changeUnit = useCallback(
    (unit: Unit) => {
      const item = selectedItemRef.current;

      if (item) {
        setSelectedItem({ ...item, unit });
      }
    },
    [setSelectedItem],
  );

  const resetSearch = () => {
    debouncedSearch.cancel();
    setIsSearchPending(false);
    setData({ status: "idle" });
    setSearch("");
  };

  const resetAddState = () => {
    resetSearch();
    setSelectedItem(null);
    setIsQuantityValid(true);
  };

  const handleSubmit = async () => {
    if (!selectedItem || !isQuantityValid) {
      return;
    }
    setData({ status: "loading" });
    try {
      await onSubmit(selectedItem);
      setOpen(false);
      if (!initialItem) {
        resetAddState();
      }
    } catch {
      toast.error("Något gick fel...");
    } finally {
      setData({ status: "idle" });
    }
  };

  const handleSelect = useCallback(
    (item: Item) => {
      setSearch("");
      setIsSearchPending(false);
      setData({ status: "idle" });
      selectItem(item);
    },
    [selectItem],
  );

  const runSearch = useCallback(
    async (value: string) => {
      setIsSearchPending(false);
      setData({ status: "loading" });
      try {
        const data = await onSearch({ search: value, excludeId });
        const exactMatch = data.find(
          (i) => i.name.toLowerCase() === value.trim().toLowerCase(),
        );
        if (exactMatch) {
          handleSelect(exactMatch);
          return;
        }
        setData({ status: "success", data });
      } catch (error) {
        console.error(error);
        setData({ status: "idle" });
        toast.error("Något gick fel...");
      }
    },
    [excludeId, handleSelect, onSearch],
  );
  const debouncedSearch = useDebounceCallback(runSearch, 500);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (!value) {
      debouncedSearch.cancel();
      setIsSearchPending(false);
      setData({ status: "idle" });
      return;
    }
    setIsSearchPending(true);
    void debouncedSearch(value);
  };

  const handleSearchSelect = (item: Item) => {
    debouncedSearch.cancel();
    setIsSearchPending(false);
    handleSelect(item);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (initialItem) {
      setSelectedItem(initialItem);
      return;
    }
    if (!value) {
      resetAddState();
    }
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
        <DialogFooter className="flex flex-row items-start gap-2">
          <DecimalInput
            key={selectedItem?.id ?? "empty-quantity"}
            ariaLabel="Kvantitet"
            disabled={!selectedItem}
            errorMessage="Måste vara större än 0"
            fallbackValue={defaultQuantity ?? 1}
            onValidityChange={setIsQuantityValid}
            onValidValueChange={changeQuantity}
            value={selectedItem?.quantity ?? defaultQuantity}
          />
          <div className="w-full">
            <Select
              onValueChange={(unit) => changeUnit(unit as Unit)}
              defaultValue={selectedItem?.unit ?? defaultUnit ?? "st"}
              value={selectedItem?.unit ?? defaultUnit ?? "st"}
              disabled={!selectedItem || title === "recept"}
              options={units.map((i) => ({
                key: i,
                value: i,
                label: unitsAbbr[i],
              }))}
            />
          </div>
          <Button
            disabled={
              !selectedItem ||
              !isQuantityValid ||
              isSearchPending ||
              data.status === "loading"
            }
            onClick={handleSubmit}
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
