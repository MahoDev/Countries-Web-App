import * as comp from "./components.js";
import { getCountry, getCountryByCountryCode } from "./api-manager.js";

const themeToggler = document.querySelector(".theme-toggler");
if (localStorage.getItem("theme") != null) {
  const root = document.querySelector(":root");
  root.classList.add(localStorage.getItem("theme"));
  themeToggler.children[0].classList.replace("fa-moon", "fa-sun");
  themeToggler.children[1].innerText = "Light Mode";
}

comp.toggleLoadingSpinner();

const queryParams = new URLSearchParams(location.search);
const countryName = queryParams.get("name");
location.searc;
let countryDataObj = await getCountry(countryName);

const countryContainer = document.querySelector(".details-section");
const country = document.createElement("div");
country.innerHTML = `
      <div class="country-info-container mt-14 flex gap-20 lg-max:flex-col dark:text-white ">
        <div class="image max-w-[500px] max-h-[400px] lg-max:self-center shadow-2xl">
          <img
            class="w-full h-full object-cover"
            src="${countryDataObj.flags.svg}"
            alt="country flag"
            title="Flag of ${countryDataObj.name.common}"
          />
        </div>
        <div class="w-[calc(100%-580px)] lg-max:w-full">
          <h2 class="text-2xl font-bold my-5 w-fit">${
            countryDataObj.name.common
          }</h2>
          <div class="text-info flex flex-wrap justify-between">
            <div class="left">
              <p class="mb-1">
                <span class="font-semibold">Native Name: </span>${
                  countryDataObj.name.nativeName[
                    Object.keys(countryDataObj.name.nativeName)[0]
                  ].official
                }
              </p>
              <p class="mb-1">
                <span class="font-semibold">Population: </span>${countryDataObj.population.toLocaleString(
                  "en-US"
                )}
              </p>
              <p class="mb-1"><span class="font-semibold">Region: </span>${
                countryDataObj.region
              }</p>
              <p class="mb-1">
                <span class="font-semibold">Sub Region: </span>${
                  countryDataObj.subregion
                }
              </p>
              <p class="mb-1"><span class="font-semibold">Capital: </span>${
                countryDataObj.capital
              }</p>
            </div>
            <div class="right">
              <p class="mb-1">
                <span class="font-semibold">Top Level Domain: </span>${
                  countryDataObj.tld == undefined
                    ? "None"
                    : countryDataObj.tld.join()
                }
              </p>
              <p class="mb-1">
                <span class="font-semibold">Currencies: </span>${Object.keys(
                  countryDataObj.currencies
                )
                  .map((val) => countryDataObj.currencies[val].name)
                  .join()}
              </p>
              <p class="mb-1">
                <span class="font-semibold">Languages: </span>${Object.keys(
                  countryDataObj.languages
                )
                  .map((val) => countryDataObj.languages[val])
                  .join()}
              </p>
            </div>
          </div>
          <div class=" flex flex-wrap items-center mt-16">
            <h3 class="font-semibold mr-4">Border Countries:</h3>
            <div class="flex gap-4 flex-wrap">
              ${
                countryDataObj.borders == undefined
                  ? "No Borders"
                  : (
                      await Promise.all(
                        countryDataObj.borders.map(async (val) => {
                          return `
                <div
                  class="border-country relative w-fit justify-center items-center overflow-hidden rounded-md bg-white px-5 py-1 drop-shadow-lg before:transition-all before:duration-300 before:bg-opacity-0 before:absolute before:w-full before:h-full before:top-0 before:left-0 before:z-10 before:bg-gray-400 hover:before:bg-opacity-60 hover:cursor-pointer dark:bg-[#2b3945]"
                >
                  ${(await getCountryByCountryCode(val)).name.common}
                </div>`;
                        })
                      )
                    ).join("")
              }
            </div>
          </div>
        </div>
      </div>
`;

countryContainer.appendChild(country);

comp.toggleLoadingSpinner();

//back button click
const backBtn = document.querySelector(".back-btn");
backBtn.onclick = () => {
  location.href = "index.html";
};

// handling click on border countries
const borderCountries = document.querySelectorAll(".border-country");
borderCountries?.forEach((borderCountry) => {
  borderCountry.onclick = () => {
    // comp.toggleLoadingSpinner();

    let param = new URLSearchParams();
    param.append("name", borderCountry.innerText);
    window.location.href = "country.html?" + param.toString();
  };
});

//handling dark mode
themeToggler.onclick = () => {
  const root = document.querySelector(":root");
  root.classList.toggle("dark");
  if (root.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeToggler.children[0].classList.replace("fa-moon", "fa-sun");
    themeToggler.children[1].innerText = "Light Mode";
  } else {
    localStorage.removeItem("theme");
    themeToggler.children[0].classList.replace("fa-sun", "fa-moon");
    themeToggler.children[1].innerText = "Dark Mode";
  }
};
