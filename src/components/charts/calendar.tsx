import { type CalendarDatum, ResponsiveTimeRange} from "@nivo/calendar"

export function CalendarChart(data: CalendarDatum[]) {
    return (
        <ResponsiveTimeRange
            data={data}
            from="2022-05-31"
            to="2022-11-30"
            emptyColor="#d4d4d4"
            colors={[ '#a8c096', '#8cb171', '#7cb156', '#6BB238' ]}
            align="left"
            dayBorderWidth={1}
            dayBorderColor="#e9e9e9"
            dayRadius={5}
            direction="vertical"
            minValue={10}
            maxValue={80}
            margin={{ top: 0, right: 55, bottom: 40, left: 55 }}
            weekdayTicks={[]}
            weekdayLegendOffset={10}
            square={false}
            legends={[
                {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    itemCount: 4,
                    itemWidth: 42,
                    itemHeight: 36,
                    itemsSpacing: 14,
                    itemDirection: 'right-to-left',
                    translateX: -60,
                    translateY: -0,
                    symbolSize: 20
                }
            ]}
        />
    )
}