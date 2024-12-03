import { DateTime } from "luxon";

export default {
  stringToRFC822Date: (dateString) => {
    const date = DateTime.fromISO(dateString, { zone: "America/Los_Angeles" });

    return date.isValid ? date.toRFC2822() : "";
  },
  stringToRFC3339: (dateString) => {
    const date = DateTime.fromISO(dateString, { zone: "America/Los_Angeles" });

    return date.isValid ? date.toISO() : "";
  },
};
