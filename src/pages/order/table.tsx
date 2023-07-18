import Head from "next/head";
import React, { useState } from "react";
import Navbar from "~/components/navbar";
import Table from "~/components/table/table";
import { api } from "~/utils/api";

const OrderTable = () => {
  return (
    <>
      <Head>
        <title>CBH Predictor Tool</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="fixed max-h-full min-h-full min-w-full max-w-full overflow-hidden bg-gray-100">
        <div className="flex flex-col">
          <div className="fixed top-0 h-[10vh] w-full bg-[#000020] shadow-[0_3px_20px_rgb(2,4,2)] ">
            <div className="fixed w-full pt-4 text-center align-middle text-6xl text-white ">
              CBH Predictor Tool
            </div>
            <Navbar />
          </div>
          <Content />
        </div>
      </div>
    </>
  );
};

export default OrderTable;

const Content: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pagelength, setPagelength] = useState(50);

  const { data: entries } = api.order.getMany.useQuery({
    page: page,
    lines: pagelength,
  });

  const { data: count } = api.order.count.useQuery()
  
  return (
    <div className="max-h-[100vh] w-full overflow-y-scroll px-10 pb-6 pt-[12vh]">
      <Table entries={entries ?? []} type="Order" count={count ?? 0} pagelength={pagelength} page={page} setPagelength={setPagelength} setPage={setPage}/>
    </div>
  );
};
