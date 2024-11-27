import { faker } from "@faker-js/faker";
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
        const NameCol = createId()
        const AgeCol = createId()
        const newBase = await prisma.base.create({
          data: {
            createdBy: { connect: { id: ctx.session.user.id } },
          },
        });
  
        const newTable = await prisma.table.create({
          data: {
            name: 'Table 1',
            base: { connect: { id: newBase.id } },
            columns: ['Name','Age'],
            columns_type: ['String','Number'],
            columns_id: [NameCol,AgeCol],
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

        for (let i = 0; i < 5; i++) {
          await prisma.data.create({
            data: {
              id: createId(), 
              table: { connect: { id: newTable.id } },
              values: {
                [NameCol]: faker.person.fullName(), 
                [AgeCol]: faker.number.int({ min: 0, max: 100 }), 
              },
            },
          });
        }

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
