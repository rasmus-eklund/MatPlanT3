import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="bg-c3 flex flex-col gap-2 rounded-md p-3">
      <Skeleton className="h-7 w-32" />
      <ul className="flex flex-col gap-2">
        <Store />
        <Store />
      </ul>
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
    </div>
  );
};

const Store = () => {
  return (
    <li className="bg-c2 flex h-10 items-center gap-2 rounded-md p-2">
      <Skeleton className="mx-2.5 size-5 rounded-sm" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="ml-auto size-8 rounded-md" />
    </li>
  );
};

export default Loading;
