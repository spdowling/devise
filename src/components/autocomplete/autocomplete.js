// @ts-check

import { css, html, LitElement } from 'lit';
import { map } from 'lit/directives/map.js';
import { createRef, ref } from 'lit/directives/ref.js';

// @ts-expect-error
import { styles } from '../../index.scss';

// Fuzzy matching xamples:
//  https://github.com/superhuman/command-score
//  https://www.typescriptlang.org/play?noImplicitAny=false&strictNullChecks=false#code/GYVwdgxgLglg9mABAZygJxmA5gZRgWxgBsBDDKATwApU0BGALhXUywBpm0AmJ21jrGhL48ALwCmTMCHwAjcWkQBeRFwCUiAN4AoRIlCRYCRFnFQAcgHEh+ZDV4tsHIuLBSZ8tBp169yZYgA5EEAdGjiAA7iJFBULkgAtIh0GgDUKCFQcAAycADuCgDCJMjiVGlBoeFRMXGuiEkpANy6vi5QiABuAWDieYgAgmhC1Mgh8VhQABYNiPGI6c2tesBwinUdMAEADE2IWwA8XeOuk1N7MKmp3su+nQDaMAC6AWPIRDAQZTAcW+nxahavkQAF9buEoCA0EhOkDQdpWjBgIgqABCWh0AD8J2w00QAB98Yh0eguNiJtNvIgIVCkNsQrt4a12ig6K90HQcWdEEdaFwuXjMZw2Q5uHCWcguOz6AKZrzSbLEEK+YhRXQWsyzIgIiQYGhkGyVKYLNZhHYDQIbGJxIDNR0dXrJQFjVYbOauJbhNbbXoJVqVL1+jgzAc+NgAHxUB36pZ2xBZKAkIgBaOS2XirVTGBQfwqXatVbrFnZ8T4RBwZGp9RaW5IlGlKAhAAm4na3ygpbUN2BeizOaucL0YKHrRp0MQff8AHp43BE0QWmDtBAEMg4C5xnAsDRHLgCMQyNnqAAiAAiW+PHDPF67y9X6-Em+3Yb3hFI5BPAHV18B8CQwAAUiQEAANYAJLIKeJAAEJwHIl6IMe35EL+-5AaBEFQdB4ioMet4rmAa4bkQW47hg2B4G+h6UFQZ4xOIhThPRTYIcejHRB2TZQR2eFqHehEPk+ZGsJRB4frRJCsbIvH8URj4kc+u6ie+R60ex9GnlArHcQxELiCx+H3sRpEvsp1EngAClMFBEB8yCsRZNl2QAGjJBFyUJpn7ipNHHlZTkwPZV6OUQUx2W5RnySZSneeZtEQDErEQCAWmGQJxmKeRr5iapx4JVpV6FNIqV8e5gkKcJFGxeJeUQKxhQQI1TXNS1rVtU1EXpVFmUidVuUkNJV4DcNsgjWNo0TeNI2dR5FVeVRNUkIgeRTA+cwIFg8ZZtgrGSWls3RVlZmLbty2rS463YFtrAzeVh29QtuWnWAxilhElCcDd+13T1VWPTR0i2UNiAvUgb0fS+MmIEAA
//  https://github.com/atom/fuzzaldrin/
//  https://github.com/farzher/fuzzysort
//  https://github.com/krisk/Fuse
//  http://glench.github.io/fuzzyset.js/
// Fuzzy matching discussion:
//  https://stackoverflow.com/questions/23305000/javascript-fuzzy-search-that-makes-sense

// TODO(spdowling) allow the display of item information beyond just name,
// e.g shortcuts for comands wrapped in <kbd></kbd>

export class FolioAutocompleteElement extends LitElement {
    #queryRef; #itemsRef; #itemRefs;

