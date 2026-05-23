"use client";
import Icon from "~/components/common/Icon";
import { useRouter } from "next/navigation";
import type { SearchRecipeParams } from "~/types";
import { formatUrl } from "~/lib/utils";
import {
  defaultRecipePageLimit,
  recipePageLimits,
} from "~/lib/constants/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type Props = { results: number; params: SearchRecipeParams };

const PaginationNav = ({
  results,
  params: { limit, page, search, shared },
}: Props) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between gap-2">
      <button
        disabled={page === 1}
        onClick={() => {
          router.push(formatUrl({ search, shared, page: page - 1, limit }));
        }}
        className="disabled:opacity-20"
      >
        <Icon icon="ChevronLeft" className="h-10" />
      </button>
      <div className="flex items-center gap-2">
        <p>Sida: {page}</p>
        <Select
          value={String(limit)}
          onValueChange={(value) => {
            const nextLimit = Number(value) || defaultRecipePageLimit;
            const currentOffset = (page - 1) * limit;
            const nextPage = Math.floor(currentOffset / nextLimit) + 1;
            router.push(
              formatUrl({
                search,
                shared,
                page: nextPage,
                limit: nextLimit,
              }),
            );
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Antal" />
          </SelectTrigger>
          <SelectContent>
            {recipePageLimits.map((pageLimit) => (
              <SelectItem key={pageLimit} value={String(pageLimit)}>
                {pageLimit} / sida
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <button
        disabled={results < limit}
        className="disabled:opacity-20"
        onClick={() => {
          router.push(formatUrl({ search, shared, page: page + 1, limit }));
        }}
      >
        <Icon icon="ChevronRight" className="h-10" />
      </button>
    </div>
  );
};

export default PaginationNav;
