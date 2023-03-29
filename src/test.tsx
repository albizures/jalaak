import { h } from './h';

function Button() {
	return <button>test</button>;
}

export function test() {
	return (
		<div>
			<Button />
			<Button />
		</div>
	);
}
