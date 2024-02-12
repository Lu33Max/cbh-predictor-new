import React, {
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";

import { type Google, type Bing, type Lead, type Order } from "prisma/generated/zod";
import {
  BingSchema,
  GoogleSchema,
  LeadSchema,
  OrderSchema,
} from "prisma/generated/zod";

import Excel from 'exceljs';

import { getProperty } from "~/common/helpers";
import Header from "./header";

type TableProps = {
  entries: Bing[] | Google[] | Lead[] | Order[];
  type: "Bing" | "Google" | "Lead" | "Order";
  count: number;
  pagelength: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  setPagelength: Dispatch<SetStateAction<number>>;
};

const Table: React.FC<TableProps> = (props) => {
  const [range, setRange] = useState<number[]>([]);
  const [entries, setEntries] = useState<Bing[] | Google[] | Lead[] | Order[]>([]);
  
  const [input, setInput] = useState<File | undefined>(undefined);
  const [startRow, setStartRow] = useState(0)
  const [header, setHeader] = useState<string[]>([])
  const [rawSamples, setRawSamples] = useState<string[][]>([])

  useEffect(() => {
    setEntries(props.entries);
  }, [props.entries]);

  useEffect(() => {
    const newRange = [];
    if (props.count !== undefined && props.count !== null) {
      const num = Math.ceil(props.count / props.pagelength);
      for (let i = 1; i <= num; i++) {
        newRange.push(i);
      }
    }
    setRange(newRange);
  }, [props.count, props.pagelength]);

  function getSchema() {
    switch (props.type) {
      case "Bing":
        return BingSchema;
      case "Google":
        return GoogleSchema;
      case "Lead":
        return LeadSchema;
      case "Order":
        return OrderSchema;
    }
  }

  type SortDirection = "asc" | "desc";

  function sortByProperty(property: string, direction: SortDirection = "asc") {
    const temp = [...entries];

    temp.sort((a, b) => {
      const aValue = a[property as keyof (typeof entries)[0]];
      const bValue = b[property as keyof (typeof entries)[0]];

      if (direction === "asc") {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
      } else {
        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
      }

      return 0;
    });

    setEntries(temp as Bing[] | Google[] | Lead[] | Order[]);
  }

  function readFile() {
    if (input !== undefined) {
      if (input?.name.endsWith(".xlsx")) {
        const wb = new Excel.Workbook();
        const reader = new FileReader();
  
        reader.readAsArrayBuffer(input); // Read the file data as an ArrayBuffer
  
        reader.onload = () => {
          const buffer = reader.result; // Get the result (file data) from the FileReader
  
          if (buffer instanceof ArrayBuffer) {
            // Load the ArrayBuffer into the Excel Workbook
            wb.xlsx.load(buffer).then((workbook) => {
              let rowLength = 0;
              const tempSampleArray: string[][] = [];
  
              workbook.eachSheet((sheet) => {
                // Iterate over each sheet in the workbook
                sheet.eachRow((row, rowIndex) => {
                  // Iterate over each row in the sheet
  
                  if (rowIndex === startRow) {
                    // Check if it is the header row
                    const tempHeader: string[] = [];
  
                    row.eachCell((cell) => {
                      // Iterate over each cell in the row to extract the header values
                      tempHeader.push(cell.text);
                    });
  
                    rowLength = tempHeader.length;
                    setHeader(tempHeader); // Set the header state with the extracted values
                  }
  
                  if (rowIndex > startRow) {
                    // Skip the header row and process the sample data
                    const tempSample: string[] = [];
                    let index = 1;
  
                    row.eachCell((cell, i) => {
                      // Iterate over each cell in the row to extract the sample values
  
                      while (i > index) {
                        tempSample.push(""); // Add empty string for missing values
                        index++;
                      }
  
                      tempSample.push(cell.text);
                      index++;
                    });
  
                    while (tempSample.length < rowLength) {
                      tempSample.push("");
                    }
  
                    tempSampleArray.push(tempSample); // Add the sample data to the temporary array
                  }
                });
              });
  
              setRawSamples(tempSampleArray); // Set the rawSamples state with the extracted sample data
            })
            .catch((error) => {
              console.error(error);
            });
          }
        };
      } else if (input.name.endsWith(".csv")) {
        // Read and process CSV (.csv) file
        const reader = new FileReader(); // Create a new instance of the FileReader API
  
        reader.readAsText(input); // Read the file data as text
  
        reader.onload = () => {
          const csvData = reader.result as string; // Get the result (file data) from the FileReader
  
          if (csvData) {
            const rows = csvData.split("\n"); // Split the CSV data into rows
            const tempSampleArray = [];
  
            if (rows.length > 0) {
              // Assuming the header is in the first row
              const tempHeader = rows[0]?.split(";") || []; // Split the first row into header values
              setHeader(tempHeader); // Set the header state with the extracted values
  
              for (let i = 1; i < rows.length; i++) {
                // Iterate over the rows (excluding the header row)
                const rowData = rows[i]?.split(";") || []; // Split the row into sample values
                const tempSample = [];
  
                for (let j = 0; j < tempHeader.length; j++) {
                  tempSample.push(rowData[j] || ""); // Push the sample values into the temporary sample array
                }
  
                tempSampleArray.push(tempSample); // Add the sample array to the temporary array
              }
            }
  
            setRawSamples(tempSampleArray); // Set the rawSamples state with the extracted sample data
          }
        };
      } else {
        // Alert the user if the file type is not supported
        alert("Filetype not supported. Try uploading data in Excel or csv format.");
      }
    } else {
      // Alert the user if no file is selected
      alert("No File selected");
    }
  }

  return (
    <div className="w-full">
      <Header
        count={props.count}
        pagelength={props.pagelength}
        range={range}
        showPage={props.page}
        setPage={props.setPage}
        setPagelength={props.setPagelength}
      />
      <input type="file" accept=".xlsx,.csv" onChange={(e) => setInput(e.target.files !== null ? e.target.files[0] : undefined)} className=" m-0 block min-w-10 flex-auto rounded-xl border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.2rem] font-bold text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-600 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-[#617e5766] focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-gray-400 dark:file:bg-[#9DC88D66] dark:file:text-[#164A41] dark:focus:border-primary"/>
      <table className="max-h-[50vh] w-full border-separate border-spacing-y-1 overflow-y-auto text-lg">
        <thead>
          <tr className="bg-[#9DC88D] font-bold text-[#164A41]">
            {Object.getOwnPropertyNames(getSchema().shape).map((prop, i) => {
              let clickCount = 0;
              if (prop !== "id") {
                return (
                  <th
                    key={"th" + prop}
                    className={`border-r-2 border-dotted border-black px-3 py-2 font-bold ${
                      i === 1
                        ? "rounded-l-xl"
                        : i === Object.getOwnPropertyNames(getSchema().shape).length - 1
                        ? "rounded-r-xl border-none"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        clickCount === 0
                          ? (sortByProperty(prop, "asc"), (clickCount = 1))
                          : (sortByProperty(prop, "desc"), (clickCount = 0));
                      }}
                    >
                      {prop}
                    </button>
                  </th>
                );
              }
            })}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            return (
              <tr key={i} className="text-center">
                {Object.getOwnPropertyNames(entry).map((prop, j) => {
                  if (prop !== "id") {
                    return (
                      <td
                        key={100 + j}
                        className={`bg-[#E6E6E6] px-3 py-2 ${
                          j === 1
                            ? "rounded-l-xl"
                            : j === Object.getOwnPropertyNames(entry).length - 1
                            ? "rounded-r-xl border-none"
                            : ""
                        }`}
                      >
                        {(
                          getProperty(entry, prop as keyof typeof entry) ?? ""
                        ).toString()}
                      </td>
                    );
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <Header
        count={props.count}
        pagelength={props.pagelength}
        range={range}
        showPage={props.page}
        setPage={props.setPage}
        setPagelength={props.setPagelength}
      />
    </div>
  );
};

export default Table;
