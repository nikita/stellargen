const countries = [
  { name: "Random", value: "Random" },
  { name: "US", value: "United States" },
  { name: "CA", value: "Canada" },
  { name: "UK", value: "United Kingdom" },
];

const randomSession = () => {
  const length = 8;
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; i -= 1)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const findCountry = (country) => {
  return countries.find(
    (_country) => _country.name.toLowerCase() === country.toLowerCase()
  ).value;
};

const generateProxy = (country, sticky) => {
  // Your accounts username/pass
  let { STELLAR_PROXY_USERNAME, STELLAR_PROXY_PASSWORD } = process.env;

  // Default http or ssl
  const ssl = "http";
  let protocol = "http";
  let port = 32000;
  let proxyHostname = "p.stellarproxies.com";

  if (ssl === "ssl") {
    protocol = "https";
    port = 31111;
  } else {
    protocol = "http";
    port = 32000;
  }

  // Country exists
  if (country) {
    if (country !== "Random") {
      STELLAR_PROXY_PASSWORD += `_country-${country.replace(/ /g, "")}`;
    }

    if (sticky) STELLAR_PROXY_PASSWORD += `_session-${randomSession()}`;

    return `${protocol}://${proxyHostname}:${port}:${STELLAR_PROXY_USERNAME}:${STELLAR_PROXY_PASSWORD}`;
  } else {
    return false;
  }
};

module.exports = { countries, findCountry, generateProxy };
