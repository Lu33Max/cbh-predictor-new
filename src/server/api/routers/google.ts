import { GoogleSchema } from "prisma/generated/zod";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const googleRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.prisma.google.findMany()
        }),

    get: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return ctx.prisma.google.findFirst({
                where: {
                    id: input
                }
            })
        }),

    update: publicProcedure
        .input(GoogleSchema)
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.google.update({
                where: {
                    id: input.id
                },
                data: input
            })
        }),

    create: publicProcedure
        .input(GoogleSchema)
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.google.create({
                data: input
            })
        }),

    delete: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input}) => {
            return await ctx.prisma.google.delete({
                where: {
                    id: input
                }
            })
        }),

    count: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.google.findMany()
            return entries.length
        }),

    monthlyImpressions: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.google.findMany({
                orderBy: {
                    Date: 'desc'
                }
            })

            const monthlyImpressions: {date: string, value: number}[] = []
            let currentDate = ''
            let impressions = 0

            entries.map((entry) => {
                if(entry.Date === currentDate){
                    impressions += entry.Impressions
                } else {
                    if(currentDate !== ""){
                        monthlyImpressions.push({date: currentDate, value: impressions})
                    }
                    currentDate = entry.Date
                    impressions = entry.Impressions
                }
            })

            return monthlyImpressions
        }),

    monthlyClicks: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.google.findMany({
                orderBy: {
                    Date: 'desc'
                }
            })

            const monthlyClicks: { date: string, value: number }[] = []
            let currentDate = ''
            let clicks = 0

            entries.map((entry) => {
                if(entry.Date === currentDate){
                    clicks += entry.Clicks
                } else {
                    if(currentDate !== ""){
                        monthlyClicks.push({date: currentDate, value: clicks})
                    }
                    currentDate = entry.Date
                    clicks = entry.Clicks
                }
            })

            return monthlyClicks
        }),

    topTerms: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.google.findMany({
                take: 2,
                select: {
                    Term: true
                },
                orderBy: [
                    {
                        Date: 'asc',
                    },
                    {
                        Impressions: 'desc'
                    }
                ]
            })

            return entries.map(entry => entry.Term)
        }),

    dates: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.google.findMany({
                select: {
                    Date: true
                },
                distinct: ['Date'],
                orderBy: {
                    Date: 'desc'
                }
            })

            return entries.map(entry => entry.Date)
        })
});