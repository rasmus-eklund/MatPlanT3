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

const getQuantityValues = (
  selectedItem: Item | null,
  defaultValue?: { quantity: number; unit: Unit },
) => {
  const quantityKey = selectedItem?.id ?? "empty-quantity";
  const quantityValue = selectedItem?.quantity ?? defaultValue?.quantity;
  const quantityFallback = defaultValue?.quantity ?? 1;
  const quantityDisabled = !selectedItem;

  return {
    quantityKey,
    quantityValue,
    quantityFallback,
    quantityDisabled,
  };
};

const getUnitValues = (
  selectedItem: Item | null,
  defaultValue?: { quantity: number; unit: Unit },
  title?: "recept" | "vara",
) => {
  const unitValue = selectedItem?.unit ?? defaultValue?.unit ?? "st";
  const unitDisabled = !selectedItem || title === "recept";

  return {
    unitValue,
    unitDisabled,
  };
};

const useSearchModalState = ({
  defaultValue,
  initialItem,
  excludeId,
  onSearch,
  onSubmit,
}: {
  defaultValue?: { quantity: number; unit: Unit };
  initialItem?: Item;
  excludeId?: string;
  onSearch: (data: { search: string; excludeId?: string }) => Promise<Item[]>;
  onSubmit: (item: Item) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Data>({ status: "idle" });
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isQuantityValid, setIsQuantityValid] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    initialItem ?? null,
  );

  const selectItem = useCallback(
    (item: Item) => {
      setSelectedItem((prev) => {
        const quantity =
          prev?.quantity ?? defaultValue?.quantity ?? item.quantity;
        const unit = prev?.unit ?? defaultValue?.unit ?? item.unit;
        return { ...item, quantity, unit };
      });
    },
    [defaultValue],
  );

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
        const results = await onSearch({ search: value, excludeId });
        const exactMatch = results.find(
          (i) => i.name.toLowerCase() === value.trim().toLowerCase(),
        );
        if (exactMatch) {
          handleSelect(exactMatch);
          return;
        }
        setData({ status: "success", data: results });
      } catch (error) {
        console.error(error);
        setData({ status: "idle" });
        toast.error("Något gick fel...");
      }
    },
    [excludeId, handleSelect, onSearch],
  );

  const debouncedSearch = useDebounceCallback(runSearch, 500);

  const resetSearch = useCallback(() => {
    debouncedSearch.cancel();
    setIsSearchPending(false);
    setData({ status: "idle" });
    setSearch("");
  }, [debouncedSearch]);

  const resetAddState = useCallback(() => {
    resetSearch();
    setSelectedItem(null);
    setIsQuantityValid(true);
  }, [resetSearch]);

  const handleSubmit = useCallback(async () => {
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
  }, [selectedItem, isQuantityValid, onSubmit, initialItem, resetAddState]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (!value) {
        debouncedSearch.cancel();
        setIsSearchPending(false);
        setData({ status: "idle" });
        return;
      }
      setIsSearchPending(true);
      void debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const handleSearchSelect = useCallback(
    (item: Item) => {
      debouncedSearch.cancel();
      setIsSearchPending(false);
      handleSelect(item);
    },
    [debouncedSearch, handleSelect],
  );

  const handleOpenChange = useCallback(
    (value: boolean) => {
      setOpen(value);
      if (initialItem) {
        setSelectedItem(initialItem);
        return;
      }
      if (!value) {
        resetAddState();
      }
    },
    [initialItem, resetAddState],
  );

  const changeQuantity = useCallback((quantity: number) => {
    setSelectedItem((prev) => (prev ? { ...prev, quantity } : null));
  }, []);

  const changeUnit = useCallback((unit: Unit) => {
    setSelectedItem((prev) => (prev ? { ...prev, unit } : null));
  }, []);

  const isSubmitDisabled =
    !selectedItem ||
    !isQuantityValid ||
    isSearchPending ||
    data.status === "loading";

  return {
    open,
    search,
    data,
    selectedItem,
    isSubmitDisabled,
    changeQuantity,
    changeUnit,
    setIsQuantityValid,
    handleSearchChange,
    handleSearchSelect,
    handleOpenChange,
    handleSubmit,
  };
};

