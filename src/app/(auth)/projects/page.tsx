import { redirect } from "next/navigation";

// Redirect to new /demandes route
export default function ProjectsPage() {
  redirect("/demandes");
}
