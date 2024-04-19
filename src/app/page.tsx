import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h2>Välkommen</h2>
      <Link href={"/login"}>Logga in</Link>
    </div>
  );
}
