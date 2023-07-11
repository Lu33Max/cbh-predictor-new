import { LeadSchema } from "prisma/generated/zod";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const leadRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.prisma.lead.findMany()
        }),

    get: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return ctx.prisma.lead.findFirst({
                where: {
                    id: input
                }
            })
        }),

    update: publicProcedure
        .input(LeadSchema)
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.lead.update({
                where: {
                    id: input.id
                },
                data: input
            })
        }),

    create: publicProcedure
        .input(LeadSchema)
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.lead.create({
                data: input
            })
        }),

    delete: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input}) => {
            return await ctx.prisma.lead.delete({
                where: {
                    id: input
                }
            })
        }),

    count: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.lead.findMany()
            return entries.length
        }),

    dates: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.lead.findMany({
                select: {
                    Lead_Date: true
                },
                distinct: ['Lead_Date'],
                orderBy: {
                    Lead_Date: 'desc'
                }
            })

            return entries.map(entry => entry.Lead_Date.toISOString().slice(7))
        })
});