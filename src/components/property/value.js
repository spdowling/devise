// @ts-check

import { html, LitElement, nothing } from 'lit';

// @ts-expect-error
import { styles } from '../../index.scss';

export class FolioPropertyValueElement extends LitElement {
    static styles = [styles];
    
    // static properties = {};

    constructor() {
        super();
    }

    render() {
        // return html`
        //     <fieldset>
        //         <label for="new">New Value
        //             <input id="new" type="text" name="new" @change=${this.#update}>
        //             <small>Add a new property value to the list.</small>
        //         </label>
        //         <label for="values">Values
        //             <select id="values" name="values" size="12" multiple
        //                 @change=${this.#update}>
        //             ${map(values, v => html`
        //                 <option ?selected=${v.default}>${v.value}</option>
        //             `)}
        //             </select>
        //             <small>Selected values will be runtime defaults.</small>
        //         </label>
        //         <div class="grid">
        //             <div class="grid">
        //                 <label for="min">Min Values
        //                     <input type="number" id="min" name="min" min="0" max="${max}" value="${min}"
        //                         @change=${this.#update}>
        //                     <small>The min required values per instance.</small>
        //                 </label>
        //                 <label for="max">Max Values
        //                     <input type="number" id="max" name="max" min="${min}" max="99999" value="${max}"
        //                         @change=${this.#update}>
        //                     <small>The max allowed values per instance.</small>
        //                 </label>
        //             </div>
        //             <fieldset><legend>Runtime Behaviour</legend>
        //                 <label for="configurable">
        //                     <input type="checkbox" id="configurable name="configurable" role="switch"
        //                         ?checked=${configurable} @change=${this.#update}>
        //                     Allow instance configuration
        //                 </label>
        //                 <label for="extensible">
        //                     <input type="checkbox" id="extensible" name="extensible" role="switch"
        //                         ?checked=${extensible} @change=${this.#update}>
        //                     Allow instance defined values
        //                 </label>
        //                 <label for="unique">
        //                     <input type="checkbox" id="unique" name="unique" role="switch" ?checked=${unique}
        //                         @change=${this.#update}>
        //                     Require unique instance values
        //                 </label>
        //             </fieldset>
        //         </div>
        //     </fieldset>
        // `;
        return html``;
    }
}

customElements.define('folio-property-value', FolioPropertyValueElement);
