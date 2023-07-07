import Head from "next/head";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import styles from "./index.module.css"
import Navbar from "~/components/navbar";

export default function Header() {
    return(
        <main className="h-[100vh] w-[100vw]">
            <div className={styles.body2}>
                <Home/>
            </div>
            <div className={styles.header2}>
                <div className={styles.text_container2}>CBH Predictor Tool</div>
                {<Navbar/>}
            </div>
        </main>
    )
}

function Home() {
    const { data: bingCount } = api.bing.count.useQuery()
    const { data: googleCount } = api.google.count.useQuery()
    const [leadCount, setLeadCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    
    const [allCount, setAllCount] = useState(0);
    
    const [calendarData, setCalendarData] = useState([]);
    const [swarmData, setSwarmData] = useState([]);
    const [funnelData, setFunnelData] = useState([
        [{ id: "NaN", value: 1, label: "NaN" }],
    ]);
    const [dates, setDates] = useState([]);
    const [activeDate, setActiveDate] = useState(0);
    
    const [cycle, setCycle] = useState(false);
    
    const { data: bingTop } = api.bing.topTerms.useQuery()
    const { data: googleTop } = api.google.topTerms.useQuery()

    let dateIndex = 0;

    useEffect(() => {
        setAllCount((bingCount ?? 0) + (googleCount ?? 0) + leadCount + orderCount);
    }, [bingCount, googleCount, leadCount, orderCount]);

    const showMonths = () => {
        return (
            <>
                {dates.map((date, index) => (
                    <label
                        key={index}
                        className={
                            index === activeDate
                                ? "styles.l_header_active"
                                : "styles.l_header_label"
                        }
                    >
                        {date}
                    </label>
                ))}
            </>
        );
    };

    useEffect(() => {
        if (cycle) {
            const interval = setInterval(() => {
                dateIndex++;

                if (dateIndex >= dates.length) dateIndex = 0;

                setActiveDate(dateIndex);
            }, 10000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [funnelData]);

/*
        //// Calendar /////
        const urlCalendar = `${Constants.API_URL_ORDER_ENTRIES}/date-count`;
        const resultCalendar = await axiosApiInstance.get(urlCalendar);
        if (resultCalendar.status === 200) {
            setCalendarData(resultCalendar.data);
        }

        ///// Swarm Plot /////
        const urlSwarm1 = `${Constants.API_URL_ORDER_ENTRIES}/price-count`;
        const resultSwarm1 = await axiosApiInstance.get(urlSwarm1);

        const urlSwarm2 = `${Constants.API_URL_ORDER_ENTRIES}/orderprice-count`;
        const resultSwarm2 = await axiosApiInstance.get(urlSwarm2);

        if (resultSwarm1.status === 200 && resultSwarm2.status === 200) {
            setSwarmData([...resultSwarm1.data, ...resultSwarm2.data]);
        }

    async function getFunnelData() {
        const urlBingImpr = `${Constants.API_URL_BING_ENTRIES}/impressions`;
        const resultBingImpr = await axiosApiInstance.get(urlBingImpr);
        const urlBingClicks = `${Constants.API_URL_BING_ENTRIES}/clicks`;
        const resultBingClicks = await axiosApiInstance.get(urlBingClicks);

        const urlGoogleImpr = `${Constants.API_URL_GOOGLE_ENTRIES}/impressions`;
        const resultGoogleImpr = await axiosApiInstance.get(urlGoogleImpr);
        const urlGoogleClicks = `${Constants.API_URL_GOOGLE_ENTRIES}/clicks`;
        const resultGoogleClicks = await axiosApiInstance.get(urlGoogleClicks);

        const urlOrders = `${Constants.API_URL_ORDER_ENTRIES}/month-count`;
        const resultOrders = await axiosApiInstance.get(urlOrders);

        if (
            resultBingClicks.status === 200 &&
            resultBingImpr.status === 200 &&
            resultGoogleClicks.status === 200 &&
            resultGoogleImpr.status === 200 &&
            resultOrders.status === 200
        ) {
            var newFunnel = [];
            var newDates = [];

            let bi = 0,
                bc = 0,
                gi = 0,
                gc = 0,
                o = 0;

            for (let i = 0; i < 6; i++) {
                if (
                    bi < resultBingImpr.data.length &&
                    bc < resultBingClicks.data.length &&
                    gi < resultGoogleImpr.data.length &&
                    gc < resultGoogleClicks.data.length &&
                    o < resultOrders.data.length
                ) {
                    if (
                        resultBingImpr.data[bi].month === resultBingClicks.data[bc].month
                    ) {
                        if (
                            resultGoogleImpr.data[gi].month ===
                            resultGoogleClicks.data[gc].month
                        ) {
                            if (
                                resultBingImpr.data[bi].month ===
                                resultGoogleImpr.data[gi].month
                            ) {
                                if (
                                    resultBingImpr.data[bi].month === resultOrders.data[o].month
                                ) {
                                    newDates.push(resultBingImpr.data[i].month);
                                    newFunnel.push([
                                        {
                                            id: "impressions",
                                            value:
                                                (resultBingImpr.data[bi].value +
                                                    resultGoogleImpr.data[gi].value) /
                                                10,
                                            label:
                                                resultBingImpr.data[bi].value +
                                                resultGoogleImpr.data[gi].value,
                                        },
                                        {
                                            id: "clicks",
                                            value:
                                                resultBingClicks.data[bc].value +
                                                resultGoogleClicks.data[gc].value,
                                            label:
                                                resultBingClicks.data[bc].value +
                                                resultGoogleClicks.data[gc].value,
                                        },
                                        {
                                            id: "orders",
                                            value: resultOrders.data[o].value * 5,
                                            label: resultOrders.data[i + 1].value,
                                        },
                                    ]);
                                    bi++;
                                    bc++;
                                    gi++;
                                    gc++;
                                    o++;
                                } else {
                                    if (
                                        resultBingImpr.data[bi].month < resultOrders.data[o].month
                                    ) {
                                        while (
                                            resultBingImpr.data[bi].month < resultOrders.data[o].month
                                        ) {
                                            o++;
                                            if (!(o < resultOrders.data.length)) {
                                                break;
                                            }
                                        }
                                    }
                                    if (
                                        resultBingImpr.data[bi].month > resultOrders.data[o].month
                                    ) {
                                        while (
                                            resultBingImpr.data[bi].month > resultOrders.data[o].month
                                        ) {
                                            bi++;
                                            bc++;
                                            gi++;
                                            gc++;
                                            if (
                                                !(bi < resultBingImpr.data.length) ||
                                                !(bc < resultBingClicks.data.length) ||
                                                !(gi < resultGoogleImpr.data.length) ||
                                                !(gc < resultGoogleClicks.data.length)
                                            ) {
                                                break;
                                            }
                                        }
                                    }
                                    i--;
                                }
                            } else {
                                if (
                                    resultBingImpr.data[bi].month <
                                    resultGoogleImpr.data[gi].month
                                ) {
                                    while (
                                        resultBingImpr.data[bi].month <
                                        resultGoogleImpr.data[gi].month
                                    ) {
                                        gi++;
                                        gc++;
                                        if (
                                            !(gi < resultGoogleImpr.data.length) ||
                                            !(gc < resultGoogleClicks.data.length)
                                        ) {
                                            break;
                                        }
                                    }
                                }
                                if (
                                    resultBingImpr.data[bi].month >
                                    resultGoogleImpr.data[gi].month
                                ) {
                                    while (
                                        resultBingImpr.data[bi].month >
                                        resultGoogleImpr.data[gi].month
                                    ) {
                                        bi++;
                                        bc++;
                                        if (
                                            !(bi < resultBingImpr.data.length) ||
                                            !(bc < resultBingClicks.data.length)
                                        ) {
                                            break;
                                        }
                                    }
                                }
                                i--;
                            }
                        } else {
                            if (
                                resultGoogleImpr.data[gi].month <
                                resultGoogleClicks.data[gc].month
                            ) {
                                while (
                                    resultGoogleImpr.data[gi].month <
                                    resultGoogleClicks.data[gc].month
                                ) {
                                    gc++;
                                    if (!(gc < resultGoogleClicks.data.length)) {
                                        break;
                                    }
                                }
                            }
                            if (
                                resultGoogleImpr.data[gi].month >
                                resultGoogleClicks.data[gc].month
                            ) {
                                while (
                                    resultGoogleImpr.data[gi].month >
                                    resultGoogleClicks.data[gc].month
                                ) {
                                    gi++;
                                    if (!(gi < resultGoogleImpr.data.length)) {
                                        break;
                                    }
                                }
                            }
                            i--;
                        }
                    } else {
                        if (
                            resultBingImpr.data[bi].month < resultBingClicks.data[bc].month
                        ) {
                            while (
                                resultBingImpr.data[bi].month < resultBingClicks.data[bc].month
                            ) {
                                bc++;
                                if (!(bc < resultBingClicks.data.length)) {
                                    break;
                                }
                            }
                        }
                        if (
                            resultBingImpr.data[bi].month > resultBingClicks.data[bc].month
                        ) {
                            while (
                                resultBingImpr.data[bi].month > resultBingClicks.data[bc].month
                            ) {
                                bi++;
                                if (!(bi < resultBingImpr.data.length)) {
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
    }*/

    return (
        <>
            <Head>
                <title>Create T3 App</title>
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
                                    {/*<FunnelChart data={funnelData[activeDate]} />*/}Funnel
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
                                    {/*<CalendarChart data={calendarData} />*/}Calendar
                                </div>
                                <div className={styles.rt_right_container}>
                                    {/*<SwarmPlot data={swarmData} />*/}SwarmPlot
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right_bottom_container}>
                        <div className={styles.right_bottom_container_bg}>
                            <div className={styles.rb_grid}>
                                <div className={styles.rb_line}></div>
                                <div className={styles.rb_top_left}>
                                    Top Searches Last Month
                                </div>
                                <div className={styles.rb_top_right}>Top Orders Last Month</div>
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
