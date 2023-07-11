import { z } from "zod";

export const SwarmPlotDatum = z.object({
    id: z.string(),
    group: z.string(),
    value: z.number(),
    volume: z.number()
})

export type ISwarmPlotDatum = z.infer<typeof SwarmPlotDatum>

export const PieDatum = z.object({
    id: z.string(),
    label: z.string().optional(),
    value: z.number()
})

export type IPieDatum = z.infer<typeof PieDatum>

export const DateValue = z.object({
    date: z.string(),
    value: z.number()
})

export type IDateValue = z.infer<typeof DateValue>

export const LineDatum = z.object({
    id: z.string(),
    data: z.object({
        x: z.string(),
        y: z.number(),
    }).array()
})

export type ILineDatum = z.infer<typeof LineDatum>

export const BumpDatum = z.object({
    id: z.string(),
    data: z.object({
        x: z.string(),
        y: z.number()
    }).array()
})

export type IBumpDatum = z.infer<typeof BumpDatum>

export const BarDatum = <Key extends string[]>(
    element: Key
) => {
    let schema = z.object({})
    
    for(const prop of element){
        schema = schema.setKey(prop, z.number())
    }

    return schema
}