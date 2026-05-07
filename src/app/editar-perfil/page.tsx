import { redirect } from "next/navigation";

export default function EditarPerfilPage() {
  redirect("/dashboard?tab=editar");
}
