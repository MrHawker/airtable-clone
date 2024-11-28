import { z } from "zod";
import { faker } from '@faker-js/faker'; 
import { applyFilter } from "./lib";
import { createId } from '@paralleldrive/cuid2';

import {
  createTRPCRouter,
  protectedProcedure,
  
} from "~/server/api/trpc";

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
        const NameCol = createId()
        const AgeCol = createId()
        const newTable = await prisma.table.create({
          data: {
            name: input.name,
            base: { connect: { id: input.baseId } },
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
  
        const defaultData = Array.from({length: 5}, () => ({
          id: createId(),
          tableId: newTable.id,
          values: {
            [NameCol]: faker.person.fullName(),
            [AgeCol]: faker.number.int({min: 0, max: 100}),
          },
        }));
        
        await prisma.data.createMany({
          data: defaultData,
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
          id: z.string(),
        })
      )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (prisma) => {
        
        const newRow = await prisma.data.create({
          data: {
            id: input.id,
            table: { connect: { id: input.tableId } },
            values: input.row,
            
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
        columnsId: z.array(z.string()),
        columnsType: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (prisma) => {
        
        const rows = Array.from({ length: input.count }, () => {
          const valuesToAdd: JsonValue = {};
          input.columnsId.forEach((col,index) => {
            if(col !== "rowId"){
              if(input.columnsType.at(index) === "String") valuesToAdd[col] = faker.person.fullName() 
              else valuesToAdd[col] = faker.number.int({ min: 0, max: 100 })
            }
          });
          return {
            tableId: input.tableId,
            values: valuesToAdd,
            id: createId() 
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
          rowId: z.string(),
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
        id: z.string(),
        tableId: z.string(),
        columnName: z.string(),
        columnType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id,tableId, columnName, columnType } = input;
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
            columns_id: {
              push: id,
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
      
    }))
    .query(async ({ ctx, input }) => {
      const fullData = await ctx.db.data.findMany({
        where: {
          tableId: input.tableId,
        },

        orderBy: {
          numId: 'asc',
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

    editColumnName: protectedProcedure
    .input(
        z.object({
          tableId: z.string(),
          oldName: z.string(),
          newName: z.string(),
          orgColumns: z.array(z.string()),
        })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.$transaction(async (prisma) => {
        const newColumns = input.orgColumns.map(col => 
          col === input.oldName ? input.newName : col
        );

        await prisma.table.update({
          where: { id: input.tableId },
          data: { 
            columns: newColumns
          }
        });
        console.log(newColumns)
        return { 
          newColumns
        };
      });

      return result;
    }),

    deleteColumn: protectedProcedure
    .input(
        z.object({
          tableId: z.string(),
          newColumns: z.array(z.string()),
          newColumnsId: z.array(z.string()),
          newColumnsType: z.array(z.string()),
        })
    )
    .mutation(async ({ ctx, input }) => {

      await ctx.db.table.update({
        where: { id: input.tableId },
          data: { 
            columns: input.newColumns,
            columns_id: input.newColumnsId,
            columns_type: input.newColumnsType
          }
      })
    }),
    
})

  
  

