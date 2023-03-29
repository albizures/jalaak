import { expect, it } from 'vitest';
import { val } from './val';

it('should return current value', () => {
	const a = val(1);

	expect(a()).toBe(1);
	expect(a(2)).toBe(2);
	expect(a(undefined)).toBe(2);
});

it.only('rerun ', () => {
	const a = val('123');

	const test = val(() => {
		console.log('call');

		return a() + '456';
	});

	expect(test()).toBe('123456');
	a('321');
	expect(test()).toBe('321456');
});
