import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fetchAllNavigation = async () => {
  const { data, error } = await supabase
    .from("optimized_navigation")
    .select("*");

  if (error) {
    console.error("Error fetching navigation data:", error);
    return {};
  }

  const menu = data.reduce((acc, item) => {
    const menuItem = {
      title: item["title"] || item["page_title"],
      permalink: item["permalink"] || item["page_permalink"],
      icon: item["icon"],
      sort: item["sort"],
    };

    if (!acc[item["menu_location"]]) {
      acc[item["menu_location"]] = [menuItem];
    } else {
      acc[item["menu_location"]].push(menuItem);
    }

    return acc;
  }, {});

  Object.keys(menu).forEach((location) => {
    menu[location].sort((a, b) => a["sort"] - b["sort"]);
  });

  return menu;
};

export default async function () {
  try {
    return await fetchAllNavigation();
  } catch (error) {
    console.error("Error fetching and processing navigation data:", error);
    return {};
  }
}
