// @ts-check

import { html, LitElement, nothing } from 'lit';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { EntityController } from '../environment';

// NOTE(spdowling) element composition imports
import './value';

// @ts-expect-error
import { styles } from '../../index.scss';

// export const PropertyType = enumerate(
//     'BOOLEAN', 'TEXT', 'EMAIL', 'URL', 'TEL',
//     'NUMBER', 'RANGE', 'DATETIME', 'TIME',
// );

export class FolioPropertyElement extends LitElement {
    #items;

    static styles = [styles];

    static properties = {
        env: { type: String, attribute: false },
        property: { type: String, attribute: false },
        nested: { type: Boolean }
    };

    constructor() {
        super();
        this.env = '';
        this.property = '';
        this.nested = false;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('env') &&
            changedProperties.get('env') !== this.env) {
            this.#items = new EntityController(this, this.env,
                async () => (await this.#items.all()),
                { records: true }
            );
        }
    }

    render() {
        const prop = (this.#items?.value ?? [])
            .find(i => i.id === this.property);
        if (!prop) return html`No property data found.`;
        // TODO(spdowling) group min, max, def (multiplicity)
        // TODO(spdowling) group configurable, extensible, unique (behaviour)
        // TODO(spdowling) render group html individually (details, multiplicity,
        // and behaiour)
        const {
            id, name, description,
            values, min, max, def,
            configurable, extensible, unique } = prop;
        const relations = (prop.relations ?? [])
            .filter(r => r.type === 'aggregate' && r.target);
        // TODO(spdowling) add date support for effectiveFrom and effectiveUntil
        // TODO(spdowling) defaults should be driven by selection of current values
        // and restricted based on multiplicity (e.g. can only select 5 if max is
        // 5)
        // TODO(spdowling) separate multiplicities for values from multiplicity
        // of the property assignment. assignment multiplicity should be
        // related to the assignment value (e.g. entity.property entries)
        // TODO(spdowling) this feels all very lengthy, is there no way around
        // how messy this looks and feels right now? do we set an alternative
        // column limit on HTML over code? right now code is at 80, perhaps
        // HTML gets a breath at 120?

        // TODO(spdowling) consider use of the cache() to allow for re-rendering?
        return html`
            <details open><summary>${name} (${id})</summary>
                <form>
                    <div class="grid">
                        <fieldset>
                            <label for="name">Name
                                <input type="text" id="name" name="name" value="${name}" required
                                    @change=${this.#update}>
                                <small>Uniquely identifying name.</small>
                            </label>
                            <label for="description">Description
                                <textarea id="description" name="description" rows="5"
                                    @change=${this.#update}>${description}</textarea>
                                <small>Descriptions should help answer the why and the how.</small>
                                </label>
                            <div class="grid">
                                <label for="effectiveFrom">Effective From
                                    <input type="date" id="effectiveFrom" name="effectiveFrom">
                                    <small>First date to use this entity.</small>
                                </label>
                                <label for="effectiveUntil">Effective Until
                                    <input type="date" id="effectiveUntil" name="effectiveUntil">
                                    <small>Last date to use this entity.</small>
                                </label>
                            </div>
                            <div class="grid">
                                <label for="min">Min Instances
                                    <input type="number" id="min" name="min" min="0" max="${max}" value="${min}"
                                        @change=${this.#update}>
                                    <small>The min required instances.</small>
                                </label>
                                <label for="max">Max Instances
                                    <input type="number" id="max" name="max" min="${min}" max="99999" value="${max}"
                                        @change=${this.#update}>
                                    <small>The max allowed instances.</small>
                                </label>
                                <label for="def">Default Instances
                                    <input type="number" id="def" name="def" min="0" max="${max}" value="${def}"
                                        @change=${this.#update}>
                                    <small>The default instance count.</small>
                                </label>
                            </div>
                        </fieldset>
                        <fieldset>
                            <label for="new">New Value
                                <input id="new" type="text" name="new" @change=${this.#update}>
                                <small>Add a new property value to the list.</small>
                            </label>
                            <label for="values">Values
                                <select id="values" name="values" size="12" multiple
                                    @change=${this.#update}>
                                ${map(values, v => html`
                                    <option ?selected=${v.default}>${v.value}</option>
                                `)}
                                </select>
                                <small>Selected values will be runtime defaults.</small>
                            </label>
                            <div class="grid">
                                <div class="grid">
                                    <label for="min">Min Values
                                        <input type="number" id="min" name="min" min="0" max="${max}" value="${min}"
                                            @change=${this.#update}>
                                        <small>The min required values per instance.</small>
                                    </label>
                                    <label for="max">Max Values
                                        <input type="number" id="max" name="max" min="${min}" max="99999" value="${max}"
                                            @change=${this.#update}>
                                        <small>The max allowed values per instance.</small>
                                    </label>
                                </div>
                                <fieldset><legend>Runtime Behaviour</legend>
                                    <label for="configurable">
                                        <input type="checkbox" id="configurable name="configurable" role="switch"
                                            ?checked=${configurable} @change=${this.#update}>
                                        Allow instance configuration
                                    </label>
                                    <label for="extensible">
                                        <input type="checkbox" id="extensible" name="extensible" role="switch"
                                            ?checked=${extensible} @change=${this.#update}>
                                        Allow instance defined values
                                    </label>
                                    <label for="unique">
                                        <input type="checkbox" id="unique" name="unique" role="switch" ?checked=${unique}
                                            @change=${this.#update}>
                                        Require unique instance values
                                    </label>
                                </fieldset>
                            </div>
                        </fieldset>
                    </div>
                ${!this.nested ? html`
                    <!--<a href="javascript:;" role="button" @click=${this.#aggregate}>Aggregate</a>-->
                    <!--<a href="javascript:;" role="button" @click=${this.#unassign}>Unassign</a>-->
                ` : html`
                    <!--<a href="javascript:;" role="button" @click=${this.#separate}>Separate</a>-->
                `}
                ${relations.length ? html`
                    <ol>
                    ${repeat(relations, r => r.id, r => html`
                        <li id="${r.id}">
                            <input type="number" name="min" min="0" max="${r.max}" value="${r.min}" @change=${this.#update}>
                            <input type="number" name="max" min="${r.min}" max="99999" value="${r.max}" @change=${this.#update}>
                            <input type="number" name="def" min="0" max="99999" value="${r.def}" @change=${this.#update}>
                            <folio-property ?nested=${true}
                                .env=${this.env} .property=${r.target}
                                @folio-property:separate=${this.#separate}>
                            </folio-property>
                        </li>
                    `)}
                    </ol>` : nothing}
                <form>
            </details>`;
    }

    // TODO(spdowling) update should trigger validation and only continue
    // if valid, otherwise mark as invalid and do not make commited change
    // to entity
    // TODO(spdowling) i'd like to trim down this code as much as possible as well
    // this feels quite clunky to do all of this checking at once, especially
    // given we also have to perform an await on catalog data retrieval in here
    async #update(e) {
        if (!e.target.name) return;
        const prop = (this.#items?.value ?? [])
            .find(i => i.id === this.property);

        // TODO(spdowling) can we infer that we are adding a new item when
        // the edit is to an input that is right next to a multi select that
        // also happens to be in the same exact fieldset
        if (e.target.name === 'new') {
            prop.values = (prop.values ?? []).concat({
                value: e.target.value,
            });
            e.target.value = '';
            return;
        }
        // TODO(spdowling) can we do better here? seems like we are doing this
        // for assignment multiplicities mostly. can we generalise it somehow
        // so that we don't have to explicitly call out an element name?
        if (e.target.name.split('-')[0] === 'relation') {
            // const value = e.target.value;
            // const relationId = e.target.id.split('-')[0];
            // const relationProperty = e.target.name.split('-')[1];
            // if (!relationId || !relationProperty) return;
            // const target = await this.catalog.latest(
            //     prop.relations.find(a => a.id === relationId).target
            // );
            // if (!target) return;
            // target.relations = target.relations.map(a => ({
            //     ...a, ...(a.source === prop.id && { [relationProperty]: value })
            // }));
            // prop.relations = prop.relations.map(a => ({
            //     ...a, ...(a.id === relationId && { [relationProperty]: value })
            // }));
            return;
        }
        if (e.target.type === 'checkbox') {
            prop[e.target.name] = e.target.checked;
            return;
        }
        if (e.target.type === 'select-one' ||
            e.target.type === 'select-multiple') {
            const selected = Array.from(e.target.selectedOptions);
            prop.values = prop.values.map(v => ({
                ...v,
                ...{ default: selected.some(s => s.value === v.value) }
            }));
            return;
        }
        prop[e.target.name] = e.target.value;
    }

    // TODO(spdowling) valid target replacements for hotkeys usage?
    // Enter being a 'next field' option is nice to keep around for reference
    // if we determine it's a nicer feature in the future
    // TODO(spdowling) using Backspace to delete values is a nice touch still
    // would be good to keep it just make it a little simpler
    #next(e) {
        switch (e.key) {
            case 'Enter':
                // TODO(spdowling) replace with array of refs?
                const field = Array.from(
                    this.shadowRoot.querySelectorAll('input, select')
                );
                const i = field.findIndex((f) => f.id === e.target.id);
                // @ts-expect-error
                if (i > -1 && field[i + 1]) field[i + 1].focus();
                break;
            case 'Backspace':
                if (e.target.type === 'select-multiple' &&
                    e.target.name === 'values') {
                    const prop = (this.#items?.value ?? [])
                        .find(i => i.id === this.property);
                    const selected = Array.from(e.target.selectedOptions);
                    prop.values = (prop.values ?? [])
                        .filter(v => !selected.some(s => s.value === v.value));
                }
                break;
        }
    }

    // TODO(spdowling) replace with some concept of command registration
    // to relate another property here instead.
    async #aggregate(e) {
        // const created = await this.catalog.create({
        //     name: (new Date().valueOf() + Math.random()).toString().slice(-10),
        //     type: CatalogItemType.CHARACTERISTIC,
        //     description: 'A new relation child prop.',
        //     format: CharacteristicType.TEXT,
        //     values: [
        //         { value: "value 1", default: true },
        //         { value: "value 2", },
        //         { value: "value 3", },
        //     ],
        //     min: 2, max: 2,
        //     configurable: true, extensible: false, unique: false,
        // });
        // this.#relate(created, 'aggregate', { min: 1, max: 1, def: 1 });
    }

    // TODO(spdowling) should we be relying on the catalog to create the
    // actual relations for us? so we just ask it to create one of a
    // certain type with additional detail attached?
    // also consider that even assignments like characteristics are really
    // another description of relation, relation via reference to another
    // item type... so maybe then that's another core relationship type?
    // ASSIGNMENT?
    #relate(target, type, options) {
        // TODO(spdowling) validate type against catalog relations
        if (!target || !type) return;
        // const source = this.#prop.value;
        // const { min = 1, max = 1, def = 1 } = options;
        // // TODO(spdowling) replace with controller.create(relation) and
        // // assigning relation record id
        // target.relations = (target.relations ?? [])
        //     .concat({
        //         id: nanoid(), type, source: source.id,
        //         min, max, def,
        //     });
        // // TODO(spdowling) replace with controller.create(relation) and
        // // assigning relation record id
        // source.relations = (source.relations ?? [])
        //     .concat({
        //         id: nanoid(), type, target: target.id,
        //         min, max, def,
        //     });
    }

    async #separate(e) {
        // if (e.type === 'click') {
        //     this.dispatchEvent(new CustomEvent(
        //         'folio-property:separate', {
        //         detail: { source: this.#prop.value }
        //     }));
        //     return;
        // }
        // if (!e.detail?.source?.id) return;
        // const target = await this.catalog.latest(e.detail.source.id);
        // if (!target) return;
        // this.#unrelate(target, 'aggregate');
    }

    #unrelate(target, type) {
        // if (!target || !type) return;
        // const source = this.#prop.value;
        // // TODO(spdowling) replace with unassigning by relation id
        // const sourceRelation = (source.relations ?? [])
        //     .find(r => r.target === target.id && r.type === type);
        // // TODO(spdowling) replace with unassigning by relation id
        // const targetRelation = (target.relations ?? [])
        //     .find(r => r.source === source.id && r.type === type);
        // if (!sourceRelation || !targetRelation) return;
        // // TODO(spdowling) replace with unassigning by relation id
        // source.relations = (source.relations ?? [])
        //     .filter(r => r.id !== sourceRelation.id);
        // // TODO(spdowling) replace with unassigning by relation id
        // target.relations = (target.relations ?? [])
        //     .filter(r => r.id !== targetRelation.id);
    }

    #unassign(e) {
        // this.dispatchEvent(new CustomEvent(
        //     'folio-property:unassign', {
        //     // TODO(spdowling) remove `composed: true`
        //     composed: true, detail: { source: this.#prop.value.id }
        // }));
    }
}

customElements.define('folio-property', FolioPropertyElement);
