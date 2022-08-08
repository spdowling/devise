// @ts-check

import { css, html, LitElement } from 'lit';
import { HotKeyController } from "../hotkeys";
import { CommandController } from './command-controller';

// @ts-expect-error
import { styles } from '../../index.scss';

export class FolioCommanderElement extends LitElement {
    #hotkeys; #commands;

    static shadowRootOptions = {
        ...LitElement.shadowRootOptions,
        delegatesFocus: true
    };

    static styles = [
        styles,
        css`
            :host {
                display: block
            }

            dialog {
                background-color: rgba(213, 220, 226, 0.3);
            }

            dialog article {
                padding: 0;
                overflow: hidden;
                border-radius: 0;
            }

            dialog article > header,
            dialog article > footer {
                margin-top: 0;
                margin-bottom: 0;
                padding-top: 0;
                padding-bottom: 0;
            }

            dialog article > header > form,
            dialog article > header > form > input#query[type="search"] {
                margin-bottom: 0;
                border-radius: 0;
            }
            
            ul {
                overflow-y: scroll;
                border: 1px solid rgba(33, 33, 33, 0.07);
                box-shadow: 0 3px 6px rgba(149, 157, 165, 0.15);
                margin-bottom: 0;
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
        open: { type: Boolean, reflect: true },
        results: { state: true },
        cursor: { state: true }
    };

    constructor() {
        super();
        this.open = false;
        this.results = null;
        this.cursor = 0;
    }

    get #registry() {
        return this.#commands.registry;
    }

    connectedCallback() {
        super.connectedCallback();
        this.#hotkeys = new HotKeyController(this);
        this.#hotkeys.assign([['Meta', 'K']]);
        this.#commands = new CommandController(this);
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (!!this.#hotkeys.value) this.open = !this.open;
        if (this.open) this.focus();
    }

    render() {
        const results = this.results ? this.results : this.#registry;
        return html`
            <dialog ?open=${this.open}>
                <article>
                    <header>
                        <form>
                            <input id="query" type="search"
                                placeholder="Search by command name"
                                @keydown=${this.#trapKey} @input=${this.#match}>
                        </form>
                    </header>
                    <ul>
            ${!results.length
                ? html`
                        <li>No matching results</li>`
                : html`
                    ${results.map((s, i) => html`
                        <li aria-selected=${i === this.cursor}
                            @click=${this.#select}>
                            ${s.name}
                        </li>
                    `)}`}
                    </ul>
                    <footer></footer>
                </article>
            </dialog>`;
    }

    #trapKey(e) {
        const results = this.shadowRoot.querySelectorAll('ul > li');
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                if (results.length > 1) {
                    const cursor = e.key === 'ArrowDown'
                        ? this.cursor + 1
                        : this.cursor - 1;
                    this.cursor = cursor >= results.length
                        ? 0
                        : cursor < 0 ? results.length - 1 : cursor;
                    results[this.cursor].scrollIntoView(false);
                }
                e.preventDefault();
                break;
            case 'Enter':
                if (results.length) this.#fire(this.cursor);
                e.preventDefault();
                break;
            case 'Escape':
                this.#close();
                e.stopPropagation();
                break;
        }
    }

    #match({ target: { value: query } }) {
        const clean = (query) => query.toString().trimLeft().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .normalize('NFC').toString();
        this.results = this.#registry.slice(0)
            .filter(c => clean(c.name).indexOf(clean(query)) >= 0);
        if (this.results.length) this.cursor = 0;
    }

    #select(e) {
        const index = [...this.shadowRoot.querySelectorAll('ul > li')]
            .indexOf(e.target);
        if (index > -1) this.#fire(index);
    }

    #fire(index) {
        this.#close();
        this.#registry[index].handler.call(this.#registry[index].host);
    }

    #close() {
        this.cursor = 0;
        this.open = false;
    }
}

customElements.define('folio-commander', FolioCommanderElement);
