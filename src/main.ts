import './jsxFactory';
import { App } from './App';
import { createGraph } from './graph';
import { isVal, act, ValId, list } from './val';
import { dropVal } from './val/val';

function isElement(child: object): child is JSX.Element {
	return typeof child === 'object' && 'type' in child;
}

interface RenderValResult {
	type: 'placeholder' | 'element' | 'text';
	element: ChildNode;
	vals: ValId[];
}

function renderVal(value: unknown, parent: HTMLElement): RenderValResult {
	const element = document.createTextNode('');

	if (value === null || value === undefined) {
		return { type: 'placeholder', element, vals: [] };
	}

	if (typeof value === 'object') {
		if (isElement(value)) {
			const { vals, element } = render(value, parent);

			return { type: 'element', vals, element };
		}

		throw new Error('Object are not valid children');
	}

	if (typeof value === 'number' || typeof value === 'string') {
		element.textContent = String(value);

		return { type: 'text', element, vals: [] };
	}

	return { type: 'placeholder', element, vals: [] };
}

interface Attes {
	vals: ValId[];
	element: HTMLElement;
}

function render(element: JSX.Element, parent: HTMLElement): Attes {
	const { type } = element;
	const vals: ValId[] = [];

	if (typeof type === 'function') {
		return render(type(element.props), parent);
	}

	const el = document.createElement(type);
	const { children } = element.props;
	if (Array.isArray(children)) {
		for (const child of children) {
			if (child === undefined || typeof child === 'boolean') {
				continue;
			}
			if (typeof child === 'string' || typeof child === 'number') {
				el.append(document.createTextNode(String(child)));
			} else if (isElement(child)) {
				render(child, el);
			} else if (isVal(child)) {
				let node: RenderValResult = {
					type: 'placeholder',
					element: document.createTextNode(''),
					vals: [],
				};
				el.append(node.element);

				vals.push(
					act(
						() => {
							const update = renderVal(child(), el);

							node.element.replaceWith(update.element);

							node.vals.forEach(dropVal);

							node = update;
						},
						{ title: 'child-render' },
					)._VAL_META_.id,
				);
			}
		}
	}

	const props = element.props as unknown as typeof el;

	for (const key in props) {
		if (Object.hasOwn(props, key) && key !== 'children') {
			const propName = key as keyof typeof el;
			const prop = props[propName] as unknown;

			if (isVal(prop)) {
				vals.push(
					act(
						() => {
							// @ts-expect-error
							el[propName] = prop();
						},
						{ title: 'attr-render' },
					)._VAL_META_.id,
				);
			} else {
				// @ts-expect-error
				el[propName] = prop;
			}
		}
	}

	parent.append(el);

	return { vals, element: el };
}

const app = document.getElementById('app');
app && render(App(), app);

function showGraph() {
	createGraph(list);
}
// @ts-ignore
window.showGraph = showGraph;
