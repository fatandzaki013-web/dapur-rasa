import { redirect } from "next/navigation";

export default function FinancialDocumentsRedirect() {
  redirect("/admin/orders");
}
