import './jsxFactory';
import { App } from './App';
import { isVal, val } from './val';

function render(element: JSX.Element): HTMLElement {
	const { type } = element;

	if (typeof type === 'function') {
		return render(type(element.props));
	}

	const el = document.createElement(type);
	const { children } = element.props;
	if (Array.isArray(children)) {
		for (const child of children) {
			if (child === undefined) {
				continue;
			}
			if (typeof child === 'string' || typeof child === 'number') {
				el.append(document.createTextNode(String(child)));
			} else if ('type' in child) {
				el.append(render(child));
			} else if (isVal(child)) {
				const text = document.createTextNode(String(child));

				val(() => {
					text.textContent = String(child());
				});
				el.append(text);
			}
		}
	}

	const props = element.props as unknown as typeof el;

	for (const key in props) {
		if (Object.hasOwn(props, key) && key !== 'children') {
			const propName = key as keyof typeof el;
			const prop = props[propName] as unknown;

			if (isVal(prop)) {
				val(() => {
					// @ts-expect-error
					el[propName] = prop();
				});
			} else {
				// @ts-expect-error
				el[propName] = prop;
			}
		}
	}

	return el;
}

const app = document.getElementById('app')!;
app.append(render(App()));
