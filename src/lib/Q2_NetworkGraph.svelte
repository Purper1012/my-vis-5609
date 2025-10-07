<script lang="ts">
  import type { TMovie } from "../types";
  import * as d3 from "d3";
  import { getGenreCooccurrence } from "./dataProcessing";
  import { onMount } from "svelte";

  type Props = {
    movies: TMovie[];
    width?: number;
    height?: number;
  };

  let { movies, width = 600, height = 500 }: Props = $props();

  const { matrix, genres } = $derived(getGenreCooccurrence(movies));

  // Create nodes and links - nodes must be $state to update with simulation
  let nodes = $state<any[]>([]);

  const nodesData = $derived(
    genres.map(genre => ({
      id: genre,
      count: movies.filter(m => m.genres.includes(genre)).length
    }))
  );

  const links = $derived(() => {
    const result: {source: string, target: string, value: number}[] = [];
    genres.forEach(g1 => {
      genres.forEach(g2 => {
        if (g1 < g2 && matrix[g1][g2] > 0) {
          result.push({
            source: g1,
            target: g2,
            value: matrix[g1][g2]
          });
        }
      });
    });
    // Keep only strong connections (top 30%)
    const sorted = result.sort((a, b) => b.value - a.value);
    return sorted.slice(0, Math.ceil(sorted.length * 0.3));
  });

  let svgElement: SVGSVGElement;
  let simulation: d3.Simulation<any, any>;

  onMount(() => {
    nodes = [...nodesData];
    createSimulation();
    return () => {
      if (simulation) simulation.stop();
    };
  });

  function createSimulation() {
    if (nodes.length === 0) return;

    simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links()).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    simulation.on("tick", () => {
      // Trigger reactivity
      nodes = [...nodes];
    });
  }

  $effect(() => {
    if (nodesData.length > 0 && nodes.length === 0) {
      nodes = [...nodesData];
      createSimulation();
    }
  });

  const nodeRadius = (count: number) => {
    const max = d3.max(nodes, d => d.count) || 1;
    return 5 + (count / max) * 15;
  };

  const linkWidth = (value: number) => {
    const max = d3.max(links(), d => d.value) || 1;
    return 1 + (value / max) * 5;
  };

  let hoveredNode = $state<string | null>(null);
</script>

<div class="chart-container">
  <h4>Design 2: Network Graph</h4>
  <p class="description">Genres as nodes, connections show co-occurrences. Node size = popularity, edge thickness = co-occurrence frequency. Shows top 30% strongest connections.</p>

  {#if nodes.length > 0}
  <svg bind:this={svgElement} {width} {height}>
    <g class="links">
      {#each links() as link}
        {@const source = nodes.find(n => n.id === link.source) || nodes.find(n => n.id === (link.source as any).id)}
        {@const target = nodes.find(n => n.id === link.target) || nodes.find(n => n.id === (link.target as any).id)}
        {#if source && target && source.x && source.y && target.x && target.y}
          <line
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke="#999"
            stroke-width={linkWidth(link.value)}
            opacity="0.6"
          />
        {/if}
      {/each}
    </g>

    <g class="nodes">
      {#each nodes as node}
        {#if node.x && node.y}
          <circle
            cx={node.x}
            cy={node.y}
            r={nodeRadius(node.count)}
            fill={hoveredNode === node.id ? "#ff6b6b" : "#4ecdc4"}
            stroke="#333"
            stroke-width="2"
            opacity={hoveredNode === null || hoveredNode === node.id ? 1 : 0.3}
            class="node"
            onmouseover={() => hoveredNode = node.id}
            onmouseout={() => hoveredNode = null}
          />
          <text
            x={node.x}
            y={node.y + nodeRadius(node.count) + 12}
            text-anchor="middle"
            font-size="10"
            font-weight={hoveredNode === node.id ? "bold" : "normal"}
          >
            {node.id}
          </text>
        {/if}
      {/each}
    </g>
  </svg>
  {:else}
    <p style="text-align: center; color: #999; padding: 40px;">Loading data...</p>
  {/if}
</div>

<style>
  .chart-container {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fafafa;
  }

  h4 {
    margin: 0 0 5px 0;
    color: #333;
  }

  .description {
    margin: 0 0 15px 0;
    font-size: 12px;
    color: #666;
  }

  .node {
    cursor: pointer;
    transition: opacity 0.2s, fill 0.2s;
  }
</style>
