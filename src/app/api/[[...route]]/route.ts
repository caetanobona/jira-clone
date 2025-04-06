import { Hono } from "hono"
import { handle } from "hono/vercel";

// importing routes from features/{feature}/server/route
import auth from "@/features/auth/server/route"

const app = new Hono().basePath("/api")

// adding routes to the app api
const routes = app
  .route("/auth", auth)

export const GET = handle(app);
export const POST = handle(app);

// defining types for the routes and their params
export type AppType = typeof routes;