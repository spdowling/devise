// @ts-check

export { EnvironmentController } from './environment-controller';
export { EntityController } from './entity-controller';
export { FolioEnvironmentsElement } from './environments';
export { FolioEnvironmentElement } from './environment';

// NOTE(spdowling) schema definitions that allow for controlled creation,
// versioning, management, discovery and migration

const EnvDBSchema = {
    currentName: 'folio-envs',
    legacyNames: [''],
    1: {
        'envs': {
            schema: { 'id': '', 'type': '', 'name': '' }, extensible: true,
            key: 'id', indexes: { 'named': { key: 'name', unique: true } }
        }
    }
};

const EnvInstanceDBSchema = {
    currentName: 'folio-env',
    legacyNames: [''],
    1: {
        'items': {
            schema: { 'id': '', 'type': '', 'name': '' }, extensible: true,
            key: 'id', indexes: { 'named': { key: 'name', unique: true } },
        }
    }
};

