//This function returns a promise that is created
//implictly during runtime. Its resolved value is
//is either passedData or failObj.
function makeCall(url) {
  const abortController = new AbortController();
  const abortSignal = abortController.signal;
  let failObj = {
    message: "Failed",
    error: "",
  };
  //we wrap in a try block because the server might be down and not return any response, so fetch will
  //throw an error
  try {
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 1000);

    return fetch(url, { signal: abortSignal })
      .then((serverRes) => {
        if (!serverRes.ok) {
          throw new Error(
            "Response not successful. Code: " + serverRes.statusText
          );
        } else {
          return serverRes.json();
        }
      })
      .then((passedData) => {
        return passedData;
      })
      .catch((error) => {
        failObj.error = error;
        return failObj;
      });
  } catch (error) {
    failObj.error = error;
    return failObj;
  }
}

export function getCountries() {
  return makeCall("https://restcountries.com/v3.1/all").then((data) => {
    if (typeof data === "object" && data.message === "Failed") {
      return makeCall("../data/fallback-data.json").then((fallbackData) => {
        return fallbackData;
      });
    } else {
      return data;
    }
  });
}

export function getCountry(countryName) {
  return makeCall(`https://restcountries.com/v3.1/name/${countryName}`).then(
    (data) => {
      if (
        countryName.length < 4 ||
        (typeof data === "object" && data.message === "Failed")
      ) {
        return makeCall("../data/fallback-data.json").then((countries) => {
          const countryObj = countries.find((country) => {
            return (
              country.name.common.toUpperCase() === countryName.toUpperCase()
            );
          });
          return countryObj;
        });
      } else {
        return data[0];
      }
    }
  );
}

export function getCountriesByRegion(region) {
  return makeCall(`https://restcountries.com/v3.1/region/${region}
`).then((data) => {
    if (typeof data === "object" && data.message === "Failed") {
      return makeCall("../data/fallback-data.json").then((countries) => {
        const countriesInRegion = countries.filter((country) => {
          return country.region === region;
        });
        return countriesInRegion;
      });
    } else {
      return data;
    }
  });
}

export function getCountryByCountryCode(code) {
  return makeCall(`https://restcountries.com/v3.1/alpha/${code}
`).then((data) => {
    if (typeof data === "object" && data.message === "Failed") {
      return makeCall("../data/fallback-data.json").then((countries) => {
        const country = countries.find((country) => {
          const countryCodes = [
            country.cca2,
            country.ccn3,
            country.cca3,
            country.cioc,
          ];
          return countryCodes.includes(code);
        });
        return country;
      });
    } else {
      return data[0];
    }
  });
}
