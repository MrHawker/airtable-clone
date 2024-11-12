import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  
} from "~/server/api/trpc";

export const viewRouter = createTRPCRouter({
    create: protectedProcedure
    .input(
        z.object({
          tableId: z.string(),
          name: z.string(),
        })
      )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (prisma) => {

        const newView = await prisma.view.create({
          data: {
            name: 'Grid 1',
            table: { connect: { id: input.tableId } },
            sortBy: [],
            sortOrder: [],
            filterBy: [],
            filterVal: [],
          },
        });
  
        return { newView:newView };
      });
  
      return result;
    }),

    getViews: protectedProcedure
    .input(
    z.object({
      tableId: z.string(),  
    }))
    .query(async ({ ctx, input }) => {
        const tables = await ctx.db.view.findMany({
            where: {
                tableId: input.tableId, 
            },
        });
        return tables;
    }),
    getFirstView: protectedProcedure
    .input(
    z.object({
      tableId: z.string(),  
    }))
    .query(async ({ ctx, input }) => {
        const tables = await ctx.db.view.findFirst({
            where: {
                tableId: input.tableId, 
            },
        });
        return tables;
    }),
    
})

  
  