    static shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true
    };

    static styles = [
        styles,
        css`
            :host {
                display: block;
            }
            
            ul {
                overflow-y: scroll;
                border: 1px solid rgba(33, 33, 33, 0.07);
                box-shadow: 0 3px 6px rgba(149, 157, 165, 0.15);
            }
            
            ul > li {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            ul > li:hover {
                cursor: pointer;
                background-color: #eee;
            }
            
            ul > li[aria-selected="true"] {
                background-color: #ccc;
            }
        `,
    ];

    static properties = {
        data: { type: Array, attribute: false },
        dataKey: { type: String, attribute: false },
        placeholder: { type: String, attribute: false },
        resultsList: { type: Boolean, attribute: false },
        emptyResult: { type: String, attribute: false },
        selectEmpty: { type: Boolean, attribute: false },
        results: { state: true },
        selected: { state: true }
    };

    constructor() {
        super();
        this.data = [];
        this.dataKey = 'name';
        this.placeholder = '';
        this.resultsList = false;
        this.emptyResult = '';
        this.selectEmpty = false;
        this.results = [];
        this.selected = 0;
        this.#queryRef = createRef();
        this.#itemsRef = createRef();
        this.#itemRefs = [];
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('data') ||
            changedProperties.has('dataKey')) this.#reset();
    }

    render() {
        const results = this.results.length ? this.results : this.data;
        this.#itemRefs = Array(this.results.length)
            .fill()
            .map(() => createRef());
        return html`
            <form @keydown=${this.#navigate}>
                <input type="search" id="query"
                    placeholder="${this.placeholder}" ${ref(this.#queryRef)}
                    @focus=${this.#focus} @input=${this.#filter}>
            </form>
            <ul ?hidden=${!this.resultsList} ${ref(this.#itemsRef)}>
            ${!this.results.length && this.emptyResult
                ? html`
                <li aria-selected=true
                    @mousedown=${this.#click}>${this.emptyResult}</li>`
                : html`
            ${map(results, (r, i) => html`
                <li aria-selected=${i === this.selected}
                    ${ref(this.#itemRefs[i])} @mousedown=${this.#click}>
                    ${r[this.dataKey]}
                </li>
            `)}`}
            </ul>`;
    }

    #focus(e) {
        this.#filter({ target: { value: e.target.value } });
    }

    #navigate(e) {
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                if (this.#itemRefs.length) {
                    e.key === 'ArrowDown' ? ++this.selected : --this.selected;
                    const items = this.#itemRefs;
                    if (this.selected >= items.length) this.selected = 0;
                    if (this.selected < 0) this.selected = items.length - 1;
                    items[this.selected].value.scrollIntoView(false);
                    e.preventDefault();
                }
                break;
            case 'Enter':
                // TODO(spdowling) if we have no itemRefs then selected should
                // be -1? if so, can just call this.#select with no worries?
                // means removing this check and just call select every time
                // regardless
                if (this.#itemRefs.length && ~this.selected) {
                    this.#select(this.selected);
                }
                e.preventDefault();
                e.stopPropagation();
                break;
            case 'Escape':
                // @ts-expect-error
                this.#queryRef.value.blur();
                this.#reset();
                break;
        }
    }

    #filter({ target: { value: query } }) {
        const prepare = (query) => query
            .toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .normalize('NFC').toString();
        const results = (this.data?.slice(0) ?? [])
            .filter(({ [this.dataKey]: value }) => {
                return prepare(value).indexOf(prepare(query)) >= 0;
            });
        // if we have results set selected to 0? otherwise set selected
        // to -1?
        this.results = results;
    }

    #click(e) {
        const index = this.#itemRefs.findIndex(m => m.value === e.target);
        if (index > -1 || this.selectEmpty) this.#select(index);
    }

    #select(index) {
        console.log('selected', index);
        this.dispatchEvent(new CustomEvent('folio-autocomplete:select', {
            // @ts-ignore
            detail: this.results[index] ?? { query: this.#queryRef.value.value }
        }));
        this.#reset();
    }

    #reset() {
        this.selected = 0;
        this.results = [];
    }
}

customElements.define('folio-autocomplete', FolioAutocompleteElement);
