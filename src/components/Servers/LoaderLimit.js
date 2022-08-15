import { useInView } from "react-intersection-observer";
import { CgSpinner } from 'react-icons/cg'
import { useEffect } from "react";

export default function LoaderLimit({ action }) {
    const { ref, inView, entry } = useInView({
        threshold: 1,
        trackVisibility: true,
        delay: 100,
    });

    var timeout = null

    useEffect(() => {
        if (inView) {
            if (timeout) {
                clearTimeout(timeout)
            }
            timeout = setTimeout(() => {
                action();
            }, 1000)
        }
    }, [inView, action]);

    return (
        <div
            className="py-3 text-center flex items-center justify-center w-full"
            ref={ref}
        >

            <div className="w-full flex justify-center items-center py-6">
                <div className="animate-spin h-10 w-10 text-6xl flex items-center justify-center">
                    <CgSpinner />
                </div>
            </div>
        </div>
    );
}