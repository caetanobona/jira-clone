import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";

import { createWorkspaceSchema } from "../schemas";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    async (c) => {
      const user = c.get("user") // getting the user thats making the request
      const databases = c.get("databases")

      const members = await databases.listDocuments( // getting members from database
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id)] // filtering members by "userId" being the same as the user who's making the request
      );

      if (members.total == 0) { // if the user isn't a member of any workspaces, no point in fetching them
        return c.json({ data : { documents : [], total : 0 } });
      }

      const workspaceIds = members.documents.map((member) => member.workspaceId) // mapping the IDs of the workspaces that will be fetched

      const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
        [
          Query.orderDesc("$createdAt"), // order by creation date
          Query.contains("$id", workspaceIds) // only fetching workspaces that user is a member of
        ]
      )

      return c.json({ data : workspaces })
    }
  )
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");

      const { name } = c.req.valid("form");

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId : user.$id, // id of the user who made the request - owner of the workspace
          inviteCode : generateInviteCode(10),
        },
      );

      await databases.createDocument( // creating a new entry in "members" collection
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          userId : user.$id, // user who created the workspace
          workspaceId : workspace.$id, // workspace that was created
          role : MemberRole.ADMIN // using the MemberRole enum for type safety
        }
      );

      return c.json({ data: workspace })
    }
  )

export default app;