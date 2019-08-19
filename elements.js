import $ from './dom.js';


class BusLine extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({
            mode: 'open'
        });
        const span = document.createElement('span');
        span.classList.add('line');
        if (this.hasAttribute('line')) {
            span.textContent = this.getAttribute('line');
        }
        if (this.hasAttribute('excluded')) {
            this.classList.add('excluded')
        }
        shadow.appendChild(span);
    }
}
class BusStop extends HTMLElement {

    connectedCallback() {
        // const shadow = this.attachShadow({
        //     mode: 'open'
        // });
        if (!this.dataset.stop) return;
        const stop = JSON.parse(this.dataset.stop);
        const stopDiv = $('div', {
            className: 'stop',
            dataset: {
                stopId: stop.id
            }
        }, this);
        $('span', {
            className: "letter",
            textContent: stop.stopLetter
        }, stopDiv)
        const stopMainInfo = $('div', {
            className: "stop-main-info"
        }, stopDiv);
        const span = $('span', {}, stopMainInfo);
        $('span', {
            className: "stop-name",
            textContent: stop.name
        }, span);
        if (stop.towards) {
            $('span', {
                className: "stop-towards",
                textContent: " -> " + stop.towards
            }, span)
        }
        $('span', {
            className: "stop-lines",
            textContent: stop.lines.join(', ')
        }, stopMainInfo);

    }
}
class BusArrival extends HTMLElement {
    // const arrivalElement = getTemplate('template-arrival');
    // arrivalElement.querySelector('.arrival-time').textContent = Service.extractTimeFromISODateString(arrival.expectedArrival);
    // const timeToStation = arrivalElement.querySelector('.time-to-station');
    // timeToStation.dataset.arrivalTime = arrival.expectedArrival;
    // timeToStation.textContent = Service.secondsToTime(Service.timeDifference(new Date(), arrival.expectedArrival));
    // arrivalElement.querySelector('.line-name').textContent = arrival.lineName;
    // arrivalElement.querySelector('.destination').textContent = arrival.destinationName;
    //     <div class="arrival">
    //     <span class="arrival-time"> </span>
    //     <span class="time-to-station"></span>
    //     <span class="line-name"></span>
    //     <span class="destination"></span>
    //   </div>

    connectedCallback() {
        const arrival = JSON.parse(this.getAttribute('arrival') || "null");
        if (!arrival) return;
        const arrivalDiv = $('div', {
            className: "arrival"
        }, this);
        $('span', {
            className: "arrival-time",
            textContent: arrival.arrivalTime,
        }, arrivalDiv);
        $('span', {
            className: "time-to-station",
            textContent: arrival.timeToStation
        }, arrivalDiv)
        $('span', {
            className: "line-name",
            textContent: arrival.lineName
        }, arrivalDiv);
        $('span', {
            className: "destination",
            textContent: arrival.destinationName
        }, arrivalDiv);
    }
}

customElements.define('bus-stop', BusStop)
customElements.define('bus-line', BusLine);
customElements.define('bus-arrival', BusArrival);