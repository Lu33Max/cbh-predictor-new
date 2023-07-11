import { ResponsiveLine } from '@nivo/line'
import React from 'react'

import { type ILineDatum } from '~/common/types'

type LineProps = {
    data: ILineDatum[],
    scheme: string[],
    axisBottom: string,
    axisLeft: string
}

export const LineChart: React.FC<LineProps> = ({data, scheme, axisBottom, axisLeft}) => {
    return(
        <ResponsiveLine
            data={data}
            colors={scheme}
            curve='monotoneX'
            margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
                type: 'linear',
                min: 0,
                max: 'auto',
                stacked: false,
                reverse: false
            }}
            lineWidth={3}
            enableArea={true}
            areaOpacity={0.1}
            yFormat=" >-.2f"
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: axisBottom,
                legendOffset: 36,
                legendPosition: 'middle'
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: axisLeft,
                legendOffset: -40,
                legendPosition: 'middle'
            }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            /*defs={[
                linearGradientDef('gradientA', [
                    { offset: 0, color: 'inherit' },
                    { offset: 100, color: 'inherit', opacity: 0 },
                ]),
            ]}
            fill={[{ match: '*', id: 'gradientA' }]}*/
            legends={[
                {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1
                            }
                        }
                    ]
                }
            ]}
        />
    )
}