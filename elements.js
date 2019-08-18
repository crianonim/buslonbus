import $ from './dom.js';

class PopUpInfo extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();

        // write element functionality in here

        // Create a shadow root
        var shadow = this.attachShadow({
            mode: 'open'
        });

        // Create spans
        var wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'wrapper');
        var icon = document.createElement('span');
        icon.setAttribute('class', 'icon');
        icon.setAttribute('tabindex', 0);
        var info = document.createElement('span');
        info.setAttribute('class', 'info');

        // Take attribute content and put it inside the info span
        var text = this.getAttribute('text');
        info.textContent = text;

        // Insert icon
        var imgUrl;
        if (this.hasAttribute('img')) {
            imgUrl = this.getAttribute('img');
        } else {
            imgUrl = 'img/default.png';
        }
        var img = document.createElement('img');
        img.src = imgUrl;
        icon.appendChild(img);

        // Create some CSS to apply to the shadow dom
        var style = document.createElement('style');

        style.textContent = '.wrapper {' +
            // CSS truncated for brevity

            // attach the created elements to the shadow dom

            shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(icon);
        wrapper.appendChild(info);
    }
}
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
} {
    /* <div class="stop" data-stop-id="">
            <span class="letter"></span>
            <div class="stop-main-info">
              <span>
                <span class="stop-name"></span>
                <span class="stop-towards"></span>
              </span>
              <span class="stop-lines"></span>
            </div>
          </div> */
}
class BusStop extends HTMLElement {

    connectedCallback() {
        // const shadow = this.attachShadow({
        //     mode: 'open'
        // });
        if (!this.hasAttribute('stop')) return;
        const stop = JSON.parse(this.getAttribute('stop'));
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
customElements.define('popup-info', PopUpInfo);
customElements.define('bus-line', BusLine);