"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Icon from "~/components/common/Icon";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  defaultRecipePageLimit,
  recipePageLimits,
} from "~/lib/constants/pagination";
import { formatUrl } from "~/lib/utils";
import type { SearchRecipeParams } from "~/types";

type Props = {
  results: number;
  totalPages: number;
  params: SearchRecipeParams;
};
type PaginationState = Pick<SearchRecipeParams, "limit" | "page">;

const PaginationNav = ({ results, totalPages, params }: Props) => {
  const router = useRouter();
  const { limit, page, search, shared } = params;
  const [pagination, setPagination] = useState<PaginationState>({
    page,
    limit,
  });
  const [debouncedPagination] = useDebounceValue(pagination, 1000);

  useEffect(() => {
    if (
      debouncedPagination.page === page &&
      debouncedPagination.limit === limit
    ) {
      return;
    }

    router.push(
      formatUrl({
        search,
        shared,
        page: debouncedPagination.page,
        limit: debouncedPagination.limit,
      }),
    );
  }, [debouncedPagination, limit, page, router, search, shared]);

  return (
    <div className="bg-c3 flex shrink-0 items-center justify-between gap-2 p-1">
      <div className="flex items-center gap-6">
        <Select
          value={String(pagination.limit)}
          onValueChange={(value) => {
            const nextLimit = Number(value) || defaultRecipePageLimit;
            const currentOffset = (pagination.page - 1) * pagination.limit;
            const nextPage = Math.floor(currentOffset / nextLimit) + 1;
            setPagination({ page: nextPage, limit: nextLimit });
          }}
        >
          <SelectTrigger className="h-8 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {recipePageLimits.map((pageLimit) => (
              <SelectItem key={pageLimit} value={String(pageLimit)}>
                {pageLimit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs">
          Sida: {pagination.page} av {totalPages}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={pagination.page === 1}
          onClick={() => {
            setPagination((current) => ({
              ...current,
              page: current.page - 1,
            }));
          }}
          className="h-8 disabled:opacity-20"
        >
          <Icon icon="ChevronLeft" />
        </Button>
        <Button
          variant="outline"
          disabled={pagination.page >= totalPages || results < pagination.limit}
          className="h-8 disabled:opacity-20"
          onClick={() => {
            setPagination((current) => ({
              ...current,
              page: current.page + 1,
            }));
          }}
        >
          <Icon icon="ChevronRight" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationNav;
