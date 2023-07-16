import React, { useState, useEffect, useRef } from "react";

//import PopoverButton from "../../components/charts/popover";*/
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BiShow } from "react-icons/bi";

import styles from "./graphs.module.css";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

import { type Google } from "@prisma/client";
import {
  type IBumpDatum,
  type ILineDatum,
  type IPieDatum,
} from "~/common/types";

import { LineChart } from "~/components/charts/line";
import { AreaBump } from "~/components/charts/areabump";
import { PieChart } from "~/components/charts/pie";
import { BarChart } from "~/components/charts/bar";
import { type BarDatum } from "@nivo/bar";
import PopoverButton from "~/components/charts/popover";
import Navbar from "~/components/navbar";

const primaryScheme = [
  "#5fc431",
  "#71d055",
  "#83dc73",
  "#96e890",
  "#abf4ab",
  "#c0ffc6",
  "#a1e5ad",
  "#82cc96",
  "#62b37f",
  "#429a6a",
  "#188255",
  "#429a6a",
  "#62b37f",
  "#82cc96",
  "#a1e5ad",
  "#c0ffc6",
  "#abf4ab",
  "#96e890",
  "#83dc73",
  "#71d055",
];
//const secondaryScheme = ['#d15454','#e16c7c','#ec86a1','#f4a2c3','#f9bee1','#ffd9fa','#e6b2e3','#cc8bce','#b066bb','#9140a8','#711496']
//const contrastScheme = ['#12ec66 ','#00d68f ','#00bcb4 ','#00a0d0 ','#0083dc ','#0064d4 ','#0056c2 ','#0047bc ','#0042b7 ','#0035aa ','#0023a1 ','#001589']
const tempScheme = ["#5fc431", "#96e890", "#82cc96", "#62b37f", "#188255"];

//// MAPPING FUNCTIONS ////
function GetImpressions(
  entries: Google[],
  minImpr: number,
  showOthers: boolean,
  dates: string[],
  period: number
) {
  const [data, setData] = useState<IPieDatum[]>([]);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    setData([]);
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    entries.map((entry) => {
      if (interval === -1 || (currentDate && entry.Date >= currentDate)) {
        if (newData.find((e) => e.id === entry.Term)) {
          const index = newData.findIndex((e) => e.id === entry.Term);
          if (newData[index])
            (newData[index] as IPieDatum).value += entry.Impressions;
        } else {
          newData.push({
            id: entry.Term,
            label: entry.Term,
            value: entry.Impressions,
          });
        }
      }
    });

    for (let i = 0; i < newData.length; i++) {
      if (newData[i] && (newData[i] as IPieDatum).value < minImpr) {
        others += (newData[i] as IPieDatum).value;
        newData.splice(i, 1);
        i--;
      }
    }

    newData.sort((a, b) => b.value - a.value);

    if (showOthers) {
      newData.unshift({
        id: "others",
        label: "others",
        value: others,
      });
    }
    setData(newData);
  }, [entries, minImpr, showOthers, dates, interval]);

  return data;
}

function GetClicks(
  entries: Google[],
  minClicks: number,
  showOthers: boolean,
  dates: string[],
  period: number
) {
  const [data, setData] = useState<IPieDatum[]>([]);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    setData([]);
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    entries.map((entry) => {
      if (interval === -1 || (currentDate && entry.Date >= currentDate)) {
        if (newData.find((e) => e.id === entry.Term)) {
          const index = newData.findIndex((e) => e.id === entry.Term);
          if (newData[index])
            (newData[index] as IPieDatum).value += entry.Clicks;
        } else {
          newData.push({
            id: entry.Term,
            label: entry.Term,
            value: entry.Clicks,
          });
        }
      }
    });

    for (let i = 0; i < newData.length; i++) {
      if (newData[i] && (newData[i] as IPieDatum).value < minClicks) {
        others += (newData[i] as IPieDatum).value;
        newData.splice(i, 1);
        i--;
      }
    }

    newData.sort((a, b) => b.value - a.value);

    if (showOthers) {
      newData.unshift({
        id: "others",
        label: "others",
        value: others,
      });
    }
    setData(newData);
  }, [entries, minClicks, showOthers, dates, interval]);

  return data;
}

