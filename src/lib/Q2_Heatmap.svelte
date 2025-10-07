<script lang="ts">
  import type { TMovie } from "../types";
  import * as d3 from "d3";
  import { getGenreCooccurrence } from "./dataProcessing";

  type Props = {
    movies: TMovie[];
    width?: number;
    height?: number;
  };

  let { movies, width = 700, height = 700 }: Props = $props();

  const margin = { top: 120, bottom: 20, left: 120, right: 20 };

  const { matrix, genres } = $derived(getGenreCooccurrence(movies));

  const cellSize = $derived(
    Math.min(
      (width - margin.left - margin.right) / genres.length,
      (height - margin.top - margin.bottom) / genres.length
    )
  );

  const colorScale = $derived(
    d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(genres.flatMap(g1 => genres.map(g2 => matrix[g1][g2]))) || 0])
  );

  let hoveredCell = $state<{genre1: string, genre2: string, count: number} | null>(null);
</script>

<div class="chart-container recommended">
  <div class="badge">⭐ RECOMMENDED</div>
  <h4>Design 1: Heatmap / Co-occurrence Matrix</h4>
  <p class="description">Shows how often genres appear together. Darker = more frequent co-occurrence. Hover for details.</p>

  {#if genres.length > 0}
    {#if hoveredCell}
    <div class="tooltip">
      <strong>{hoveredCell.genre1}</strong> co-occurs with <strong>{hoveredCell.genre2}</strong>:
      <span class="count">{hoveredCell.count}</span> times
    </div>
  {/if}

  <svg {width} {height}>
    <g transform="translate({margin.left}, {margin.top})">
      {#each genres as genre1, i}
        {#each genres as genre2, j}
          {@const count = matrix[genre1][genre2]}
          <rect
            x={j * cellSize}
            y={i * cellSize}
            width={cellSize}
            height={cellSize}
            fill={colorScale(count)}
            stroke="white"
            stroke-width="1"
            class="cell"
            onmouseover={() => hoveredCell = {genre1, genre2, count}}
            onmouseout={() => hoveredCell = null}
          />
          {#if count > 0 && cellSize > 30}
            <text
              x={j * cellSize + cellSize / 2}
              y={i * cellSize + cellSize / 2}
              text-anchor="middle"
              dominant-baseline="middle"
              font-size={Math.min(cellSize / 3, 10)}
              fill={count > (colorScale.domain()[1] / 2) ? "white" : "black"}
              pointer-events="none"
            >
              {count}
            </text>
          {/if}
        {/each}
      {/each}

      <!-- X-axis labels -->
      {#each genres as genre, i}
        <text
          x={i * cellSize + cellSize / 2}
          y={-10}
          text-anchor="end"
          font-size="11"
          transform="rotate(-45, {i * cellSize + cellSize / 2}, -10)"
        >
          {genre}
        </text>
      {/each}

      <!-- Y-axis labels -->
      {#each genres as genre, i}
        <text
          x={-10}
          y={i * cellSize + cellSize / 2}
          text-anchor="end"
          dominant-baseline="middle"
          font-size="11"
        >
          {genre}
        </text>
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
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fafafa;
    position: relative;
  }

  .recommended {
    border: 3px solid #4CAF50;
    background: #f0f8f0;
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
  }

  .badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #4CAF50;
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
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

  .cell {
    cursor: pointer;
    transition: stroke-width 0.2s;
  }

  .cell:hover {
    stroke: #333;
    stroke-width: 2;
  }

  .tooltip {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 13px;
    pointer-events: none;
    z-index: 10;
    white-space: nowrap;
  }

  .tooltip .count {
    color: #4CAF50;
    font-weight: bold;
  }
</style>
