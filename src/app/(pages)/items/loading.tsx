import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex justify-between gap-2">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex flex-col gap-2">
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
    <div className="flex flex-col rounded-md bg-c2/80 p-2 ">
      <Skeleton className="h-6 w-full" />
    </div>
  );
};
export default Loading;
