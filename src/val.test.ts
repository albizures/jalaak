import { describe, expect, it, vi } from 'vitest';
import { val } from './val';

it('should return the current value', () => {
	const foo = val(1);

	expect(foo()).toBe(1);
	expect(foo(2)).toBe(2);
	// no value
	expect(foo(undefined)).toBe(2);
});

describe('acts', () => {
	describe('when a dependency changes', () => {
		it('should recompute the value', () => {
			const name = val('World', { title: 'name' });

			const message = val(
				() => {
					return `Hello ${name()}!`;
				},
				{ title: 'message' },
			);

			expect(message()).toBe('Hello World!');

			name('John');

			expect(message()).toBe('Hello John!');
		});
	});

	describe('when a nested dependency changes', () => {
		it('should recompute all the dependencies ', () => {
			const name = val('John', { title: 'name' });
			const age = val(20, { title: 'age' });
			const isAdult = val(() => age() > 18, { title: 'isAdult' });

			const messageAct = vi.fn(() => {
				if (isAdult()) {
					return `Hello Mr. ${name()}!`;
				}

				return `Hello ${name()}!`;
			});

			const message = val(messageAct, { title: 'message' });

			expect(message()).toBe('Hello Mr. John!');
			age(10);
			expect(message()).toBe('Hello John!');
		});
	});

	describe('when dependencies changes while recomputing', () => {
		it('should update the dependencies', () => {
			const name = val('John', { title: 'name' });
			const age = val(20, { title: 'age' });

			const messageAct = vi.fn(() => {
				if (age() > 18) {
					return `Hello Mr. ${name()}!`;
				}

				return `Hey kid!`;
			});

			const message = val(messageAct, { title: 'message' });

			expect(message()).toBe('Hello Mr. John!');
			age(10);
			expect(message()).toBe('Hey kid!');
			expect(messageAct).toHaveBeenCalledTimes(2);
			// now it's under 18, and name is not needed
			// it shouldn't change when name changes anymore
			name('Mike');
			expect(messageAct).toHaveBeenCalledTimes(2);
		});
	});
});
