import { Skeleton } from "~/components/ui/skeleton";

type Props = {
  items?: number;
};

export const SearchRecipeLoading = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};

const FoundRecipesLoading = ({ items = 4 }: Props) => {
  return (
    <section className="bg-c3/80 flex min-h-0 flex-1 flex-col gap-2 rounded-md p-2">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        {Array.from({ length: items }, (_, index) => (
          <Item key={index} />
        ))}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 p-1">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-6 w-16" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </section>
  );
};

const Item = () => {
  return (
    <div className="bg-c2/80 flex flex-col rounded-md p-2">
      <Skeleton className="h-6 w-48" />
      <div className="flex w-full justify-end">
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
};

export default FoundRecipesLoading;
