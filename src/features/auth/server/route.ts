import { z } from "zod";
import { Hono } from "hono";
import { ID, OAuthProvider } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, setCookie } from "hono/cookie";
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";
import { redirect } from "next/dist/server/api-utils";
import { signUpWithGithub } from "@/lib/oauth";

const app = new Hono()
  .get(
    "/current",
    sessionMiddleware,
    (c) => {
      console.log("entrou na current")

      const user = c.get("user");

      return c.json({ data : user })
    }
  )
  .post(
    "/login",
    zValidator("json", loginSchema), 
    async (c) => {
      const { email, password } = c.req.valid("json");

      const { account } = await createAdminClient()
      const session = await account.createEmailPasswordSession(
        email,
        password
      )

      setCookie(c, AUTH_COOKIE, session.secret, {
        path : "/",
        httpOnly : true,
        secure : true,
        sameSite : "strict",
        maxAge : 60 * 60 * 24 * 30
      })
        
      return c.json({ success : true })
    }
  )
  .post(
    "/register",
    zValidator("json", registerSchema),
    async (c) => {
      const { name, email, password } = c.req.valid("json");

      const { account } = await createAdminClient();
      await account.create(
        ID.unique(),
        email,
        password,
        name
      )

      const session = await account.createEmailPasswordSession(
        email,
        password
      );

      setCookie(c, AUTH_COOKIE, session.secret, {
        path : "/",
        httpOnly : true,
        secure : true,
        sameSite : "strict",
        maxAge : 60 * 60 * 24 * 30
      })

      return c.json({ success : true })
    }
  )
  .post(
    "/oauth-github",
    async (c) => {
      const { account } = await createAdminClient();

      const redirectUrl = await account.createOAuth2Token(
        OAuthProvider.Github,
        `${process.env.NEXT_PUBLIC_APP_URL}/current`,
        `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`
      );

      return c.text(redirectUrl);
    }
  )
  .post(
    "/logout",
    sessionMiddleware,
    async (c) => {
      const account = c.get("account");

      deleteCookie(c, AUTH_COOKIE);
      await account.deleteSession("current");

      return c.json({ success : true })
    }
  )
  


export default app;