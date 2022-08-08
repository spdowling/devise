// @ts-check

import { html, LitElement } from 'lit';

// @ts-expect-error
import { styles } from '../../index.scss';

// TODO(spdowling) make sure we have our terminology correct across the board:
// multiplicity = [participation (lower) + cardinality (upper)]

// TODO(spdowling) do we need this as a custom element? or is it enough just
// to allow for description of aggregate relationships of entities on the 
// entity-model element instead?

export class FolioEntityRelationElement extends LitElement {
    static styles = [styles];
    
    static properties = {
        _example: { state: true }
    };

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    render() {
        return html``;
    }
}

customElements.define('folio-entity-relation', FolioEntityRelationElement);
