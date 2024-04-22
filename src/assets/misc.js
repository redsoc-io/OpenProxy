function toBeautyString(then, now) {
  var nowdate = now || new Date();
  var thendate = then;

  //finding the human-readable components of the date.

  var y = nowdate.getFullYear() - thendate.getFullYear();
  var m = nowdate.getMonth() - thendate.getMonth();
  var d = nowdate.getDate() - thendate.getDate();
  var h = nowdate.getHours() - thendate.getHours();
  var mm = nowdate.getMinutes() - thendate.getMinutes();
  var s = nowdate.getSeconds() - thendate.getSeconds();

  //back to second grade math, now we must now 'borrow'.

  if (s < 0) {
    s += 60;
    mm--;
  }
  if (mm < 0) {
    mm += 60;
    h--;
  }
  if (h < 0) {
    h += 24;
    d--;
  }
  if (d < 0) {
    //here's where we take into account variable month lengths.

    var a = thendate.getMonth();
    var b;
    if (a <= 6) {
      if (a == 1) b = 28;
      else if (a % 2 == 0) b = 31;
      else b = 30;
    } else if (b % 2 == 0) b = 30;
    else b = 31;

    d += b;
    m--;
  }
  if (m < 0) {
    m += 12;
    y--;
  }

  return `
            ${y > 0 ? `${y}y` : ""}
            ${m > 0 ? `${m}M` : ""}
            ${d > 0 ? `${d}d` : ""}
            ${h > 0 ? `${h}h` : ""}
            ${mm > 0 ? `${mm}m` : ""}
            ${s > 0 ? `${s}s` : ""}
            ago
            `;
}

function Th(props) {
  const { children, className } = props;
  return (
    <th {...props} className={`border border-slate-300 ${className || ""}`}>
      <div className="p-2">{children}</div>
    </th>
  );
}
function Td(props) {
  const { children, className } = props;
  return (
    <td {...props} className={`border border-slate-300 ${className || ""}`}>
      <div className="p-2">{children}</div>
    </td>
  );
}

module.exports = {
  toBeautyString,
  Th,
  Td,
};
