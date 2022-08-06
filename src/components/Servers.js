import { useState, useEffect } from "react";
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { ImSpinner8 } from 'react-icons/im'

function Th({ children }) {
    return (
        <th className="border border-slate-300">
            <div className="p-2">
                {children}
            </div>
        </th>
    )
}
function Td({ children }) {
    return (
        <td className="border border-slate-300">
            <div className="p-2">
                {children}
            </div>
        </td>
    )
}

function ServerDisplay({ server }) {

    const server_speed = server.speed_score;
    const server_speed_color = server_speed > 50 ? "bg-green-500" : server_speed > 30 ? "bg-orange-500" : "bg-red-500";

    return (
        <div className="server p-3 w-1/4">
            <div className="shadow-md rounded-md overflow-hidden bg-white border">
                <div className="flex items-center justify-center bg-gray-100 p-3">
                    <p>{getUnicodeFlagIcon(server.data.country)} {server.data.city}, {server.data.country}</p>
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
                        </tbody>
                    </table>
                    <div className="text-center py-2">
                        <input
                            value={server.url}
                            readOnly
                            className="text-slate-400 w-full px-3 p-2 bg-gray-200 text-gray-700"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Servers() {

    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/servers")
            .then(res => res.json())
            .then(
                json => {
                    setServers(json)
                    setLoading(false)
                }
            );
    }, []);

    return (
        <div>
            <div className="flex flex-wrap items-center justify-start p-4">
                {
                    loading &&
                    <div className="w-full h-full flex items-center justify-center mt-12">
                        <div className="spinner animate-spin h-5 w-5 flex items-center justify-center text-5xl">
                            <ImSpinner8 />
                        </div>
                    </div>
                }
                {
                    servers.map(server => {
                        return <ServerDisplay key={server.url} server={server} />
                    })
                }
            </div>
        </div>
    )
}