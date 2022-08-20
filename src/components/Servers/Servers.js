import { useState, useEffect, useRef } from "react";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
const lookup = require('country-code-lookup')
import { BsStarFill, BsUiChecksGrid, BsViewList } from "react-icons/bs"
import Head from "next/head";
import { toBeautyString } from "../../assets/misc";
import LoaderLimit from "./LoaderLimit";

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
        <div className="text-center py-2 h-full">
            <input
                value={url}
                readOnly
                className="text-slate-400 w-full px-3 p-2 bg-gray-200 text-gray-700 h-full w-64"
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
                    <p className={`flex items-center px-2 justify-center font-bold text-lg bg-blue-600 text-gray-800 rounded-md text-center text-white font-bold`}>
                        <span className="mr-1">{server.streak}</span>
                        <span><BsStarFill /></span>
                    </p>
                </Td>
                <Td>
                    <p className="font-bold text-lg text-gray-800 w-48">{
                        getUnicodeFlagIcon(server.data?.country)}{" "}
                        {server.data?.city},{" "}
                        {
                            (lookup.byIso(server.data?.country) || {}).country
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
                    <p className="font-bold text-lg text-gray-800 w-48">
                        {server.data?.asn?.name}
                    </p>
                </Td>
                <Td>
                    <p className="font-bold text-lg text-gray-800">
                        {server.private ? "Yes" : "No"}
                    </p>
                </Td>
                <Td>
                    <Updated updated={server.updated_at} />
                </Td>
            </tr>
        )
}


function Updated({ updated }) {
    const [date, setDate] = useState(new Date());
    function update_time() {
        setDate(new Date());
    }

    useEffect(() => {
        update_time()
        setInterval(() => {
            update_time()
        }, 10000);
    }, []);

    return (
        <div className="w-24">
            {toBeautyString(new Date(updated), date)}
        </div>
    )
}

