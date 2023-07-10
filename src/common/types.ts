import { z } from "zod";

export const SwarmPlotDatum = z.object({
    id: z.string(),
    group: z.string(),
    value: z.number(),
    volume: z.number()
})

export type ISwarmPlotDatum = z.infer<typeof SwarmPlotDatum>