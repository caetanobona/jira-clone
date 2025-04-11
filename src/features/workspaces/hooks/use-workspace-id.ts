import { useParams } from "next/navigation";

export const useWorkspaceId = () => {
  const params = useParams();
  return params.workspaceId as string; // getting the current workspaceId from the URL params
}