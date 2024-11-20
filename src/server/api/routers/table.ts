import { z } from "zod";
import { faker } from '@faker-js/faker'; 
import { applyFilter } from "./lib";

import {
  createTRPCRouter,
  protectedProcedure,
  
} from "~/server/api/trpc";
import { RowData } from "@tanstack/react-table";
import { JsonValue } from "@prisma/client/runtime/library";

const filterSchema = z.object({
  id: z.string(),
  value: z.unknown()
});

const sortSchema = z.object({
  id: z.string(),
  desc: z.boolean()
});

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

    addManyRows: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        count: z.number(),
        columnsName: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (prisma) => {
        const valuesToAdd: JsonValue = {};
        input.columnsName.forEach((col) => {
          valuesToAdd[col] = faker.person.fullName();
        });
        const rows = Array.from({ length: input.count }, () => {
          const valuesToAdd: JsonValue = {};
          input.columnsName.forEach((col) => {
            if(col !== "rowId"){
              valuesToAdd[col] = faker.person.fullName();
            }
            
          });
          return {
            tableId: input.tableId,
            values: valuesToAdd
          }
        });

        const newRows = await prisma.data.createMany({
          data: rows,
        });

        return { newRows };
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
      filters: z.array(filterSchema),
      sorts:z.array(sortSchema),
      limit: z.number().min(1).max(500).default(50),
      cursor: z.number().nullish(),
      flip:z.boolean()
    }))
    .query(async ({ ctx, input }) => {
      const fullData = await ctx.db.data.findMany({
        where: {
          tableId: input.tableId,
        },
        
        orderBy: {
          id: 'asc',
        },
      });
  
      const processedData = applyFilter(
        fullData.map((dat) => ({
          id: dat.id,
          values: dat.values,
        })),
        input.filters,
        input.sorts
      );
  
      const rows = processedData.slice(
        input.cursor ? input.cursor : 0,
        (input.cursor ? input.cursor : 0) + input.limit
      );
      
      let nextCursor: typeof input.cursor | undefined = undefined;
      if (processedData.length > (input.cursor ?? 0) + input.limit) {
        nextCursor = (input.cursor ?? 0) + input.limit;
      }

      return {
        items: rows,
        nextCursor,
        meta: {
          totalRowCount: fullData.length,
        },
      };
    }),

    
})

  
  