const SearchModalTrigger = ({
  initialItem,
  addIcon,
  title,
  open,
}: {
  initialItem?: Item;
  addIcon: boolean;
  title: "recept" | "vara";
  open: boolean;
}) => {
  const triggerButton = initialItem ? (
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
  );

  return (
    <DialogTrigger autoFocus={open} asChild>
      {triggerButton}
    </DialogTrigger>
  );
};

const SearchListItems = ({
  data,
  onSelect,
}: {
  data: Data;
  onSelect: (item: Item) => void;
}) => {
  if (data.status !== "success") {
    return null;
  }
  if (data.data.length === 0) {
    return <CommandEmpty>Hittade inget</CommandEmpty>;
  }
  return (
    <>
      {data.data.map((item) => (
        <CommandItem
          key={item.id}
          value={item.name}
          onSelect={() => onSelect(item)}
          className="first-letter:capitalize"
        >
          {item.name}
        </CommandItem>
      ))}
    </>
  );
};

type SearchFormProps = {
  quantityKey: string;
  quantityValue?: number;
  quantityFallback: number;
  quantityDisabled: boolean;
  unitValue: Unit;
  unitDisabled: boolean;
  isSubmitDisabled: boolean;
  onQuantityChange: (quantity: number) => void;
  onUnitChange: (unit: Unit) => void;
  onValidityChange: (isValid: boolean) => void;
  onSubmit: () => void;
};

const SearchForm = ({
  quantityKey,
  quantityValue,
  quantityFallback,
  quantityDisabled,
  unitValue,
  unitDisabled,
  isSubmitDisabled,
  onQuantityChange,
  onUnitChange,
  onValidityChange,
  onSubmit,
}: SearchFormProps) => {
  return (
    <DialogFooter className="flex flex-row items-start gap-2">
      <DecimalInput
        key={quantityKey}
        ariaLabel="Kvantitet"
        disabled={quantityDisabled}
        errorMessage="Måste vara större än 0"
        fallbackValue={quantityFallback}
        onValidityChange={onValidityChange}
        onValidValueChange={onQuantityChange}
        value={quantityValue}
      />
      <div className="w-full">
        <Select
          onValueChange={(unit) => onUnitChange(unit as Unit)}
          defaultValue={unitValue}
          value={unitValue}
          disabled={unitDisabled}
          options={units.map((i) => ({
            key: i,
            value: i,
            label: unitsAbbr[i],
          }))}
        />
      </div>
      <Button disabled={isSubmitDisabled} onClick={onSubmit} type="button">
        Spara
      </Button>
    </DialogFooter>
  );
};

const SearchModal = ({
  addIcon = false,
  defaultValue,
  item: initialItem,
  ...props
}: Props) => {
  const { title, excludeId, onSearch, onSubmit } = props;
  const state = useSearchModalState({
    defaultValue,
    initialItem,
    excludeId,
    onSearch,
    onSubmit,
  });

  const quantityValues = getQuantityValues(state.selectedItem, defaultValue);
  const unitValues = getUnitValues(state.selectedItem, defaultValue, title);

  return (
    <Dialog onOpenChange={state.handleOpenChange} open={state.open}>
      <SearchModalTrigger
        initialItem={initialItem}
        addIcon={addIcon}
        title={title}
        open={state.open}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-2">
              <p className="first-letter:capitalize">
                {state.selectedItem ? state.selectedItem.name : title}
              </p>
              {state.data.status === "loading" && <Spinner />}
            </div>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <Command shouldFilter={false}>
          <CommandInput
            id="name"
            placeholder={`Sök ${title}`}
            value={state.search}
            onValueChange={state.handleSearchChange}
          />
          <CommandList>
            <SearchListItems
              data={state.data}
              onSelect={state.handleSearchSelect}
            />
          </CommandList>
        </Command>
        <SearchForm
          {...quantityValues}
          {...unitValues}
          isSubmitDisabled={state.isSubmitDisabled}
          onQuantityChange={state.changeQuantity}
          onUnitChange={state.changeUnit}
          onValidityChange={state.setIsQuantityValid}
          onSubmit={state.handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
