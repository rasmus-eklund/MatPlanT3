import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="flex flex-col gap-2 rounded-md bg-c3/80 p-2">
        <div className="text-xl text-c5">Recept:</div>
        <div className="flex flex-col gap-2">
          <Item />
          <Item />
          <Item />
          <Item />
        </div>
      </div>
    </div>
  );
};

const Item = () => {
  return (
    <div className="flex flex-col rounded-md bg-c2/80 p-2 ">
      <Skeleton className="h-6 w-48" />
      <div className="flex w-full justify-end">
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  );
};
export default Loading;
