"use client";

import { useMemo, useState } from "react";
import Select from "~/components/common/Select";
import type { AllUsers } from "~/server/shared";
import User from "./User";

type SortBy = "lastActiveAt" | "createdAt" | "email";

type Props = {
  users: AllUsers;
};

const sortOptions: Array<{ key: SortBy; value: SortBy; label: string }> = [
  { key: "lastActiveAt", value: "lastActiveAt", label: "Senast aktiv" },
  { key: "createdAt", value: "createdAt", label: "Skapad" },
  { key: "email", value: "email", label: "E-post" },
];

const UsersList = ({ users }: Props) => {
  const [sortBy, setSortBy] = useState<SortBy>("lastActiveAt");

  const sortedUsers = useMemo(
    () =>
      users.toSorted((a, b) => {
        if (sortBy === "email") {
          return a.email.localeCompare(b.email, "sv-SE");
        }

        if (sortBy === "createdAt") {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }

        return (
          (b.lastActiveAt?.getTime() ?? 0) - (a.lastActiveAt?.getTime() ?? 0)
        );
      }),
    [sortBy, users],
  );

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-c2 text-lg">Användare: {users.length}</h2>
        <div className="w-40">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortBy)}
            options={sortOptions}
            triggerClassName="bg-c2 h-8"
          />
        </div>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        {sortedUsers.map((userData) => (
          <User key={userData.id} userData={userData} />
        ))}
      </ul>
    </>
  );
};

export default UsersList;
