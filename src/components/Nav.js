import Link from "next/link";
import { useState, useEffect } from "react";

function NavLink({ children, href = "/" }) {
    return (
        <Link href={href}>
            <a className="inline-block p-5 text-gray-800 tracking-wide font-bold text-decoration-none hover:underline hover:bg-gray-100">
                {children}
            </a>
        </Link>
    )
}

function toBeautyString(then) {

    var nowdate = new Date();
    var thendate = then;

    //finding the human-readable components of the date.

    var y = nowdate.getFullYear() - thendate.getFullYear();
    var m = nowdate.getMonth() - thendate.getMonth();
    var d = nowdate.getDate() - thendate.getDate();
    var h = nowdate.getHours() - thendate.getHours();
    var mm = nowdate.getMinutes() - thendate.getMinutes();
    var s = nowdate.getSeconds() - thendate.getSeconds();

    //back to second grade math, now we must now 'borrow'.

    if (s < 0) {
        s += 60;
        mm--;
    }
    if (mm < 0) {
        mm += 60;
        h--;
    }
    if (h < 0) {
        h += 24;
        d--;
    }
    if (d < 0) {

        //here's where we take into account variable month lengths.

        var a = thendate.getMonth();
        var b;
        if (a <= 6) {
            if (a == 1) b = 28;
            else if (a % 2 == 0) b = 31;
            else b = 30;
        }
        else if (b % 2 == 0) b = 30;
        else b = 31;

        d += b;
        m--;
    }
    if (m < 0) {
        m += 12;
        y--;
    }

    return `
            ${y > 0 ? `${y}y` : ""}
            ${m > 0 ? `${m}M` : ""}
            ${d > 0 ? `${d}d` : ""}
            ${h > 0 ? `${h}h` : ""}
            ${mm > 0 ? `${mm}m` : ""}
            ${s > 0 ? `${s}s` : ""}
            ago
            `
}
function Updated() {
    const [date, setDate] = useState(new Date());
    const [relatime, setRelatime] = useState(null);

    function update_time() {
        fetch("/api/updated")
            .then(res => res.text())
            .then(
                (text) => {
                    setRelatime(
                        toBeautyString(new Date(text))
                    )
                }
            );
    }

    useEffect(() => {
        update_time()
        setInterval(() => {
            update_time()
        }, 10000);
    }, []);

    return (
        <div>
            {
                relatime ? (
                    <>

                        Updated {relatime}

                    </>
                ) : <>
                    <div>
                        loading...
                    </div>
                </>
            }
        </div>
    )
}

export default function Nav() {
    return (
        <>
            <nav className="flex items-center flex-wrap w-full justify-between px-4 bg-gray-50 border lg:border-none lg:shadow-lg lg:fixed top-0">
                <div className="flex items-center justify-center flex-wrap">
                    <div className="uppercase font-bold tracking-wide text-blue-900 lg:mr-5 lg:p-0 p-3">
                        OProxy.ml
                    </div>
                    <div>
                        <ul>
                            <NavLink href="/">Servers</NavLink>
                            <NavLink href="/log">Live Log</NavLink>
                            <NavLink href="/pac_file">PAC File</NavLink>
                            <NavLink href="/about">About</NavLink>
                        </ul>
                    </div>
                </div>
                <div className="py-3 text-center lg:w-auto w-full">
                    <Updated />
                </div>
            </nav>
            <div className="lg:py-12"></div>
        </>
    );
}