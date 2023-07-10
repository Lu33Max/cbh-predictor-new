import { type FunnelDatum, ResponsiveFunnel } from "@nivo/funnel"
import React from "react"

export function FunnelChart (data: FunnelDatum[]) {
    return(
        <ResponsiveFunnel
            data={data}
            margin={{ top: 20, right: 35, bottom: 20, left: 35 }}
            valueFormat=">-.0f"
            colors={[ '#8cb171', '#7cb156', '#6BB238' ]}
            borderWidth={20}
            enableLabel={false}
            labelColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        3
                    ]
                ]
            }}
            enableBeforeSeparators={false}
            enableAfterSeparators={false}
            currentPartSizeExtension={10}
            currentBorderWidth={40}
            motionConfig="wobbly"
            tooltip={( part ) => (
                <div style={{ padding: 12, color: '#000000', background: '#ffffff'}}>
                    <strong>
                        {part.part.data.id}: {part.part.data.label ?? "None"}
                    </strong>
                </div>
            )}
        />
    )
}