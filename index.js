import Service from "./service.js";
import "./elements.js";
import $ from "./dom.js";
import storage from "./storage.js";

const state={
  updating:false
}

window.addEventListener("load", () => {
  setupTabs();
  displaySMScodeEntry();
  getNearby();
  displayStarred();
});

const displayStarred = () =>{
  const stops = storage.getStarred();
  const around = replaceElement(
    document.querySelector(".stops-list"),
    true,
    () => {
      around.querySelectorAll(".stop").forEach(stop => {
        stop.addEventListener("click", ev => {
          displayStop(ev.currentTarget.dataset.stopId);
        });
      });
    }
  );
  stops
    .filter(stop => stop.lines.length)
    .map(renderStopComponent)
    .forEach(around.appendChild.bind(around));
}
const renderAllStarred = ()=>{
  const starredDiv=document.querySelector('#starred');
  let starred=storage.getStarred();
  starred.forEach(stop=>{
    $('test-stop',{textContent:stop},starredDiv);
  })
}

const setupTabs = () => {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", e => {
      selectTab(
        Array.from(e.target.parentElement.children).findIndex(el => el === tab)
      );
    });
  });
  selectTab(0)
};

const selectTab = tab => {
    document.querySelectorAll('.tab').forEach( (tabEl,i)=>{
        if (i===tab){
            tabEl.classList.add('tab-active');
        } else {
            tabEl.classList.remove('tab-active');
        }
    })
    document.querySelectorAll('.tab-item').forEach( (item,i)=>{
        if (i===tab){
            item.classList.remove('hidden')
        } else {
            item.classList.add('hidden');
        }
    })
  };
const fakeLog = s => {
  document.getElementById("console").textContent += `${JSON.stringify(s)}
  `;
};
if (location.search === "?debug") {
  console.log = fakeLog;
  console.error = fakeLog;
  console.warn = fakeLog;
}
let code = "";

const displayStopBySmsCode = code => {
  
  Service.getStopID(code)
    .then(res => {
      const id = res.id;
      // Service.getStopInfo(id).then(console.log);
      showArrivalsAtStop(res);
    })
    .catch(err => {
      // TODO send info that bad code
      console.log({
        err
      });
    });
};

const displayStop = code => {
  state.updating=false;
  const arrivalElement=document.querySelector('#arrivals');
  arrivalElement.textContent="Loading arrivals at stop "+code;
  Service.getStopInfo(code).then(res => {
    const id = res.id;
    Service.getStopInfo(id).then(console.log);
    showArrivalsAtStop(res);
  });
};

const updateCode = () => {
  for (let i = 1; i < 6; i++) {
    const el = document.getElementById("code" + i);
    let digit = code[i - 1];
    if (typeof digit == "undefined") digit = "";
    el.innerText = digit;
  }
};

const displaySMScodeEntry = () => {
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
      updateCode();
    }
  });
  
};

const getTemplate = id =>
  document.getElementById(id).cloneNode(true).content.firstElementChild;

const renderStopComponent = stop =>
  $("bus-stop", {
    dataset: {
      stop: JSON.stringify(stop)
    }
  });

const replaceElement = (orignal, cloneDeep = true, cb) => {
  const el = orignal.cloneNode(cloneDeep);
  window.requestAnimationFrame(() => {
    orignal.replaceWith(el);
    if (cb) cb();
  });
  return el;
};

const getNearby = () => {
  Service.getStopsWithinRadius(500)
    .then(stops => {
      const around = replaceElement(
        document.querySelector(".around"),
        true,
        () => {
          around.querySelectorAll(".stop").forEach(stop => {
            stop.addEventListener("click", ev => {
              displayStop(ev.currentTarget.dataset.stopId);
            });
          });
        }
      );
      stops
        .filter(stop => stop.lines.length)
        .map(renderStopComponent)
        .forEach(around.appendChild.bind(around));
    })
    .catch(reason => {
      console.log(reason);
    });
};

const showArrivalsAtStop = stopInfo => {
  Service.getArrivailAtStopID(stopInfo.id).then(arr => {
    const processed = Service.sortByArrivalTime(arr);
    stopInfo.timestamp = Date.now();
    stopInfo.linesExcluded = stopInfo.linesExcluded || [];
    renderResultsComponent(stopInfo, processed);
    setInterval(updateTimes, 1000);
    state.updating=true;
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

const stopLetterCorrected = stopLetter => (stopLetter || "-").replace("->", "");

const renderResultsComponent = (stopInfo, arrivals) => {
  const arrivalsOrig = document.getElementById("arrivals");
  const arrivalsNew = arrivalsOrig.cloneNode(false);
  const el = getTemplate("template-results");
  el.querySelector(".letter").textContent = stopLetterCorrected(
    stopInfo.stopLetter
  );
  el.querySelector(".stop-name").textContent = stopInfo.name;
  if (stopInfo.towards) {
    el.querySelector(".stop-towards").textContent =
      "towards " + stopInfo.towards;
  }
  if (storage.isStarred(stopInfo.id)){
    el.querySelector('.make-favourite').classList.add('starred');
  }
  // const lineTemplate = getTemplate('template-line');
  const linesDiv = el.querySelector(".lines");
  stopInfo.lines.forEach(line => {
    const lineElement = document.createElement("bus-line");
    if (stopInfo.linesExcluded.includes(line)) {
      lineElement.setAttribute("excluded", true);
    }
    lineElement.setAttribute("line", line);
    linesDiv.appendChild(lineElement);
  });
  el.querySelector(
    ".updated-at"
  ).textContent = Service.extractTimeFromISODateString(stopInfo.timestamp);
  const updatedAgo = el.querySelector(".updated-ago");
  updatedAgo.dataset.updatedAgo = stopInfo.timestamp;
  updatedAgo.textContent = Service.secondsToTime(
    ((Date.now() - stopInfo.timestamp) / 1000) >> 0
  );

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
      renderResultsComponent(stopInfo, arrivals);
    }
  });
  el.querySelector('.make-favourite').addEventListener('click',()=>{
    console.log(storage.toggleStarred(stopInfo));
  })
  el.querySelector(".update").addEventListener("click", () => {
    showArrivalsAtStop(stopInfo);
  });
  arrivalsNew.appendChild(el);
  window.requestAnimationFrame(() => {
    arrivalsOrig.replaceWith(arrivalsNew);
  });
};
renderAllStarred();
storage.test();
