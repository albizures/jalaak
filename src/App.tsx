import { h } from './h';
import { Val, val } from './val';

interface ResetBtnProps {
	value: Val<string>;
	// children: JSX.Node;
}

function ResetBtn(props: ResetBtnProps) {
	const { value } = props;

	function onClick() {
		console.log('cliec');

		value('reseted');
	}

	return <button onclick={onClick}>reset</button>;
}

function onlyIf<T>(condition: Val<T>, fn: (value: T) => JSX.Element) {
	return val(() => {
		const value = condition();

		if (value) {
			return fn(value);
		}

		return;
	});
}

export function App() {
	const name = val('');
	const isShown = val(false);
	function onInput(event: JSX.InputEvent) {
		name(event.target.value);
	}

	const message = val(() => {
		const nameVal = name();
		return `Hello ${nameVal === '' ? 'World' : nameVal}!`;
	});

	function onChecked(event: JSX.InputEvent) {
		isShown(event.target.checked);
	}

	return (
		<div>
			<h1>Name: {name}</h1>

			<div>
				<ResetBtn value={name} />

				<input oninput={onInput} value={name} />
			</div>
			<label>
				Show message
				<input oninput={onChecked} checked={isShown} type="checkbox" />
			</label>
			{onlyIf(isShown, () => {
				return <p>{message}</p>;
			})}
		</div>
	);
}
