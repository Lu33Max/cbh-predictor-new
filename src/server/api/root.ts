import { createTRPCRouter } from "~/server/api/trpc";
import { bingRouter } from "./routers/bing";
import { googleRouter } from "./routers/google";
import { leadRouter } from "./routers/lead";
import { orderRouter } from "./routers/order";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  bing: bingRouter,
  google: googleRouter,
  lead: leadRouter,
  order: orderRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
