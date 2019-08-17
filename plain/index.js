import Service from "./service.js";

window.addEventListener("load", () => {
  displaySMScodeEntry();
  getNearby();
});


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

function displayStopBySmsCode(code) {
  Service.getStopID(code).then(res => {
      const id = res.id;
      Service.getStopInfo(id).then(console.log);
      showArrivalsAtStop(res);
  }).catch(err=>{
    // TODO send info that bad code
    console.log({err});
  });
}
function displayStop(code) {
  Service.getStopInfo(code).then(res => {
    const id = res.id;
    Service.getStopInfo(id).then(console.log);
    showArrivalsAtStop(res);
  });
}
function updateCode() {
  for (let i = 1; i < 6; i++) {
    const el = document.getElementById("code" + i);
    let digit = code[i - 1];
    if (typeof digit == "undefined") digit = "";
    el.innerText = digit;
  }
}
function displaySMScodeEntry() {
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
            // console.log("HAVE")
            displayStopBySmsCode(code);
          }
        }
      }
      updateCode();
    }
  });
  document.getElementById("smsCodeToggle").addEventListener("click", () => {
    document.getElementById("code").classList.toggle("hidden");
    document.getElementById("digits").classList.toggle("hidden");
  });
}

const getTemplate = (id) => document.getElementById(id).cloneNode(true).content.firstElementChild;

const renderStopComponent = (stop) => {
  const el=getTemplate('template-stop'); 
  el.querySelector('.stop-name').textContent=stop.name;
  el.querySelector('.letter').textContent=stopLetterCorrected(stop.stopLetter)
  el.dataset.stopId=stop.id;
  if (stop.towards){
    el.querySelector('.stop-towards').textContent="-> "+stop.towards;
  }
  el.querySelector('.stop-lines').textContent=stop.lines.join(", ");
  return el;
}

// function renderStop(stop) {
//   return !stop.lines.length
//     ? ""
//     : `
//     <div class='stop' data-stop-id='${stop.id}'>
//      <span class='letter'>${(stop.stopLetter || "-").replace("->", "")}</span>
//      <div class='stop-main-info'>
//       <span>
//        <span class='stop-name'>${stop.name}</span>
//        ${stop.towards?` towards ${stop.towards}`:`` } 
//       </span>
//       <span>${stop.lines.join(", ")}</span>
//     </div>
//     </div>
//        `;
// }
function getNearby() {
  Service.getStopsWithinRadius(500)
    .then(stops => {
      const aroundOrig = document.querySelector(".around");
      const around = aroundOrig.cloneNode(true);
      console.log(around);
      stops.filter(stop=>stop.lines.length)
       .map(renderStopComponent)
       .forEach(around.appendChild.bind(around));
      
      // around.innerHTML = `
      //   <div class='around'>
      //    <div class='around-header'>Nearby Bus stops</div>
      //    ${stops.map(renderStop).join("")}
      //   </div>
      //  `;
      around.querySelectorAll(".stop").forEach(stop => {
        stop.addEventListener("click", ev => {
          displayStop(ev.currentTarget.dataset.stopId);
          // console.log("Clicked on id", ev.currentTarget.dataset.stopId)
        });
      });
      window.requestAnimationFrame(()=>{
        aroundOrig.replaceWith(around);
      })
    })
    .catch(reason => {
      console.log(reason);
    });
}

function showArrivalsAtStop(stopInfo) {
  const id = stopInfo.id;
  Service.getArrivailAtStopID(id).then(arr => {
    const processed = Service.sortByArrivalTime(arr);
    processed.forEach(el => {
      // console.log(`${el.expectedArrival} ${el.lineName} ${el.destinationName}`);
    });
    stopInfo.timestamp = Date.now();
    stopInfo.linesExcluded = stopInfo.linesExcluded || [];
    renderResultsComponent(stopInfo, processed);
    setInterval(updateTimes, 1000);
  });
}
function updateTimes() {
  document.querySelectorAll(".time-to-station").forEach(el => {
    const time = el.dataset.arrivalTime;
    const difference = Service.timeDifference(new Date(), time);
    el.textContent = Service.secondsToTime(difference);
    // console.log(time);
  });
  const ago = document.querySelector(".updated-ago");
  ago.textContent = Service.secondsToTime(
    ((Date.now() - ago.dataset.updatedAgo) / 1000) >> 0
  );
}
// WIP
function renderLine(el){
    return `
    <span class='line'>${el}</span>
    `
}
const stopLetterCorrected = (stopLetter) =>(stopLetter || "-").replace("->", "");

