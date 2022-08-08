// @ts-check

import { css, html, LitElement } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { EntityController } from '../environment';

// NOTE(spdowling) element composition imports
import '../autocomplete';
import '../property';

// @ts-expect-error
import { styles } from '../../index.scss';

// Resizable and Fixed panel:
// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
// https://developer.mozilla.org/en-US/docs/Web/CSS/resize

// https://github.com/anhr/resizer / https://jsfiddle.net/3jMQD/
// https://stackoverflow.com/questions/8960193/how-to-make-html-element-resizable-using-pure-javascript
// https://www.geeksforgeeks.org/how-to-create-footer-to-stay-at-the-bottom-of-a-web-page/
// https://stackoverflow.com/questions/27793806/how-to-freeze-a-div-to-the-bottom-of-the-page-like-a-footer

// detailsRef.class resizable
// createElement div, div.class resizer
// add mousedown to resizer - init drag
// calc start height, mousemove; drag, mouseup; stopdrag
// drag(): detailsRef.height = startHeight + (e.clientY-startY) (px)

// keep details fixed and just calculate the appropriate height based on drag
// position account for size of the gutter/handle
// have a min-height before they have to close it completely

// grid-auto-comlumns or grid-template-columns can also be calculated just
// as well..

// e.g.
// https://split.js.org

// p.resizable { position: relative; }
// p .resizer { width: 10px; height: 10px; background: blue; position:absolute; right: 0; bottom: 0; cursor: se-resize; }

// var p = document.querySelector('p');

// p.addEventListener('click', function init() {
//     p.removeEventListener('click', init, false);
//     p.className = p.className + ' resizable';
//     var resizer = document.createElement('div');
//     resizer.className = 'resizer';
//     p.appendChild(resizer);
//     resizer.addEventListener('mousedown', initDrag, false);
// }, false);

// var startX, startY, startWidth, startHeight;

// function initDrag(e) {
//     startX = e.clientX;
//     startY = e.clientY;
//     startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10);
//     startHeight = parseInt(document.defaultView.getComputedStyle(p).height, 10);
//     document.documentElement.addEventListener('mousemove', doDrag, false);
//     document.documentElement.addEventListener('mouseup', stopDrag, false);
// }

// function doDrag(e) {
//     p.style.width = (startWidth + e.clientX - startX) + 'px';
//     p.style.height = (startHeight + e.clientY - startY) + 'px';
// }

// function stopDrag(e) {
//     document.documentElement.removeEventListener('mousemove', doDrag, false); document.documentElement.removeEventListener('mouseup', stopDrag, false);
// }


// TODO(spdowling) could see a point in the future where this gets replaced
// by a properties listing instead
export class FolioEntityDataElement extends LitElement {
    #filterRef; #items; #propRefs;

    static styles = [
        styles,
        // TODO(spdowling) allow vertical resize of details
        css`
            :host {
                display: block;
            }

            :host > details {
                position: fixed;
                bottom: 0;
                left: 0;
                background: #fff;
                border-bottom: 0;
            }

            :host > details[open] {
                min-height: 30vh;
            }
        `,
    ];
    
    static properties = {
        env: { type: String, attribute: false },
        entity: { type: String, attribute: false },
        selected: { state: true },
        filtered: { state: true },
        dragIndex: { state: true },
        dropIndex: { state: true }
    };

    constructor() {
        super();
        this.env = '';
        this.entity = '';
        this.selected = -1;
        this.filtered = [];
        this.dragIndex = -1;
        this.dropIndex = -1;
        this.#filterRef = createRef();
    }

