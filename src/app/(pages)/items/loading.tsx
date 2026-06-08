import { Skeleton } from "~/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="flex h-full flex-col md:gap-1 md:pb-1">
      <div className="flex w-full shrink-0">
        <Skeleton className="h-10 flex-1 rounded-none md:max-w-28 md:rounded-sm" />
        <Skeleton className="h-10 flex-1 rounded-none md:max-w-32 md:rounded-sm" />
        <Skeleton className="h-10 flex-1 rounded-none md:max-w-28 md:rounded-sm" />
      </div>
      <div className="bg-c2 flex h-10 w-full shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-sm" />
          <Skeleton className="size-8 rounded-md" />
        </div>
        <p className="text-lg font-bold">Köpa</p>
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-auto">
        <Category items={3} headingWidth="w-24" />
        <Category items={1} headingWidth="w-32" />
      </div>
    </div>
  );
};

const Category = ({
  items,
  headingWidth,
}: {
  items: number;
  headingWidth: string;
}) => {
  return (
    <div className="bg-c5 px-1 py-2">
      <Skeleton className={`mx-2 mb-2 h-6 ${headingWidth}`} />
      <ul className="flex flex-col gap-1">
        {Array.from({ length: items }).map((_, index) => (
          <Item key={index} />
        ))}
      </ul>
    </div>
  );
};

const Item = () => {
  return (
    <li className="bg-c3/80 flex flex-col rounded-md px-2 py-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-5 w-36 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-sm" />
          <Skeleton className="size-5 rounded-sm" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      </div>
    </li>
  );
};
export default Loading;
