import React, { type Dispatch, type SetStateAction } from "react";

const Header: React.FC<{
  count: number | undefined;
  pagelength: number;
  range: number[];
  showPage: number;
  setPage: Dispatch<SetStateAction<number>>;
  setPagelength: Dispatch<SetStateAction<number>>;
  children?: React.ReactNode | React.ReactNode[]
}> = ({
  count,
  pagelength,
  range,
  showPage,
  setPage,
  setPagelength,
  children,
}) => {

  return (
    <div className="px-16 mb-6">
        <div className="mb-2 mt-3 flex w-full flex-row items-center">
          {/*display of found results*/}
          <Count count={count} />

          <div className="mx-auto">
            {/*selection of page*/}
            <Pages range={range} page={showPage} setPage={setPage} />
          </div>

          {/*selection of how many entries should be displayed per page*/}
          <ShowRows
            pagelength={pagelength}
            setPagelength={setPagelength}
            setPage={setPage}
          />
          {children}
        </div>
    </div>
  );
};

export default Header;

const Count: React.FC<{ count: number | undefined }> = ({ count }) => {
  return (
    <div
      className={`w-fit rounded-2xl border-2 px-3 py-1 text-lg border-green-300 bg-white text-green-900`}
    >
      Search Results:{" "}
      {count ?? "0"}
    </div>
  );
};

const Pages: React.FC<{
  range: number[];
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}> = ({ range, page, setPage }) => {

  return (
    <div className="flex flex-row items-center">
      {/*selection of page*/}
      {range.map((el, index) => (
        <>
          {el === 1 && (
            <>
              <button
                key={index}
                className={`mx-1 justify-center rounded-xl border-2 border-solid px-3 py-1 border-green-900 text-lg text-green-900 ${
                  page === index + 1
                    ? `bg-orange-300`
                    : `bg-green-200`
                }`}
                onClick={() => setPage(el)}
              >
                {el}
              </button>
              {(page - 3 > 1) && (
                  <label key={1000} className="whitespace-nowrap">
                    &nbsp;. . .&nbsp;
                  </label>
                )}
            </>
          )}
          {(el >= page - 2 && el <= page + 2 && el !== 1 && el !== range.length) && (
              <button
                key={1000 + index}
                className={`mx-1 justify-center rounded-xl border-2 border-solid px-3 py-1 border-green-900 text-lg text-green-900 ${
                  page === index + 1
                    ? `bg-orange-300`
                    : `bg-green-200`
                }`}
                onClick={() => setPage(el)}
              >
                {el}
              </button>
            )}
          {el === range.length && range.length !== 1 && (
            <>
              {(page + 3 < range.length) && (
                  <label key={range.length + 1} className="whitespace-nowrap">
                    &nbsp;. . .&nbsp;
                  </label>
                )}
              <button
                key={1000 + index}
                className={`mx-1 justify-center rounded-xl border-2 border-solid px-3 py-1 border-green-900 text-lg text-green-900 ${
                  page === index + 1
                    ? `bg-orange-300`
                    : `bg-green-200`
                }`}
                onClick={() => setPage(el)}
              >
                {el}
              </button>
            </>
          )}
        </>
      ))}
    </div>
  );
};

const ShowRows: React.FC<{
  pagelength: number;
  setPagelength: Dispatch<SetStateAction<number>>;
  setPage: Dispatch<SetStateAction<number>>;
}> = ({ pagelength, setPagelength, setPage }) => {

  const handlePageLengthChange = (length: number) => {
    setPagelength(length);
  };

  return (
    <>
    {/*selection of how many entries should be displayed per page*/}
      <p
        className={`ml-2 w-fit rounded-l-2xl border-2 bg-white px-3 py-1 text-lg border-green-300 text-green-900 h-10 outline-none transition`}
      >
        Show rows
      </p>
      <select
        className={`w-fit rounded-r-2xl border-2 border-l-0 bg-white px-3 py-2 text-lg border-green-300 text-green-900 h-10 outline-none transition`}
        name="pagelength"
        id="pagelength"
        value={pagelength}
        onChange={(e) => {
          handlePageLengthChange(parseInt(e.target.value));
          setPage(1);
        }}
      >
        <option value={50}>50</option>
        <option value={100}>100</option>
        <option value={150}>150</option>
        <option value={200}>200</option>
        <option value={250}>250</option>
        <option value={500}>500</option>
        <option value={1000}>1000</option>
      </select>
    </>
  );
};
