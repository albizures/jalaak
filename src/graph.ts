import * as d3 from 'd3';
import { ValId, getValMeta } from './val';

interface Node extends d3.SimulationNodeDatum {
	valId: ValId;
	id: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {}

export function createGraph(vals: ValId[]) {
	const ids = new Set<string>();
	const idMap = new Map<ValId, string>();
	const links: Link[] = [];
	const nodes: Node[] = vals.map((valId) => {
		const id = String(valId).replace('Symbol(', '').replace(')', '');
		let counter = 2;
		let uniqueId = id;
		while (ids.has(uniqueId)) {
			uniqueId = `${id}-${counter}`;
		}
		idMap.set(valId, uniqueId);
		ids.add(uniqueId);

		return {
			id: uniqueId,
			valId,
		};
	});

	nodes.forEach((node) => {
		const meta = getValMeta(node.valId);
		meta.deps.forEach((depId) => {
			links.push({
				source: node.id,
				target: idMap.get(depId)!,
			});
		});
	});

	const color = d3.scaleOrdinal(nodes, d3.schemeCategory10);
	const simulation = d3
		.forceSimulation<Node>(nodes)
		.force(
			'link',
			d3.forceLink<Node, Link>(links).id((d) => `${String(d.id)}`),
		)
		.force('charge', d3.forceManyBody().strength(-600))
		.force('x', d3.forceX())
		.force('y', d3.forceY());

	const width = 600;
	const height = 600;

	const svg = d3
		.create('svg')
		.attr('viewBox', [-width / 2, -height / 2, width, height])
		.style('font', '12px sans-serif');

	svg
		.append('defs')
		.append('marker')
		.attr('id', 'arrow')
		.attr('viewBox', '0 0 10 10')
		.attr('refX', '16')
		.attr('refY', '5')
		.attr('markerWidth', '7')
		.attr('markerHeight', '7 ')
		.attr('orient', 'auto-start-reverse')
		.append('path')
		.attr('d', 'M 0 0 L 10 5 L 0 10 z');

	const link = svg
		.append('g')
		.attr('fill', 'none')
		.attr('stroke-width', 1)
		.selectAll('path')
		.data(links)
		.join('path')
		.attr('stroke', 'black')
		.attr('marker-end', `url(#arrow)`);

	const node = svg
		.append('g')
		.attr('fill', 'currentColor')
		.attr('stroke-linecap', 'round')
		.attr('stroke-linejoin', 'round')
		.selectAll('g')
		.data(nodes)
		.join('g');

	node
		.append('circle')
		.attr('fill', (d) => color(d))
		.attr('stroke', 'white')
		.attr('stroke-width', 1.5)
		.attr('r', 4);

	node
		.append('text')
		.attr('x', 8)
		.attr('y', '0.31em')
		.text((d) => String(d.id))
		.clone(true)
		.lower()
		.attr('fill', 'none')
		.attr('stroke', 'white')
		.attr('stroke-width', 3);

	interface LinkArc {
		target: {
			x: number;
			y: number;
		};
		source: {
			x: number;
			y: number;
		};
	}

	function linkArc(d: LinkArc) {
		const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
		return `
		M${d.source.x},${d.source.y}
		A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
	`;
	}

	simulation.on('tick', () => {
		// @ts-expect-error
		link.attr('d', linkArc);
		node.attr('transform', (d) => `translate(${d.x},${d.y})`);
	});

	const output = svg.node();

	const container = document.createElement('div');

	Object.assign(container.style, {
		width: '600px',
		height: '600px',
		position: 'fixed',
		right: '0',
		top: '0',
		border: '1px solid black',
	});

	document.body.append(container);

	output && container.append(output);
}
