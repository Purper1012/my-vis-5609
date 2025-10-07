<script lang="ts">
  import type { TMovie } from "../types";
  import * as d3 from "d3";
  import { getGenreRankingsOverTime } from "./dataProcessing";

  type Props = {
    movies: TMovie[];
    width?: number;
    height?: number;
  };

  let { movies, width = 600, height = 400 }: Props = $props();

  const margin = { top: 20, bottom: 60, left: 50, right: 120 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };

  const genreRankings = $derived(getGenreRankingsOverTime(movies, 3));

  const allYears = $derived(
    Array.from(new Set(genreRankings.flatMap(g => g.data.map(d => d.year)))).sort()
  );

  const xScale = $derived(
    d3.scaleLinear()
      .domain([d3.min(allYears) || 0, d3.max(allYears) || 0])
      .range([usableArea.left, usableArea.right])
  );

  const yScale = $derived(
    d3.scaleLinear()
      .domain([1, 3])
      .range([usableArea.top, usableArea.bottom])
  );

  const colorScale = $derived(
    d3.scaleOrdinal(d3.schemeCategory10)
      .domain(genreRankings.map(g => g.genre))
  );

  const line = $derived(
    d3.line<{year: number, rank: number}>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.rank))
      .curve(d3.curveMonotoneX)
  );

  let xAxis: any = $state();
  let yAxis: any = $state();

  function updateAxis() {
    if (xAxis) {
      d3.select(xAxis)
        .call(d3.axisBottom(xScale).tickFormat(d => d.toString()));
    }
    if (yAxis) {
      d3.select(yAxis)
        .call(d3.axisLeft(yScale).ticks(3).tickFormat(d => `#${d}`));
    }
  }

  $effect(() => {
    updateAxis();
  });
</script>

<div class="chart-container">
  <h4>Design 1: Bump Chart (Ranking Changes)</h4>
  <p class="description">Shows how genre rankings change over time. Lower position = higher rank.</p>

  {#if genreRankings.length > 0}
  <svg {width} {height}>
    <g class="lines">
      {#each genreRankings as genreData}
        <path
          d={line(genreData.data) || ""}
          fill="none"
          stroke={colorScale(genreData.genre)}
          stroke-width="2"
          opacity="0.8"
        />
        {#each genreData.data as point}
          <circle
            cx={xScale(point.year)}
            cy={yScale(point.rank)}
            r="4"
            fill={colorScale(genreData.genre)}
          />
        {/each}
        {#if genreData.data.length > 0}
          <text
            x={usableArea.right + 10}
            y={yScale(genreData.data[genreData.data.length - 1].rank)}
            font-size="12"
            fill={colorScale(genreData.genre)}
            dominant-baseline="middle"
          >
            {genreData.genre}
          </text>
        {/if}
      {/each}
    </g>

    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />

    <text x={width / 2} y={height - 10} text-anchor="middle" font-size="14">Year</text>
    <text x={-height / 2} y={15} text-anchor="middle" font-size="14" transform="rotate(-90)">Rank</text>
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
</style>
