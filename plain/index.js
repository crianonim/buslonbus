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

const displayStopBySmsCode = (code) => {
    Service.getStopID(code).then(res => {
        const id = res.id;
        Service.getStopInfo(id).then(console.log);
        showArrivalsAtStop(res);
    }).catch(err => {
        // TODO send info that bad code
        console.log({
            err
        });
    });
}

const displayStop = (code) => {
    Service.getStopInfo(code).then(res => {
        const id = res.id;
        Service.getStopInfo(id).then(console.log);
        showArrivalsAtStop(res);
    });
}

const updateCode = () => {
    for (let i = 1; i < 6; i++) {
        const el = document.getElementById("code" + i);
        let digit = code[i - 1];
        if (typeof digit == "undefined") digit = "";
        el.innerText = digit;
    }
}

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
    document.getElementById("smsCodeToggle").addEventListener("click", () => {
        document.getElementById("code").classList.toggle("hidden");
        document.getElementById("digits").classList.toggle("hidden");
    });
}

const getTemplate = (id) => document.getElementById(id).cloneNode(true).content.firstElementChild;

const renderStopComponent = (stop) => {
    const el = getTemplate('template-stop');
    el.querySelector('.stop-name').textContent = stop.name;
    el.querySelector('.letter').textContent = stopLetterCorrected(stop.stopLetter)
    el.dataset.stopId = stop.id;
    if (stop.towards) {
        el.querySelector('.stop-towards').textContent = "-> " + stop.towards;
    }
    el.querySelector('.stop-lines').textContent = stop.lines.join(", ");
    return el;
}

const getNearby = () => {
    Service.getStopsWithinRadius(500)
        .then(stops => {
            const aroundOrig = document.querySelector(".around");
            const around = aroundOrig.cloneNode(true);
            stops.filter(stop => stop.lines.length)
                .map(renderStopComponent)
                .forEach(around.appendChild.bind(around));
            around.querySelectorAll(".stop").forEach(stop => {
                stop.addEventListener("click", ev => {
                    displayStop(ev.currentTarget.dataset.stopId);
                });
            });
            window.requestAnimationFrame(() => {
                aroundOrig.replaceWith(around);
            })
        })
        .catch(reason => {
            console.log(reason);
        });
}

const showArrivalsAtStop = (stopInfo) => {
    const id = stopInfo.id;
    Service.getArrivailAtStopID(id).then(arr => {
        const processed = Service.sortByArrivalTime(arr);
        stopInfo.timestamp = Date.now();
        stopInfo.linesExcluded = stopInfo.linesExcluded || [];
        renderResultsComponent(stopInfo, processed);
        setInterval(updateTimes, 1000);
    });
}

const updateTimes = () => {
    document.querySelectorAll(".time-to-station").forEach(el => {
        const time = el.dataset.arrivalTime;
        const difference = Service.timeDifference(new Date(), time);
        el.textContent = Service.secondsToTime(difference);
    });
    const ago = document.querySelector(".updated-ago");
    ago.textContent = Service.secondsToTime(((Date.now() - ago.dataset.updatedAgo) / 1000) >> 0);
}

const stopLetterCorrected = (stopLetter) => (stopLetter || "-").replace("->", "");

const renderResultsComponent = (stopInfo, arrivals) => {
    const arrivalsOrig = document.getElementById('arrivals');
    const arrivalsNew = arrivalsOrig.cloneNode(false);
    const el = getTemplate('template-results');
    el.querySelector('.letter').textContent = stopLetterCorrected(stopInfo.stopLetter);
    el.querySelector('.stop-name').textContent = stopInfo.name;
    if (stopInfo.towards) {
        el.querySelector('.stop-towards').textContent = "towards " + stopInfo.towards
    }
    const lineTemplate = getTemplate('template-line');
    const linesDiv = el.querySelector('.lines');
    stopInfo.lines.forEach(line => {
        const lineElement = lineTemplate.cloneNode(false);
        if (stopInfo.linesExcluded.includes(line)) {
            lineElement.classList.add('excluded');
        }
        lineElement.textContent = line;
        linesDiv.appendChild(lineElement);
    })
    el.querySelector('.updated-at').textContent = Service.extractTimeFromISODateString(stopInfo.timestamp)
    const updatedAgo = el.querySelector('.updated-ago');
    updatedAgo.dataset.updatedAgo = stopInfo.timestamp;
    updatedAgo.textContent = Service.secondsToTime(((Date.now() - stopInfo.timestamp) / 1000) >> 0)

    const arrivalsDiv = el.querySelector('.arrivals');
    arrivals
        .filter(arr => !stopInfo.linesExcluded.includes(arr.lineName))
        .map(arrival => {
            const arrivalElement = getTemplate('template-arrival');
            arrivalElement.querySelector('.arrival-time').textContent = Service.extractTimeFromISODateString(arrival.expectedArrival);
            const timeToStation = arrivalElement.querySelector('.time-to-station');
            timeToStation.dataset.arrivalTime = arrival.expectedArrival;
            timeToStation.textContent = Service.secondsToTime(Service.timeDifference(new Date(), arrival.expectedArrival));
            arrivalElement.querySelector('.line-name').textContent = arrival.lineName;
            arrivalElement.querySelector('.destination').textContent = arrival.destinationName;
            return arrivalElement;
        })
        .forEach(arrivalElement => arrivalsDiv.appendChild(arrivalElement));

    el.querySelector(".lines").addEventListener("click", ev => {
        if (ev.target.classList.contains("line")) {
            let lineName = ev.target.textContent;
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

    el.querySelector('.update').addEventListener("click", () => {
        showArrivalsAtStop(stopInfo);
    })
    arrivalsNew.appendChild(el);
    window.requestAnimationFrame(() => {
        arrivalsOrig.replaceWith(arrivalsNew);
    })
}