export default {
  stringToRFC822Date: (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "";

    const options = {
      timeZone: "America/Los_Angeles",
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
  },
  stringToRFC3339: (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "";

    const options = { timeZone: "America/Los_Angeles" };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const tzDate = new Date(
      date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
    );

    return tzDate.toISOString();
  },
};
