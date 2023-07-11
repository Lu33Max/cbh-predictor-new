import { ResponsiveAreaBump } from '@nivo/bump'
import { type IBumpDatum } from '~/common/types'

type AreaBumpProps = {
    data: IBumpDatum[],
    scheme: string[]
}

export const AreaBump: React.FC<AreaBumpProps> = ({ data, scheme }) => {
    return(
        <ResponsiveAreaBump
            data={data}
            margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
            spacing={8}
            colors={scheme}
            blendMode="multiply"
            startLabel={true}
            endLabel={true}
            axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '',
                legendPosition: 'middle',
                legendOffset: -36
            }}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '',
                legendPosition: 'middle',
                legendOffset: 32
            }}
        />
    )
}