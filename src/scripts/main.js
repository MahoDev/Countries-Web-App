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
const noResultsText = document.querySelector(".no-results-text");
const searchInput = document.querySelector(".search-box input");

async function searchHandler(event, type) {
  //add loading spinner
  noResultsText.setAttribute("hidden", "true");

  comp.toggleLoadingSpinner();
  event.preventDefault();
  if (searchInput.value.length === 0) {
    changeVisibiltyOfCountries(false, true);
    noResultsText.setAttribute("hidden", "true");
    comp.toggleLoadingSpinner();
    return;
  }

  const countries = getCountriesStartingWith(searchInput.value);
  changeVisibiltyOfCountries(true);
  changeVisibiltyOfCountries(false, false, null, countries);
  if (countries.length === 0) {
    noResultsText.removeAttribute("hidden");
  }
  comp.toggleLoadingSpinner();
}

function getCountriesStartingWith(text) {
  let resultCountries = [];
  let titleCaseText = text.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  const xpath = `//h2[starts-with(., "${titleCaseText}")]`;
  const countries = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null
  );
  let country = {};
  while (country != null) {
    country = countries.iterateNext()?.parentElement.parentElement;
    if (country != null) {
      resultCountries.push(country);
    }
  }

  return resultCountries;
}

// searchInput.addEventListener("keypress", (event) => {
//   searchHandler(event);
// });

searchInput.addEventListener("keyup", (event) => {
  searchHandler(event);
});

function changeVisibiltyOfCountries(
  hideAll,
  showAll = false,
  countryNamesToShow = [],
  countryElementsToShow = []
) {
  if (hideAll === true) {
    const countries = document.querySelectorAll(".country");
    countries.forEach((country) => {
      country.setAttribute("hidden", "true");
    });
  } else if (showAll === true) {
    const countries = document.querySelectorAll(".country");
    countries.forEach((country) => {
      country.removeAttribute("hidden");
    });
  } else {
    if (countryNamesToShow !== null && countryNamesToShow.length != 0) {
      let returnCountries = [];
      countryNamesToShow.forEach((countryName) => {
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
      return returnCountries;
    } else if (
      countryElementsToShow !== null &&
      countryElementsToShow.length != 0
    ) {
      countryElementsToShow.forEach((country) => {
        country.removeAttribute("hidden");
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
    noResultsText.setAttribute("hidden", "true");

    comp.toggleLoadingSpinner();

    regionsContainer.classList.toggle("hidden");
    filterP.textContent = region.innerText;
    const countries = await getCountriesByRegion(region.dataset.region);
    const countriesNames = countries.map((country) => {
      return country.name.common;
    });
    changeVisibiltyOfCountries(true);
    changeVisibiltyOfCountries(false, false, countriesNames);
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
