import { OrderSchema } from "prisma/generated/zod";
import { z } from "zod";
import { type ISwarmPlotDatum } from "~/common/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.prisma.order.findMany()
        }),

    get: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            return ctx.prisma.order.findFirst({
                where: {
                    id: input
                }
            })
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

    count: publicProcedure
        .query(async ({ ctx }) => {
            const entries = await ctx.prisma.order.findMany()
            return entries.length
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
            return entries.map(entry => entry.Order_Date)
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

            return entries.sort((a,b) => a.Price < b.Price ? 1 : -1).map(entry => {
                if(currentPrice === entry.Price){
                    count++
                }   
                else {
                    const newEntry: ISwarmPlotDatum = { 
                        id: entry.Price.toString(), 
                        group: "specimen", 
                        value: entry.Price, 
                        volume: count 
                    }
                    currentPrice = entry.Price
                    count = 0
                    return newEntry
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

            let orderPrice = 0
            let currentID = entries[0]?.Order_ID ?? 0

            const prices: number[] = []

            entries.sort((a,b) => a.Order_ID < b.Order_ID ? 1 : -1).map(entry => {
                if(currentID === entry.Order_ID){
                    orderPrice += entry.Price
                }   
                else {
                    prices.push(orderPrice)
                    currentID = entry.Order_ID
                    orderPrice = 0
                }
            })

            let currentPrice = prices[0] ?? 0
            let priceCount = 0

            return prices.sort().map(price => {
                if(currentPrice === price){
                    priceCount++
                }
                else {
                    const newEntry: ISwarmPlotDatum = { 
                        id: price.toString(), 
                        group: "order", 
                        value: price, 
                        volume: priceCount 
                    }
                    currentPrice = price
                    priceCount = 0
                    return newEntry
                }
            })
        })
});