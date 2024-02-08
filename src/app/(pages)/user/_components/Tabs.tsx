"use client";

import { useState } from "react";

type Props = { tabs: { name: string; tab: React.ReactNode }[] };

const Tabs = ({ tabs }: Props) => {
  const [openTab, setOpenTab] = useState(0);
  return (
    <div className="flex flex-col grow">
      <nav className="flex">
        {tabs.map((tab, n) => (
          <button
            className={`${
              n === openTab ? "bg-c3 text-c5" : "bg-c5 text-c1"
            } rounded-t-md px-4 py-2`}
            key={tab.name}
            onClick={() => setOpenTab(n)}
          >
            {tab.name}
          </button>
        ))}
      </nav>
      <div className="bg-c3 grow">{tabs[openTab]?.tab}</div>
    </div>
  );
};

export default Tabs;
