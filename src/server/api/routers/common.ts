import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const commonRouter = createTRPCRouter({
    getBaseInfo: protectedProcedure.query(async ({ ctx }) => {
        const bases = await ctx.db.base.findMany({
          where: { createdBy: { id: ctx.session.user.id } },
          include: {
            tables: {
              take: 1, 
              include: {
                views: {
                  take: 1, 
                },
              },
            },
          },
        });
        return bases.length > 0 ? bases : [];
      }),

      getFirstViewForTables: protectedProcedure
      .input(z.object({ baseId: z.string() }))
      .query(async ({ ctx,input }) => {
        const tables = await ctx.db.table.findMany({
          where: { baseId: input.baseId },
          include: {
            views: {
              take: 1, 
            },
          },
        });
        return tables.length > 0 ? tables : [];
      }),
    

});
