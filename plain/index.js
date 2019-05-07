import Service from './service.js';

window.addEventListener('load',()=>{
    displaySMScodeEntry();
    // document.getElementById('btn_nearby').addEventListener('click',getNearby)
    getNearby();
})
let fakeLog=(s) => {
    return
    let console = document.getElementById('console');
    console.textContent += ('\n' + JSON.stringify(s));
}
console.log = fakeLog;
console.error=fakeLog;
console.warn=fakeLog;
let code = "";
function displayStopBySmsCode(code) {
    Service.getStopID(code).then(
        (res) => {
            let id = res.id
            // console.log(res);
            Service.getStopInfo(id).then(console.log)
            showArrivalsAtStop(res);
        }

    )
}
function displayStop(code) {

    Service.getStopInfo(code).then(
        (res) => {
            let id = res.id
            // console.log(res);
            Service.getStopInfo(id).then(console.log)
            showArrivalsAtStop(res);
        }

    )
}
function updateCode() {
    for (let i = 1; i < 6; i++) {
        let el = document.getElementById('code' + i);
        let digit = code[i - 1];
        if (typeof digit == "undefined") digit = '';
        el.innerText = digit;
    }
}
function displaySMScodeEntry() {
    document.getElementById('digits').addEventListener('click', (ev) => {
        if (ev.target.classList.contains('digit')) {
            let digit = ev.target.textContent;
            if (digit == "X") {
                code = "";
            } else
                if (digit == "<") {
                    if (code.length > 0) {
                        code = code.substr(0, code.length - 1)
                    }
                } else {
                    if (code.length < 5) {
                        code += digit;
                        if (code.length == 5) {
                            // console.log("HAVE")
                            displayStopBySmsCode(code)
                        }
                    }

                }
            // console.log(code)
            updateCode();
        }
    })
    document.getElementById("smsCodeToggle").addEventListener('click', () => {
        console.log("Toggle")
        document.getElementById('code').classList.toggle('hidden');
        document.getElementById('digits').classList.toggle('hidden');

    })
}
function getNearby(){
    try{

        let re = Service.getStopsWithinRadius(500);
        re.then((stops) => {
            // console.log("Have stops"+ stops.length);
            let s = `<div class='around'><div class='around-header'>Nearby Bus stops</div>`;
            stops.forEach(stop => {

                if (!stop.lines.length) {
                    
                    return;

                }
                s += `<div class='stop' data-stop-id='${stop.id}'>`
                s += `<span class='letter'>${(stop.stopLetter||'-').replace('->', '')}</span>`;
                s += `<div class='stop-main-info'><span><span class='stop-name'>${stop.name} </span>`;
                s += ` towards ${stop.towards}</span>`
                s += `<span>${stop.lines.join(', ')}</span></div>`
                s += `</div>`; //stop
                // console.log(s)
            })
            // console.log("All:"+s);
            s += `</div>`; //around
            let around = document.getElementById('around')
            around.innerHTML = s;
            around.querySelectorAll('.stop').forEach(stop => {
                stop.addEventListener('click', (ev) => {
                    displayStop(ev.currentTarget.dataset.stopId)
                    // console.log("Clicked on id", ev.currentTarget.dataset.stopId)
                })
            })
        })
    } catch (e){
        console.log("ERROR"+e);
    }
}
// displayStop('490000055A');
//displayStopBySmsCode(72538);

function showArrivalsAtStop(stopInfo) {
    let id = stopInfo.id;
    Service.getArrivailAtStopID(id).then(
        (arr) => {
            let processed = Service.sortByArrivalTime(arr)
            // console.log(arr)
            // processed.forEach(el=>console.log(JSON.stringify(el,null,2)))
            processed.forEach(el => {
                // console.log(`${el.expectedArrival} ${el.lineName} ${el.destinationName}`);
            });
            stopInfo.timestamp = Date.now();
            stopInfo.linesExcluded = stopInfo.linesExcluded || [];
            renderResults(stopInfo, processed)
            setInterval(updateTimes, 1000);
        })
}
function updateTimes() {
    document.querySelectorAll('.time-to-station').forEach(el => {
        let time = el.dataset.arrivalTime;
        let difference = Service.timeDifference(new Date(), time);
        el.textContent = Service.secondsToTime(difference);
        // console.log(time);
    })
    let ago = document.getElementById('updated-ago');
    ago.textContent = Service.secondsToTime(((Date.now() - ago.dataset.updatedAgo) / 1000) >> 0);
}
function renderResults(stopInfo, arrivals) {

    let s = "<div class='results'>";
    s += "<div class='stop-info'>";
    s += `<div class='stop-title-line'><span class='letter'>${stopInfo.stopLetter.replace('->', '')}</span>
       <div class='stop-title-text'> 
        <span class='stop-name'>${stopInfo.name}</span>
        <span class='stop-towards'> towards ${stopInfo.towards} </span>
        </div> 
        </div>`
    s += "<div class='lines'>";
    stopInfo.lines.forEach(el => {
        let isExcluded = stopInfo.linesExcluded.includes(el) ? "excluded" : "";
        s += `<span class='line ${isExcluded}'>${el}</span>`;
    })
    s += "</div>";//lines
    s += "<div class='update-info'>"
    s += "<span class='update-info-content'>"
    s += `<span>Updated at ${Service.extractTimeFromISODateString(stopInfo.timestamp)}</span> `
    s += `<span id='updated-ago' data-updated-ago='${stopInfo.timestamp}'>${Service.secondsToTime(((Date.now() - stopInfo.timestamp) / 1000) >> 0)}</span> ago. `
    s += `</span>`
    s += "<span class='button' id='update'>Update</span> "
    s += "</div>";

    s += "</div>"; // stop-info

    s += "<div class='arrivals'>"

    arrivals.filter(arr => !stopInfo.linesExcluded.includes(arr.lineName))
        .forEach(arr => {
            s += `<div class='arrival'>`;
            s += `<span class='arrival-time' >${Service.extractTimeFromISODateString(arr.expectedArrival)}</span>`;
            s += `<span class='time-to-station' data-arrival-time='${arr.expectedArrival}'>${Service.secondsToTime(Service.timeDifference(new Date(), arr.expectedArrival))}</span>`;
            s += `<span class='line-name'>${arr.lineName}</span>`;
            s += `<span class='destination'>${arr.destinationName}</span>`
            s += `</div>`
        })
    s += "</div>";//arrivals
    s += "</div>"; // results
    document.getElementById('arrivals').innerHTML = s;
    document.querySelector('.lines').addEventListener("click", (ev) => {
        if (ev.target.classList.contains("line")) {
            let lineName = ev.target.textContent;
            if (stopInfo.linesExcluded.includes(lineName)) {
                stopInfo.linesExcluded = stopInfo.linesExcluded.filter(el => el != lineName);
            } else {
                stopInfo.linesExcluded.push(lineName);
            }
            // console.log(stopInfo.linesExcluded)
            renderResults(stopInfo, arrivals)
        }
    });
    document.getElementById('update').addEventListener('click', () => {
        showArrivalsAtStop(stopInfo);
    })
}