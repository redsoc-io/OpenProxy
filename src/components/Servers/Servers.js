import { useState, useEffect, useRef } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { BsUiChecksGrid, BsViewList } from "react-icons/bs";
import Head from "next/head";
import LoaderLimit from "./LoaderLimit";
import { Th } from "../../assets/misc";
import ServerDisplay from "./ServerDisplay";
import lookup from "country-code-lookup";
import { IoReload } from "react-icons/io5";
import { CiBoxList } from "react-icons/ci";
let refreshInterval;

export default function Servers({}) {
  const inputRef = useRef(null);

  const [query, setSearchQuery] = useState("");
  const [grid, setGrid] = useState(true);
  const [loading, setLoading] = useState(true);

  const [protoFilter, setProtoFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sort, setSort] = useState("streak");

  var [data, setData] = useState([]);

  const loadData = async () => {
    setLoading(true);
    fetch("/api/servers")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();

    refreshInterval = setInterval(loadData, 10000);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  data = data.map((server) => {
    try {
      server.country = lookup.byIso(server.geo).country;
    } catch (e) {
      server.country = "Unknown";
    }
    return server;
  });

  const response_times = data
    .map((server) => server.response_time)
    .sort((a, b) => a - b);

  const [rt_min, rt_max] = [
    response_times[0],
    response_times[response_times.length - 1],
  ];

  data = data.map((server) => {
    server.percent =
      100 -
      Math.floor(((server.response_time - rt_min) / (rt_max - rt_min)) * 100);
    return server;
  });

  const protos = Array.from(
    new Set(data.map((server) => server.url.split(":")[0]))
  ).sort();
  const countries = Array.from(
    new Set(data.map((server) => server.country))
  ).sort();
  var filtered = data
    .filter((server) => {
      if (protoFilter === "all") return true;
      return server.url.split(":")[0] === protoFilter;
    })
    .filter((server) => {
      if (query === "") return true;
      return JSON.stringify(server).toLowerCase().includes(query.toLowerCase());
    })
    .filter((server) => {
      if (countryFilter === "all") return true;
      return server.country === countryFilter;
    })
    .sort((a, b) => {
      if (sort === "streak") {
        return b.streak - a.streak;
      } else if (sort === "response_time") {
        return a.response_time - b.response_time;
      }
    });

  return (
    <div>
      <Head>
        <title>OProxy: Servers</title>
      </Head>
      <div className="w-full lg:px-4">
        <div className="shadow border rounded-md">
          <div className="w-full bg-white flex justify-between items-center flex-wrap">
            <div className="lg:w-2/5 w-full">
              <div className="p-3">
                <input
                  type="text"
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full px-3 p-2 bg-gray-50 rounded-md border text-gray-700"
                  placeholder={`Search in ${data.length || 0} servers`}
                  defaultValue={query}
                  ref={inputRef}
                />
              </div>
            </div>
            <div className="grow">
              <div className="p-3 w-full">
                <select
                  onChange={(e) => {
                    setProtoFilter(e.target.value);
                  }}
                  className="p-2 bg-gray-50 rounded-md border text-gray-700 w-full"
                >
                  <option value="all">Show all protocols</option>
                  {protos.map((proto, i) => {
                    return (
                      <option key={`proto-${proto}-${i}`} value={proto}>
                        {proto}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="grow">
              <div className="p-3">
                <select
                  className="p-2 bg-gray-50 rounded-md border text-gray-700 w-full"
                  onChange={(e) => {
                    setCountryFilter(e.target.value);
                  }}
                >
                  <option value="all">Show all countries</option>
                  {countries.map((country, i) => {
                    return (
                      <option key={`country-${country}-${i}`} value={country}>
                        {country}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="grow">
              <div className="p-3">
                <select
                  className="p-2 bg-gray-50 rounded-md border text-gray-700 w-full"
                  onChange={(e) => {
                    setSort(e.target.value);
                  }}
                >
                  <option value="streak">Sort by Streak</option>
                  <option value="response_time">Sort by Response Time</option>
                </select>
              </div>
            </div>
            <div className="grow">
              <div className="p-3 flex gap-2 justify-end">
                <button
                  onClick={() => setGrid(!grid)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-md flex items-center justify-center gap-3"
                >
                  <span className="text-xl ">
                    {!grid ? <BsUiChecksGrid /> : <CiBoxList />}
                  </span>
                  <span>Show as {grid ? "List" : "Grid"}</span>
                </button>
                <button
                  onClick={() => loadData()}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-md flex items-center justify-center gap-3"
                >
                  <span className={`text-xl ${loading ? "animate-spin" : ""}`}>
                    <IoReload />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:p-4 px-2 w-full">
        {data.length > 0 && (
          <>
            {grid ? (
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1366: 4 }}
              >
                <Masonry>
                  {filtered.map((server, i) => {
                    return (
                      <ServerDisplay
                        key={`grid-server-${server.url}-${i}`}
                        server={server}
                        grid={grid}
                        percent={server.percent}
                      />
                    );
                  })}
                </Masonry>
              </ResponsiveMasonry>
            ) : (
              <div className="w-full overflow-x-scroll">
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <Th className="w-24">Protocol</Th>
                      <Th>URL</Th>
                      <Th>Country</Th>
                      <Th className="w-36">Response Time</Th>
                      <Th>Streak</Th>
                      <Th>Last Checked</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((server, i) => {
                      return (
                        <ServerDisplay
                          key={`grid-server-${server.url}-${i} `}
                          server={server}
                          grid={grid}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        {loading && <LoaderLimit />}
      </div>
    </div>
  );
}
