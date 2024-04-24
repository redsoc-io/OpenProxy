import Head from "next/head";
import Nav from "../components/Nav";
import ServerURL from "../components/Servers/ServerURL";

export default function PacFile() {
  var origin = null;
  try {
    var { origin } = window.location;
  } catch (e) {
    origin = "https://opp.redsoc.in";
  }
  return (
    <div>
      <Nav />
      <Head>
        <title>OProxy: Proxy Auto Configuration File</title>
      </Head>
      <div className="text-center py-3">
        <h1 className="text-3xl font-black py-12">
          Proxy Auto Configuration (PAC) File
        </h1>
      </div>
      <div className="lg:p-4 flex items-center justify-center w-full flex-col w-full">
        <div className="w-auto lg:mr-4 lg:p-0 p-4 font-bold">PAC URL </div>
        <div className="p-2 flex items-center justify-center w-full">
          <ServerURL url={`${origin}/api/proxy.pac`} />
        </div>
      </div>
      <div className="p-4 flex items-center justify-center w-full"></div>
      <div className="p-4 flex items-center justify-center w-full">
        <div>
          <h2 className="font-bold text-xl mb-3">Note</h2>
          <p>
            * PAC files are used to configure the proxy settings for a web
            browser.
          </p>
          <p>
            * OProxy PAC file is a simple JavaScript file that returns a proxy
            configuration for the browser.
          </p>
          <p>
            * You will receive the best server configuration from the proxy
            list.
          </p>
          <p>* This OProxy PAC file is currently a work in progress.</p>
          <p>
            <a
              href="https://www.websense.com/content/support/library/web/v76/pac_file_best_practices/PAC_explained.aspx#:~:text=PAC%20files%20are%20used%20to,easy%20to%20create%20and%20maintain."
              target={"_blank"}
              className="hover:text-blue-700"
              rel="noreferrer"
            >
              * Click here for more info about PAC Files
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
