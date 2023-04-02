import { describe, expect, it, vi } from 'vitest';
import { act, val } from './val';

it('should return the current value', () => {
	const foo = val(1);

	expect(foo()).toBe(1);
	expect(foo(2)).toBe(2);
	// no value
	expect(foo(undefined)).toBe(2);
});

describe('acts', () => {
	it('should eagerly recompute', () => {
		const name = val('World', { title: 'name' });
		const mrName = val(() => `Mr ${name()}`, { title: 'mr' });

		const messageAct = vi.fn(() => {
			return `Hello ${mrName()}!`;
		});

		const message = act(messageAct, { title: 'message' });

		expect(messageAct).toHaveBeenCalledTimes(1);
		expect(message()).toBe('Hello Mr World!');
		// no need to recompute
		expect(messageAct).toHaveBeenCalledTimes(1);

		name('John');
		expect(messageAct).toHaveBeenCalledTimes(2);
		expect(message()).toBe('Hello Mr John!');
		expect(messageAct).toHaveBeenCalledTimes(2);
	});

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

	describe('when acts lazily', () => {
		it('should only compute on demand', () => {
			const name = val('World', { title: 'name' });

			const messageAct = vi.fn(() => {
				return `Hello ${name()}!`;
			});
			const message = val(messageAct, { title: 'message' });

			name('John');
			expect(messageAct).toBeCalledTimes(0);
			expect(message()).toBe('Hello John!');
			expect(messageAct).toBeCalledTimes(1);

			name('Mike');
			expect(messageAct).toBeCalledTimes(1);
			expect(message()).toBe('Hello Mike!');
		});

		it('should only compute once it has users', () => {
			const name = val('John', { title: 'name' });
			const age = val(20, { title: 'age' });
			const time = val(10, { title: 'time' });
			const messageTime = val(() => (time() > 12 ? 'Good afternoon' : 'Good morning'), {
				title: 'message-time',
			});
			const isAdult = val(() => age() > 18, { title: 'isAdult' });

			const log = vi.fn((value) => {
				console.log(value);
			});
			const messageAct = vi.fn(() => {
				return `${messageTime()} ${name()}!`;
			});

			const message = val(messageAct, { title: 'message' });

			name('Mike');
			time(11);
			expect(messageAct).toBeCalledTimes(0);
			act(
				() => {
					if (isAdult()) {
						log(message());
					}
				},
				{ title: 'act' },
			);
			expect(log).toBeCalledTimes(1); // first compute
			expect(messageAct).toBeCalledTimes(1);

			name('Peter');
			time(14);
			// recompute because changed from dependencies
			expect(log).toBeCalledTimes(3);
			expect(messageAct).toBeCalledTimes(3);
			age(10);

			name('John');
			time(14);
			expect(log).toBeCalledTimes(3); // no recompute since name is not use anymore
			expect(messageAct).toBeCalledTimes(3);
			expect(message()).toBe('Good afternoon John!');
		});
	});

	describe('when a dependency receives an update event but maintains the same value', () => {
		it("shouldn't recompute the value", () => {
			const name = val('World', { title: 'name' });

			const messageAct = vi.fn(() => {
				return `Hello ${name()}!`;
			});

			const message = val(messageAct, { title: 'message' });

			expect(message()).toBe('Hello World!');

			name('World');

			expect(message()).toBe('Hello World!');
			expect(messageAct).toHaveBeenCalledTimes(1);
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
