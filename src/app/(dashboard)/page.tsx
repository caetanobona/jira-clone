
import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in") // if the user isn't signed in, redirect him to sign in page

  const workspaces = await getWorkspaces(); // getting the workspaces where user is a member
  if (workspaces.total === 0) { // if there are no workspaces
    redirect("/workspaces/create") // make the user create one
  } else { // if there are workspaces
    redirect(`/workspaces/${workspaces.documents[0].$id}`) // redirect to latest workspace created
  }

  // no HTML return since "http://localhost:3000/" route is not supposed to be a page
}
