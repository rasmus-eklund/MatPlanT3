"use client";
import Icon from "~/icons/Icon";
import { formatUrl } from "../helpers/searchUrl";
import { useRouter } from "next/navigation";
import { tSearchRecipeSchema } from "~/zod/zodSchemas";

type Props = { results: number; data: tSearchRecipeSchema };

const PaginationNav = ({ results, data: { page, search, shared } }: Props) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <button
        disabled={page === 1}
        onClick={() => {
          router.push(formatUrl({ search, shared, page: page - 1 }));
        }}
        className="disabled:opacity-50"
      >
        <Icon icon="caretLeft" className="h-10" />
      </button>
      <p>Sida: {page}</p>
      <button
        disabled={results < 10}
        className="disabled:opacity-50"
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
