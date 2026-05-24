import FoundRecipesLoading, {
  SearchRecipeLoading,
} from "./_components/FoundRecipesLoading";

const Loading = () => {
  return (
    <div className="flex flex-col gap-2 py-2 md:p-2">
      <SearchRecipeLoading />
      <FoundRecipesLoading />
    </div>
  );
};

export default Loading;
