"use client";
import Icon from "~/icons/Icon";
import { useRouter } from "next/navigation";
import type { SearchRecipeParams } from "~/types";
import { formatUrl } from "~/lib/utils";

type Props = { results: number; params: SearchRecipeParams };

const PaginationNav = ({
  results,
  params: { page, search, shared },
}: Props) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <button
        disabled={page === 1}
        onClick={() => {
          router.push(formatUrl({ search, shared, page: page - 1 }));
        }}
        className="disabled:opacity-20"
      >
        <Icon icon="caretLeft" className="h-10" />
      </button>
      <p>Sida: {page}</p>
      <button
        disabled={results < 10}
        className="disabled:opacity-20"
        onClick={() => {
          router.push(formatUrl({ search, shared, page: page + 1 }));
        }}
      >
        <Icon icon="caretRight" className="h-10" />
      </button>
    </div>
  );
};

export default PaginationNav;
