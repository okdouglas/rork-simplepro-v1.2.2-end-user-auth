import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";
import { quoteWorkflowRouter } from "./routes/quotes/workflow";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  quotes: createTRPCRouter({
    workflow: quoteWorkflowRouter,
  }),
});

export type AppRouter = typeof appRouter;