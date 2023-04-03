import { ValId, ValMeta } from './types';

export const valsMeta: Record<ValId, ValMeta> = {};

export function setValMeta(id: ValId, meta: ValMeta) {
	valsMeta[id] = meta;
}

export function getValMeta(id: ValId) {
	return valsMeta[id];
}
