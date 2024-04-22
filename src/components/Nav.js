import Link from "next/link";
import { useState, useEffect } from "react";
import { BsCoin } from "react-icons/bs";

function NavLink({ children, href = "/" }) {
  return (
    <Link
      href={href}
      className="inline-block p-5 text-gray-800 tracking-wide font-bold text-decoration-none hover:underline hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  return (
    <>
      <nav className="flex items-center flex-wrap w-full justify-between px-4 bg-gray-50 border lg:border-none lg:shadow-lg lg:fixed top-0">
        <div className="flex items-center justify-center flex-wrap">
          <div className="uppercase font-bold tracking-wide text-blue-900 lg:mr-5 lg:p-0 p-3">
            Open Proxy Project
          </div>
          <div>
            <ul>
              <NavLink href="/">Servers</NavLink>
              <NavLink href="/pac_file">PAC File</NavLink>
              <NavLink href="/about">About</NavLink>
            </ul>
          </div>
        </div>
        <div className="py-3 text-center lg:w-auto w-full">
          <Link
            href="https://www.paypal.me/midhunnadh"
            className="flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <span className="font-bold text-2xl mr-1">
              <BsCoin />
            </span>
            <span className="font-bold uppercase">Donate</span>
          </Link>
        </div>
      </nav>
      <div className="lg:py-12"></div>
    </>
  );
}
