import React from "react";

type Props = {
  searchParams?: { search?: string; page?: number; shared: boolean };
};

const page = ({ searchParams }: Props) => {
  return <div>recipes</div>;
};

export default page;
