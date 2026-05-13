import { Skeleton } from "~/components/ui/skeleton";
const Loading = () => {
  return (
    <div className="flex flex-col gap-2">
      <Item />
      <Item />
      <Item />
      <Item />
    </div>
  );
};

const Item = () => {
  return (
    <div className="bg-c3/80 flex flex-col gap-2 rounded-md p-2">
      <Skeleton className="h-8 w-48" />
      <div className="flex w-full items-center justify-between gap-2 py-2 select-none">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-28" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="size-6" />
          </div>
        </div>
        <Skeleton className="size-6" />
      </div>
    </div>
  );
};

export default Loading;
