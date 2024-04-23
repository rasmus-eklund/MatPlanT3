"use client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "~/components/ui/select";
import type { Store } from "~/server/shared";

type Props = {
  stores: Store;
  defaultStoreId: string;
};

const StoreSelect = ({ stores, defaultStoreId }: Props) => {
  const router = useRouter();
  const changePath = (id: string) => {
    const found = stores.find((i) => i.id === id);
    if (found) {
      router.push(`/items?store=${found.slug}`);
    }
  };
  return (
    <Select defaultValue={defaultStoreId} onValueChange={changePath}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Välj affär" />
      </SelectTrigger>
      <SelectContent>
        {stores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            {store.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StoreSelect;
