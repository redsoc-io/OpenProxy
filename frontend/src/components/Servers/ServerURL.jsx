import { LuClipboard, LuClipboardCheck } from "react-icons/lu";
import { useState } from "react";

export default function ServerURL({ url }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="text-center h-full w-full flex items-center justify-center">
      <div className="flex rounded-md bg-gray-200 max-w-md w-full">
        <div className="text-slate-700 text-left w-full text-nowrap overflow-x-auto px-3 p-3 h-full font-mono bg-transparent focus:outline-none focus:bg-gray-300 focus:text-gray-900 select:text-gray-900 select-none">
          {url}
        </div>
        <button
          className={`px-5 py-3 ${
            copied
              ? "bg-green-400 focus:bg-green-500"
              : "bg-blue-400 focus:bg-blue-500"
          } text-white hover:bg-blue-500 focus:outline-none focus:text-white flex items-center justify-center gap-2 rounded-r-md w-1/12`}
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1000);
          }}
        >
          <span>{copied ? <LuClipboardCheck /> : <LuClipboard />}</span>
        </button>
      </div>
    </div>
  );
}
