import {
  getCountries,
  getCountry,
  getCountriesByRegion,
} from "./api-manager.js";
import * as comp from "./components.js";

const themeToggler = document.querySelector(".theme-toggler");

if (localStorage.getItem("theme") != null) {
  const root = document.querySelector(":root");
  root.classList.add(localStorage.getItem("theme"));
  themeToggler.children[0].classList.replace("fa-moon", "fa-sun");
  themeToggler.children[1].innerText = "Light Mode";
}

const countriesContainer = document.querySelector(".countries");

comp.toggleLoadingSpinner();

const countriesArray = await getCountries();
await showCountries(countriesArray);
comp.toggleLoadingSpinner();

function createCountryElement(countryObj) {
  const countryDiv = document.createElement("div");
  countryDiv.classList.add(
    "country",
    "relative",
    "bg-white",
    "shadow-lg",
    "shadow-neutral-200",
    "rounded-lg",
    "max-w-[350px]",
    "min-h-[470px]",
    "overflow-hidden",
    "before:transition-all",
    "before:duration-400",
    "before:bg-opacity-0",
    "before:absolute",
    "before:w-full",
    "before:h-full",
    "before:z-10",
    "hover:before:bg-gray-500",
    "hover:before:bg-opacity-60",
    "hover:cursor-pointer",
    "dark:text-white",
    "dark:bg-[#2b3945]",
    "dark:shadow-md"
  );
  const flag = document.createElement("img");
  flag.src = countryObj.flags.svg;
  flag.alt = "Country Flag";
  flag.title = "Flag of " + countryObj.name.common;
  flag.classList.add("w-full", "h-[270px]", "object-cover", "rounded-t-lg");

  const countryDetailsContainer = document.createElement("div");
  countryDetailsContainer.classList.add("country-details", "pl-7", "pb-14");

  const countryName = document.createElement("h2");
  countryName.classList.add("text-2xl", "font-bold", "my-5");
  countryName.innerText = countryObj.name.common;

  const countryInfo = document.createElement("div");

  const para1 = document.createElement("p");
  const para2 = document.createElement("p");
  const para3 = document.createElement("p");
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  const span3 = document.createElement("span");

  span1.classList.add("font-semibold");
  span2.classList.add("font-semibold");
  span3.classList.add("font-semibold");
  span1.innerText = "Population: ";
  span2.innerText = "Region: ";
  span3.innerText = "Captial: ";

  para1.append(span1);
  para2.append(span2);
  para3.append(span3);
  para1.append(countryObj.population.toLocaleString("en-US"));
  para2.append(countryObj.region);
  para3.append(countryObj.capital);

  countryInfo.appendChild(para1);
  countryInfo.appendChild(para2);
  countryInfo.appendChild(para3);

  countryDetailsContainer.appendChild(countryName);
  countryDetailsContainer.appendChild(countryInfo);

  countryDiv.appendChild(flag);
  countryDiv.appendChild(countryDetailsContainer);

  countriesContainer.appendChild(countryDiv);
}

function showCountries(countriesArray) {
  return new Promise(async (resolve) => {
    for (let country of countriesArray) {
      createCountryElement(country);
    }
    resolve();
  });
}

//Search tool
let gotResultsBefore = false;
let searchResults = [];
const noResultsText = document.createElement("p");
noResultsText.innerText = "No such country was found.";
noResultsText.setAttribute("hidden", "true");
countriesContainer.appendChild(noResultsText);

const searchInput = document.querySelector(".search-box input");

searchInput.addEventListener("keypress", async function (event) {
  if (event.key === "Enter") {
    //add loading spinner
    comp.toggleLoadingSpinner();

    event.preventDefault();
    const countryObj = await getCountry(searchInput.value);
    console.log(countryObj);
    if (countryObj !== undefined) {
      noResultsText.setAttribute("hidden", "true");
      if (gotResultsBefore == false) {
        //hide all countries
        changeVisibiltyOfCountries(true);
        //show the countries we searched for
        let countryElements = changeVisibiltyOfCountries(false, [
          countryObj.name.common,
        ]);
        searchResults.push(...countryElements);
        gotResultsBefore = true;
      } else {
        //hide old search result
        changeVisibiltyOfCountries(false, null, [searchResults.pop()]);
        let countryElements = changeVisibiltyOfCountries(false, [
          countryObj.name.common,
        ]);
        searchResults.push(...countryElements);
      }
    } else {
      changeVisibiltyOfCountries(true);
      noResultsText.removeAttribute("hidden");
    }
    //remove loading spinner
    comp.toggleLoadingSpinner();
  }
});

searchInput.addEventListener("change", (ev) => {});

function changeVisibiltyOfCountries(
  toggleAll,
  countryNamesToToggle = [],
  countryElementsToToggle = []
) {
  if (toggleAll === true) {
    const countries = document.querySelectorAll(".country");
    countries.forEach((country) => {
      country.setAttribute("hidden", "true");
    });
  } else {
    if (countryNamesToToggle !== null && countryNamesToToggle.length != 0) {
      console.log(countryElementsToToggle);
      let returnCountries = [];
      countryNamesToToggle.forEach((countryName) => {
        const xpath = `//h2[text()="${countryName}"]`;
        const countryEl = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue.parentElement.parentElement;
        countryEl.removeAttribute("hidden");
        returnCountries.push(countryEl);
      });
      console.log("returnCountries = ");
      console.log(returnCountries);
      return returnCountries;
    } else if (
      countryElementsToToggle !== null &&
      countryElementsToToggle.length != 0
    ) {
      countryElementsToToggle.forEach((country) => {
        country.setAttribute("hidden", "true");
      });
    }
  }
}

//Filter tool
const filterP = document.querySelector(".filter-box p");
const regionsContainer = document.querySelector(".filter-box .regions");
const regions = document.querySelectorAll(".filter-box .regions li");
filterP.addEventListener("click", () =>
  regionsContainer.classList.toggle("hidden")
);

regions.forEach((region) => {
  region.onclick = async () => {
    //add loading spinner
    comp.toggleLoadingSpinner();

    regionsContainer.classList.toggle("hidden");
    filterP.textContent = region.innerText;
    const countries = await getCountriesByRegion(region.dataset.region);
    const countriesNames = countries.map((country) => {
      return country.name.common;
    });
    changeVisibiltyOfCountries(true);
    changeVisibiltyOfCountries(false, countriesNames);
    //remove loading spinner
    comp.toggleLoadingSpinner();
  };
});

//Country details page

countriesContainer.addEventListener("click", async (event) => {
  if (event.target.classList.contains("country")) {
    let param = new URLSearchParams();
    param.append("name", event.target.querySelector(".country h2").textContent);

    window.location.href = "country.html?" + param.toString();
  }
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
