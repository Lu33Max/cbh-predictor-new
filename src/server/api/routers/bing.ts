import { BingSchema } from "prisma/generated/zod";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const bingRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.prisma.bing.findMany()
        }),

    getMany: publicProcedure
        .input(z.object({ page: z.number(), lines: z.number() }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.bing.findMany({
                take: input.lines,
                skip: input.lines * (input.page -1)
            })
        }),

    get: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return ctx.prisma.bing.findFirst({
                where: {
                    id: input
                }
            })
        }),

    count: publicProcedure
        .query(async ({ ctx }) => {
            return (await ctx.prisma.bing.findMany()).length
        }),

    update: publicProcedure
        .input(BingSchema)
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.bing.update({
                where: {
                    id: input.id
                },
                data: input
            })
        }),

    create: publicProcedure
        .input(BingSchema)
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.bing.create({
                data: input
            })
        }),

    delete: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input}) => {
            return await ctx.prisma.bing.delete({
                where: {
                    id: input
                }
            })
        }),

    monthlyImpressions: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.bing.findMany({
                orderBy: {
                    Date: 'desc'
                }
            })

            const monthlyImpressions: {date: string, value: number}[] = []
            let currentDate = ''
            let impressions = 0

            entries.map((entry, i) => {
                if(entry.Date === currentDate){
                    impressions += entry.Impressions
                } else {
                    if(currentDate !== ""){
                        monthlyImpressions.push({date: currentDate, value: impressions})
                    }
                    currentDate = entry.Date
                    impressions = entry.Impressions
                }

                if(i === entries.length -1){
                    monthlyImpressions.push({date: currentDate, value: impressions})
                }
            })

            return monthlyImpressions
        }),

    monthlyClicks: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.bing.findMany({
                orderBy: {
                    Date: 'desc'
                }
            })

            const monthlyClicks: { date: string, value: number }[] = []
            let currentDate = ''
            let clicks = 0

            entries.map((entry, i) => {
                if(entry.Date === currentDate){
                    clicks += entry.Clicks
                } else {
                    if(currentDate !== ""){
                        monthlyClicks.push({date: currentDate, value: clicks})
                    }
                    currentDate = entry.Date
                    clicks = entry.Clicks
                }

                if(i === entries.length -1){
                    monthlyClicks.push({date: currentDate, value: clicks})
                }
            })

            return monthlyClicks
        }),

    topTerms: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.bing.findMany({
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
            const entries = await ctx.prisma.bing.findMany({
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