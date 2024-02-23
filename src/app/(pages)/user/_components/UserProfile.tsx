import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";
import LogOut from "./LogOut";
import { Session } from "next-auth";

type Props = { user: Session["user"] };
const UserProfile = async ({ user: { email, image, name } }: Props) => {
  return (
    <div className="flex items-center gap-5 self-center p-5">
      {image && (
        <Image
          className="w-16 rounded-full"
          alt="Profilbild"
          width={250}
          height={250}
          src={image}
        />
      )}
      <div className="text-c1">
        <p className="text-xl">{name}</p>
        <p className="text-sm">{email}</p>
        <LogOut />
      </div>
    </div>
  );
};

export default UserProfile;
