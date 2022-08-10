import Nav from '../components/Nav';
import { useState, useEffect } from 'react';
import Head from "next/head";

export default function LogPage() {
    const [log, setLog] = useState(["Loading..."]);

    useEffect(() => {
        fetch("/api/last_log")
            .then(res => res.text())
            .then(
                text => setLog(text.split("\n"))
            );
    }, []);
    return (
        <div>
            <Head>
                <title>OProxy: Last Log</title>
            </Head>
            <Nav />
            <div className='w-full flex items-center justify-center p-3'>
                <div className='lg:w-3/4 h-screen overflow-scroll w-full p-3 bg-white rounded-md text-sm border-2 shadow-md bg-black/70 text-white'>
                    {
                        log.map((line, index) => {
                            return (
                                <div key={index}>
                                    <pre>
                                        {line}
                                    </pre>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div >
    );
}