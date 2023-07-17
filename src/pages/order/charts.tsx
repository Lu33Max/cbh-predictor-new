import React, { useState, useEffect, useRef } from "react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BiShow } from "react-icons/bi";

import styles from "./charts.module.css";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { type Order } from "@prisma/client";
import { type ILineDatum, type IPieDatum } from "~/common/types";
import { truncateTimeMonth } from "~/common/helpers";
import { PieChart } from "~/components/charts/pie";
import { LineChart } from "~/components/charts/line";
import { Navbar } from "react-bootstrap";
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
function GetMatrices(allEntries: Order[], minMatrix: number, maxMatrix: number, showOthers: boolean, dates: string[], period: number) {
  const [data, setData] = useState<IPieDatum[]>([]);
  let interval = period;

  console.log(period)

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    allEntries.map((entry) => {
      if ((interval === -1 || (currentDate && truncateTimeMonth(entry.Order_Date.toISOString()) >= currentDate)) && entry.Matrix) {
        if (newData.find((e) => e.id === entry.Matrix)) {
          const index = newData.findIndex((e) => e.id === entry.Matrix);
          if (newData[index])
            (newData[index] as IPieDatum).value++;
        } else {
          newData.push({
            id: entry.Matrix,
            label: entry.Matrix,
            value: 1,
          });
        }
      }
    });

    for (let i = 0; i < newData.length; i++) {
      if (newData[i] && ((newData[i] as IPieDatum).value < minMatrix || (newData[i] as IPieDatum).value > maxMatrix)) {
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
  }, [allEntries, minMatrix, maxMatrix, showOthers, dates, interval]);

  return data;
}

function GetDiagnosis(allEntries: Order[], minDiagnoses: number, maxDiagnoses: number, showOthers: boolean, dates: string[], period: number) {
  const [data, setData] = useState<IPieDatum[]>([]);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    allEntries.map((entry) => {
      if ((interval === -1 || (currentDate && truncateTimeMonth(entry.Order_Date.toISOString()) >= currentDate)) && entry.Diagnosis) {
        if (newData.find((e) => e.id === entry.Diagnosis)) {
          const index = newData.findIndex((e) => e.id === entry.Diagnosis);
          if (newData[index])
            (newData[index] as IPieDatum).value++;
        } else {
          newData.push({
            id: entry.Diagnosis,
            label: entry.Diagnosis,
            value: 1,
          });
        }
      }
    });

    for (let i = 0; i < newData.length; i++) {
      if (newData[i] && ((newData[i] as IPieDatum).value < minDiagnoses || (newData[i] as IPieDatum).value > maxDiagnoses)) {
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
  }, [allEntries, minDiagnoses, maxDiagnoses, showOthers, dates, interval]);

  return data;
}

function GetSampleSizes(allEntries: Order[], minSampleSize: number, showOthers: boolean, dates: string[], period: number) {
  const [data, setData] = useState<IPieDatum[]>([]);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    allEntries.map((entry) => {
      if ((interval === -1 || (currentDate && truncateTimeMonth(entry.Order_Date.toISOString()) >= currentDate)) && entry.Quantity) {
        console.log("inside")
        if (newData.find((e) => e.id === entry.Quantity?.toString())) {
          const index = newData.findIndex((e) => e.id === entry.Quantity?.toString());
          if (newData[index])
            (newData[index] as IPieDatum).value++;
        } else {
          newData.push({
            id: entry.Quantity.toString(),
            label: entry.Quantity.toString(),
            value: 1,
          });
        }
      }
    });

    for (let i = 0; i < newData.length; i++) {
      if (newData[i] && (newData[i] as IPieDatum).value < minSampleSize) {
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
  }, [allEntries, minSampleSize, showOthers, dates, interval]);

  return data;
}

function GetLabParameter(allEntries: Order[], minParams: number, maxParams: number, showOthers: boolean, dates: string[], period: number) {
  const [data, setData] = useState<IPieDatum[]>([]);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    allEntries.map((entry) => {
      if ((interval === -1 || (currentDate && truncateTimeMonth(entry.Order_Date.toISOString()) >= currentDate)) && entry.Lab_Parameter) {
        if (newData.find((e) => e.id === entry.Lab_Parameter)) {
          const index = newData.findIndex((e) => e.id === entry.Lab_Parameter);
          if (newData[index])
            (newData[index] as IPieDatum).value++;
        } else {
          newData.push({
            id: entry.Lab_Parameter,
            label: entry.Lab_Parameter,
            value: 1,
          });
        }
      }
    });

    for (let i = 0; i < newData.length; i++) {
      if (newData[i] && ((newData[i] as IPieDatum).value < minParams || (newData[i] as IPieDatum).value > maxParams)) {
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
  }, [allEntries, minParams, maxParams, showOthers, dates, interval]);

  return data;
}