function GetClickThrough(entries: Google[], dates: string[], period: number) {
  const [clicks, setClicks] = useState(0);
  const [impressions, setImpressions] = useState(0);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    setClicks(0);
    setImpressions(0);

    entries.map(function (entry) {
      if (interval === -1 || entry.Date >= (dates[interval] as string)) {
        setClicks((clicks) => clicks + entry.Clicks);
        setImpressions((impressions) => impressions + entry.Impressions);
      }
    });
  }, [entries, dates, interval]);

  return Math.round((clicks / impressions + Number.EPSILON) * 1000) / 10;
}

function GetClicksAndImpressionsOverTime(
  dates: string[],
  period: number,
  allEntries: Google[]
) {
  const [data, setData] = useState<ILineDatum[]>([]);
  const [entries, setEntries] = useState(allEntries);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const currentDate = dates[interval];
    if (currentDate !== undefined) {
      setEntries(
        allEntries
          .filter((e) => e.Date.localeCompare(currentDate) >= 0)
          .sort((a, b) => (a.Date < b.Date ? 1 : -1))
      );
    }
  }, [dates, allEntries, interval]);

  useEffect(() => {
    const newData: ILineDatum[] = [
      {
        id: "impressions",
        data: [],
      },
      {
        id: "clicks",
        data: [],
      },
    ];

    if (entries.length > 0 && newData[0] && newData[1]) {
      let clicks = 0;
      let impressions = 0;
      let currentMonth = entries[0]?.Date ?? "";

      entries.map((entry, i) => {
        if (entry.Date === currentMonth) {
          clicks += entry.Clicks;
          impressions += entry.Impressions;
        } else {
          newData[0]?.data.push({
            x: currentMonth,
            y: impressions,
          });
          newData[1]?.data.push({
            x: currentMonth,
            y: clicks,
          });
          clicks = entry.Clicks;
          impressions = entry.Impressions;
          currentMonth = entry.Date;
        }

        // Pushes the last entry that else would not be detected, because the date doesn't change at the end of the array
        if (i === entries.length - 1) {
          newData[0]?.data.push({
            x: currentMonth,
            y: impressions,
          });
          newData[1]?.data.push({
            x: currentMonth,
            y: clicks,
          });
        }
      });

      newData[0].data.reverse();
      newData[1].data.reverse();
    }
    setData(newData);
  }, [entries, dates]);

  return data;
}

function GetClickThroughOverTime(
  dates: string[],
  period: number,
  allEntries: Google[]
) {
  const [data, setData] = useState<ILineDatum[]>([]);
  const [entries, setEntries] = useState(allEntries);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const currentDate = dates[interval];
    if (currentDate !== undefined) {
      setEntries(
        allEntries
          .filter((e) => e.Date.localeCompare(currentDate) >= 0)
          .sort((a, b) => (a.Date < b.Date ? 1 : -1))
      );
    }
  }, [dates, allEntries, interval]);

  useEffect(() => {
    const newData: ILineDatum[] = [{ id: "Click-Through", data: [] }];
    const clicksArr: number[] = [];
    const impressionsArr: number[] = [];

    if (entries.length > 0 && newData[0]) {
      let clicks = 0;
      let impressions = 0;
      let currentMonth = entries[0]?.Date ?? "";

      entries.map((entry, i) => {
        if (entry.Date === currentMonth) {
          clicks += entry.Clicks;
          impressions += entry.Impressions;
        } else {
          clicksArr.push(clicks);
          impressionsArr.push(impressions);
          clicks = entry.Clicks;
          impressions = entry.Impressions;
          currentMonth = entry.Date;
        }

        // Pushes the last entry that else would not be detected, because the date doesn't change at the end of the array
        if (i === entries.length - 1) {
          clicksArr.push(clicks);
          impressionsArr.push(impressions);
        }
      });

      for (let i = 0; i < clicksArr.length; i++) {
        newData[0].data.push({
          x: dates[i] ?? "None",
          y:
            Math.round(
              ((clicksArr[i] ?? 1) / (impressionsArr[i] ?? 1) +
                Number.EPSILON) *
                1000
            ) / 10,
        });
      }
      newData[0].data.reverse();
    }
    setData(newData);
  }, [entries, dates]);

  return data;
}