export default function Servers({ }) {

    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false)

    const [sort, setSort] = useState("");
    const [query, setSearchQuery] = useState("");
    const [filterCountry, setFilterCountry] = useState("");
    const [filterPrivate, setFilterPrivate] = useState(false);
    const [filterProtocol, setFilterProtocol] = useState("");
    const [page, setPage] = useState(-1);
    const [grid, setGrid] = useState(false);
    const [nomore, setNotMore] = useState(false);

    const [protocols, setProtocols] = useState([]);
    const [countries, setCountries] = useState([]);
    const [data, setData] = useState({});

    useEffect(() => {
        fetch("https://api.oproxy.ml/countries").then(res => res.json()).then(data => {
            setCountries(data);
        })
    }, [data])

    useEffect(() => {
        fetch("https://api.oproxy.ml/protocols").then(res => res.json()).then(data => {
            setProtocols(data);
        })
    }, [])


    function resetData(reset_input = true) {
        setData({ servers: [], alive_count:(data.alive_count || 0) });
        setPage(-1);
        setNotMore(false);
        if (reset_input) {
            setSearchQuery("");
            inputRef.current.value = "";
        }
    }

    useEffect(() => {
        const api_url = new URL("https://api.oproxy.ml/servers")
        const params = new URLSearchParams();

        if (query) params.append("q", query);

        if (!query) {
            if (filterCountry) params.append("country", filterCountry);
            if (filterPrivate) params.append("private_only", filterPrivate);
            if (filterProtocol) params.append("proto", filterProtocol);
            if (sort) params.append("sort", sort);
        }

        if (page >= 0) params.append("page", page);

        api_url.search = params.toString();
        const url = api_url.toString();

        if (page >= 0 && !loading) {
            setLoading(true)
            fetch(url).then(res => res.json()).then(fetched_data => {
                const new_data = {
                    alive_count: fetched_data.alive_count,
                    servers: [...(data.servers || []), fetched_data.servers],
                };
                setNotMore(fetched_data.servers.length < 10);
                setData(new_data);
                setLoading(false)
            })
        }

    }, [query, filterCountry, filterPrivate, filterProtocol, page, sort]);

    var filtered = data["servers"]

    var timeout_var = null;

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
                                    onChange={(e) => {
                                        if (timeout_var) clearTimeout(timeout_var);
                                        timeout_var = setTimeout(() => {
                                            resetData(false);
                                            setSearchQuery(e.target.value)
                                        }, 1000)
                                    }}
                                    className="w-full px-3 p-2 bg-gray-200 rounded-md shadow border text-gray-700"
                                    placeholder={`Search in ${data["alive_count"] || 0} servers`}
                                    defaultValue={query}
                                    ref={inputRef}
                                />
                            </div>
                        </div>
                        <div className="w-1/2 lg:1/5">
                            <div className="p-3">
                                <select
                                    className="w-full px-3 p-2 bg-gray-200 rounded-md shadow border text-gray-700"
                                    onChange={
                                        (e) => {
                                            resetData()
                                            setFilterCountry(e.target.value)
                                        }
                                    }
                                >
                                    <option value="">{filterCountry ? "Show All" : "Filter by country"}</option>
                                    {
                                        countries.map(
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
                        <div className="w-1/2 lg:1/5">
                            <div className="p-3">
                                <select
                                    className="w-full px-3 p-2 bg-gray-200 rounded-md shadow border text-gray-700"
                                    onChange={
                                        (e) => {
                                            resetData()
                                            setFilterProtocol(e.target.value)
                                        }
                                    }
                                >
                                    <option value="">{filterProtocol ? "Show All" : "Filter by protocol"}</option>
                                    {
                                        protocols.map(
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
                                <input type="checkbox" onChange={(e) => {
                                    resetData()
                                    setFilterPrivate(e.target.checked)
                                }
                                } id="private-filter" />
                                {" "}
                                <label htmlFor="private-filter">Show only private</label>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className="px-3">Sort</span>
                            <div className="">
                                    <select
                                        className="w-full px-3 p-2 bg-gray-200 rounded-md shadow border text-gray-700"
                                        onChange={
                                            ({target}) => {
                                                resetData()
                                                setSort(target.value)
                                            }
                                        }
                                    >
                                        <option value="updated_at">Updated</option>
                                        <option value="speed_score">Speed</option>
                                        <option value="streak">Streak</option>
                                    </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-end px-4">
                {
                    data.servers && (
                        <button
                            onClick={() => setGrid(!grid)}
                            className="bg-blue-600 text-white font-bold px-3 py-2 rounded-md flex items-center justify-center"
                        >
                            <span className="text-xl mr-2">{!grid ? <BsUiChecksGrid /> : <BsViewList />}</span>
                            <span>Show as {grid ? "List" : "Grid"}</span>
                        </button>
                    )
                }
            </div>
            <div className="p-4 w-full">
                {data.servers?.length > 0 &&
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
                                                        .map((server_bulk, i) => {
                                                            return server_bulk.map(
                                                                (server, j) => {
                                                                    return (
                                                                        <ServerDisplay key={`grid-server-${server.url}-${i}-${j}`} server={server} grid={grid} />
                                                                    )
                                                                }
                                                            )
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
                                                        <Th>Alive Streak</Th>
                                                        <Th>Country</Th>
                                                        <Th>URL</Th>
                                                        <Th>Strength</Th>
                                                        <Th>Protocol</Th>
                                                        <Th>ISP</Th>
                                                        <Th>Private </Th>
                                                        <Th>Updated</Th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        filtered
                                                            .map((server_bulk, i) => {
                                                                return server_bulk.map(
                                                                    (server, j) => {
                                                                        return (
                                                                            <ServerDisplay
                                                                                key={`grid-server-${server.url}-${i}-${j}`}
                                                                                server={server}
                                                                                grid={grid}
                                                                            />
                                                                        )
                                                                    }
                                                                )
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
                {
                    !nomore && (
                        <LoaderLimit
                            action={() => {
                                setPage(page + 1)
                            }}
                        />
                    )
                }
            </div>
        </div>
    )
}