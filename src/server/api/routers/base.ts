import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const baseRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .mutation(async ({ ctx}) => {
      const newBase = await ctx.db.base.create({
        data: {
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
      return {id:newBase.id};
    }),

  getBases: protectedProcedure.query(async ({ ctx }) => {
    const base = await ctx.db.base.findMany({
      
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return base ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
