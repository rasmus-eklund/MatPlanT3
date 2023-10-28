import type { ReactNode } from "react";
import HomeIcon from "../icons/HomeIcon";
import RecipeIcon from "../icons/RecipesIcon";
import ItemsIcon from "../icons/ItemsIcon";
import ShoppingListIcon from "../icons/ShoppingListIcon";
import StoreIcon from "../icons/StoreIcon";
import Link from "next/link";

const Navbar = () => {
  const className = "fill-c2 h-6 md:h-10 hover:scale-110";
  const home = <HomeIcon className={className} />;
  const recipes = <RecipeIcon className={className} />;
  const itemsIcon = <ItemsIcon className={className} />;
  const shoppingList = <ShoppingListIcon className={className} />;
  const store = <StoreIcon className={className} />;

  const items: { name: string; href: string; child: ReactNode }[] = [
    { name: "Meny", href: "/menu", child: home },
    { name: "Maträtter", href: "/recipes", child: recipes },
    { name: "Varor", href: "/ingredients", child: itemsIcon },
    { name: "Inköpslista", href: "/shoppingList", child: shoppingList },
    { name: "Butik", href: "/stores", child: store },
  ];

  return (
    <nav className="bg-c5">
      <ul className="flex justify-evenly px-4 py-4">
        {items.map(({ name, href, child }) => (
          <li key={name}>
            <Link className="flex flex-col items-center" href={href}>
              {child}
              <h3 className="text-c2 font-bold">{name}</h3>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
