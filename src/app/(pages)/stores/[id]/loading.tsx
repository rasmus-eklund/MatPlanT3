import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="bg-c3 flex flex-col gap-2 rounded-md p-3">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="size-9 rounded-md" />
      </div>
      <ul className="bg-c3 flex flex-col gap-2 rounded-md pb-10">
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
        <Category />
      </ul>
    </div>
  );
};

const Category = () => {
  return (
    <li className="bg-c4 flex flex-col gap-2 rounded-md px-2 py-1">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="size-6 rounded-sm" />
        <Skeleton className="h-7 w-36 grow" />
        <Skeleton className="size-6 rounded-sm" />
      </div>
    </li>
  );
};

export default Loading;
