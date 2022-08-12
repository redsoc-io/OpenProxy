import Nav from '../components/Nav';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { AiOutlineStar, AiOutlineEye, AiOutlineFork, AiOutlineGithub } from 'react-icons/ai';
import { FiExternalLink } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown'
import 'star-markdown-css'

function StatsUnit({ name, text, icon }) {
    return (
        <div className='text-center p-7 flex items-center justify-center w-1/3 bg-violet-400 text-gray-900'>
            <div className='text-4xl mr-3'>{icon}</div>
            <div className='font-bold text-4xl'>{text}</div>
        </div>
    )
}

function Stats() {

    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch("https://api.github.com/repos/midhunvnadh/Open-Proxy-Project")
            .then(res => res.json())
            .then(
                (json) => {
                    setStats(json)
                }
            );
    }, [])

    return (
        <div className='w-full lg:w-4/6 bg-gray-200 rounded-md flex-wrap shadow-lg overflow-hidden border flex items-center'>
            <div className='w-full lg:w-2/6 h-full'>
                <div className='flex items-center justify-center p-3'>
                    <a
                        href={stats?.html_url || "#"}
                        rel="noopener noreferrer"
                        target="_blank"
                        className='flex items-center justify-center text-gray-900 hover:text-blue-700 cursor-pointer'>
                        <span className='mr-3 text-4xl'>
                            <AiOutlineGithub />
                        </span>
                        <span className='font-black text-xl'>
                            Open Proxy Project
                        </span>
                        <span className='font-black ml-2 text-xl'>
                            <FiExternalLink />
                        </span>
                    </a>
                </div>
            </div>
            <div className='flex w-full lg:w-4/6'>
                <StatsUnit name="Watchers" text={stats?.subscribers_count || 0} icon={<AiOutlineEye />} />
                <StatsUnit name="Stars" text={stats?.stargazers_count || 0} icon={<AiOutlineStar />} />
                <StatsUnit name="Forks" text={stats?.forks || 0} icon={<AiOutlineFork />} />
            </div>
        </div>
    )
}

function AboutMd({ readme }) {
    return (
        <div className='markdown-body p-12'>
            <ReactMarkdown linkTarget={"_blank"}>
                {
                    readme
                }
            </ReactMarkdown>
        </div>
    )
}

export default function About({ readme }) {
    return (
        <div>
            <Nav />
            <Head>
                <title>About</title>
            </Head>
            <div className='p-4 flex items-center justify-center w-full'>
                <Stats />
            </div>
            <div className='text-center mt-12'>
                <h1 className='text-3xl font-black'>About Open Proxy Project (OProxy)</h1>
            </div>
            <div className='flex items-center justify-center w-full'>
                <AboutMd readme={readme || ""} />
            </div>
        </div>
    );
}

export const getServerSideProps = async () => {
    const res = await fetch("https://raw.githubusercontent.com/midhunvnadh/Open-Proxy-Project/main/README.md")
    const text = await res.text()
    return {
        props: {
            readme: text
        }
    }
}