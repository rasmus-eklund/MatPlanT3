import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";
import LogOut from "./LogOut";

const UserProfile = async () => {
  const session = await getServerAuthSession();
  if (session) {
    return (
      <div className="flex items-center gap-5 self-center p-5">
        {session.user.image && (
          <Image
            className="w-16 rounded-full"
            alt="Profilbild"
            width={250}
            height={250}
            src={session.user.image}
          />
        )}
        <div className="text-c1">
          <p className="text-xl">{session.user.name}</p>
          <p className="text-sm">{session.user.email}</p>
          <LogOut />
        </div>
      </div>
    );
  }
  return <div>Not logged in</div>;
};

export default UserProfile;
