import getUnicodeFlagIcon from "country-flag-icons/unicode";
import Updated from "./UpdatedTime";
const lookup = require("country-code-lookup");
import { Td } from "../../assets/misc";
import { BsStarFill } from "react-icons/bs";
import { ImClock2 } from "react-icons/im";
import ServerURL from "./ServerURL";

export default function ServerDisplay({ server, grid = false }) {
  const server_speed_color =
    server.response_time < 1000
      ? "bg-green-500"
      : server.response_time < 3000
      ? "bg-orange-500"
      : "bg-red-500";

  const proto = server.url.split(":")[0];

  if (grid)
    return (
      <div className="server p-3">
        <div className="shadow-md rounded-md overflow-hidden bg-white border">
          <div className="flex items-center justify-center bg-gray-200 p-3">
            <div className="font-bold text-lg text-gray-800 flex items-center justify-between gap-4 w-full">
              <div>
                <span className="uppercase text-sm bg-blue-500 rounded-md py-1 px-2 text-white block">
                  {proto}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {getUnicodeFlagIcon(lookup.byIso(server.geo).iso2)}
                </div>
                <div className="font-bold">
                  {lookup.byIso(server.geo).country}
                </div>
              </div>
              <div>
                <span
                  className={`text-sm ${server_speed_color} rounded-md py-1 px-2 text-white block`}
                >
                  {server.response_time} ms
                </span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 h-1">
            <div
              className={`${server_speed_color} h-1`}
              style={{
                width: `${server.speed_score}%`,
              }}
            ></div>
          </div>
          <div className="p-1">
            <table className="w-full text-left">
              <tbody>
                <tr>
                  <Td colSpan={4} className="border-none">
                    <ServerURL url={server.url} />
                  </Td>
                </tr>
                <tr>
                  <Td className="border-none">
                    <div className="uppercase flex items-center gap-3 justify-center">
                      <span className="text-blue-500">
                        <BsStarFill />
                      </span>
                      <span>{server.streak}</span>
                    </div>
                  </Td>
                  <Td className="border-none">
                    <div className="flex items-center gap-2 text-gray-600 justify-center">
                      <ImClock2 />
                      <Updated updated={server.last_checked} />
                    </div>
                  </Td>
                </tr>
              </tbody>
            </table>
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
            <div className="text-3xl">
              {getUnicodeFlagIcon(lookup.byIso(server.geo).iso2)}
            </div>
            <div className="font-bold">{lookup.byIso(server.geo).country}</div>
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
