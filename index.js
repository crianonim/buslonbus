import Service from "./service.js";
import "./elements.js";
import storage from "./storage.js";

import { domElementCreate as $, replaceElement, clearElement } from "./dom.js";

const state = {
  updating: false
};

window.addEventListener("load", () => {
  setupTabs();
  setupNearby();
  renderSMScodeEntry();
  renderStarred();
  renderNearby();
  setInterval(updateTimes, 1000);
});

// Show console.log messages in browser window
const mobileLog = s => {
  document.getElementById("console").textContent += `${JSON.stringify(s)}
  `;
};
if (location.search === "?debug") {
  console.log = mobileLog;
}

const renderStopList = (stops, elSelector) => {
  const el = replaceElement(document.querySelector(elSelector), false, () => {
    el.querySelectorAll(".stop").forEach(stop => {
      stop.addEventListener("click", ev => {
        renderStop(ev.currentTarget.dataset.stopId);
      });
    });
  });
  const sortBy = localStorage.getItem("sortBy");

  (sortBy == "alpha" ? stops.sort((a, b) => a.stopLetter > b.stopLetter ? 1 : -1) : stops)
    .map(x => { console.log(x); return x })
    .filter(stop => stop.lines.length)
    .map(renderStopListComponent)
    .forEach(el.appendChild.bind(el));
};

// TABS
const setupTabs = () => {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", e => {
      selectTab(
        Array.from(e.currentTarget.parentElement.children).findIndex(el => el === tab)
      );
    });
  });
  selectTab(0);
};

const selectTab = tab => {
  document.querySelectorAll(".tab").forEach((tabEl, i) => {
    if (i === tab) {
      tabEl.classList.add("tab-active");
    } else {
      tabEl.classList.remove("tab-active");
    }
  });
  document.querySelectorAll(".tab-item").forEach((item, i) => {
    if (i === tab) {
      item.classList.remove("hidden");
    } else {
      item.classList.add("hidden");
    }
  });
};

// DIAL SMS CODE section

let code = "";

const displayStopBySmsCode = code => {
  Service.getStopID(code)
    .then(res => {
      const id = res.id;
      // Service.getStopInfo(id).then(console.log);
      renderStopArrivals(res);
    })
    .catch(err => {
      // TODO send info that bad code
      console.log({
        err
      });
    });
};

const updateSMSCode = () => {
  for (let i = 1; i < 6; i++) {
    const el = document.getElementById("code" + i);
    let digit = code[i - 1];
    if (typeof digit == "undefined") digit = "";
    el.innerText = digit;
  }
};

const renderSMScodeEntry = () => {
  document.getElementById("digits").addEventListener("click", ev => {
    if (ev.target.classList.contains("digit")) {
      const digit = ev.target.textContent;
      if (digit === "X") {
        code = "";
      } else if (digit === "<") {
        if (code.length > 0) {
          code = code.substr(0, code.length - 1);
        }
      } else {
        if (code.length < 5) {
          code += digit;
          if (code.length === 5) {
            displayStopBySmsCode(code);
          }
        }
      }
      updateSMSCode();
    }
  });
};

const getTemplate = id =>
  document.getElementById(id).cloneNode(true).content.firstElementChild;

const renderStopListComponent = stop =>
  $("bus-stop", {
    dataset: {
      stop: JSON.stringify(stop),
      starred: storage.isStarred(stop),
    }
  });

const setupNearby = () => {
  document.querySelector('.nearby-btn').addEventListener('click', renderNearby);
  const abc = document.querySelector('button.sort-ABC')
  const isABC = localStorage.getItem("sortBy") == "alpha"
  if (isABC) abc.classList.add("inverse");
  abc.addEventListener('click', () => {
    const isABC = localStorage.getItem("sortBy") == "alpha"
    if (isABC) abc.classList.remove("inverse")
    else abc.classList.add("inverse");
    localStorage.setItem("sortBy", isABC ? "normal" : "alpha")
    renderNearby();
  })
}
const renderNearby = () => {
  document.querySelector('.around-list').textContent = "Loading stops nearby...";
  Service.getStopsWithinRadius(500)
    .then(stops => {
      renderStopList(stops, ".around-list");
    })
    .catch(reason => {
      console.log(reason);
    });
};

// ARRIVALS STOP

const renderStop = code => {
  state.updating = false;
  const arrivalElement = document.querySelector("#arrivals");
  arrivalElement.textContent = "Loading arrivals at the bus stop"
  Service.getStopInfo(code).then(res => {
    renderStopArrivals(res);
  });
};

