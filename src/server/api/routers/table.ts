import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  
} from "~/server/api/trpc";

export const tableRouter = createTRPCRouter({
    create: protectedProcedure
    .input(
        z.object({
          baseId: z.string(),
          name: z.string(),
        })
      )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (prisma) => {
  
        const newTable = await prisma.table.create({
          data: {
            name: input.name,
            base: { connect: { id: input.baseId } },
            columns: ['Name'],
            columns_type: ['String'],
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
  
        return { newTable:newTable, newView:newView };
      });
  
      return result;
    }),

    addRow: protectedProcedure
    .input(
        z.object({
          tableId: z.string(),
          row: z.object({}),
        })
      )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (prisma) => {
        
        const newRow = await prisma.data.create({
          data: {
            table: { connect: { id: input.tableId } },
            values: input.row
          },
        });
  
        return { newRow:newRow };
      });
  
      return result;
    }),

    editRow: protectedProcedure
    .input(
        z.object({
          rowId: z.number(),
          row: z.any(),
        })
      )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (prisma) => {
        
        const newRow = await prisma.data.update({
          where: {
            id: input.rowId, 
          },
          data: {
            values: input.row as object
          },
        });
  
        return { newRow:newRow };
      });
  
      return result;
    }),
    addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        columnName: z.string(),
        columnType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { tableId, columnName, columnType } = input;
      const result = await ctx.db.$transaction(async (prisma) => {
        
        const newTable = await prisma.table.update({
          where: {
            id: tableId, 
          },
          data: {
            columns: {
              push: columnName, 
            },
            columns_type: {
              push: columnType, 
            },
          },
        });

        return { newTable };
      });

      return result;
    }),
    
    getTables: protectedProcedure
    .input(
    z.object({
      baseId: z.string(),  
    }))
    .query(async ({ ctx, input }) => {
        const tables = await ctx.db.table.findMany({
            where: {
                baseId: input.baseId, 
            },
        });
        return tables;
    }),
    getFirstTable: protectedProcedure
    .input(
    z.object({
      baseId: z.string(),  
    }))
    .query(async ({ ctx, input }) => {
        const tables = await ctx.db.table.findFirst({
            where: {
                baseId: input.baseId, 
            },
        });
        return tables;
    }),
    getTableById: protectedProcedure
    .input(
    z.object({
      tableId: z.string(),  
    }))
    .query(async ({ ctx, input }) => {
        const table = await ctx.db.table.findFirst({
            where: {
                id: input.tableId, 
            },
        });
        return table;
    }),

    getRows: protectedProcedure
    .input(
    z.object({
      tableId: z.string(),  
    }))
    .query(async ({ ctx, input }) => {
        const data = await ctx.db.data.findMany({
            where: {
                tableId: input.tableId, 
            },
            orderBy: {
              id: 'asc', 
          },
        });
        return data.length > 0 ? data : []
    }),
    
    
})

  
  

