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
import { Button } from "~/components/ui/button";

type Props = { results: number; params: SearchRecipeParams };

const PaginationNav = ({
  results,
  params: { limit, page, search, shared },
}: Props) => {
  const router = useRouter();
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 p-1">
      <div className="flex items-center gap-6">
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
          <SelectTrigger className="w-16">
            <SelectValue placeholder="Antal" />
          </SelectTrigger>
          <SelectContent>
            {recipePageLimits.map((pageLimit) => (
              <SelectItem key={pageLimit} value={String(pageLimit)}>
                {pageLimit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p>Sida: {page}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => {
            router.push(formatUrl({ search, shared, page: page - 1, limit }));
          }}
          className="disabled:opacity-20"
        >
          <Icon icon="ChevronLeft" className="h-10" />
        </Button>
        <Button
          variant="outline"
          disabled={results < limit}
          className="disabled:opacity-20"
          onClick={() => {
            router.push(formatUrl({ search, shared, page: page + 1, limit }));
          }}
        >
          <Icon icon="ChevronRight" className="h-10" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationNav;
