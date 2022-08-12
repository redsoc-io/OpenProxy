import Nav from '../components/Nav';
import { useState, useEffect } from 'react';
import Head from "next/head";

export default function LogPage() {
    return (
        <div>
            <Head>
                <title>OProxy: Last Log</title>
            </Head>
            <Nav />
            <div className='w-full flex items-center justify-center p-3'>
                <iframe
                    src={"/api/last_log"}
                    className='lg:w-3/4 m-0 h-screen overflow-scroll w-full bg-white rounded-md text-sm border-2 shadow-md bg-black/70 text-white'
                    onLoad={(e) => {
                        e.target.contentWindow.document.querySelector("pre").style.color = '#fff';
                    }}
                ></iframe>
            </div>
        </div >
    );
}