import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import { workflowRouter } from "./routes/quotes/workflow";
import { adminRouter } from "./routes/auth/admin";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  quotes: createTRPCRouter({
    workflow: workflowRouter,
  }),
  auth: createTRPCRouter({
    admin: adminRouter,
  }),
});

export type AppRouter = typeof appRouter;