import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col gap-2 bg-c3 p-2">
      <Skeleton className="h-8 w-full" />
      <div className="flex w-full justify-between">
        <span className="text-lg text-c5/60">Portioner:</span>
        <Skeleton className="size-7" />
      </div>
      <span className="text-lg text-c5/60">Ingredienser:</span>
      <div className="flex flex-col gap-2">
        <Item />
        <Item />
        <Item />
        <Item />
        <Item />
        <Item />
      </div>
      <span className="text-lg text-c5/60">Instruktion:</span>
      <Skeleton className="h-48 w-full" />
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
