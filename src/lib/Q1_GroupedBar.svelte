<script lang="ts">
  import type { TMovie } from "../types";
  import * as d3 from "d3";
  import { getTopGenresByYear } from "./dataProcessing";

  type Props = {
    movies: TMovie[];
    width?: number;
    height?: number;
  };

  let { movies, width = 700, height = 450 }: Props = $props();

  const margin = { top: 40, bottom: 80, left: 60, right: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };

  const topByYear = $derived(getTopGenresByYear(movies, 3));

  let selectedYearIndex = $state(0);

  const selectedYear = $derived(topByYear[selectedYearIndex]);

  const xScale = $derived(
    d3.scaleBand()
      .domain(['1st', '2nd', '3rd'])
      .range([usableArea.left, usableArea.right])
      .padding(0.3)
  );

  const yScale = $derived(
    d3.scaleLinear()
      .domain([0, d3.max(topByYear.flatMap(y => y.genres.map(g => g.count))) || 0])
      .range([usableArea.bottom, usableArea.top])
  );

  const colorScale = $derived(
    d3.scaleOrdinal(d3.schemeSet2)
  );

  let xAxis: any = $state();
  let yAxis: any = $state();

  function updateAxis() {
    if (xAxis) {
      d3.select(xAxis).call(d3.axisBottom(xScale));
    }
    if (yAxis) {
      d3.select(yAxis).call(d3.axisLeft(yScale));
    }
  }

  $effect(() => {
    updateAxis();
  });
</script>

<div class="chart-container recommended">
  <div class="badge">⭐ RECOMMENDED</div>
  <h4>Design 3: Grouped Bar Chart with Time Slider</h4>
  <p class="description">Interactive view of top 3 genres for each year. Use the slider to explore changes over time.</p>

  {#if topByYear.length > 0 && selectedYear}
    <div class="controls">
      <label for="year-slider">
        Year: <strong>{selectedYear.year}</strong>
      </label>
      <input
        id="year-slider"
        type="range"
        min="0"
        max={topByYear.length - 1}
        bind:value={selectedYearIndex}
        style="width: 300px;"
      />
    </div>

    <svg {width} {height}>
      <g class="bars">
        {#each selectedYear.genres as genreData, i}
        {@const rank = i + 1}
        {@const x = xScale(['1st', '2nd', '3rd'][i])}
        {@const barWidth = xScale.bandwidth()}
        {@const barHeight = yScale(0) - yScale(genreData.count)}
        {@const y = yScale(genreData.count)}

        <rect
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={colorScale(genreData.genre)}
          opacity="0.8"
          class="bar"
        />

        <text
          x={x! + barWidth / 2}
          y={y - 5}
          text-anchor="middle"
          font-size="14"
          font-weight="bold"
        >
          {genreData.count}
        </text>

        <text
          x={x! + barWidth / 2}
          y={usableArea.bottom + 25}
          text-anchor="middle"
          font-size="12"
          font-weight="bold"
        >
          {genreData.genre}
        </text>
      {/each}
    </g>

    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />

    <text x={width / 2} y={height - 10} text-anchor="middle" font-size="14" font-weight="bold">Ranking</text>
    <text x={-height / 2} y={20} text-anchor="middle" font-size="14" font-weight="bold" transform="rotate(-90)">Number of Movies</text>
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

  .controls {
    margin: 15px 0;
    padding: 10px;
    background: white;
    border-radius: 5px;
  }

  .controls label {
    display: block;
    margin-bottom: 10px;
    font-size: 14px;
  }

  input[type="range"] {
    cursor: pointer;
  }

  .bar {
    transition: opacity 0.2s ease;
  }

  .bar:hover {
    opacity: 1 !important;
  }
</style>
