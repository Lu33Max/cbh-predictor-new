import React, { useState, useEffect, type Dispatch, type SetStateAction } from 'react'

import { type Google, type Bing, type Lead, type Order } from '@prisma/client'
import { BingSchema, GoogleSchema, LeadSchema, OrderSchema } from 'prisma/generated/zod'
import { getProperty } from '~/common/helpers'
import Header from './header'

type TableProps = {
  entries: Bing[] | Google[] | Lead[] | Order[],
  type: "Bing" | "Google" | "Lead" | "Order",
  count: number,
  pagelength: number,
  page: number
  setPage: Dispatch<SetStateAction<number>>
  setPagelength: Dispatch<SetStateAction<number>>
}

const Table: React.FC<TableProps> = (props) => {
  const [range, setRange] = useState<number[]>([])

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
    switch(props.type){
      case "Bing":
        return BingSchema
      case "Google":
        return GoogleSchema
      case "Lead":
        return LeadSchema
      case "Order":
        return OrderSchema
    }
  }

  return (
    <div className='w-full'>
      <Header count={props.count} pagelength={props.pagelength} range={range} showPage={props.page} setPage={props.setPage} setPagelength={props.setPagelength}/>
      <table className="w-full text-lg border-separate border-spacing-y-1 max-h-[50vh] overflow-y-auto">
        <thead>
          <tr className="bg-[#9DC88D] text-[#164A41] font-bold">
            {Object.getOwnPropertyNames(getSchema().shape).map((prop, i) => {
              if(prop !== "id"){
                return (
                  <th key={"th" + prop} className={`py-2 px-3 font-bold border-dotted border-black border-r-2 ${i === 1 ? "rounded-l-xl" : i === Object.getOwnPropertyNames(getSchema().shape).length -1 ? "rounded-r-xl border-none" : ""}`}>{prop}</th>
                )
              }
            })}
          </tr>
        </thead>
        <tbody>
            {props.entries.map((entry, i) => {
              return(
                <tr key={i} className="text-center">
                  {Object.getOwnPropertyNames(entry).map((prop, j) => {
                    if(prop !== "id"){
                      return(
                        <td key={100 + j} className={`py-2 px-3 bg-[#E6E6E6] ${j === 1 ? "rounded-l-xl" : j === Object.getOwnPropertyNames(entry).length -1 ? "rounded-r-xl border-none" : ""}`}>{(getProperty(entry, prop as keyof typeof entry) ?? "").toString()}</td>
                      )
                    }
                  })}
                </tr>
              )
            })}
        </tbody>
      </table>
      <Header count={props.count} pagelength={props.pagelength} range={range} showPage={props.page} setPage={props.setPage} setPagelength={props.setPagelength}/>
    </div>
  )
}

export default Table