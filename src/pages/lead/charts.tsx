import React, { useState, useEffect, useRef } from "react";

import { PieChart } from "~/components/charts/pie";
import { LineChart } from "~/components/charts/line";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BiShow } from "react-icons/bi";

import styles from "./graphs.module.css";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { truncateTimeMonth } from "~/common/helpers";
import { type Lead } from "@prisma/client";
import { type ILineDatum, type IPieDatum } from "~/common/types";
import Navbar from "~/components/navbar";
import Head from "next/head";

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
const secondaryScheme = [
  "#d15454",
  "#e16c7c",
  "#ec86a1",
  "#f4a2c3",
  "#f9bee1",
  "#ffd9fa",
  "#e6b2e3",
  "#cc8bce",
  "#b066bb",
  "#9140a8",
  "#711496",
];

//// MAPPING FUNCTIONS ////
function GetMedicalField(
  entries: Lead[],
  minField: number,
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
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    entries.map((entry) => {
      if (
        entry.Field_of_Interest !== null &&
        (interval === -1 ||
          (currentDate &&
            truncateTimeMonth(entry.Lead_Date.toISOString()) >= currentDate))
      ) {
        if (newData.find((e) => e.id === entry.Field_of_Interest)) {
          const index = newData.findIndex(
            (e) => e.id === entry.Field_of_Interest
          );
          if (newData[index]) (newData[index] as IPieDatum).value++;
        } else {
          newData.push({
            id: entry.Field_of_Interest,
            label: entry.Field_of_Interest,
            value: 1,
          });
        }
      }
    });

    for (let i = 0; i < newData.length; i++) {
      if (newData[i] && (newData[i] as IPieDatum).value < minField) {
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
  }, [entries, minField, showOthers, dates, interval]);

  return data;
}

function GetLeadStatus(
  entries: Lead[],
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
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    entries.map((entry) => {
      if (
        entry.Lead_Status !== null &&
        (interval === -1 ||
          (currentDate &&
            truncateTimeMonth(entry.Lead_Date.toISOString()) >= currentDate))
      ) {
        if (newData.find((e) => e.id === entry.Lead_Status)) {
          const index = newData.findIndex((e) => e.id === entry.Lead_Status);
          if (newData[index]) (newData[index] as IPieDatum).value++;
        } else {
          newData.push({
            id: entry.Lead_Status,
            label: entry.Lead_Status,
            value: 1,
          });
        }
      }
    });

    const values = newData.reduce((prev, curr) => prev + curr.value, others);

    newData.map((entry, i) => {
      if (entry.id.toLowerCase() === "other") {
        others += entry.value;
        newData.splice(i, 1);
      }
    });

    newData.sort((a, b) => b.value - a.value);

    if (showOthers) {
      newData.unshift({
        id: "others",
        label: "others",
        value: others,
      });
    }

    const percentual: IPieDatum[] = newData.map((e) => {
      return {
        id: e.id,
        label: e.label,
        value: Math.round((e.value / values) * 100),
      };
    });

    setData(percentual);
  }, [entries, showOthers, dates, interval]);

  return data;
}

function GetLeadsOverTime(allEntries: Lead[], dates: string[], period: number) {
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
              truncateTimeMonth(e.Lead_Date.toISOString()).localeCompare(
                currentDate
              ) >= 0
          )
          .sort((a, b) => (a.Lead_Date < b.Lead_Date ? 1 : -1))
      );
    }
  }, [dates, allEntries, interval]);

  useEffect(() => {
    const newData: ILineDatum[] = [{ id: "Click-Through", data: [] }];
    const countArr: number[] = [];

    if (entries.length > 0 && newData[0]) {
      let count = 0;
      let currentMonth = truncateTimeMonth(
        entries[0]?.Lead_Date.toISOString() ?? ""
      );

      entries.map((entry, i) => {
        if (truncateTimeMonth(entry.Lead_Date.toISOString()) === currentMonth) {
          count++;
        } else {
          countArr.push(count);
          count = 1;
          currentMonth = truncateTimeMonth(entry.Lead_Date.toISOString());
        }

        // Pushes the last entry that else would not be detected, because the date doesn't change at the end of the array
        if (i === entries.length - 1) {
          countArr.push(count);
        }
      });

      for (let i = 0; i < countArr.length; i++) {
        newData[0].data.push({
          x: dates[i] ?? "None",
          y: countArr[i] ?? 0,
        });
      }
      newData[0].data.reverse();
    }
    setData(newData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return data;
}

//// RENDER VIEW ////
const LeadChart = () => {
  const router = useRouter();

  const initialExport = [false, false, false];
  const [includeExport, setIncludeExport] = useState(initialExport);
  const [showExport, setShowExport] = useState(false);

  const [minField, setMinField] = useState(10);
  const [showOtherFields, setShowOtherFields] = useState(false);
  const [showOthers, setShowOthers] = useState(true);
  const [periods, setPeriods] = useState([2]);

  const { data: allEntries } = api.lead.getAll.useQuery();
  const { data: dates } = api.lead.dates.useQuery();

  const headers = [
    "Customer Fields",
    "Lead Status (%)",
    "Lead Requests over time",
  ];

  const printRef = useRef<(HTMLDivElement | null)[]>([]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.name) {
      case "minField":
        setMinField(Number(e.target.value));
        return;
      case "showOtherFields":
        setShowOtherFields(!showOtherFields);
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

          if (i !== 2) {
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
    <>
      <Head>
        <title>CBH Predictor Tool</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-[100vh] w-[100vw] font-poppins">
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
          <div className={styles.grid_container_2_items_3_rows}>
            <div className="col-span-3 flex h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#89d056]">
              Period:
              <select onChange={(e) => onPeriodChange(e, 0)}>
                <option value={2} selected={true}>
                  Last 3 Months
                </option>
                <option value={5}>Last 6 Months</option>
                <option value={11}>Last Year</option>
              </select>
              Show Others
              <input
                type="checkbox"
                defaultChecked
                onChange={() => setShowOthers(!showOthers)}
              ></input>
            </div>
            <div className={styles.left_wrapper}>
              <h3>
                Customer Fields
                {showExport ? (
                  <input
                    type="checkbox"
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
                  data={GetMedicalField(
                    allEntries ?? [],
                    minField,
                    showOthers,
                    dates ?? [],
                    periods[0] ?? 0
                  )}
                  scheme={primaryScheme}
                />
              </div>
              <div className={styles.min}>
                Min. Occurrences:{" "}
                <input
                  className={styles.min_input}
                  value={minField}
                  name="minField"
                  type="number"
                  onChange={onInputChange}
                />
              </div>
            </div>
            <div className={styles.middle_wrapper}>
              <h3>
                Lead Status in %
                {showExport ? (
                  <input
                    type="checkbox"
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
                  data={GetLeadStatus(
                    allEntries ?? [],
                    showOthers,
                    dates ?? [],
                    periods[0] ?? 0
                  )}
                  scheme={secondaryScheme}
                />
              </div>
            </div>
            <div className={styles.center_wrapper}>
              <h3>
                Lead Requests Over Time
                {showExport ? (
                  <input
                    type="checkbox"
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
                  data={GetLeadsOverTime(
                    allEntries ?? [],
                    dates ?? [],
                    periods[0] ?? 0
                  )}
                  scheme={primaryScheme}
                  axisBottom="Months"
                  axisLeft="No. of leads"
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
    </>
  );
};

export default LeadChart;
