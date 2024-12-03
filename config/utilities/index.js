export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
};

export const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export const getCountryName = (countryCode) =>
  regionNames.of(countryCode.trim()) || countryCode.trim();

export const parseCountryField = (countryField) => {
  if (!countryField) return null;

  const delimiters = [",", "/", "&", "and"];
  let countries = [countryField];

  delimiters.forEach((delimiter) => {
    countries = countries.flatMap((country) => country.split(delimiter));
  });

  return countries.map(getCountryName).join(", ");
};
