// @ts-check

import { css, html, LitElement } from 'lit';
import { EntityController } from '../environment';

// @ts-expect-error
import { styles } from '../../index.scss';

export class FolioEntityModelElement extends LitElement {
    #entities;

    static styles = [
        styles,
        css`
            :host {
                display: block;
                margin: 1em 0.5em;
                padding-top: 1em;
            }

            /* Root and association wrap style */
            :host > ul, ul ul {
                display: flex;
                place-content: center;
                margin: 0;
                padding: 0;
            }

            /* Root and association node style */
            :host > ul li, li li {
                list-style-type: none;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0 0.1em;
            }

            /* Vertical connector: root to association wrap */
            ul ul::before:not(:empty) {
                content: '';
                position: absolute;
                left: 50%;
                border-left: 1px solid #ccc;
                height: 1em;
            }

            /* Horizontal connector: association node peers */
            li li::before, li li::after {
                content: '';
                position: absolute;
                top: 1em;
                right: 50%;
                border-top: 1px solid #ccc;
                width: 50%;
                height: 1em;
            }

            /* Vertical connector: all association nodes */
            li li::after {
                left: 50%;
                border-left: 1px solid #ccc;
            }

            /* Horizontal connector: remove from only-child nodes */
            li li:only-child::before, li li:only-child::after {
                border-top: 0;
            }

            /* Horizontal connector: remove trailing first and last */
            li li:first-child::before, li li:last-child::after {
                border-top: 0;
            }

            /* Connector styling: round first-child border */
            li li:not(:only-child):first-child::after {
                border-radius: 5px 0 0 0;
            }

            /* Vertical connector: switch last-child direction */
            li li:not(:only-child):last-child::after {
                border-left: 0;
            }

            /* Connector styling: round last-child border */
            li li:not(:only-child):last-child::before {
                border-right: 1px solid #ccc;
                border-radius: 0 5px 0 0;
            }

            /* Root node styling */
            li div {
                display: flex;
                flex-direction: column;
                align-items: center;
                border: 1px solid #ccc;
                border-radius: 8px;
                padding: 1em;
                height: 140px;
                width: 190px;
            }

            /* Highlight descendants of selected node */
            li div[aria-selected="true"],
            li div[aria-selected="true"]+ul::before,
            li div[aria-selected="true"]+ul li::before,
            li div[aria-selected="true"]+ul li::after,
            li div[aria-selected="true"]+ul li div,
            li div[aria-selected="true"]+ul ul::before {
                border-color: #94a0b4;
            }

            li div[aria-selected="true"],
            li div[aria-selected="true"]+ul li div {
                background: #c8e4f8;
            }
        `,
    ];
    
    static properties = {
        env: { type: String, attribute: false },
        entity: { type: String, attribute: false }
    };

    constructor() {
        super();
        this.env = '';
        this.entity = '';
    }

    get #entity() {
        return this.#entities?.value?.find(i => i.id === this.entity);
    }

    get #relations() {
        return this.#entity.relations ?? [];
    }

    get #nested() {
        // TODO(spdowling) retrieve full entity records per target aggregate
        // relation
        // const aggs = this.#relations.filter(r => r.type === 'AGGREGATE' && r.target);
        // const rels = await this.#entities.value.find(r => r.id === agg.id);
        // const nested = await this.#entities.value.find(i => i.id === rels.target);
        return this.#relations.filter(r => r.type === 'AGGREGATE' && r.target);
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('env') &&
            changedProperties.get('env') !== this.env) {
            this.#entities = new EntityController(
                this,
                this.env,
                async () => (await this.#entities.all())
            );
        }
    }

    render() {
        // TODO(spdowling) allow model image export (SVG, PNG, JPG etc.)
        // TODO(spdowling) provide collapse/expand options
        // TODO(spdowling) provide + option to trigger aggregation?
        // TODO(spdowling) support selecting item to trigger descendant styling
        if (!this.#entity) return;
        return html`
            <ul>
                <li>
                    <div id="${this.#entity.id}">
                        <span>${this.#entity.name}</span>
                    </div>
                    <ul>
                    ${this.#nested.map(r => html`
                        <li id="${r.id}">
                            <folio-entity-model
                                .env=${this.env} .entity=${r.target}>
                            </folio-entity-model>
                        </li>
                    `)}
                    </ul>
                </li>
            </ul>`;
    }
}

customElements.define('folio-entity-model', FolioEntityModelElement);
