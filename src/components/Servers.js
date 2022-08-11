import { useState, useEffect } from "react";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { CgSpinner } from 'react-icons/cg'
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
const lookup = require('country-code-lookup')
import { BsUiChecksGrid, BsViewList } from "react-icons/bs"
import Head from "next/head";

function Th(props) {
    const { children, className } = props;
    return (
        <th {...props} className={`border border-slate-300 ${className || ""}`}>
            <div className="p-2">
                {children}
            </div>
        </th>
    )
}
function Td(props) {
    const { children, className } = props;
    return (
        <td {...props} className={`border border-slate-300 ${className || ""}`}>
            <div className="p-2">
                {children}
            </div>
        </td>
    )
}

function ServerURL({ url }) {
    return (
        <div className="text-center py-2">
            <input
                value={url}
                readOnly
                className="text-slate-400 w-full px-3 p-2 bg-gray-200 text-gray-700 w-fit"
            />
        </div>
    )
}

function ServerDisplay({ server, grid = false }) {

    const server_speed = server.speed_score;
    const server_speed_color = server_speed > 50 ? "bg-green-500" : server_speed > 30 ? "bg-orange-500" : "bg-red-500";

    if (grid)
        return (
            <div className="server p-3">
                <div className="shadow-md rounded-md overflow-hidden bg-white border">
                    <div className="flex items-center justify-center bg-gray-300 p-3">
                        <p className="font-bold text-lg text-gray-800">{
                            getUnicodeFlagIcon(server.data.country)}{" "}
                            {server.data.city},{" "}
                            {
                                (lookup.byIso(server.data.country) || {}).country
                            }
                        </p>
                    </div>
                    <div className="w-full bg-gray-200 h-1">
                        <div className={`${server_speed_color} h-1`}
                            style={{
                                width: `${server.speed_score}%`
                            }}>
                        </div>
                    </div>
                    <div className="p-3">
                        <table className="w-full border-collapse border border-slate-400 table-auto">
                            <tbody>
                                <tr>
                                    <Th>Protocol</Th>
                                    <Td><span className="uppercase">{server.proto}</span></Td>
                                </tr>
                                <tr>
                                    <Th>ISP</Th>
                                    <Td>
                                        {server.data.asn.name}
                                    </Td>
                                </tr>
                                <tr>
                                    <Th>Private</Th>
                                    <Td>
                                        {server.private ? "Yes" : "No"}
                                    </Td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <ServerURL url={server.url} />
                </div>
            </div>
        )
    else
        return (
            <tr>
                <Td>
                    <p className="font-bold text-lg text-gray-800">{
                        getUnicodeFlagIcon(server.data.country)}{" "}
                        {server.data.city},{" "}
                        {
                            (lookup.byIso(server.data.country) || {}).country
                        }
                    </p>
                </Td>
                <Td>
                    <ServerURL url={server.url} />
                </Td>
                <Td>
                    <p className={`"font-bold text-lg text-gray-800 rounded-md text-center text-white font-bold ${server_speed_color}`}>
                        {server.speed_score} %
                    </p>
                </Td>
                <Td className="uppercase">
                    {server.proto}
                </Td>
                <Td>
                    <p className="font-bold text-lg text-gray-800">
                        {server.data.asn.name}
                    </p>
                </Td>
                <Td>
                    <p className="font-bold text-lg text-gray-800">
                        {server.private ? "Yes" : "No"}
                    </p>
                </Td>
            </tr>
        )
}

