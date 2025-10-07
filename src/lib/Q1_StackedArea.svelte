<script lang="ts">
  import type { TMovie } from "../types";
  import * as d3 from "d3";
  import { getTopGenresByYear } from "./dataProcessing";

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

  const topByYear = $derived(getTopGenresByYear(movies, 3));

  // Get all top genres
  const allTopGenres = $derived(
    Array.from(new Set(topByYear.flatMap(y => y.genres.map(g => g.genre))))
  );

  // Prepare data for stacked area
  const stackData = $derived(() => {
    const data: any[] = [];
    topByYear.forEach(yearData => {
      const row: any = { year: yearData.year };
      allTopGenres.forEach(genre => {
        const found = yearData.genres.find(g => g.genre === genre);
        row[genre] = found ? found.count : 0;
      });
      data.push(row);
    });
    return data;
  });

  const stack = $derived(
    d3.stack().keys(allTopGenres)(stackData())
  );

  const xScale = $derived(
    d3.scaleLinear()
      .domain(d3.extent(topByYear.map(d => d.year)) as [number, number])
      .range([usableArea.left, usableArea.right])
  );

  const yScale = $derived(
    d3.scaleLinear()
      .domain([0, d3.max(stack, layer => d3.max(layer, d => d[1])) || 0])
      .range([usableArea.bottom, usableArea.top])
  );

  const colorScale = $derived(
    d3.scaleOrdinal(d3.schemeCategory10).domain(allTopGenres)
  );

  const area = $derived(
    d3.area<any>()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX)
  );

  let xAxis: any = $state();
  let yAxis: any = $state();

  function updateAxis() {
    if (xAxis) {
      d3.select(xAxis).call(d3.axisBottom(xScale).tickFormat(d => d.toString()));
    }
    if (yAxis) {
      d3.select(yAxis).call(d3.axisLeft(yScale));
    }
  }

  $effect(() => {
    updateAxis();
  });
</script>

<div class="chart-container">
  <h4>Design 2: Stacked Area Chart</h4>
  <p class="description">Shows the cumulative count of top 3 genres over time.</p>

  {#if topByYear.length > 0}
  <svg {width} {height}>
    <g class="areas">
      {#each stack as layer, i}
        <path
          d={area(layer) || ""}
          fill={colorScale(allTopGenres[i])}
          opacity="0.7"
        />
      {/each}
    </g>

    <g class="legend">
      {#each allTopGenres as genre, i}
        <g transform="translate({usableArea.right + 10}, {usableArea.top + i * 20})">
          <rect width="15" height="15" fill={colorScale(genre)} opacity="0.7" />
          <text x="20" y="12" font-size="12">{genre}</text>
        </g>
      {/each}
    </g>

    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />

    <text x={width / 2} y={height - 10} text-anchor="middle" font-size="14">Year</text>
    <text x={-height / 2} y={15} text-anchor="middle" font-size="14" transform="rotate(-90)">Count</text>
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
