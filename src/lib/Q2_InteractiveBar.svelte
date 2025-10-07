<script lang="ts">
  import type { TMovie } from "../types";
  import * as d3 from "d3";
  import { getGenreCooccurrence } from "./dataProcessing";

  type Props = {
    movies: TMovie[];
    width?: number;
    height?: number;
  };

  let { movies, width = 600, height = 400 }: Props = $props();

  const margin = { top: 20, bottom: 100, left: 60, right: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };

  const { matrix, genres } = $derived(getGenreCooccurrence(movies));

  let selectedGenre = $state(genres[0] || "Comedy");

  const cooccurrenceData = $derived(
    genres
      .filter(g => g !== selectedGenre)
      .map(g => ({
        genre: g,
        count: matrix[selectedGenre][g]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  );

  const xScale = $derived(
    d3.scaleBand()
      .domain(cooccurrenceData.map(d => d.genre))
      .range([usableArea.left, usableArea.right])
      .padding(0.2)
  );

  const yScale = $derived(
    d3.scaleLinear()
      .domain([0, d3.max(cooccurrenceData, d => d.count) || 0])
      .range([usableArea.bottom, usableArea.top])
  );

  let xAxis: any = $state();
  let yAxis: any = $state();

  function updateAxis() {
    if (xAxis) {
      d3.select(xAxis)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
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
  <h4>Design 3: Interactive Bar Chart</h4>
  <p class="description">Select a genre to see its top 10 co-occurring genres.</p>

  {#if genres.length > 0}
    <div class="controls">
      <label for="genre-select">
        Select Genre:
      </label>
      <select id="genre-select" bind:value={selectedGenre}>
        {#each genres as genre}
          <option value={genre}>{genre}</option>
        {/each}
      </select>
    </div>

    <svg {width} {height}>
    <g class="bars">
      {#each cooccurrenceData as data}
        {@const x = xScale(data.genre)}
        {@const barWidth = xScale.bandwidth()}
        {@const barHeight = yScale(0) - yScale(data.count)}
        {@const y = yScale(data.count)}

        <rect
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill="#ff6b6b"
          opacity="0.8"
          class="bar"
        />

        <text
          x={x! + barWidth / 2}
          y={y - 5}
          text-anchor="middle"
          font-size="12"
          font-weight="bold"
        >
          {data.count}
        </text>
      {/each}
    </g>

    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />

    <text x={width / 2} y={height - 5} text-anchor="middle" font-size="14" font-weight="bold">
      Genres Co-occurring with {selectedGenre}
    </text>
    <text x={-height / 2} y={20} text-anchor="middle" font-size="14" font-weight="bold" transform="rotate(-90)">
      Co-occurrence Count
    </text>
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

  .controls {
    margin: 15px 0;
    padding: 10px;
    background: white;
    border-radius: 5px;
  }

  .controls label {
    margin-right: 10px;
    font-size: 14px;
    font-weight: bold;
  }

  select {
    padding: 5px 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
  }

  .bar {
    transition: opacity 0.2s;
  }

  .bar:hover {
    opacity: 1 !important;
  }
</style>
