const update = Symbol('Update');
type Update = typeof update;

const empty = Symbol('Empty');
type Empty = typeof empty;

type ValAct<T> = () => T;

function isValAct<T>(value: unknown): value is ValAct<T> {
	return typeof value === 'function';
}

type ValArg<T> = T | Empty | Update;

export interface Val<T> {
	(value?: ValArg<T>): T;
	isVal: true;
	valId: Symbol;
}
export function isVal(val: unknown): val is Val<unknown> {
	return typeof val === 'function' && val !== null && 'isVal' in val;
}

let context: Symbol | undefined;

function setContext(id: Symbol) {
	context = id;
}

function unSetContext() {
	context = undefined;
}

const vals = new WeakMap<Symbol, Val<unknown>>();
const deps = new WeakMap<Symbol, Symbol[]>();

function addDep(val: Symbol, dep: Symbol) {
	const list = deps.get(val);

	if (Array.isArray(list)) {
		if (!list.includes(dep)) {
			deps.set(val, list.concat(dep));
		}
	} else {
		deps.set(val, [dep]);
	}
}

function registerVal<T>(id: Symbol, val: Val<T>) {
	vals.set(id, val as Val<unknown>);
}

function getVal(id: Symbol) {
	return vals.get(id);
}

function updateDeps(val: Symbol) {
	const list = deps.get(val);

	if (list) {
		for (let index = 0; index < list.length; index++) {
			const val = getVal(list[index]);

			val && val(update);
		}
	}
}

export function val<T>(initial: T | ValAct<T>): Val<T> {
	const id = Symbol('val-id');

	setContext(id);
	let current: T = isValAct<T>(initial) ? initial() : initial;
	unSetContext();

	function create() {
		function val(value: ValArg<T> = empty) {
			if (value === update) {
				if (isValAct(initial)) {
					current = initial();
				}
				return;
			}

			if (value !== empty) {
				current = value;
				updateDeps(id);
				return current;
			}

			if (context) {
				addDep(id, context);
			}

			return current;
		}

		val.isVal = true;
		val.valId = id;

		return val as Val<T>;
	}

	const val = create();
	registerVal(id, val);

	return val;
}
