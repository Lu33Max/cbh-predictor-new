import React, { useState } from "react";
import { BiBarChartAlt, BiHomeAlt, BiLineChart, BiLogOut, BiMenu, BiTable, BiX } from "react-icons/bi";
import Link from "next/link";
import { IconContext } from "react-icons/lib";

import styles from "./navbar.module.css"

function Navbar() {
    const [sidebar, setSidebar] = useState(false)

    const showSidebar = () => setSidebar(!sidebar)

    return(
        <>
            <IconContext.Provider value={{color: "green"}}>
                <div className={styles.navbar}>
                    <Link href={"/"} className="menu_bars">
                        <BiMenu onClick={showSidebar}/>
                    </Link>
                </div>
                <nav className={sidebar ? styles.nav_menu_active : styles.nav_menu}>
                    <ul className={styles.nav_menu_items} onClick={showSidebar}>
                        <li className={styles.navbar_toggle}>
                            <Link href={"/"} className={styles.menu_bars}>
                                <BiX/>
                            </Link>
                            <Link href={"/"} className={styles.logout}>
                                <BiLogOut />
                            </Link>
                        </li>
                        {NavbarData.map((item, index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    {item.path !== "" ? (
                                        <Link href={item.path}>
                                            {item.icon}
                                            <span className="ml-10">{item.title}</span>
                                        </Link>
                                    ) : (
                                        <>
                                            {item.icon}
                                            <span className="ml-10">{item.title}</span>
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
        cName: "nav_text head",
    },
    {
        title: "Bing Data",
        path: "",
        icon: <BiBarChartAlt/>,
        cName: "nav_text head"
    },
    {
        title: "Charts",
        path: "/charts/bing",
        icon: <BiLineChart/>,
        cName: "nav_text"
    },
    {
        title: "Table",
        path: "/table/bing",
        icon: <BiTable/>,
        cName: "nav_text"
    },
    {
        title: "Google Data",
        path: "",
        icon: <BiBarChartAlt/>,
        cName: "nav_text head"
    },
    {
        title: "Charts",
        path: "/charts/google",
        icon: <BiLineChart/>,
        cName: "nav_text"
    },
    {
        title: "Table",
        path: "/table/google",
        icon: <BiTable/>,
        cName: "nav_text"
    },
    {
        title: "Lead Data",
        path: "",
        icon: <BiBarChartAlt/>,
        cName: "nav_text head"
    },
    {
        title: "Charts",
        path: "/charts/lead",
        icon: <BiLineChart/>,
        cName: "nav_text"
    },
    {
        title: "Table",
        path: "/table/lead",
        icon: <BiTable/>,
        cName: "nav_text"
    },
    {
        title: "Order Data",
        path: "",
        icon: <BiBarChartAlt/>,
        cName: "nav_text head"
    },
    {
        title: "Charts",
        path: "/charts/order",
        icon: <BiLineChart/>,
        cName: "nav_text"
    },
    {
        title: "Table",
        path: "/table/order",
        icon: <BiTable/>,
        cName: "nav_text"
    }
]