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

	console.group('- context eager', id);
	setContext(id);
	fn();
	Object.assign(context, old);
	console.groupEnd();
}

export function withLazyContext(id: ValId, fn: () => void) {
	const old: Context = { ...context };

	console.group('- context lazy', id);
	setLazyContext(id);
	fn();
	Object.assign(context, old);
	console.groupEnd();
}
