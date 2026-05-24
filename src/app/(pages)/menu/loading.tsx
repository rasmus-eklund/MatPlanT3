import { Skeleton } from "~/components/ui/skeleton";
const Loading = () => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-2 py-1 md:px-3">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="size-4 rounded-md" />
      </div>
      <div className="space-y-2 px-1 md:px-2">
        <Item />
        <Item />
        <Item />
        <Item />
      </div>
    </div>
  );
};

const Item = () => {
  return (
    <div className="bg-c2/80 flex flex-col gap-2 rounded-md px-2 font-bold">
      <Skeleton className="mt-2 h-5 w-48" />
      <div className="flex w-full items-center justify-between gap-2 py-2 select-none">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="size-6" />
          </div>
        </div>
        <Skeleton className="size-9 rounded-md" />
      </div>
    </div>
  );
};

export default Loading;
