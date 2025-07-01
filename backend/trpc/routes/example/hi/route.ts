import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "@/backend/trpc/create-context";

// Create a procedure
const hiProcedure = publicProcedure
  .input(z.object({ name: z.string() }))
  .query(({ input }) => {
    return {
      hello: input.name,
      date: new Date(),
    };
  });

// Create and export the router
export const exampleRouter = createTRPCRouter({
  hi: hiProcedure
});

// Also export the default procedure for backward compatibility
export default hiProcedure;