function GetCustomAreaBump(
  terms: string[],
  dates: string[],
  period: number,
  allEntries: Google[]
) {
  const [data, setData] = useState<ILineDatum[]>([]);
  const [entries, setEntries] = useState(allEntries);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const currentDate = dates[interval];
    if (currentDate !== undefined) {
      setEntries(
        allEntries
          .filter(
            (e) =>
              e.Date.localeCompare(currentDate) >= 0 &&
              terms.find((t) => t === e.Term) !== undefined
          )
          .sort((a, b) => (a.Date < b.Date ? 1 : -1))
      );
    }
  }, [dates, allEntries, interval, terms]);

  useEffect(() => {
    const newEntries: IBumpDatum[] = [];

    if (entries.length > 0) {
      terms.map((term) => {
        const newDatum: IBumpDatum = {
          id: term,
          data: [],
        };

        const filtered = entries.filter((e) => e.Term === term);

        for (let i = 0; i <= interval; i++) {
          const currentDate = dates[i];

          if (currentDate !== undefined) {
            const termAtDate = filtered.find((e) => e.Date === currentDate);

            if (termAtDate !== undefined) {
              newDatum.data.push({
                x: currentDate,
                y: termAtDate.Impressions,
              });
            } else {
              newDatum.data.push({
                x: currentDate,
                y: 0,
              });
            }
          }
        }

        newDatum.data.reverse();
        newEntries.push(newDatum);
      });
    }
    setData(newEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return data;
}

function GetCustomBar(
  terms: string[],
  dates: string[],
  period: number,
  allEntries: Google[]
): BarDatum[] {
  const [barData, setBarData] = useState<BarDatum[]>([]);
  const [entries, setEntries] = useState(allEntries);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const currentDate = dates[interval];
    if (currentDate !== undefined) {
      setEntries(
        allEntries
          .filter(
            (e) =>
              e.Date.localeCompare(currentDate) >= 0 &&
              terms.find((t) => t === e.Term) !== undefined
          )
          .sort((a, b) => (a.Date < b.Date ? 1 : -1))
      );
    }
  }, [dates, allEntries, interval, terms]);

  useEffect(() => {
    const newBarData: BarDatum[] = [];

    dates.map((currentDate, i) => {
      if (i <= interval) {
        const filtered = entries.filter((e) => e.Date === currentDate);
        newBarData.push({ date: currentDate });

        terms.map((term) => {
          const entry = filtered.find((e) => e.Term === term);

          if (entry !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (newBarData[i] as BarDatum)[term] = entry.Impressions;
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (newBarData[i] as BarDatum)[term] = 0;
          }
        });
      }
    });

    newBarData.reverse();
    setBarData(newBarData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return barData;
}

function GetCustomLine(
  terms: string[],
  dates: string[],
  period: number,
  allEntries: Google[]
) {
  const [lineData, setLineData] = useState<ILineDatum[]>([]);
  const [entries, setEntries] = useState(allEntries);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const currentDate = dates[interval];
    if (currentDate !== undefined) {
      setEntries(
        allEntries
          .filter(
            (e) =>
              e.Date.localeCompare(currentDate) >= 0 &&
              terms.find((t) => t === e.Term) !== undefined
          )
          .sort((a, b) => (a.Date < b.Date ? 1 : -1))
      );
    }
  }, [dates, allEntries, interval, terms]);

  useEffect(() => {
    const newEntries: ILineDatum[] = [];

    if (entries.length > 0) {
      terms.map((term, i) => {
        newEntries.push({ id: term, data: [] });

        dates.map((currentDate, j) => {
          if (j <= interval) {
            const entry = entries.find(
              (e) => e.Term === term && e.Date === currentDate
            );

            if (entry !== undefined)
              newEntries[i]?.data.push({
                x: currentDate,
                y: entry.Impressions,
              });
            else newEntries[i]?.data.push({ x: currentDate, y: 0 });
          }
        });

        newEntries[i]?.data.reverse();
      });
    }

    setLineData(newEntries);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return lineData;
}

//// RENDER VIEW ////
const GoogleChart = () => {
  const router = useRouter();

  const initialExport = [false, false, false, false, false, false, false];
  const [showExport, setShowExport] = useState(false);
  const [includeExport, setIncludeExport] = useState(initialExport);

  const [minImpr, setMinImpr] = useState(100);
  const [minClicks, setMinClicks] = useState(5);
  const [periods, setPeriods] = useState([0, 2, 2]);
  const [showOthers, setShowOthers] = useState(true);

  const { data: allEntries } = api.google.getAll.useQuery();
  const { data: dates } = api.google.dates.useQuery();

  const [terms, setTerms] = useState([
    "biobank",
    "biorepository",
    "ffpe tissue",
  ]);

  const headers = [
    "Impressions",
    "Clicks",
    "Impressions & Clicks",
    "Click-Through-Rate",
    "Ranking over Time",
    "Terms per Month",
    "Terms over Time",
  ];

  const printRef = useRef<(HTMLDivElement | null)[]>([]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "minImpr":
        setMinImpr(Number(e.target.value));
        return;
      case "minClicks":
        setMinClicks(Number(e.target.value));
        return;
      default:
        return;
    }
  };

  const onPeriodChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    index: number
  ) => {
    const newPeriods = periods.map((period) => {
      return period;
    });
    newPeriods[index] = parseInt(e.target.value);
    setPeriods(newPeriods);
  };

  const onIncludeChange = (index: number) => {
    const newIncludes = [...includeExport];
    newIncludes[index] = !newIncludes[index];
    setIncludeExport(newIncludes);
  };

  const handleDownloadPdf = async () => {
    const pdf = new jsPDF();
    let count = 0;
    let exportnum = 0;

    for (let i = 0; i < includeExport.length; i++) {
      if (includeExport[i]) exportnum++;
    }

    if (exportnum === 0) {
      alert("Nothing select for export");
      return;
    }

    for (let i = 0; i < includeExport.length; i++) {
      if (includeExport[i] === true) {
        count++;

        const element = printRef.current[i];
        if (element !== undefined && element !== null) {
          const canvas = await html2canvas(element, { scale: 3 });
          const data = canvas.toDataURL("image/png");

          if (i !== 4) {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const widthRatio = pageWidth / canvas.width;
            const heightRatio = pageHeight / canvas.height;
            const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

            const canvasWidth = canvas.width * ratio - 70 * ratio;
            const canvasHeight = canvas.height * ratio - 70 * ratio;

            const marginX = (pageWidth - canvasWidth) / 2;

            pdf.setFontSize(30);

            if (count % 2 === 1) {
              pdf.text(headers[i] ?? "Default", pageWidth / 2, 15, {
                align: "center",
              });
              pdf.addImage(data, "PNG", marginX, 17, canvasWidth, canvasHeight);
            } else {
              pdf.text(
                headers[i] ?? "Default",
                pageWidth / 2,
                pageHeight / 2 + 10,
                { align: "center" }
              );
              pdf.addImage(
                data,
                "PNG",
                marginX,
                pageHeight / 2 + 12,
                canvasWidth,
                canvasHeight
              );
            }

            if (count % 2 === 0 && count !== exportnum)
              pdf.addPage("a4", "portrait");
          } else {
            if (count % 2 === 1) {
              pdf.deletePage(pdf.internal.pages.length - 1);
              count++;
              exportnum++;
            }
            pdf.addPage("a4", "landscape");

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const widthRatio = pageWidth / canvas.width;
            const heightRatio = pageHeight / canvas.height;
            const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

            const canvasWidth = canvas.width * ratio - 70 * ratio;
            const canvasHeight = canvas.height * ratio - 70 * ratio;

            const marginX = (pageWidth - canvasWidth) / 2;
            const marginY = (pageHeight - canvasHeight) / 2;

            pdf.setFontSize(30);

            pdf.text(headers[i] ?? "Default", pageWidth / 2, 60, {
              align: "center",
            });
            pdf.addImage(
              data,
              "PNG",
              marginX,
              marginY,
              canvasWidth,
              canvasHeight
            );

            if (count !== exportnum) pdf.addPage("a4", "portrait");
          }
        }
      }
    }
    pdf.save("Searchterms_B.pdf");
    setIncludeExport(initialExport);
  };

  return (
    <main className="h-[100vh] w-[100vw] font-poppins ">
      <div className="overflow-y-auto overflow-x-hidden px-20 pt-[12vh]">
        <button
          onClick={() => void router.push("/")}
          className="fixed left-4 w-12 rounded-2xl bg-[#000040] py-1 text-white"
        >
          <b>&#60;</b>
        </button>
        <div className="fixed left-4 top-48">
          <button
            onClick={() => {
              setShowExport(false);
              void handleDownloadPdf();
            }}
            className="fixed -left-[0.55rem] h-[50px] w-[100px] -rotate-90 rounded-r-2xl bg-[#6bb238]"
          >
            Export
          </button>
          <button
            onClick={() => setShowExport(!showExport)}
            className="relative top-16 flex w-[50px] justify-center rounded-b-2xl bg-[#599231] py-2"
          >
            <BiShow />
          </button>
        </div>
        {/* First Block */}
        <div className={styles.grid_container_3_items_small_mid}>
          <div className="col-span-3 flex h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#89d056]">
            Period:
            <select onChange={(e) => onPeriodChange(e, 0)} className="mr-2">
              <option selected={true} value={0}>
                Last Month
              </option>
              <option value={2}>Last 3 Months</option>
              <option value={11}>Last Year</option>
              <option value={-1}>All Time</option>
            </select>
            Show Others
            <input
              type="checkbox"
              defaultChecked
              onChange={() => setShowOthers(!showOthers)}
            ></input>
          </div>
          <div className={styles.left_wrapper}>
            <h3 className="h3">
              Impressions
              {showExport ? (
                <input
                  type="checkbox"
                  checked={includeExport[0]}
                  onChange={() => onIncludeChange(0)}
                ></input>
              ) : (
                <></>
              )}
            </h3>
            <div
              style={{ width: "100%", height: "100%" }}
              ref={(ref) =>
                !printRef.current.includes(ref) && printRef.current.push(ref)
              }
            >
              <PieChart
                data={GetImpressions(
                  allEntries ?? [],
                  minImpr,
                  showOthers,
                  dates ?? [],
                  periods[0] ?? 0
                )}
                scheme={primaryScheme}
              />
            </div>
            <div className={styles.min}>
              Min. Impressions:{" "}
              <input
                className={styles.min_input}
                value={minImpr}
                name="minImpr"
                type="number"
                onChange={onInputChange}
              />{" "}
            </div>
          </div>
          <div className={styles.middle_wrapper}>
            <h3 className="h3">vs.</h3> <br />
            <br />
            <br />
            <br />
            <h4>Click-Through-Rate:</h4>
            {GetClickThrough(allEntries ?? [], dates ?? [], periods[0] ?? 0)} %
          </div>
          <div className={styles.right_wrapper}>
            <h3 className="h3">
              Clicks
              {showExport ? (
                <input
                  type="checkbox"
                  checked={includeExport[1]}
                  onChange={() => onIncludeChange(1)}
                ></input>
              ) : (
                <></>
              )}
            </h3>
            <div
              style={{ width: "100%", height: "100%" }}
              ref={(ref) =>
                !printRef.current.includes(ref) && printRef.current.push(ref)
              }
            >
              <PieChart
                data={GetClicks(
                  allEntries ?? [],
                  minClicks,
                  showOthers,
                  dates ?? [],
                  periods[0] ?? 0
                )}
                scheme={primaryScheme}
              />
            </div>
            <div className={styles.min}>
              Min. Clicks:{" "}
              <input
                className={styles.min_input}
                value={minClicks}
                name="minClicks"
                type="number"
                onChange={onInputChange}
              />{" "}
            </div>
          </div>
        </div>
        {/* Second Block */}
        <div className={styles.grid_container_2_items}>
          <div className="col-span-3 flex h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#89d056]">
            Period:
            <select onChange={(e) => onPeriodChange(e, 1)}>
              <option value={2} selected={true}>
                Last 3 Months
              </option>
              <option value={5}>Last 6 Months</option>
              <option value={11}>Last Year</option>
            </select>
          </div>
          <div className={styles.left_wrapper}>
            <h3 className="h3">
              Impressions & Clicks
              {showExport ? (
                <input
                  type="checkbox"
                  checked={includeExport[2]}
                  onChange={() => onIncludeChange(2)}
                ></input>
              ) : (
                <></>
              )}
            </h3>
            <div
              style={{ width: "100%", height: "100%" }}
              ref={(ref) =>
                !printRef.current.includes(ref) && printRef.current.push(ref)
              }
            >
              <LineChart
                data={GetClicksAndImpressionsOverTime(
                  dates ?? [],
                  periods[1] ?? 0,
                  allEntries ?? []
                )}
                scheme={[
                  primaryScheme[0] ?? "#000000",
                  primaryScheme[8] ?? "#000000",
                ]}
                axisBottom={"time"}
                axisLeft={""}
              />
            </div>
          </div>
          <div className={styles.middle_wrapper}>
            <h3 className="h3">
              Click-Through-Rate
              {showExport ? (
                <input
                  type="checkbox"
                  checked={includeExport[3]}
                  onChange={() => onIncludeChange(3)}
                ></input>
              ) : (
                <></>
              )}
            </h3>
            <div
              style={{ width: "100%", height: "100%" }}
              ref={(ref) =>
                !printRef.current.includes(ref) && printRef.current.push(ref)
              }
            >
              <LineChart
                data={GetClickThroughOverTime(
                  dates ?? [],
                  periods[1] ?? 0,
                  allEntries ?? []
                )}
                scheme={[primaryScheme[10] ?? "#000000"]}
                axisBottom={"time"}
                axisLeft={"%"}
              />
            </div>
          </div>
        </div>
        {/* Third Block */}
        <div className={styles.grid_container_2_items_4_rows}>
          <div className="col-span-3 flex h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#89d056]">
            Period:
            <select onChange={(e) => onPeriodChange(e, 2)}>
              <option value={2} selected={true}>
                Last 3 Month
              </option>
              <option value={5}>Last 6 Months</option>
              <option value={11}>Last Year</option>
            </select>
          </div>
          <div className={styles.wrapper_2_wide_top}>
            <h3 className="h3">
              Ranking over Time
              {showExport ? (
                <input
                  type="checkbox"
                  checked={includeExport[4]}
                  onChange={() => onIncludeChange(4)}
                ></input>
              ) : (
                <></>
              )}
            </h3>
            <div
              style={{ width: "100%", height: "100%" }}
              ref={(ref) =>
                !printRef.current.includes(ref) && printRef.current.push(ref)
              }
            >
              <AreaBump
                data={GetCustomAreaBump(
                  terms,
                  dates ?? [],
                  periods[2] ?? 0,
                  allEntries ?? []
                )}
                scheme={tempScheme}
              />
            </div>
          </div>
          <div className={styles.wrapper_2_wide_mid}>
            {terms.map((item, i) => (
              <label className={styles.terms} key={i}>
                {item}
                <button
                  onClick={() => {
                    removeFromTerms(item);
                  }}
                >
                  X
                </button>
              </label>
            ))}
            <PopoverButton terms={terms} addToTerms={addToTerms} />
          </div>
          <div className={styles.wrapper_left_bottom}>
            <h3 className="h3">
              Terms per Month
              {showExport ? (
                <input
                  type="checkbox"
                  checked={includeExport[5]}
                  onChange={() => onIncludeChange(5)}
                ></input>
              ) : (
                <></>
              )}
            </h3>
            <div
              style={{ width: "100%", height: "85%" }}
              ref={(ref) =>
                !printRef.current.includes(ref) && printRef.current.push(ref)
              }
            >
              <BarChart
                data={GetCustomBar(
                  terms,
                  dates ?? [],
                  periods[2] ?? 0,
                  allEntries ?? []
                )}
                scheme={tempScheme}
                keys={terms}
                index={"date"}
                xAxis={"dates"}
                yAxis={""}
              />
            </div>
          </div>
          <div className={styles.wrapper_right_bottom}>
            <h3 className="h3">
              Terms over Time
              {showExport ? (
                <input
                  type="checkbox"
                  checked={includeExport[6]}
                  onChange={() => onIncludeChange(6)}
                ></input>
              ) : (
                <></>
              )}
            </h3>
            <div
              style={{ width: "100%", height: "85%" }}
              ref={(ref) =>
                !printRef.current.includes(ref) && printRef.current.push(ref)
              }
            >
              <LineChart
                data={GetCustomLine(
                  terms,
                  dates ?? [],
                  periods[2] ?? 0,
                  allEntries ?? []
                )}
                scheme={tempScheme}
                axisBottom="month"
                axisLeft="impressions"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="fixed top-0 h-[10vh] w-full bg-[#000020] shadow-[0_3px_20px_rgb(2,4,2)] ">
        <div className="fixed w-full pt-4 text-center align-middle text-6xl text-white ">
          CBH Predictor Tool
        </div>
        <Navbar />
      </div>
    </main>
  );

  function addToTerms(term: string) {
    if (allEntries !== undefined) {
      if (!allEntries.find((e) => e.Term === term)) {
        alert("Term " + term + " does not exist");
        return;
      }
      setTerms([...terms, term]);
    }
  }

  function removeFromTerms(item: string) {
    setTerms(terms.filter((a) => a !== item));
  }
};

export default GoogleChart;