    get #entity() {
        return this.#items?.value?.find(i => i.id === this.entity);
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (changedProperties.has('env') &&
            changedProperties.get('env') !== this.env) {
            this.#items = new EntityController(
                this,
                this.env,
                async () => (await this.#items.all())
            );
            // this.#entity = new CatalogController(this, this.catalog,
            //     async () => (await this.catalog.latest(this.entity)),
            // );
            // this.#props = new CatalogController(this, this.catalog,
            //     async () => (this.#entity.value ? await this.catalog.all() : [])
            //         .filter(s => this.#entity.value.properties?.includes(s.id))
            //         .map(p => ({ id: p.id, name: p.name })) ?? [],
            //     { attributes: ['properties'] }
            // );
        }
    }

    render() {
        if (!this.#entity) return;
        const index = this.#items.value
            .filter(s => this.#entity.properties?.includes(s.id))
            .map(p => ({ id: p.id, name: p.name })) ?? [];
        this.#propRefs = Array((this.#entity.properties ?? []).length)
            .fill()
            .map(() => createRef());
        // TODO(spdowling) will this not break how we use propRefs[i]?
        // since we have filtered, so not kept the original indices to validate
        // against propRefs? if I filter, I want to move items around still?
        const props = this.filtered.length
            ? (this.#entity.properties ?? []).filter(c => this.filtered.includes(c))
            : (this.#entity.properties ?? [])
        if (~this.dragIndex && ~this.dropIndex) {
            props.splice(this.dropIndex, 0, props.splice(this.dragIndex, 1)[0]);
        }
        return html`
            <details class="container-fluid">
                <summary>Properties</summary>
                <folio-autocomplete ${ref(this.#filterRef)}
                    .data=${index}
                    @folio-autocomplete:filter=${this.#filter}>
                </folio-autocomplete>
                <ol>
                ${repeat(props, p => p, (p, i) => html`
                    <li id="${p}" draggable="true"
                        aria-selected=${i === this.selected}
                        ${ref(this.#propRefs[i])} @click=${this.#select}
                        @dragstart=${this.#dragStart} @dragenter=${this.#dragEnter}
                        @dragover=${this.#dragOver} @dragleave=${this.#dragLeave}
                        @drop=${this.#dragDrop} @dragend=${this.#dragEnd}>
                        <folio-property
                            .env=${this.env} .property=${p}>
                        </folio-property>
                    </li>`)}
                </ol>
            </details>`;
    }

    #filter(e) {
        // TODO(spdowling) compile the available properties from here
        this.filtered = e.detail.filtered
            .reduce((acc, cur) => acc.concat(cur.item.id), []);
    }

    // revert property
    // revert property value

    #select(e) {
        // const selected = this.#propRefs
        //     .findIndex(r => r.value === e.currentTarget);
        // // NOTE(spdowling) deselect if already selected, unless we are selecting
        // // a child component item (char).
        // this.selected = selected === this.selected && e.target === e.currentTarget ?
        //     this.selected = -1 : selected;
    }

    #dragStart(e) {
        this.dragIndex = this.#propRefs
            .findIndex(r => r.value === e.target);
        this.dropIndex = this.dragIndex;
        this.dropZones = Array.from(e.target.parentElement.children);
        e.dataTransfer.effectAllowed = 'move';
    }

    #dragEnter(e) {
        // TODO(spdowling) do we need to set dropIndex at all? really this is
        // more similar to selected, in that we just need to identify the
        // current potential drop
        // TODO(spdowling) refactor to directly set dropIndex
        const index = this.#propRefs
            .findIndex(r => r.value === this.dropZones
                .find(el => el === e.target || el.contains(e.target)));
        if (~index) this.dropIndex = index;
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();
    }

    #dragOver(e) {
        e.preventDefault();
    }

    #dragLeave(e) {
        e.preventDefault();
    }

    #dragDrop(e) {
        // TODO(spdowling) should we use event details instead of dropIndex?
        if (this.dragIndex === this.dropIndex) return;
        this.#reorder(this.dragIndex, this.dropIndex);
        e.preventDefault();
    }

    #dragEnd(e) {
        this.dragIndex = -1;
        this.dropIndex = -1;
        e.preventDefault();
    }

    // TODO(spdowling) we don't utilise these params, should we?
    #reorder(sourceIndex, targetIndex) {
        // console.log('#reorder():', sourceIndex, targetIndex);
        // const props = this.#entity.value.properties.slice(0);
        // props.splice(this.dropIndex, 0, props.splice(this.dragIndex, 1)[0]);
        // this.#entity.value.properties = props;
    }
}

customElements.define('folio-entity-data', FolioEntityDataElement);
