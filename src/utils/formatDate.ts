const monthsArr = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function assert(val: unknown): asserts val {
  if (!val) throw new Error("Not defined");
}

export default function formatDate(dateString: string) {
  const date = new Date(dateString);
  const monthName = monthsArr[date.getMonth()];
  assert(monthName);
  const dayOfTheMonth = date.getDate().toString();
  const year = date.getFullYear().toString();
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${monthName} ${dayOfTheMonth}, ${year}, ${time}`;
}