export default function Servers({ }) {

    const [sort, setSort] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCountry, setFilterCountry] = useState("");
    const [filterPrivate, setFilterPrivate] = useState(false);
    const [filterProtocol, setFilterProtocol] = useState("");
    const [grid, setGrid] = useState(false);

    const [servers, setServers] = useState([]);

    useEffect(() => {
        fetch("/api/servers").then(res => res.json()).then(data => {
            setServers(data);
        })
    }, []);


    const filtered = (sort ?
        servers.sort((a, b) => b.speed_score - a.speed_score)
        :
        servers
    )
        .filter(server => {
            return JSON.stringify(server).toLowerCase().includes(searchTerm.toLowerCase())
        })
        .filter(server => {
            return server.proto.toLowerCase().includes(filterProtocol.toLowerCase())
        })
        .filter(server => {
            return server.data.country.toLowerCase().includes(filterCountry.toLowerCase())
        })
        .filter(
            server => {
                if (filterPrivate) {
                    return server.private
                } else {
                    return true
                }
            }
        )
    return (
        <div>
            <Head>
                <title>OProxy: Servers</title>
            </Head>
            <div className="w-full py-5 px-4">
                <div className="shadow-md border rounded-md py-3">
                    <div className="w-full bg-white flex lg:flex-nowrap flex-wrap">
                        <div className="lg:w-2/5 w-full">
                            <div className="p-3">
                                <input type="text"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 p-2 bg-gray-200 rounded-md shadow border text-gray-700" placeholder={`Search in ${servers.length} servers`}
                                />
                            </div>
                        </div>
                        <div className="w-2/5 lg:1/5">
                            <div className="p-3">
                                <select
                                    className="w-full px-3 p-2 bg-gray-200 rounded-md shadow border text-gray-700"
                                    onChange={(e) => setFilterCountry(e.target.value)}
                                >
                                    <option value="">{filterCountry ? "Show All" : "Filter by country"}</option>
                                    {
                                        [...new Set(servers.map(server => {
                                            return server.data.country
                                        }))].sort().map(
                                            country => {
                                                return (
                                                    <option value={country} key={`country-filter-${country}`}>
                                                        {(lookup.byIso(country) || {}).country}
                                                    </option>
                                                )
                                            }
                                        )
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="w-2/5 lg:1/5">
                            <div className="p-3">
                                <select
                                    className="w-full px-3 p-2 bg-gray-200 rounded-md shadow border text-gray-700"
                                    onChange={(e) => setFilterProtocol(e.target.value)}
                                >
                                    <option value="">{filterProtocol ? "Show All" : "Filter by protocol"}</option>
                                    {
                                        [...new Set(servers.map(server => {
                                            return server.proto
                                        }))].sort().map(
                                            proto => {
                                                return (
                                                    <option value={proto} key={`proto-filter-${proto}`}>
                                                        {proto}
                                                    </option>
                                                )
                                            }
                                        )
                                    }
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-4 rounded-md">
                        <div className="">
                            <div className="p-3 select-none">
                                <input type="checkbox" onChange={(e) => setFilterPrivate(e.target.checked)} id="private-filter" />
                                {" "}
                                <label htmlFor="private-filter">Show only private</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-end px-4">
                {
                    servers.length > 0 && (
                        <button
                            onClick={() => setGrid(!grid)}
                            className="bg-blue-600 text-white font-bold px-3 py-2 rounded-md flex items-center justify-center">
                            <span className="text-xl mr-2">{!grid ? <BsUiChecksGrid /> : <BsViewList />}</span>
                            <span>Show as {grid ? "List" : "Grid"}</span>
                        </button>
                    )
                }
            </div>
            <div>
                {
                    servers.length === 0 && (
                        <div className="w-full flex justify-center items-center py-6">
                            <div className="animate-spin h-10 w-10 text-6xl flex items-center justify-center">
                                <CgSpinner />
                            </div>
                        </div>
                    )
                }
            </div>
            <div className="p-4 w-full">
                {servers.length > 0 &&
                    (
                        <>
                            {

                                grid ?
                                    (

                                        <ResponsiveMasonry
                                            columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                                        >
                                            <Masonry>
                                                {
                                                    filtered
                                                        .map(server => {
                                                            return <ServerDisplay key={server.url} server={server} grid={grid} />
                                                        })
                                                }
                                            </Masonry>
                                        </ResponsiveMasonry>
                                    )
                                    :
                                    (
                                        <div className="w-full overflow-x-scroll">
                                            <table className="w-full">
                                                <thead>
                                                    <tr>
                                                        <Th>
                                                            <p className="font-bold text-lg text-gray-800">
                                                                Country
                                                            </p>
                                                        </Th>
                                                        <Th>
                                                            <p className="font-bold text-lg text-gray-800">
                                                                URL
                                                            </p>
                                                        </Th>
                                                        <Th>
                                                            <p className="font-bold text-lg text-gray-800">
                                                                Strength
                                                            </p>
                                                        </Th>
                                                        <Th>
                                                            <p className="font-bold text-lg text-gray-800">
                                                                Protocol
                                                            </p>
                                                        </Th>
                                                        <Th>
                                                            <p className="font-bold text-lg text-gray-800">
                                                                ISP
                                                            </p>
                                                        </Th>
                                                        <Th>
                                                            <p className="font-bold text-lg text-gray-800">
                                                                Private
                                                            </p>
                                                        </Th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        filtered
                                                            .map(server => {
                                                                return <ServerDisplay key={server.url} server={server} grid={grid} />
                                                            })
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                            }
                        </>
                    )
                }
            </div>
        </div>
    )
}