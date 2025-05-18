const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${months[parseInt(month) - 1]} ${day} ${year}`;
}

export function formatSimpleDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${parseInt(month)}/${day}/${year}`;
}
