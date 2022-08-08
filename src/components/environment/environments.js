// @ts-check

import { css, html, LitElement } from 'lit';
import { EnvironmentController } from './environment-controller';

// @ts-expect-error
import { styles } from '../../index.scss';

export class FolioEnvironmentsElement extends LitElement {
    #environments;

    static styles = [
        styles,
        css`
            :host {
                display: block;
            }
        `,
    ];
    static properties = {
        baseUrl: { type: String, attribute: false },
        visible: { state: true }
    };

    constructor() {
        super();
        this.baseUrl = '';
        this.visible = [];
    }

    connectedCallback() {
        super.connectedCallback();
        // TODO(spdowling) separate out .observe() for record changes
        this.#environments = new EnvironmentController(
            this,
            async () => (await this.#environments.all()),
            { records: true }
        );
    }

    // TODO(spdowling) this.#environments isn't triggering an update for initial
    // rendering
    render() {
        const noop = (e) => e.key === 'Enter' && e.preventDefault();
        const environments = this.visible.length
            ? this.visible
            : this.#environments?.value ?? [];
        // TODO(spdowling) do a better job of regex replacing slashes
        const baseUrl = this.baseUrl === '/' ? '' : this.baseUrl;
        return html`
            <input type="search" @keydown=${noop} @input=${this.#filter}>
            <ul>
            ${environments.map((e) => html`
                <li>
                    <a href="${baseUrl}/${e.id}">${e.name}</a>
                </li>`)}
            </ul>`;
    }

    #filter({ target: { value: query } }) {
        const clean = (query) => query
            .toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .normalize('NFC').toString();
        this.visible = (this.#environments?.value?.slice(0) ?? [])
            .filter(c => clean(c.name).indexOf(clean(query)) >= 0);
    }
}

customElements.define('folio-environments', FolioEnvironmentsElement);
