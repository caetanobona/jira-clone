import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleware } from "@/lib/session-middleware";

import { createWorkspaceSchema } from "../schemas";
import { DATABASE_ID, IMAGES_BUCKET_ID, WORKSPACE_ID } from "@/config";
import { ID } from "node-appwrite";

const app = new Hono()
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage") // getting the storage (defined in middleware)
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

      let uploadedImageUrl : string | undefined; // undefined in case user didn't upload image

      if (image instanceof File) { // if user uploaded a file for image
        const file = await storage.createFile( // creating the File for bucket
            IMAGES_BUCKET_ID,
            ID.unique(),
            image
        );
        
        const arrayBuffer = await storage.getFilePreview( // getting the ArrayBuffer for the file created
          IMAGES_BUCKET_ID,
          file.$id,
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}` // transforming ArrayBuffer to an URL
      }

      const workspace = await databases.createDocument(
        DATABASE_ID,
        WORKSPACE_ID,
        ID.unique(),
        {
          name,
          userId : user.$id,
          imageUrl : uploadedImageUrl // adding the image to the workspace document
        },
      );

      return c.json({ data: workspace })
    }
  )

export default app;