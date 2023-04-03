export type ValId = symbol;

export function createId(title = 'val-id'): ValId {
	return Symbol(title);
}

export type ValAct<T> = () => T;

export function isValAct<T>(value: unknown): value is ValAct<T> {
	return typeof value === 'function';
}

export interface ValMeta {
	id: ValId;
	deps: ValId[];
	users: ValId[];
	dirtyDeps: ValId[];
	lazy: boolean;
	title?: string;
}
