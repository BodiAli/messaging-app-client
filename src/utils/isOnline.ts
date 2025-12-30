export default function isOnline(isoDateString: string): boolean {
  const dateTimestamp = new Date(isoDateString).getTime();
  const currentTimestamp = new Date().getTime();
  const difference = currentTimestamp - dateTimestamp;
  const differenceInMinutes = Math.ceil(difference / 1000 / 60);

  return differenceInMinutes <= 5;
}
