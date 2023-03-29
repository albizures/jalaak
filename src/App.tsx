import { h } from './h';
import { Val, val } from './val';

interface ResetBtnProps {
	value: Val<string>;
	children: JSX.Node;
}

function ResetBtn(props: ResetBtnProps) {
	const { value } = props;

	function onClick() {
		console.log('cliec');

		value('reseted');
	}

	return <button onclick={onClick}>reset</button>;
}

export function App() {
	const name = val('');
	function onInput(event: JSX.InputEvent) {
		name(event.target.value);
	}

	return (
		<div>
			<h1>{name}</h1>
			<ResetBtn value={name}>
				<h1>asdf</h1>
			</ResetBtn>
			<input oninput={onInput} value={name} />
		</div>
	);
}
