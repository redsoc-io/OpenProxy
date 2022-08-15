import Nav from '../components/Nav';
import { useState, useEffect } from 'react';
import Head from "next/head";
import { io } from "socket.io-client"

export default function LogPage() {
    const [log, setLog] = useState([]);
    var listening = false
    const startlistening = () => {
        listening = true;
        const socket = io("https://api.oproxy.ml");
        socket.on("receive-message", (line) => {
            setLog(log => [...log, line]);
        });
    }

    useEffect(() => {
        if (!listening) {
            startlistening()
        }
    }, [])

    return (
        <div>
            <Head>
                <title>OProxy: Live Log</title>
            </Head>
            <Nav />
            <div className='w-full flex items-center justify-center p-3'>
                <div
                    className='lg:w-3/4 m-0 p-2 h-screen overflow-scroll w-full bg-white rounded-md text-sm border-2 shadow-md bg-black/70 text-white'
                >
                    {
                        (log.length > 0 ? log : ["Logs will load once something is updated in the server..."]).map((line, index) => {
                            return (
                                <pre key={index}>{line}</pre>
                            )
                        })
                    }
                </div>
            </div>
        </div >
    );
}