function GetLabResult(allEntries: Order[], showOthers: boolean, dates: string[], period: number) {
  const [data, setData] = useState<IPieDatum[]>([]);
  let interval = period;

  if (interval >= dates.length) {
    interval = dates.length - 1;
  }

  useEffect(() => {
    const newData: IPieDatum[] = [];
    let others = 0;
    const currentDate = dates[interval];

    allEntries.map((entry) => {
      if ((interval === -1 || (currentDate && truncateTimeMonth(entry.Order_Date.toISOString()) >= currentDate)) && entry.Result_Interpretation) {
        if (newData.find((e) => e.id === entry.Result_Interpretation)) {
          const index = newData.findIndex((e) => e.id === entry.Result_Interpretation);
          if (newData[index])
            (newData[index] as IPieDatum).value++;
        } else {
          newData.push({
            id: entry.Result_Interpretation,
            label: entry.Result_Interpretation,
            value: 1,
          });
        }
      }
    });

    const values = newData.reduce((prev, curr) => 
      prev + curr.value
    , others)

    for (let i = 0; i < newData.length; i++) {
      if (newData[i] && ((newData[i] as IPieDatum).id !== "positive" && (newData[i] as IPieDatum).id !== "negative")) {
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

    const percentual: IPieDatum[] = newData.map((e) => {
      return (
        { id: e.id, label: e.label, value: Math.round(e.value / values * 100) }
      )
    })

    setData(percentual);
  }, [allEntries, showOthers, dates, interval]);

  return data;
}

function GetOrders(allEntries: Order[], dates: string[], period: number) {
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
          .filter((e) => truncateTimeMonth(e.Order_Date.toISOString()).localeCompare(currentDate) >= 0)
          .sort((a, b) => (a.Order_Date < b.Order_Date ? 1 : -1))
      );
    }
  }, [dates, allEntries, interval]);

  useEffect(() => {
    const newData: ILineDatum[] = [{ id: "Click-Through", data: [] }];
    const countArr: number[] = [];

    if (entries.length > 0 && newData[0]) {
      let count = 0;
      let currentMonth = truncateTimeMonth(entries[0]?.Order_Date.toISOString() ?? "");

      entries.map((entry, i) => {
        if (truncateTimeMonth(entry.Order_Date.toISOString()) === currentMonth) {
          count++
        } else {
          countArr.push(count);
          count = 1
          currentMonth = truncateTimeMonth(entry.Order_Date.toISOString());
        }

        // Pushes the last entry that else would not be detected, because the date doesn't change at the end of the array
        if (i === entries.length - 1) {
          countArr.push(count);
        }
      });

      for (let i = 0; i < countArr.length; i++) {
        newData[0].data.push({
          x: dates[i] ?? "None",
          y: countArr[i] ?? 0
        });
      }
      newData[0].data.reverse();
    }
    setData(newData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

    return data
}

/*function CustomBar () {
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])

    useEffect(() => {
        test(setEntries)
    }, [])

    useEffect(() => {
        let newData = []
        
        for(let k = 0; k < entries.length; k++){
            let newDataEntry = {}

            newDataEntry.date = entries[k][0].Item2

            for(let i = 1; i < entries[k].length; i++){
                newDataEntry[entries[k][i].Item1] = entries[k][i].Item2 
            }

            newData.push(newDataEntry)       
        }
        setData(newData)
    }, [entries])

    return data
}

function CustomAreaBump() {
    const [data, setData] = useState([])
    const [entries, setEntries] = useState([])

    useEffect(() => {
        const url = `${Constants.API_URL_ORDER_ENTRIES}/bump`
        getLineData(url, "matrix", ["serum", "K3EDTA plasma", "Li-heparin plasma"], "2022-09-01", "m", 3, setEntries)
    }, [])

    useEffect(() => {
        if(entries.length > 1){
            const newData = [{
                id: "serum",
                color: "hsl(48, 70%, 50%)",
                data: entries[0]
            },{
                id: "K3DTA",
                color: "hsl(48, 70%, 50%)",
                data: entries[1]
            },{
                id: "Li",
                color: "hsl(48, 70%, 50%)",
                data: entries[2]
            }]
            setData(newData)
        }
    }, [entries])

    return data
}
*/

//// RENDER VIEW ////
const OrderChart = () => {
  const router = useRouter();

  const initialExport = [false, false, false, false, false, false];
  const [includeExport, setIncludeExport] = useState(initialExport);
  const [showExport, setShowExport] = useState(false);

  const [min, setMin] = useState([150, 150, 150, 150]);
  const [max, setMax] = useState([7000, 1000, 800]);
  const [showOthers1, setShowOthers1] = useState(true);
  const [showOthers2, setShowOthers2] = useState(true);
  const [periods, setPeriods] = useState([0, 0, 2]);

  const { data: allEntries } = api.order.getAll.useQuery();
  const { data: dates } = api.order.dates.useQuery();

  const headers = [
    "Frequent Matrices",
    "Frequent Diagnoses",
    "Frequent Sample Sizes (ml)",
    "Lab Parameters",
    "Lab Results (%)",
    "Orders over Time",
  ];

  const printRef = useRef<(HTMLDivElement | null)[]>([]);

  const minChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = [...min];
    newMin[Number(e.target.name)] = Number(e.target.value);
    setMin(newMin);
  };

  const maxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = [...max];
    newMax[Number(e.target.name)] = Number(e.target.value);
    setMax(newMax);
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

          if (i !== 5) {
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const widthRatio = pageWidth / canvas.width;
            const heightRatio = pageHeight / canvas.height;
            const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

            let canvasHeight, canvasWidth;

            if (i <= 2) {
              canvasWidth = canvas.width * ratio - 350 * ratio;
              canvasHeight = canvas.height * ratio - 350 * ratio;
            } else {
              canvasWidth = canvas.width * ratio + 200 * ratio;
              canvasHeight = canvas.height * ratio + 200 * ratio;
            }

            const marginX = (pageWidth - canvasWidth) / 2;

            pdf.setFontSize(30);

            if (count % 2 === 1) {
              pdf.text(headers[i] ?? "", pageWidth / 2, 15, {
                align: "center",
              });
              pdf.addImage(data, "PNG", marginX, 17, canvasWidth, canvasHeight);
            } else {
              pdf.text(headers[i] ?? "", pageWidth / 2, pageHeight / 2 + 10, {
                align: "center",
              });
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

            pdf.text(headers[i] ?? "", pageWidth / 2, 60, { align: "center" });
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
    pdf.save("Orders.pdf");
    setIncludeExport(initialExport);
  };

  return (
    <>
      <Head>
          <title>CBH Predictor Tool</title>
          <meta name="description" content="Generated by create-t3-app" />
          <link rel="icon" href="/favicon.ico" />
      </Head>
    
      <main className="h-[100vh] w-[100vw] font-poppins overflow-x-hidden">
        <div className="overflow-y-auto px-20 pt-[12vh] pb-6">
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
          <div className={styles.grid_container_3_items}>
            <div className="col-span-3 flex h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#89d056]">
              Period:
              <select onChange={(e) => onPeriodChange(e, 0)}>
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
                onChange={() => setShowOthers1(!showOthers1)}
              ></input>
              {/*TODO: Add Checkbox to switch between absolute and relative count*/}
            </div>
            <div className={styles.left_wrapper}>
              <h3>
                Frequent Matrices
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
                <PieChart data={GetMatrices(allEntries ?? [], min[0] ?? 0, max[0] ?? 0, showOthers1, dates ?? [], periods[0] ?? 0)} scheme={primaryScheme}/>
              </div>
              <div className={styles.min}>
                Min:{" "}
                <input
                  className={styles.min_input}
                  value={min[0]}
                  name="0"
                  type="number"
                  onChange={minChange}
                />{" "}
                Max:{" "}
                <input
                  className={styles.min_input}
                  value={max[0]}
                  name="0"
                  type="number"
                  onChange={maxChange}
                />
              </div>
            </div>
            <div className={styles.middle_wrapper}>
              <h3>
                Frequent Diagnoses
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
                <PieChart data={GetDiagnosis(allEntries ?? [], min[1] ?? 0, max[1] ?? 0, showOthers1, dates ?? [], periods[0] ?? 0)} scheme={primaryScheme}/>
              </div>
              <div className={styles.min}>
                Min:{" "}
                <input
                  className={styles.min_input}
                  value={min[1]}
                  name="1"
                  type="number"
                  onChange={minChange}
                />{" "}
                Max:{" "}
                <input
                  className={styles.min_input}
                  value={max[1]}
                  name="1"
                  type="number"
                  onChange={maxChange}
                />
              </div>
            </div>
            <div className={styles.right_wrapper}>
              <h3>
                Frequ. Sample Sizes (in ml)
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
                <PieChart data={GetSampleSizes(allEntries ?? [], min[2] ?? 0, showOthers1, dates ?? [], periods[0] ?? 0)} scheme={primaryScheme}/>
              </div>
              <div className={styles.min}>
                Min:{" "}
                <input
                  className={styles.min_input}
                  value={min[2]}
                  name="2"
                  type="number"
                  onChange={minChange}
                />{" "}
              </div>
            </div>
          </div>
          {/* Second Block */}
          <div className={styles.grid_container_2_items}>
            <div className="col-span-3 flex h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#89d056]">
              Period:
              <select onChange={(e) => onPeriodChange(e, 1)}>
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
                onChange={() => setShowOthers2(!showOthers2)}
              ></input>
              {/*TODO: Add Checkbox to switch between absolute and relative count*/}
            </div>
            <div className={styles.left_wrapper}>
              <h3>
                Lab Parameters
                {showExport ? (
                  <input
                    type="checkbox"
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
                <PieChart data={GetLabParameter(allEntries ?? [], min[3] ?? 0, max[2] ?? 0, showOthers2, dates ?? [], periods[1] ?? 0)} scheme={secondaryScheme}/>
              </div>
              <div className={styles.min}>
                Min:{" "}
                <input
                  className={styles.min_input}
                  value={min[3]}
                  name="3"
                  type="number"
                  onChange={minChange}
                />{" "}
                Max:{" "}
                <input
                  className={styles.min_input}
                  value={max[2]}
                  name="2"
                  type="number"
                  onChange={maxChange}
                />
              </div>
            </div>
            <div className={styles.middle_wrapper}>
              <h3>
                Lab Results (in %)
                {showExport ? (
                  <input
                    type="checkbox"
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
                <PieChart data={GetLabResult(allEntries ?? [], showOthers2, dates ?? [], periods[1] ?? 0)} scheme={secondaryScheme}/>
              </div>
            </div>
          </div>
          {/* Third Block */}
          <div className="flex flex-col justify-start items-center text-center bg-[#e9e9e9] rounded-3xl">
            <div className="w-full flex h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#89d056]">
              Period:
              <select onChange={(e) => onPeriodChange(e, 2)}>
                <option selected={true} value={2}>
                  Last 3 Months
                </option>
                <option value={5}>Last 6 Months</option>
                <option value={11}>Last Year</option>
              </select>
            </div>
            <div>
              <br />
              <h3>
                Orders Over Time
                {showExport ? (
                  <input
                    type="checkbox"
                    onChange={() => onIncludeChange(5)}
                  ></input>
                ) : (
                  <></>
                )}
              </h3>
              <div
                className="w-[85vw] h-[50vh]"
                ref={(ref) =>
                  !printRef.current.includes(ref) && printRef.current.push(ref)
                }
              >
                <LineChart data={GetOrders(allEntries ?? [], dates ?? [], periods[2] ?? 0)} scheme={primaryScheme} axisBottom="Month" axisLeft="No. of Orders"/>
              </div>
            </div>
          </div>
          {/* Testblock */}
          {/*<div className={styles.grid_container_2_items}>
            <div className={styles.settings}></div>
            <div className={styles.left_wrapper}>
              <div
                style={{ width: "100%", height: "100%" }}
                ref={(ref) =>
                  !printRef.current.includes(ref) && printRef.current.push(ref)
                }
              >
                <BarChart data={CustomBar()} scheme={primaryScheme} keys={["serum","K3EDTA plasma"]} index={"date"} xAxis={"dates"} yAxis={""}/>
              </div>
            </div>
            <div className={styles.middle_wrapper}>
              <BumpChart data={CustomAreaBump()} scheme={primaryScheme} axisBottom={"time"} axisLeft={""}/>
            </div>
          </div>*/}
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

export default OrderChart;
