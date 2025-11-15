import React, { useEffect, useState } from "react";
import { toBeautyString } from "../../assets/misc";

export default function Updated({ updated }) {
  const [date, setDate] = useState(new Date());
  function update_time() {
    setDate(new Date());
  }

  useEffect(() => {
    update_time();
    setInterval(() => {
      update_time();
    }, 1000);
  }, []);

  return <div className="">{toBeautyString(new Date(updated), date)}</div>;
}
