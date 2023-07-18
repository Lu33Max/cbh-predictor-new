import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { OrderSchema } from "prisma/generated/zod";
import { type ISwarmPlotDatum } from "~/common/types";
import { type CalendarDatum } from "@nivo/calendar";

export const orderRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.prisma.order.findMany()
        }),

    getMany: publicProcedure
        .input(z.object({ page: z.number(), lines: z.number() }))
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.order.findMany({
                take: input.lines,
                skip: input.lines * (input.page -1)
            })
        }),

    get: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.order.findFirst({
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
        .input(OrderSchema)
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.order.update({
                where: {
                    id: input.id
                },
                data: input
            })
        }),

    create: publicProcedure
        .input(OrderSchema)
        .query(async ({ ctx, input }) => {
            return await ctx.prisma.order.create({
                data: input
            })
        }),

    delete: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input}) => {
            return await ctx.prisma.order.delete({
                where: {
                    id: input
                }
            })
        }),

    countDistinct: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.order.findMany({
                distinct: ['Order_ID']
            })
            return entries.length
        }),

    dates: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.order.findMany({
                select: {
                    Order_Date: true
                },
                distinct: ['Order_Date'],
                orderBy: {
                    Order_Date: 'desc'
                }
            })
            return Array.from(new Set(entries.map(entry => entry.Order_Date.toISOString().slice(0, 7))))
        }),

    priceDist: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.order.findMany({
                select: {
                    Price: true
                }
            })

            let count = 0
            let currentPrice = 0

            return entries.sort((a,b) => a.Price < b.Price ? 1 : -1).map((entry, i) => {
                if(currentPrice === entry.Price){
                    count++
                }   
                else {
                    const newEntry: ISwarmPlotDatum = { 
                        id: entry.Price.toString() + "specimen", 
                        group: "specimen", 
                        value: entry.Price, 
                        volume: count 
                    }
                    currentPrice = entry.Price
                    count = 1
                    return newEntry
                }

                if(i === entries.length -1){
                    return { 
                        id: entry.Price.toString() + "specimen", 
                        group: "specimen", 
                        value: entry.Price, 
                        volume: count 
                    }
                }
            })
        }),

    orderPriceDist: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.order.findMany({
                select: {
                    Price: true,
                    Order_ID: true
                }
            })

            entries.sort((a,b) => a.Order_ID < b.Order_ID ? 1 : -1)

            let orderPrice = 0
            let currentID = entries[0]?.Order_ID ?? 0

            const prices: number[] = []

            entries.map((entry, i) => {
                if(currentID === entry.Order_ID){
                    orderPrice += entry.Price
                }   
                else {
                    prices.push(orderPrice)
                    currentID = entry.Order_ID
                    orderPrice = 1
                }

                if(i === entries.length -1){
                    prices.push(orderPrice)
                }
            })

            let currentPrice = prices[0] ?? 0
            let priceCount = 0

            return prices.sort().map((price, i) => {
                if(currentPrice === price){
                    priceCount++
                }
                else {
                    const newEntry: ISwarmPlotDatum = { 
                        id: price.toString() + "order", 
                        group: "order", 
                        value: price, 
                        volume: priceCount 
                    }
                    currentPrice = price
                    priceCount = 1
                    return newEntry
                }

                if(i === prices.length -1){
                    return { 
                        id: price.toString() + "order", 
                        group: "order", 
                        value: price, 
                        volume: priceCount 
                    }
                }
            })
        }),

    dateCount: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.order.findMany({
                select: {
                    Order_Date: true
                }
            })

            entries.sort((a,b) => a.Order_Date < b.Order_Date ? 1 : -1)

            const dateCounts: CalendarDatum[] = []
            let count = 0
            let currentDate = entries[0]?.Order_Date.toISOString().slice(0, 10) ?? ""

            entries.map((entry, i) => {
                if(currentDate === entry.Order_Date.toISOString().slice(0, 10)){
                    count++
                }
                else {
                    if(currentDate !== "")
                        dateCounts.push({ day: currentDate, value: count })
                    
                    count = 1
                    currentDate = entry.Order_Date.toISOString().slice(0, 10)
                }

                if(i === entries.length -1){
                    dateCounts.push({ day: currentDate, value: count })
                }
            })

            return dateCounts
        }),

    monthCount: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.order.findMany({
                select: {
                    Order_Date: true,
                    Order_ID: true
                }
            })

            entries.sort((a,b) => a.Order_Date < b.Order_Date ? 1 : -1)

            const monthCounts: { date: string, value: number }[] = []
            let count = 0
            let currentID = entries[0]?.Order_ID ?? 0
            let currentDate = entries[0]?.Order_Date.toISOString().slice(0, 7) ?? ""

            entries.map((entry, i) => {
                if(currentDate === entry.Order_Date.toISOString().slice(0, 7)){
                    if(currentID !== entry.Order_ID){
                        count++
                        currentID = entry.Order_ID
                    }
                }
                else {
                    if(currentDate !== "")
                        monthCounts.push({ date: currentDate, value: count })
                    
                    count = 1
                    currentID = entry.Order_ID
                    currentDate = entry.Order_Date.toISOString().slice(0, 7)
                }

                if(i === entries.length -1){
                    monthCounts.push({ date: currentDate, value: count })
                }
            })

            return monthCounts
        })
});