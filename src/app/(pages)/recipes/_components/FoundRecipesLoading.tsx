import Icon from "~/components/common/Icon";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import type { SearchRecipeParams } from "~/types";

type Props = {
  items?: number;
  params?: Pick<SearchRecipeParams, "limit" | "page">;
};

export const SearchRecipeLoading = () => {
  return (
    <div className="flex flex-col gap-2 px-1">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
};

const FoundRecipesLoading = ({ items, params }: Props) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const itemCount = items ?? Math.min(limit, 8);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 rounded-md">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-1">
        {Array.from({ length: itemCount }, (_, index) => (
          <Item key={index} />
        ))}
      </div>
      <div className="bg-c3/80 flex shrink-0 items-center justify-between gap-2 p-1">
        <div className="flex items-center gap-6">
          <div className="border-input bg-background flex h-8 w-16 items-center justify-between rounded-md border px-3 py-2 text-sm">
            <span>{limit}</span>
            <Icon icon="ChevronDown" />
          </div>
          <p className="text-xs">Sida: {page}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "border-input bg-background flex h-8 w-12.5 items-center justify-center rounded-md border",
              page === 1 ? "opacity-20" : "",
            )}
          >
            <Icon icon="ChevronLeft" />
          </div>
          <div className="border-input bg-background flex h-8 w-12.5 items-center justify-center rounded-md border">
            <Icon icon="ChevronRight" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Item = () => {
  return (
    <div className="bg-c2/80 flex flex-col gap-1 rounded-md p-1">
      <Skeleton className="h-6 w-48" />
      <div className="flex w-full justify-end">
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
};

export default FoundRecipesLoading;