const renderStopArrivals = stopInfo => {
  Service.getArrivailAtStopID(stopInfo.id).then(arr => {
    const processed = Service.sortByArrivalTime(arr);
    stopInfo.timestamp = Date.now();
    stopInfo.linesExcluded = stopInfo.linesExcluded || [];
    renderUpdatingArrivalsComponent(stopInfo, processed);
    state.updating = true;
    window.scrollTo(0, 0);
  });
};

const updateTimes = () => {
  if (!state.updating) return;
  document.querySelectorAll(".time-to-station").forEach(el => {
    const time = el.parentElement.parentElement.dataset.arrivalTime;
    const difference = Service.timeDifference(new Date(), time);
    el.textContent = Service.secondsToTime(difference);
  });
  const ago = document.querySelector(".updated-ago");
  ago.textContent = Service.secondsToTime(
    ((Date.now() - ago.dataset.updatedAgo) / 1000) >> 0
  );
};

const renderUpdatingArrivalsComponent = (stopInfo, arrivals) => {
  const arrivalsNew = replaceElement(
    document.getElementById("arrivals"),
    false
  );

  const el = getTemplate("template-results");

  el.querySelector(".letter").textContent = stopInfo.stopLetter;
  el.querySelector(".stop-name").textContent = stopInfo.name;
  if (stopInfo.towards) {
    el.querySelector(".stop-towards").textContent =
      "towards " + stopInfo.towards;
  }

  if (storage.isStarred(stopInfo)) {
    el.querySelector(".make-favourite").classList.add("starred");
  }

  renderLineNumbers(el, stopInfo);

  renderUpdateTimesInArrivals(el, stopInfo);

  renderUpdatingArrivalsListComponent(el, stopInfo, arrivals);

  activateBusLinesToggle(el, stopInfo, arrivals);

  el.querySelector(".make-favourite").addEventListener("click", () => {
    console.log(storage.toggleStarred(stopInfo));
    renderStarred();
    renderStopArrivals(stopInfo);
  });
  el.querySelector(".update").addEventListener("click", () => {
    renderStopArrivals(stopInfo);
  });
  el.querySelector(".close-stop-btn").addEventListener("click", closeButtonHandler);
  arrivalsNew.appendChild(el);
};

const renderLineNumbers = (el, stopInfo) => {
  const linesDiv = el.querySelector(".lines");
  stopInfo.lines.forEach(line => {
    const lineElement = document.createElement("bus-line");
    if (stopInfo.linesExcluded.includes(line)) {
      lineElement.setAttribute("excluded", true);
    }
    lineElement.setAttribute("line", line);
    linesDiv.appendChild(lineElement);
  });
};

const renderUpdateTimesInArrivals = (el, stopInfo) => {
  el.querySelector(
    ".updated-at"
  ).textContent = Service.extractTimeFromISODateString(stopInfo.timestamp);
  const updatedAgo = el.querySelector(".updated-ago");
  updatedAgo.dataset.updatedAgo = stopInfo.timestamp;
  updatedAgo.textContent = Service.secondsToTime(
    ((Date.now() - stopInfo.timestamp) / 1000) >> 0
  );
};

const renderUpdatingArrivalsListComponent = (el, stopInfo, arrivals) => {
  const arrivalsDiv = el.querySelector(".arrivals");
  arrivals
    .filter(arr => !stopInfo.linesExcluded.includes(arr.lineName))
    .map(arrival => {
      //to be moved to Service
      arrival.timeToStation = Service.secondsToTime(
        Service.timeDifference(new Date(), arrival.expectedArrival)
      );
      arrival.arrivalTime = Service.extractTimeFromISODateString(
        arrival.expectedArrival
      );
      const arrivalElement = document.createElement("bus-arrival");
      arrivalElement.dataset.arrivalTime = arrival.expectedArrival;
      arrivalElement.setAttribute("arrival", JSON.stringify(arrival));

      return arrivalElement;
    })
    .forEach(arrivalElement => arrivalsDiv.appendChild(arrivalElement));
};

const activateBusLinesToggle = (el, stopInfo, arrivals) => {
  el.querySelector(".lines").addEventListener("click", ev => {
    if (ev.target.tagName === "BUS-LINE") {
      let lineName = ev.target.getAttribute("line");
      if (stopInfo.linesExcluded.includes(lineName)) {
        stopInfo.linesExcluded = stopInfo.linesExcluded.filter(
          el => el != lineName
        );
      } else {
        stopInfo.linesExcluded.push(lineName);
      }
      renderUpdatingArrivalsComponent(stopInfo, arrivals);
    }
  });
};

const closeButtonHandler = () => {
  state.updating = false;
  clearElement(document.querySelector('#arrivals'));
}

// starred
const renderStarred = () => {

  renderStopList(storage.getStarred(), ".stops-list");
};

// storage.test();
