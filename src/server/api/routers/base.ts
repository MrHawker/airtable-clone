import { createId } from "@paralleldrive/cuid2";
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
    .mutation(async ({ ctx }) => {
      const result = await ctx.db.$transaction(async (prisma) => {
  
        const newBase = await prisma.base.create({
          data: {
            createdBy: { connect: { id: ctx.session.user.id } },
          },
        });
  
        const newTable = await prisma.table.create({
          data: {
            name: 'Table 1',
            base: { connect: { id: newBase.id } },
            columns: [],
            columns_type: [],
            columns_id: [],
            views: {
              create: [], 
            },
            data: {
              create: [], 
            },
          },
        });
        const newView = await prisma.view.create({
          data: {
            name: 'Grid 1',
            table: { connect: { id: newTable.id } },
            sortBy: [],
            sortOrder: [],
            filterBy: [],
            filterVal: [],
          },
        });
  
        return { newBase:newBase, newTable:newTable, newView:newView };
      });
  
      return result;
    }),

  getBases: protectedProcedure.query(async ({ ctx }) => {
    const bases = await ctx.db.base.findMany({
      where: { createdBy: { id: ctx.session.user.id } },
    });
    
    return bases ?? null;
  }),

});
