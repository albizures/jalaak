import { getValMeta } from './meta';
import { ValId } from './types';
import { list, vals } from './val';

const directions = ['->', '<-'] as const;

type Directions = typeof directions[number];

export function createLink(val1: ValId, direction: Directions, val2: ValId) {
	const val1Meta = getValMeta(val1);
	const val2Meta = getValMeta(val2);

	const [userMeta, depMeta] = direction === '->' ? [val1Meta, val2Meta] : [val2Meta, val1Meta];

	if (!userMeta.deps.includes(depMeta.id)) {
		userMeta.deps.push(depMeta.id);
	}

	if (!depMeta.users.includes(userMeta.id)) {
		depMeta.users.push(userMeta.id);
	}
}

interface Link {
	from: string;
	to: string;
}

export function getLinks() {
	const links: Link[] = [];
	const nodes = list.map((id) => {
		const meta = getValMeta(id);
		meta.deps.forEach((depId) => {
			links.push({
				from: String(id),
				to: String(depId),
			});
		});

		return {
			key: String(id),
		};
	});

	return [nodes, links, vals];
}

export function dropLinks(valId: ValId) {
	const valMeta = getValMeta(valId);

	for (const depId of valMeta.deps) {
		const depMeta = getValMeta(depId);

		depMeta.users = depMeta.users.filter((userId) => valId !== userId);
	}
	for (const userId of valMeta.users) {
		const userMeta = getValMeta(userId);

		userMeta.deps = userMeta.deps.filter((depId) => valId !== depId);
	}

	valMeta.deps.length = 0;
	valMeta.users.length = 0;
}
