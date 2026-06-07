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

const getQuantityDraft = (quantity: number | undefined) =>
  String(quantity ?? 1);

const parseQuantityDraft = (value: string) => {
  const trimmed = value.trim();
  const normalized = trimmed.replace(",", ".");
  const isPartialDecimal =
    trimmed.endsWith(".") || trimmed.endsWith(",") || trimmed === "";
  const decimalPattern = /^(?:\d+|\d*[.,]\d+)$/;

  if (isPartialDecimal || !decimalPattern.test(trimmed)) {
    return null;
  }

  const quantity = Number(normalized);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  return quantity;
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
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    initialItem ?? null,
  );
  const defaultQuantity = defaultValue?.quantity;
  const defaultUnit = defaultValue?.unit;
  const fallbackQuantity = defaultQuantity ?? 1;
  const [quantityDraft, setQuantityDraft] = useState(
    getQuantityDraft(initialItem?.quantity ?? fallbackQuantity),
  );
  const parsedQuantity = parseQuantityDraft(quantityDraft);
  const showQuantityError = !!selectedItem && parsedQuantity === null;

  const resetSearch = () => {
    debouncedSearch.cancel();
    setIsSearchPending(false);
    setData({ status: "idle" });
    setSearch("");
  };

  const resetAddState = () => {
    resetSearch();
    setSelectedItem(null);
    setQuantityDraft(getQuantityDraft(fallbackQuantity));
  };

  const handleSubmit = async () => {
    if (!selectedItem || parsedQuantity === null) {
      return;
    }
    setData({ status: "loading" });
    try {
      await onSubmit({ ...selectedItem, quantity: parsedQuantity });
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
      const { quantity, unit } =
        selectedItem ??
        (defaultQuantity !== undefined && defaultUnit !== undefined
          ? { quantity: defaultQuantity, unit: defaultUnit }
          : item);
      setQuantityDraft(getQuantityDraft(quantity));
      setSelectedItem({ ...item, quantity, unit });
    },
    [defaultQuantity, defaultUnit, selectedItem],
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
      setQuantityDraft(getQuantityDraft(initialItem.quantity));
      return;
    }
    if (!value) {
      resetAddState();
    }
  };

  const handleQuantityChange = (value: string) => {
    setQuantityDraft(value);
    const quantity = parseQuantityDraft(value);

    if (quantity === null) {
      return;
    }

    setSelectedItem((item) => (item ? { ...item, quantity } : item));
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
          <div className="w-full">
            <Input
              aria-label="Kvantitet"
              aria-describedby={
                showQuantityError ? "quantity-error" : undefined
              }
              aria-invalid={showQuantityError}
              disabled={!selectedItem}
              inputMode="decimal"
              type="text"
              value={quantityDraft}
              onChange={({ target: { value } }) => handleQuantityChange(value)}
            />
            <p
              id="quantity-error"
              aria-hidden={!showQuantityError}
              className={`text-destructive mt-1 min-h-5 text-sm font-medium ${
                showQuantityError ? "visible" : "invisible"
              }`}
            >
              Måste vara större än 0
            </p>
          </div>
          <div className="w-full">
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
          </div>
          <Button
            disabled={
              !selectedItem ||
              showQuantityError ||
              isSearchPending ||
              data.status === "loading"
            }
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
