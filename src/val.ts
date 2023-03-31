const compute = Symbol('Update');
type Compute = typeof compute;

const empty = Symbol('Empty');
type Empty = typeof empty;

type ValAct<T> = () => T;

type ValId = symbol;

function createId(title = 'val-id'): ValId {
	return Symbol(title);
}

function isValAct<T>(value: unknown): value is ValAct<T> {
	return typeof value === 'function';
}

type ValArg<T> = T | Empty | Compute;
interface ValMeta {
	id: ValId;
	deps: ValId[];
	users: ValId[];
	title?: string;
}

export interface Val<T> {
	(value?: ValArg<T>): T;
	_VAL_META_: ValMeta;
}
export function isVal(val: unknown): val is Val<unknown> {
	return typeof val === 'function' && val !== null && 'isVal' in val;
}

let context: ValId | undefined;

function setContext(id: ValId) {
	context = id;
}

function unSetContext() {
	context = undefined;
}

const valsMeta: Record<ValId, ValMeta> = {};
const vals: Record<ValId, Val<unknown>> = {};
// const deps = new WeakMap<ValId, ValId[]>();

function addDep(userId: ValId, meta: ValMeta) {
	const userMeta = getValMeta(userId);
	if (!userMeta.deps.includes(meta.id)) {
		userMeta.deps.push(meta.id);
	}

	if (!meta.users.includes(userId)) {
		meta.users.push(userId);
	}
}

function registerValMeta(id: ValId, meta: ValMeta) {
	valsMeta[id] = meta;
}
function registerVal<T>(id: ValId, val: Val<T>) {
	vals[id] = val as Val<unknown>;
}

function getValMeta(id: ValId) {
	return valsMeta[id];
}
function getVal(id: ValId) {
	return vals[id];
}

function cleanDeps(valId: ValId) {
	for (const id of getValMeta(valId).deps) {
		getValMeta(id).users = getValMeta(id).users.filter((userId) => userId !== valId);
	}

	getValMeta(valId).deps = [];
}

function updateUsers(val: ValId) {
	const list = getValMeta(val).users;

	for (let index = 0; index < list.length; index++) {
		const val = getVal(list[index]);

		if (val) {
			// recompute val and its deps
			val(compute);
			updateUsers(val._VAL_META_.id);
			// throw new Error('');
		}
	}
}

interface ValConfig {
	title?: string;
}

function withContext(id: ValId, fn: () => void) {
	setContext(id);
	fn();
	unSetContext();
}

function isNewValue<T>(current: T, value: ValArg<T>): value is T {
	return value !== empty && !Object.is(value, current);
}

function shouldRecompute<T>(value: ValArg<T>) {
	return value === compute;
}

export function val<T>(initial: T | ValAct<T>, config: ValConfig = {}): Val<T> {
	const { title } = config;

	const id = createId(title);
	const meta: ValMeta = {
		id,
		title,
		users: [],
		deps: [],
	};

	registerValMeta(id, meta);

	let current: T;
	withContext(id, () => {
		current = isValAct<T>(initial) ? initial() : initial;
	});

	function create() {
		function val(value: ValArg<T> = empty) {
			if (shouldRecompute(value)) {
				if (isValAct(initial)) {
					// act val should be recomputed
					// and its old deps removed
					cleanDeps(id);

					withContext(id, () => {
						current = initial();
					});
				}
				return;
			}

			if (isNewValue(current, value)) {
				// a new value was provided.
				current = value;
				// deps should be updated
				updateUsers(id);

				return current;
			}

			if (context) {
				addDep(context, meta);
			}

			return current;
		}

		val._VAL_META_ = meta;

		return val as Val<T>;
	}

	const val = create();
	registerVal(id, val);

	return val;
}