const renderResultsComponent = (stopInfo, arrivals) =>{
  const arrivalsOrig=document.getElementById('arrivals');
  const arrivalsNew=arrivalsOrig.cloneNode(false);
  const el=getTemplate('template-results');
  el.querySelector('.letter').textContent=stopLetterCorrected(stopInfo.stopLetter);
  el.querySelector('.stop-name').textContent=stopInfo.name;
  if (stopInfo.towards) {
    el.querySelector('.stop-towards').textContent="towards "+stopInfo.towards
  }
  const lineTemplate=getTemplate('template-line');
  const linesDiv=el.querySelector('.lines');
  stopInfo.lines.map(line=>{
    const lineElement=lineTemplate.cloneNode(false);
    if (stopInfo.linesExcluded.includes(line)){
      lineElement.classList.add('excluded');
    }
    lineElement.textContent=line;
    linesDiv.appendChild(lineElement);
  })
  el.querySelector('.updated-at').textContent=Service.extractTimeFromISODateString(stopInfo.timestamp)
  const updatedAgo=el.querySelector('.updated-ago');
  updatedAgo.dataset.updatedAgo=stopInfo.timestamp;
  updatedAgo.textContent=Service.secondsToTime(((Date.now() - stopInfo.timestamp) / 1000) >> 0)
  arrivalsNew.appendChild(el);
  window.requestAnimationFrame(()=>{
    arrivalsOrig.replaceWith(arrivalsNew);
  })

}
function renderResults(stopInfo, arrivals) {
  let s = `<div class='results'>
  <div class='stop-info'>
  <div class='stop-title-line'>
  <span class='letter'>${stopInfo.stopLetter.replace("->", "")}</span>
       <div class='stop-title-text'> 
        <span class='stop-name'>${stopInfo.name}</span>
        <span class='stop-towards'> towards ${stopInfo.towards} </span>
        </div>
        <div class='make-favourite'> + </div>
        </div>
   <div class='lines'>`;
  stopInfo.lines.forEach(el => {
    let isExcluded = stopInfo.linesExcluded.includes(el) ? "excluded" : "";
    s += `<span class='line ${isExcluded}'>${el}</span>`;
  });
  s += "</div>"; //lines
  s += "<div class='update-info'>";
  s += "<span class='update-info-content'>";
  s += `<span>Updated at ${Service.extractTimeFromISODateString(
    stopInfo.timestamp
  )}</span> `;
  s += `<span id='updated-ago' data-updated-ago='${
    stopInfo.timestamp
  }'>${Service.secondsToTime(
    ((Date.now() - stopInfo.timestamp) / 1000) >> 0
  )}</span> ago. `;
  s += `</span>`;
  s += "<span class='button' id='update'>Update</span> ";
  s += "</div>";

  s += "</div>"; // stop-info

  s += "<div class='arrivals'>";

  arrivals
    .filter(arr => !stopInfo.linesExcluded.includes(arr.lineName))
    .forEach(arr => {
      s += `<div class='arrival'>`;
      s += `<span class='arrival-time' >${Service.extractTimeFromISODateString(
        arr.expectedArrival
      )}</span>`;
      s += `<span class='time-to-station' data-arrival-time='${
        arr.expectedArrival
      }'>${Service.secondsToTime(
        Service.timeDifference(new Date(), arr.expectedArrival)
      )}</span>`;
      s += `<span class='line-name'>${arr.lineName}</span>`;
      s += `<span class='destination'>${arr.destinationName}</span>`;
      s += `</div>`;
    });
  s += "</div>"; //arrivals
  s += "</div>"; // results
  document.getElementById("arrivals").innerHTML = s;
  document.querySelector(".lines").addEventListener("click", ev => {
    if (ev.target.classList.contains("line")) {
      let lineName = ev.target.textContent;
      if (stopInfo.linesExcluded.includes(lineName)) {
        stopInfo.linesExcluded = stopInfo.linesExcluded.filter(
          el => el != lineName
        );
      } else {
        stopInfo.linesExcluded.push(lineName);
      }
      // console.log(stopInfo.linesExcluded)
      renderResults(stopInfo, arrivals);
    }
  });
  document.getElementById("update").addEventListener("click", () => {
    showArrivalsAtStop(stopInfo);
  });
}
