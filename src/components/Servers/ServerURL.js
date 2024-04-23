import { LuClipboard, LuClipboardCheck } from "react-icons/lu";
import { useState } from "react";

export default function ServerURL({ url }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="text-center h-full">
      <div className="flex rounded-md  bg-gray-200 overflow-hidden">
        <input
          value={url}
          readOnly
          className="text-slate-700 w-full min-w-80 px-3 p-2 h-full font-mono bg-transparent focus:outline-none focus:bg-gray-300 focus:text-gray-900 select:text-gray-900 select-none"
        />
        <button
          className={`p-3 ${
            copied
              ? "bg-green-400 focus:bg-green-500"
              : "bg-blue-400 focus:bg-blue-500"
          } text-white hover:bg-blue-500 focus:outline-none focus:text-white`}
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1000);
          }}
        >
          {copied ? <LuClipboardCheck /> : <LuClipboard />}
        </button>
      </div>
    </div>
  );
}
