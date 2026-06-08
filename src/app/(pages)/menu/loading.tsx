import { Skeleton } from "~/components/ui/skeleton";
const Loading = () => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-2 py-1 md:px-3">
        <h2 className="text-c2 text-lg">Meny</h2>
        <Skeleton className="size-4 rounded-md" />
      </div>
      <ul className="space-y-2 px-1 md:px-2">
        <Item />
        <Item />
        <Item />
        <Item />
      </ul>
    </div>
  );
};

const Item = () => {
  return (
    <li className="bg-c2/80 flex flex-col gap-1 rounded-md px-2 font-bold">
      <div className="pt-1">
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="flex w-full items-center justify-between gap-1 py-1 select-none">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-28 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="size-5" />
          </div>
        </div>
        <Skeleton className="size-8 rounded-md" />
      </div>
    </li>
  );
};

export default Loading;
