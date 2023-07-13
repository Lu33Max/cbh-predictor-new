import React, { useState } from "react";
import { BiBarChartAlt, BiHomeAlt, BiLineChart, BiLogOut, BiMenu, BiTable, BiX } from "react-icons/bi";
import Link from "next/link";
import { IconContext } from "react-icons/lib";

function Navbar() {
    const [sidebar, setSidebar] = useState(false)

    const showSidebar = () => setSidebar(!sidebar)

    return(
        <>
            <IconContext.Provider value={{color: "green"}}>
                <div className="absolute text-6xl w-fit ml-5 mt-4">
                    <button>
                        <BiMenu onClick={showSidebar}/>
                    </button>
                </div>
                <nav className={`absolute w-[250px] h-[100dvh] ${sidebar ? "left-0" : "left-[-250px]"} bg-[#000030] text-neutral-300 text-2xl transition-all ease-in-out duration-300`}>
                    <ul onClick={showSidebar}>
                        <li className="flex flex-row items-center mt-6 mb-10">
                            <button className="ml-5 text-5xl">
                                <BiX/>
                            </button>
                            <Link href={"/"} className="ml-auto mr-3 text-4xl flex flex-row items-center">
                                <label className="text-2xl mr-1">Logout</label><BiLogOut />
                            </Link>
                        </li>
                        {NavbarData.map((item, index) => {
                            return (
                                <li key={index} className="flex flex-col ml-3">
                                    {item.cName !== "head" ? (
                                        <Link href={item.path} className="flex flex-row ml-3 items-center my-2 hover:bg-[#000050] px-3 py-1 rounded-lg mr-4">
                                            {item.icon}
                                            <span className="ml-1">{item.title}</span>
                                        </Link>
                                    ) : (
                                        <>
                                            <hr className="mt-2 mr-4"/>
                                            {item.path !== "" ? (
                                                <Link href={item.path} className="flex flex-row items-center my-2 hover:bg-[#000050] px-3 py-1 rounded-lg mr-4">
                                                    {item.icon}
                                                    <span className="ml-1">{item.title}</span>
                                                </Link>
                                            ) : (
                                                <div className="flex flex-row items-center my-2 px-3 py-1">
                                                    {item.icon}
                                                    <span className="ml-1">{item.title}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </IconContext.Provider>
        </>
    )
}

export default Navbar

const NavbarData = [
    {
        title: "Home",
        path: "/",
        icon: <BiHomeAlt/>,
        cName: "head",
    },
    {
        title: "Bing Data",
        path: "",
        icon: <BiBarChartAlt/>,
        cName: "head"
    },
    {
        title: "Charts",
        path: "/bing/charts",
        icon: <BiLineChart/>,
        cName: "sub"
    },
    {
        title: "Table",
        path: "/bing/table",
        icon: <BiTable/>,
        cName: "sub"
    },
    {
        title: "Google Data",
        path: "",
        icon: <BiBarChartAlt/>,
        cName: "head"
    },
    {
        title: "Charts",
        path: "/google/charts",
        icon: <BiLineChart/>,
        cName: "sub"
    },
    {
        title: "Table",
        path: "/google/table",
        icon: <BiTable/>,
        cName: "sub"
    },
    {
        title: "Lead Data",
        path: "",
        icon: <BiBarChartAlt/>,
        cName: "head"
    },
    {
        title: "Charts",
        path: "/lead/charts",
        icon: <BiLineChart/>,
        cName: "sub"
    },
    {
        title: "Table",
        path: "/lead/table",
        icon: <BiTable/>,
        cName: "sub"
    },
    {
        title: "Order Data",
        path: "",
        icon: <BiBarChartAlt/>,
        cName: "head"
    },
    {
        title: "Charts",
        path: "/order/charts",
        icon: <BiLineChart/>,
        cName: "sub"
    },
    {
        title: "Table",
        path: "/order/table",
        icon: <BiTable/>,
        cName: "sub"
    }
]