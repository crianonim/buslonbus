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
        const stopDiv=$('div', {
            className: 'stop',
            dataset: {
                stopId: stop.id
            }
        }, this);
        $('span', {
            className: "letter",
            textContent: stop.stopLetter
        }, stopDiv)
        const stopMainInfo=$('div',{className:"stop-main-info"},stopDiv);
        const span=$('span',{},stopMainInfo);
        $('span',{className:"stop-name",textContent:stop.name},span);
        if (stop.towards){
            $('span',{className:"stop-towards",textContent:" -> "+stop.towards},span)
        }
        $('span',{className:"stop-lines",textContent:stop.lines.join(', ')},stopMainInfo);
        
    }
}
customElements.define('bus-stop', BusStop)
customElements.define('bus-line', BusLine);