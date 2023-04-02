import { expect, describe, it } from 'vitest';
import { context, withContext, withLazyContext } from './context';
import { ValId } from './types';
import { createId } from './helpers';

const emptyContext = { eager: undefined, lazy: undefined };
function expectEmptyContext() {
	expect(context).toEqual(emptyContext);
}

function expectEagerContext(eager: ValId) {
	expect(context).toEqual({ eager, lazy: undefined });
}
function expectLazyContext(lazy: ValId) {
	expect(context).toEqual({ eager: undefined, lazy });
}

describe('withContext', () => {
	it('should set the context only while running', () => {
		const id = createId();
		expectEmptyContext();
		withContext(id, () => {
			expectEagerContext(id);
		});
		expectEmptyContext();
	});

	it('should restore the previus context', () => {
		const firstId = createId('first');
		const secondId = createId('second');

		expectEmptyContext();
		withContext(firstId, () => {
			expectEagerContext(firstId);
			withContext(secondId, () => {
				expectEagerContext(secondId);
			});
			expectEagerContext(firstId);
		});
		expectEmptyContext();
	});
});

describe('withLazyContext', () => {
	it('should set the context only while running', () => {
		const id = createId();
		expectEmptyContext();
		withLazyContext(id, () => {
			expect(context.lazy).toBe(id);
		});

		expectEmptyContext();
	});

	it('should restore the previus context', () => {
		const firstId = createId('first');
		const secondId = createId('second');

		expectEmptyContext();
		withLazyContext(firstId, () => {
			expectLazyContext(firstId);
			withLazyContext(secondId, () => {
				expectLazyContext(secondId);
			});
			expectLazyContext(firstId);
		});
		expectEmptyContext();
	});
});
