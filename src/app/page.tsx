import { redirect } from "next/navigation";

export default function Home() {
  // Redirect from homepage to select-user page
  redirect("/signin");
}
