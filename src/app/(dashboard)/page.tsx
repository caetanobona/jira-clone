
import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in")

  const workspaces = await getWorkspaces(); // getting the workspaces where user is a member
  if (workspaces.total === 0) { // if there are no workspaces
    redirect("/workspaces/create") // make the user create one
  } else { // if there are workspaces
    redirect(`/workspaces/${workspaces.documents[0].$id}`) // redirect to the first one
  }

  // no HTML return since "/" route is not supposed to have a page
}
