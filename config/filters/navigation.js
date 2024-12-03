export default {
  isLinkActive: (category, page) =>
    page.includes(category) &&
    page.split("/").filter((a) => a !== "").length <= 1,
};
