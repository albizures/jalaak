import { context, withContext, withLazyContext } from './context';
import { createLink, dropLinks } from './links';
import { getValMeta, setValMeta } from './meta';
import { ValAct, ValId, ValMeta, createId, isValAct } from './types';

export const compute = Symbol('Update');
export type Compute = typeof compute;

export const empty = Symbol('Empty');
export type Empty = typeof empty;

export type ValArg<T> = T | Empty | Compute;

export interface Val<T> {
	(value?: ValArg<T>): T;
	_VAL_META_: ValMeta;
}

export function isVal(val: unknown): val is Val<unknown> {
	return typeof val === 'function' && val !== null && '_VAL_META_' in val;
}

export const list: ValId[] = [];
export const vals: Record<ValId, Val<unknown>> = {};

function setVal<T>(id: ValId, val: Val<T>) {
	vals[id] = val as Val<unknown>;
	list.push(id);
}

export function getVal(id: ValId) {
	return vals[id];
}

function cleanDeps(meta: ValMeta) {
	for (const id of meta.deps) {
		const depMeta = getValMeta(id);
		depMeta.users = depMeta.users.filter((userId) => userId !== meta.id);
	}

	meta.deps.length = 0;
}

function updateUsers(meta: ValMeta) {
	const { users } = meta;

	if (users.includes(meta.id)) {
		throw new Error('recursive');
	}

	for (const userId of users) {
		const user = getVal(userId);
		const { lazy, dirtyDeps } = user._VAL_META_;

		if (lazy) {
			// let's leave the recompute for later
			// and save the deps that changed
			if (!dirtyDeps.includes(meta.id)) {
				dirtyDeps.push(meta.id);
			}
		} else {
			// recompute val
			user(compute);
		}
		// do the same for its deps
		updateUsers(user._VAL_META_);
	}
}

interface ValConfig {
	title?: string;
	lazy?: boolean;
}

function isNewValue<T>(current: T, value: ValArg<T>): value is T {
	return value !== empty && !Object.is(value, current);
}

function shouldRecompute<T>(value: ValArg<T>) {
	return value === compute;
}

/**
 * Creates an eager val
 */
export function act<T>(initial: ValAct<T>, config: Omit<ValConfig, 'lazy'> = {}) {
	return val(initial, {
		...config,
		lazy: false,
	});
}

function hasDirtyDeps(meta: ValMeta) {
	return meta.dirtyDeps.length > 0;
}

function cleanDirtyDeps(meta: ValMeta) {
	meta.dirtyDeps.length = 0;
}

export function val<T>(initial: T | ValAct<T>, config: ValConfig = {}): Val<T> {
	const { title, lazy = true } = config;

	const id = createId(title);
	const meta: ValMeta = {
		id,
		title,
		lazy,
		dirtyDeps: [],
		users: [],
		deps: [],
	};

	setValMeta(id, meta);

	const isAct = isValAct<T>(initial);

	let current: T;

	function compute() {
		current = (initial as ValAct<T>)();
	}

	if (isAct) {
		if (!lazy) {
			if (context.eager) {
				createLink(context.eager, '->', meta.id);
			}
			if (context.lazy) {
				createLink(context.lazy, '->', meta.id);
			}

			withContext(id, compute);
		}
	} else {
		current = initial;
	}

	function create() {
		function val(value: ValArg<T> = empty) {
			if (shouldRecompute(value)) {
				if (isValAct(initial)) {
					// act val should be recomputed
					// and its old deps removed
					cleanDeps(meta);
					withContext(id, compute);
				}
				return;
			}

			if (isNewValue(current, value)) {
				// a new value was provided.
				current = value;
				// deps should be updated
				updateUsers(meta);

				return current;
			}

			if (context.eager) {
				createLink(context.eager, '->', meta.id);
			}
			if (context.lazy) {
				createLink(context.lazy, '->', meta.id);
			}

			if (lazy && isAct && (hasDirtyDeps(meta) || current === undefined)) {
				cleanDirtyDeps(meta);
				cleanDeps(meta);
				withLazyContext(id, compute);
			}

			return current;
		}

		val._VAL_META_ = meta;

		return val as Val<T>;
	}

	const val = create();
	setVal(id, val);

	return val;
}

export function dropVal(valId: ValId) {
	dropLinks(valId);
	const index = list.indexOf(valId);

	list.splice(index, 1);

	delete vals[valId];
}
