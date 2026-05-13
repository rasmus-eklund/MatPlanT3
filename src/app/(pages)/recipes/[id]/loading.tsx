import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="bg-c3 flex flex-col gap-2 p-2">
      <Skeleton className="h-8 w-full" />
      <div className="flex w-full justify-between">
        <span className="text-c5/60 text-lg">Portioner:</span>
        <Skeleton className="size-7" />
      </div>
      <span className="text-c5/60 text-lg">Ingredienser:</span>
      <div className="flex flex-col gap-2">
        <Item />
        <Item />
        <Item />
        <Item />
        <Item />
        <Item />
      </div>
      <span className="text-c5/60 text-lg">Instruktion:</span>
      <Skeleton className="h-48 w-full" />
    </div>
  );
};

const Item = () => {
  return (
    <div className="bg-c2/80 flex flex-col rounded-md p-2">
      <Skeleton className="h-6 w-full" />
    </div>
  );
};
export default Loading;
