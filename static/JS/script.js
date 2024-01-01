var elements = [];

[].forEach.call(document.querySelectorAll(".scroll-to-link"), function (div) {
  div.onclick = function (e) {
    e.preventDefault();
    var target = this.dataset.target;
    document.getElementById(target).scrollIntoView({ behavior: "smooth" });
    var elems = document.querySelectorAll(".content-menu ul li");
    [].forEach.call(elems, function (el) {
      el.classList.remove("active");
    });
    this.classList.add("active");
    return false;
  };
});

document.getElementById("button-menu-mobile").onclick = function (e) {
  e.preventDefault();
  document.querySelector("html").classList.toggle("menu-opened");
};
document.querySelector(".left-menu .mobile-menu-closer").onclick = function (
  e
) {
  e.preventDefault();
  document.querySelector("html").classList.remove("menu-opened");
};

function debounce(func) {
  var timer;
  return function (event) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, 100, event);
  };
}

function calculElements() {
  var totalHeight = 0;
  elements = [];
  [].forEach.call(
    document.querySelectorAll(".content-section"),
    function (div) {
      var section = {};
      section.id = div.id;
      totalHeight += div.offsetHeight;
      section.maxHeight = totalHeight - 25;
      elements.push(section);
    }
  );
  onScroll();
}

function onScroll() {
  var scroll = window.pageYOffset;

  for (var i = 0; i < elements.length; i++) {
    var section = elements[i];
    if (scroll <= section.maxHeight) {
      var elems = document.querySelectorAll(".content-menu ul li");
      [].forEach.call(elems, function (el) {
        el.classList.remove("active");
      });
      var activeElems = document.querySelectorAll(
        ".content-menu ul li[data-target='" + section.id + "']"
      );
      [].forEach.call(activeElems, function (el) {
        el.classList.add("active");
      });
      break;
    }
  }
  if (window.innerHeight + scroll + 5 >= document.body.scrollHeight) {
    // end of scroll, last element
    var elems = document.querySelectorAll(".content-menu ul li");
    [].forEach.call(elems, function (el) {
      el.classList.remove("active");
    });
    var activeElems = document.querySelectorAll(
      ".content-menu ul li:last-child"
    );
    [].forEach.call(activeElems, function (el) {
      el.classList.add("active");
    });
  }
}

calculElements();
window.onload = () => {
  calculElements();
};
window.addEventListener(
  "resize",
  debounce(function (e) {
    e.preventDefault();
    calculElements();
  })
);
window.addEventListener("scroll", function (e) {
  e.preventDefault();
  onScroll();
});
var globalCountryId = 0;
var globalStateId = 0;
async function makeXHRRequest(endPoint, parameters) {
  return new Promise(function (resolve, reject) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        resolve(JSON.parse(xhttp.responseText));
      }
    };
    xhttp.onerror = function () {
      reject({
        status: false,
        error: xhr.statusText,
      });
    };
    xhttp.open("POST", endPoint + parameters);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.setRequestHeader("cache", "no-store");
    xhttp.setRequestHeader("customHeader", "no-store");
    xhttp.send();
  });
}
async function getCountryList() {
  var countryList = await makeXHRRequest(host, "");
  if (countryList.status) {
    var htmlContent = `<option value="" selected disabled>Select Country</option>`;
    countryList.data.forEach(function (e) {
      htmlContent = `${htmlContent} <option value="${e.countryId}">${e.countryName}</option>`;
    });
    document.getElementById("countryList").innerHTML = htmlContent;
  }
}
async function getStateList(countryId) {
  var stateList = await makeXHRRequest(host, countryId);
  if (stateList.status) {
    var htmlContent = `<option value="" selected disabled>Select State</option>`;
    stateList.data.forEach(function (e) {
      htmlContent = `${htmlContent} <option data-countryId="${e.countryId}" value="${e.stateId}">${e.stateName}</option>`;
    });
    document.getElementById("stateList").innerHTML = htmlContent;
  }
}
async function getCityList(countryId, stateId) {
  var cityList = await makeXHRRequest(host, countryId + "/" + stateId);
  if (cityList.status) {
    var htmlContent = `<option value="" selected disabled>Select City</option>`;
    cityList.data.forEach(function (e) {
      htmlContent = `${htmlContent} <option data-countryId="${e.countryId}" data-stateId="${e.stateId}" value="${e.cityId}">${e.cityName}</option>`;
    });
    document.getElementById("cityList").innerHTML = htmlContent;
  }
}
window.onload = () => {
  getCountryList();
  var countryListSelector = document.getElementById("countryList");
  var stateListSelector = document.getElementById("stateList");
  countryListSelector.addEventListener("change", function () {
    let countryId = this.value;
    globalCountryId = countryId;
    document.getElementById(
      "stateList"
    ).innerHTML = `<option value="" selected disabled>Select State</option>`;
    document.getElementById(
      "cityList"
    ).innerHTML = `<option value="" selected disabled>Select City</option>`;
    getStateList(countryId);
  });
  stateListSelector.addEventListener("change", function () {
    let stateId = this.value;
    globalStateId = stateId;
    document.getElementById(
      "cityList"
    ).innerHTML = `<option value="" selected disabled>Select City</option>`;
    getCityList(globalCountryId, stateId);
  });
};
