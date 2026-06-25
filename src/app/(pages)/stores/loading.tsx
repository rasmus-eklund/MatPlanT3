import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex h-full flex-col">
      <h2 className="text-c2 px-2 py-1 text-lg md:px-3">Butiker</h2>
      <ul className="space-y-2 px-1 md:px-2">
        <Store />
      </ul>
      <div className="space-y-4 p-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
};

const Store = () => {
  return (
    <li className="bg-c2 flex h-10 items-center gap-2 rounded-md p-2">
      <Skeleton className="mx-1 size-5" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="ml-auto size-8" />
    </li>
  );
};

export default Loading;
