export function h<P extends {}>(
	type: JSX.Component<P>,
	props?: P,
	...children: JSX.Children
): JSX.Element;
export function h<T extends JSX.ElementNames>(
	type: T,
	props?: JSX.IntrinsicElements[T],
	...children: JSX.Children
): JSX.Element;
export function h<P extends {}>(
	type: string | JSX.Component<P>,
	props: P,
	...children: JSX.Children
): JSX.Element {
	const propsAndChildren = {
		...(props ?? {}),
		children,
	} as JSX.PropsAndChildren<P>;
	const el: JSX.Element = {
		type,
		props: propsAndChildren,
	};

	return el;
}
