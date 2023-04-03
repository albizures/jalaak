import { getValMeta } from './meta';
import { ValId } from './types';

export interface Context {
	lazy?: ValId;
	eager?: ValId;
}

export const context: Context = {
	eager: undefined,
	lazy: undefined,
};

function setContext(id: ValId) {
	context.eager = id;
	context.lazy = undefined;
}
function setLazyContext(id: ValId) {
	context.lazy = id;
	context.eager = undefined;
}

export function withContext(id: ValId, fn: () => void) {
	const old = { ...context };

	setContext(id);
	fn();
	Object.assign(context, old);
}

export function withLazyContext(id: ValId, fn: () => void) {
	const old: Context = { ...context };

	setLazyContext(id);
	fn();
	Object.assign(context, old);
}

export function lazyContextMeta() {
	return context.lazy && getValMeta(context.lazy);
}
export function eagerContextMeta() {
	return context.eager && getValMeta(context.eager);
}
