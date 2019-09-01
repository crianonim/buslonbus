// import $ from './dom.js';
import { domElementCreate as $} from "./dom.js";

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
        const starred = JSON.parse(this.dataset.starred);
        console.log({starred})
        const stopDiv = $('div', {
            className: 'stop',
            dataset: {
                stopId: stop.id
            }
        }, this);
        $('span', {
            className: "letter"+(starred?" starred-stop-letter":""),
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