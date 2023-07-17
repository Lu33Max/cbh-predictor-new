import Head from "next/head";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";

import styles from "./index.module.css"
import Navbar from "~/components/navbar";

import { FunnelChart } from "~/components/charts/funnel";
import { CalendarChart } from "~/components/charts/calendar";
import { SwarmPlot } from "~/components/charts/swarmplot";

import { type IDateValue, type ISwarmPlotDatum } from "~/common/types";
import { type FunnelDatum } from "@nivo/funnel";

export default function Header() {
    return(
        <main className="h-[100vh] w-[100vw] font-poppins">
            <div className="h-[100vh] overflow-x-hidden pt-[10vh]">
                <Home/>
            </div>
            <div className="fixed top-0 h-[10vh] w-full bg-[#000020] shadow-[0_3px_20px_rgb(2,4,2)] ">
                <div className="fixed w-full pt-4 text-center align-middle text-6xl text-white ">
                    CBH Predictor Tool
                </div>
                <Navbar/>
            </div>
        </main>
    )
}

function Home() {
    const { data: bingCount } = api.bing.count.useQuery()
    const { data: googleCount } = api.google.count.useQuery()
    const { data: leadCount } = api.lead.count.useQuery()
    const { data: orderCount } = api.order.count.useQuery()
    
    const { data: swarmPrice } = api.order.priceDist.useQuery()
    const { data: swarmOrderPrice } = api.order.orderPriceDist.useQuery()
    const { data: calendarData } = api.order.dateCount.useQuery()

    const { data: resultBingImpr } = api.bing.monthlyImpressions.useQuery()
    const { data: resultBingClicks } = api.bing.monthlyClicks.useQuery()
    const { data: resultGoogleImpr } = api.google.monthlyImpressions.useQuery()
    const { data: resultGoogleClicks } = api.google.monthlyClicks.useQuery()
    const { data: resultOrders } = api.order.monthCount.useQuery()

    const [allCount, setAllCount] = useState(0);
    
    const [swarmData, setSwarmData] = useState<ISwarmPlotDatum[]>([]);
    const [funnelData, setFunnelData] = useState<FunnelDatum[][]>([]);
    const [dates, setDates] = useState<string[]>([]);
    const [activeDate, setActiveDate] = useState(0);
    
    const [cycle, setCycle] = useState(false);
    
    const { data: bingTop } = api.bing.topTerms.useQuery()
    const { data: googleTop } = api.google.topTerms.useQuery()
    
    let dateIndex = 0;

    useEffect(() => {
        setAllCount((bingCount ?? 0) + (googleCount ?? 0) + (leadCount ?? 0) + (orderCount ?? 0));
    }, [bingCount, googleCount, leadCount, orderCount]);

    useEffect(() => {
        if(swarmPrice !== undefined && swarmOrderPrice !== undefined){
            setSwarmData([...swarmPrice.filter(e => e !== undefined) as ISwarmPlotDatum[], ...swarmOrderPrice.filter(e => e !== undefined) as ISwarmPlotDatum[]])
        }
    }, [swarmPrice, swarmOrderPrice])

    useEffect(() => {
        if (cycle) {
            const interval = setInterval(() => {
                dateIndex++;

                if (dateIndex >= dates.length)
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                    dateIndex = 0;

                setActiveDate(dateIndex);
            }, 10000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [funnelData]);

    const showMonths = () => {
        return (
            <>
                {dates.map((date, index) => (
                    <label
                        key={index}
                        className={
                            index === activeDate
                                ? "text-2xl py-1 px-3 rounded-full whitespace-nowrap mx-1 text-center bg-[#6BB238] border-[#a4d67f] border-8"
                                : "text-2xl py-1 px-3 rounded-full whitespace-nowrap mx-1 text-center bg-[#d4d4d4]"
                        }
                    >
                        {date}
                    </label>
                ))}
            </>
        );
    };


    useEffect(() => {
        if (
            resultBingClicks !== undefined &&
            resultBingImpr !== undefined &&
            resultGoogleClicks !== undefined &&
            resultGoogleImpr !== undefined &&
            resultOrders !== undefined
        ) {
            const newFunnel: FunnelDatum[][] = [];
            const newDates: string[] = [];

            let bi = 0,
                bc = 0,
                gi = 0,
                gc = 0,
                o = 0;

            for (let i = 0; i < 6; i++) {
                const bingImpr = resultBingImpr[bi]
                const bingClicks = resultBingClicks[bc]
                const googleImpr = resultGoogleImpr[gi]
                const googleClicks = resultGoogleClicks[gc]
                const currentOrder = resultOrders[o]

                if (bi < resultBingImpr.length && bc < resultBingClicks.length && gi < resultGoogleImpr.length && gc < resultGoogleClicks.length && o < resultOrders.length && bingImpr !== undefined && bingClicks !== undefined && googleImpr !== undefined && googleClicks !== undefined && currentOrder !== undefined) {
                    if (bingImpr?.date === bingClicks?.date) {
                        if (googleImpr?.date === googleClicks?.date) {
                            if (bingImpr?.date === googleImpr?.date) {
                                if (bingImpr?.date === currentOrder?.date) {
                                    newDates.push(resultBingImpr[i]?.date ?? "");
                                    newFunnel.push([
                                        {
                                            id: "impressions",
                                            value:
                                                (bingImpr.value +
                                                    googleImpr.value) /
                                                10,
                                            label:
                                                (bingImpr.value +
                                                googleImpr.value).toString(),
                                        },
                                        {
                                            id: "clicks",
                                            value:
                                                bingClicks.value +
                                                googleClicks.value,
                                            label:
                                                (bingClicks.value +
                                                googleClicks.value).toString(),
                                        },
                                        {
                                            id: "orders",
                                            value: currentOrder.value * 5,
                                            label: resultOrders[i + 1]?.value.toString(),
                                        },
                                    ]);
                                    bi++;
                                    bc++;
                                    gi++;
                                    gc++;
                                    o++;
                                } else {
                                    if (
                                        bingImpr?.date < currentOrder?.date
                                    ) {
                                        
                                        while (
                                            bingImpr?.date < (resultOrders[o] as IDateValue).date
                                        ) {
                                            o++;
                                            if (!(o < resultOrders.length)) {
                                                break;
                                            }
                                        }
                                    }
                                    if (
                                        bingImpr?.date > currentOrder?.date
                                    ) {
                                        while (
                                            (resultBingImpr[bi] as IDateValue).date > currentOrder?.date
                                        ) {
                                            bi++;
                                            bc++;
                                            gi++;
                                            gc++;
                                            if (
                                                !(bi < resultBingImpr.length) ||
                                                !(bc < resultBingClicks.length) ||
                                                !(gi < resultBingImpr.length) ||
                                                !(gc < resultGoogleClicks.length)
                                            ) {
                                                break;
                                            }
                                        }
                                    }
                                    i--;
                                }
                            } else {
                                if (
                                    bingImpr?.date < googleImpr?.date
                                ) {
                                    while (
                                        bingImpr?.date < (resultGoogleImpr[gi] as IDateValue).date
                                    ) {
                                        gi++;
                                        gc++;
                                        if (
                                            !(gi < resultGoogleImpr.length) ||
                                            !(gc < resultGoogleClicks.length)
                                        ) {
                                            break;
                                        }
                                    }
                                }
                                if (
                                    bingImpr?.date > googleImpr?.date
                                ) {
                                    while (
                                        (resultBingImpr[bi] as IDateValue).date > googleImpr?.date
                                    ) {
                                        bi++;
                                        bc++;
                                        if (
                                            !(bi < resultBingImpr.length) ||
                                            !(bc < resultBingClicks.length)
                                        ) {
                                            break;
                                        }
                                    }
                                }
                                i--;
                            }
                        } else {
                            if (
                                googleImpr?.date < googleClicks?.date
                            ) {
                                while (
                                    googleImpr?.date < (resultGoogleClicks[gc] as IDateValue).date
                                ) {
                                    gc++;
                                    if (!(gc < resultGoogleClicks.length)) {
                                        break;
                                    }
                                }
                            }
                            if (
                                googleImpr?.date > googleClicks?.date
                            ) {
                                while (
                                    (resultBingImpr[gi] as IDateValue).date > googleClicks?.date
                                ) {
                                    gi++;
                                    if (!(gi < resultGoogleImpr.length)) {
                                        break;
                                    }
                                }
                            }
                            i--;
                        }
                    } else {
                        if (
                            bingImpr.date < bingClicks?.date
                        ) {
                            while (
                                bingImpr.date < (resultBingClicks[bc] as IDateValue).date
                            ) {
                                bc++;
                                if (!(bc < resultBingClicks.length)) {
                                    break;
                                }
                            }
                        }
                        if (
                            bingImpr.date > bingClicks.date
                        ) {
                            while (
                                (resultBingImpr[bi] as IDateValue).date > bingClicks.date
                            ) {
                                bi++;
                                if (!(bi < resultBingImpr.length)) {
                                    break;
                                }
                            }
                        }
                        i--;
                    }
                } else {
                    break;
                }
            }

            if (newDates.length > 0 && newFunnel.length > 0) {
                newDates.reverse();
                newFunnel.reverse();

                setDates(newDates);
                setFunnelData(newFunnel);
                setCycle(true);
            }
        }
    }, [resultBingClicks, resultBingImpr, resultGoogleClicks, resultGoogleImpr, resultOrders])

    return (
        <>
            <Head>
                <title>CBH Predictor Tool</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.body}>
                <div className={styles.outer_grid}>
                    <div className={styles.header_row}>
                        <label>
                            <h3>Total Entries:</h3>
                            <h3>{allCount}</h3>
                            <h3>|</h3>
                            <div>Bing: {bingCount}</div>
                            <div>Google: {googleCount}</div>
                            <div>Lead: {leadCount}</div>
                            <div>Order: {orderCount}</div>
                        </label>
                    </div>
                    <div className={styles.left_container}>
                        <div className={styles.left_container_bg}>
                            <div className={styles.l_grid}>
                                <div className={styles.l_header}>{showMonths()}</div>
                                <div className={styles.top_line}></div>
                                <div className={styles.bottom_line}></div>
                                <div className={styles.l_left_top_container}>
                                    <div className={styles.circle}>
                                        <h3>1</h3>
                                    </div>
                                </div>
                                <div className={styles.l_left_mid_container}>
                                    <div className={styles.circle}>
                                        <h3>2</h3>
                                    </div>
                                </div>
                                <div className={styles.l_left_bot_container}>
                                    <div className={styles.circle}>
                                        <h3>3</h3>
                                    </div>
                                </div>
                                <div className={styles.l_funnel_container}>
                                    {FunnelChart(funnelData[activeDate] ?? [{id: "None", value: 0}])}
                                </div>
                                <div className={styles.l_right_text_top}>Impressions</div>
                                <div className={styles.l_right_text_mid}>Clicks</div>
                                <div className={styles.l_right_text_bot}>Orders</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right_top_container}>
                        <div className={styles.right_top_container_bg}>
                            <div className={styles.rt_grid}>
                                <div className={styles.rt_left_container}>
                                    {CalendarChart(calendarData ?? [])}
                                </div>
                                <div className={styles.rt_right_container}>
                                    {SwarmPlot(swarmData)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right_bottom_container}>
                        <div className={styles.right_bottom_container_bg}>
                            <div className={styles.rb_grid}>
                                <div className={styles.rb_line}></div>
                                <div className={styles.rb_top_left}>
                                    <b>Top Searches Last Month</b>
                                </div>
                                <div className={styles.rb_top_right}>
                                    <b>Top Orders Last Month</b>
                                </div>
                                <div className={styles.rb_bot_left}>
                                    <div
                                        style={{
                                            gridColumnStart: "1",
                                            gridColumnEnd: "2",
                                            gridRowStart: "1",
                                            gridRowEnd: "2",
                                            textAlign: "center",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        B:
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "2",
                                            gridColumnEnd: "3",
                                            gridRowStart: "1",
                                            gridRowEnd: "2",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        #1 {bingTop ? bingTop[0] ?? "No Data" : "No Data"}
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "3",
                                            gridColumnEnd: "4",
                                            gridRowStart: "1",
                                            gridRowEnd: "2",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        #2 {bingTop ? bingTop[1] ?? "No Data" : "No Data"}
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "1",
                                            gridColumnEnd: "2",
                                            gridRowStart: "2",
                                            gridRowEnd: "3",
                                            textAlign: "center",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        G:
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "2",
                                            gridColumnEnd: "3",
                                            gridRowStart: "2",
                                            gridRowEnd: "3",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        #1 {googleTop ? googleTop[0] ?? "No Data" : "No Data"}
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "3",
                                            gridColumnEnd: "4",
                                            gridRowStart: "2",
                                            gridRowEnd: "3",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        #2 {googleTop ? googleTop[1] ?? "No Data" : "No Data"}
                                    </div>
                                </div>
                                <div className={styles.rb_bot_right}>
                                    <div
                                        style={{
                                            gridColumnStart: "1",
                                            gridColumnEnd: "2",
                                            gridRowStart: "1",
                                            gridRowEnd: "2",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        Diag:
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "2",
                                            gridColumnEnd: "3",
                                            gridRowStart: "1",
                                            gridRowEnd: "2",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        #1 {orderCount == 0 ? "NaN" : "healthy"}
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "3",
                                            gridColumnEnd: "4",
                                            gridRowStart: "1",
                                            gridRowEnd: "2",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        #2 {orderCount == 0 ? "NaN" : "diabetes"}
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "1",
                                            gridColumnEnd: "2",
                                            gridRowStart: "2",
                                            gridRowEnd: "3",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        Para:
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "2",
                                            gridColumnEnd: "3",
                                            gridRowStart: "2",
                                            gridRowEnd: "3",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        #1 {orderCount == 0 ? "NaN" : "Procalcit..."}
                                    </div>
                                    <div
                                        style={{
                                            gridColumnStart: "3",
                                            gridColumnEnd: "4",
                                            gridRowStart: "2",
                                            gridRowEnd: "3",
                                            textAlign: "left",
                                            fontSize: "2.2vh",
                                        }}
                                    >
                                        #2 {orderCount == 0 ? "NaN" : "ALP"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
