// @ts-check

import { css, html, LitElement } from 'lit';
import { RouteController } from '../routing';
import { CommandController } from '../commander';
import { EntityController } from '../environment';

// NOTE(spdowling) element composition imports
import '../prompt';
import '../autocomplete';

// @ts-expect-error
import { styles } from '../../index.scss';

// Pan & Zoom:
// https://stackoverflow.com/questions/68280184/panning-image-when-overflow-scroll-using-javascript:
// https://betterprogramming.pub/implementation-of-zoom-and-pan-in-69-lines-of-javascript-8b0cb5f221c1
// https://stackblitz.com/edit/zoom-pan
// https://github.com/kwdowik/zoom-pan:

// Drag'n'Drop: https://justinribeiro.com/chronicle/2020/07/14/handling-web-components-and-drag-and-drop-with-event.composedpath/

export class FolioEntityElement extends LitElement {
    #router; #commands; #entities;

    static styles = [
        styles,
        css`
            :host {
                display: block;
            }
        `,
    ];

    static properties = {
        env: { type: String, attribute: false },
        entity: { type: String, attribute: false },
        prompt: { state: true }
    };

    constructor() {
        super();
        this.env = '';
        this.entity = '';
        this.prompt = null;
    }

    get #entity() {
        return this.#entities?.value?.find(i => i.id === this.entity);
    }

    connectedCallback() {
        super.connectedCallback();
        this.#commands = new CommandController(this);
        this.#commands.register(this.#associate, 'Associate Entity');
        this.#commands.register(this.#dissociate, 'Dissociate Entity');
        this.#commands.register(this.#aggregate, 'Aggregate Entity');
        this.#commands.register(this.#separate, 'Separate Entity');
        this.#commands.register(this.#assign, 'Assign Property');
        this.#commands.register(this.#unassign, 'Unassign Property');
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
        const entity = this.#entity;
        // if (!this.#entity) return;
        // TODO(spdowling) could we also have an Associations element, similar
        // to how we have a Properties drawer element? So we can stack them on
        // top of each other and have them switch between
        // console.log(this.#router.state);
        // return html`
        //     <folio-prompt ?open=${!!this.prompt}>
        //         ${this.prompt ?? null}
        //     </folio-prompt>
        //     ${this.#router.render()}`;
        return html`
            <folio-prompt ?open=${!!this.prompt}>
                ${this.prompt ?? null}
            </folio-prompt>
            <header class="grid">
                <hgroup>
                    <h1>${entity?.name}</h1>
                    <h2>${entity?.id}</h2>
                </hgroup>
                <form @keydown=${this.#next}>
                    <div class="grid">
                        <label for="name">Name
                            <input type="text" id="name" name="name" required
                                value="${entity?.name}"
                                @change=${this.#update}>
                        </label>
                        <label for="from">Effective From
                            <input type="date" id="from" name="effective"
                                required value="${entity?.effective?.from}"
                                @change=${this.#update}>
                        </label>
                        <label for="until">Effective Until
                            <input type="date" id="until" name="effective"
                                value="${entity?.effective?.until}"
                                @change=${this.#update}>
                        </label>
                    </div>
                </form>
            </header>
            <folio-entity-model
                .env=${this.env} .entity=${this.entity}>
            </folio-entity-model>
            <folio-entity-data
                .env=${this.env} .entity=${this.entity}>
            </folio-entity-data>`;
    }

    #associate() {
        const select = async ({ detail: { item, query } }) => {
            if (!item.id || (item.id === -1 && !query)) return;
            if (item.id === -1) {
                item.id = await this.#entities.create({
                    name: query,
                    type: this.#entity.type
                });
            }
            this.prompt = null;
            // this.#entities.relate(this.#entity, item.id, association);
        }
        // TODO(spdowling) use #confirm approach to select from associations?
        // filter out Aggregation type
        this.prompt = html`
            <folio-autocomplete
                .data=${this.#entities.value}
                .emptyResult=${{ id: -1, name: 'No entity found. Create?' }}
                .placeholder=${'Entity to associate...'}
                @folio-autocomplete:select=${select}>
            </folio-autocomplete>`;
    }

    #dissociate() {
        const select = async ({ detail: { item } }) => {
            if (item.id !== undefined) return;
            this.prompt = null;
            // TODO(spdowling) how do we best get the association id now?
            // this.#entities.unrelate(this.#entity, item.id, association.id);
        }
        // TODO(spdowling) filter entities by associations of this.#entity
        this.prompt = html`
            <folio-autocomplete
                .data=${this.#entities.value}
                .placeholder=${'Entity to dissociate...'}
                @folio-autocomplete:select=${select}>
            </folio-autocomplete>`;
    }

    // _relate(target, type, options) {
    //     // TODO(spdowling) validate type against catalog relations
    //     if (!target || !type) return;
    //     const source = (this.#entities?.value ?? [])
    //         .find(i => i.id === this.entity);
    //     const { min = 1, max = 1, def = 1 } = options;
    //     // TODO(spdowling) replace with controller.create(relation) and
    //     // assigning relation record id
    //     target.relations = (target.relations ?? [])
    //         .concat({
    //             id: nanoid(), type, source: source.id,
    //             min, max, def,
    //         });
    //     // TODO(spdowling) replace with controller.create(relation) and
    //     // assigning relation record id
    //     source.relations = (source.relations ?? [])
    //         .concat({
    //             id: nanoid(), type, target: target.id,
    //             min, max, def,
    //         });
    // }

    #aggregate() {
        const select = async ({ detail: { item, query } }) => {
            if (!item.id || (item.id === -1 && !query)) return;
            if (item.id === -1) {
                item.id = await this.#entities.create({
                    name: query,
                    type: this.#entity.type
                });
            }
            this.prompt = null;
            // this.#entities.relate(this.#entity, item.id, 'AGGREGATE');
        }
        this.prompt = html`
            <folio-autocomplete
                .data=${this.#entities.value}
                .emptyResult=${{ id: -1, name: 'No entity found. Create?' }}
                .placeholder=${'Entity to aggregate...'}
                @folio-autocomplete:select=${select}>
            </folio-autocomplete>`;
    }

    // _unrelate(target, type) {
    //     if (!target || !type) return;
    //     const source = (this.#entities?.value ?? [])
    //         .find(i => i.id === this.entity);
    //     // TODO(spdowling) replace with unassigning by relation id
    //     const sourceRelation = (source.relations ?? []).
    //         find(r => r.target === target.id && r.type === type);
    //     // TODO(spdowling) replace with unassigning by relation id
    //     const targetRelation = (target.relations ?? []).
    //         find(r => r.source === source.id && r.type === type);
    //     if (!sourceRelation || !targetRelation) return;
    //     // TODO(spdowling) replace with unassigning by relation id
    //     source.relations = (source.relations ?? [])
    //         .filter(r => r.id !== sourceRelation.id);
    //     // TODO(spdowling) replace with unassigning by relation id
    //     target.relations = (target.relations ?? [])
    //         .filter(r => r.id !== targetRelation.id);
    // }

    #separate() {
        const select = async ({ detail: { item } }) => {
            if (item.id !== undefined) return;
            this.prompt = null;
            // TODO(spdowling) how do we best get the aggregation id now?
            // this.#entities.unrelate(this.#entity, item.id, aggregation.id);
        }
        // TODO(spdowling) filter entities by aggregations of this.#entity
        this.prompt = html`
            <folio-autocomplete
                .data=${this.#entities.value}
                .placeholder=${'Entity to separate...'}
                @folio-autocomplete:select=${select}>
            </folio-autocomplete>`;
    }

    #assign() {
        // TODO(spdowling) capture required property detail in extra prompt
        // const create = ... capture value type at a minimum
        const select = async ({ detail: { item, query } }) => {
            if (!item.id || (item.id === -1 && !query)) return;
            if (item.id === -1) {
                // TODO(spdowlign) trigger create prompt view to capture
                // value type before creating
                item.id = await this.#entities.create({
                    name: query, type: 'PROPERTY'
                });
            }
            this.prompt = null;
            // TODO(spdowling) do we handle this as a relation or just directly
            // assign via a .properties concat?
            // this.#entities.relate(this.#entity, item.id, 'ASSIGN');
        }
        // TODO(spdowling) filter by all known properties
        this.prompt = html`
            <folio-autocomplete
                .data=${this.#entities.value}
                .emptyResult=${{ id: -1, name: 'No property found. Create?' }}
                .placeholder=${'Property to assign...'}
                @folio-autocomplete:select=${select}>
            </folio-autocomplete>`;
    }

    #unassign() {
        const select = async ({ detail: { item } }) => {
            if (item.id !== undefined) return;
            this.prompt = null;
            // TODO(spdowling) how do we best get the assignment id now?
            // this.#entities.unrelate(this.#entity, item.id, assignment.id);
        }
        // TODO(spdowling) filter entities by assignments of this.#entity
        this.prompt = html`
            <folio-autocomplete
                .data=${this.#entities.value}
                .placeholder=${'Property to unassign...'}
                @folio-autocomplete:select=${select}>
            </folio-autocomplete>`;
    }

    // TODO(spdowling) try to make the autocomplete and confirmation prompt
    // process more DRY-friendly?

    // const assign = (item) => { /* do assignment of item */ };
    // this.prompt = this.#choose(this.#entities, assign, {
    //      placeholder: 'Property to assign',
    //      default: { id: -1, name: 'No property found. Create?' }
    // });

    // #choose(items, handler, { placeholder, default }) {
    //      const select = async ({ detail: { item } }) => {
    //          if (!item) return;
    //          await handler(item);
    //          this.prompt = null;
    //      };
    //      return html`
    //          <folio-autocomplete
    //              .data=${items}
    //              .emptyResult=${default}
    //              .placeholder=${placeholder}
    //              @folio-autocomplete:select=${select}>
    //          </folio-autocomplete>`;
    // }

    #next({ key, currentTarget, target }) {
        switch (key) {
            case 'Enter':
                const fields = [...currentTarget.querySelectorAll('input')];
                const cursor = fields.indexOf(target);
                if (cursor > -1 && fields[cursor + 1]) {
                    fields[cursor + 1].focus();
                }
                break;
            case 'Escape':
                target.blur();
                break;
        }
    }

    #update({ target: { name, id, value } }) {
        if (name === 'effective') {
            if (!this.#entity.effective) this.#entity.effective = {};
            this.#entity.effective[id] = value;
            return;
        }
        this.#entity[id] = value;
    }
}

customElements.define('folio-entity', FolioEntityElement);
