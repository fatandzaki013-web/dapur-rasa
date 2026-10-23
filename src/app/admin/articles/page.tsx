import { redirect } from "next/navigation";

export default function ArticlesRedirect() {
  redirect("/admin/content/articles");
}
