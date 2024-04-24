import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Updated from "./UpdatedTime";
const lookup = require("country-code-lookup");
import { Td } from "../../assets/misc";
import { BsStarFill } from "react-icons/bs";
import { ImClock2 } from "react-icons/im";
import ServerURL from "./ServerURL";

export default function ServerDisplay({ server, grid = false, percent = 100 }) {
  const server_speed_color =
    server.response_time < 500
      ? "bg-green-500"
      : server.response_time < 1000
      ? "bg-yellow-500"
      : server.response_time < 2000
      ? "bg-orange-500"
      : server.response_time < 3000
      ? "bg-red-500"
      : "bg-red-600";
  const proto = server.url.split(":")[0];

  var icon = null;

  try {
    icon = getUnicodeFlagIcon(lookup.byIso(server.geo).iso2);
  } catch (e) {}

  if (grid)
    return (
      <div className="server lg:p-3 py-2">
        <div className="rounded-md overflow-hidden bg-white border">
          <div className="flex items-center justify-center bg-gray-100 px-3 py-1">
            <div className="font-bold text-lg text-gray-800 flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{icon}</div>
                <div className="font-normal text-md">
                  {server.country === "Unknown" ? "" : server.country}
                </div>
              </div>
              <div className="flex justify-center items-center gap-2">
                <div>
                  <span className="uppercase text-xs bg-blue-500 rounded-md py-1 px-2 text-white block">
                    {proto}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-xs ${server_speed_color} rounded-md py-1 px-2 text-white block`}
                  >
                    {server.response_time} ms
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1">
            <div
              className={`${server_speed_color} h-1`}
              style={{
                width: `${100 - percent}%`,
              }}
            ></div>
          </div>
          <div className="p-1">
            <div className="">
              <div className="w-full p-2">
                <ServerURL url={server.url} />
              </div>
              <div className="flex items-center justify-between">
                <div className="uppercase flex items-center justify-center p-3 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <span className="text-blue-500">
                      <BsStarFill />
                    </span>
                    <span>{server.streak}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 justify-center p-3 text-center">
                  <div className="flex justify-center items-center gap-3 w-32">
                    <span className="text-blue-500">
                      <ImClock2 />
                    </span>
                    <span>
                      <Updated updated={server.last_checked} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  else
    return (
      <tr>
        <Td>
          <span className="uppercase text-sm bg-blue-500 rounded-md py-1 px-2 text-white block w-24 text-center font-bold">
            {proto}
          </span>
        </Td>
        <Td>
          <ServerURL url={server.url} />
        </Td>
        <Td>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{icon}</div>
            <div className="font-bold">{server.country}</div>
          </div>
        </Td>
        <Td>
          <span
            className={`text-sm ${server_speed_color} rounded-md py-1 px-2 text-white block w-24 text-center font-bold`}
          >
            {server.response_time} ms
          </span>
        </Td>
        <Td>
          <div className="uppercase flex items-center gap-3 justify-start">
            <span className="text-blue-500">
              <BsStarFill />
            </span>
            <span>{server.streak}</span>
          </div>
        </Td>
        <Td>
          <Updated updated={server.last_checked} />
        </Td>
      </tr>
    );
}
