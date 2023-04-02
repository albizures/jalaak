import { ValAct, ValId } from './types';

export function createId(title = 'val-id'): ValId {
	return Symbol(title);
}

export function isValAct<T>(value: unknown): value is ValAct<T> {
	return typeof value === 'function';
}
