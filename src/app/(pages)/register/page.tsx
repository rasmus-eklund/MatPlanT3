import { createAccount } from "~/server/api/users";

const page = async () => {
  await createAccount();
};

export default page;
