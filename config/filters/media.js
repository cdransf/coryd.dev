export default {
  filterBooksByStatus: (books, status) =>
    books.filter((book) => book["status"] === status),
  findFavoriteBooks: (books) =>
    books.filter((book) => book["favorite"] === true),
  bookYearLinks: (years) =>
    years
      .sort((a, b) => b["value"] - a["value"])
      .map(
        (year, index) =>
          `<a href="/books/years/${year["value"]}">${year["value"]}</a>${
            index < years.length - 1 ? " / " : ""
          }`
      )
      .join(""),
  mediaLinks: (data, type, count = 10) => {
    if (!data || !type) return "";

    const dataSlice = data.slice(0, count);
    if (dataSlice.length === 0) return null;

    const buildLink = (item) => {
      switch (type) {
        case "genre":
          return `<a href="${item["genre_url"]}">${item["genre_name"]}</a>`;
        case "artist":
          return `<a href="${item["url"]}">${item["name"]}</a>`;
        case "book":
          return `<a href="${item["url"]}">${item["title"]}</a>`;
        default:
          return "";
      }
    };

    if (dataSlice.length === 1) return buildLink(dataSlice[0]);

    const links = dataSlice.map(buildLink);
    const allButLast = links.slice(0, -1).join(", ");
    const last = links[links.length - 1];

    return `${allButLast} and ${last}`;
  },
};
