import Image from "next/image";
import { getServerAuthSession } from "../server/auth";
import { redirect } from "next/navigation";
import LoginHome from "./_components/LoginHome";

const Home = async () => {
  const session = await getServerAuthSession();
  if (session) {
    redirect("/menu");
  }
  return (
    <div className="relative flex h-full items-center justify-center p-10">
      <Image
        className="z-0 object-cover"
        src="/bgimage_lg.jpg"
        alt="background image"
        quality={30}
        fill
      />
      <div className="z-10 flex flex-col items-center gap-5 rounded-3xl bg-c1/80 p-2 md:p-10">
        <h1 className="z-10 text-center text-2xl font-bold text-c5">
          Välkommen till MatPlan!
        </h1>
        <p className="text-center text-xl font-bold text-c5">
          Planera måltider, förenkla inköpslistor och effektivisera dina
          matinköp.
        </p>
        {!session && <LoginHome />}
      </div>
    </div>
  );
};

export default Home;
