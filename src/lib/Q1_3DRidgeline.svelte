<script lang="ts">
  import type { TMovie } from "../types";
  import * as d3 from "d3";
  import { getTopGenresByYear } from "./dataProcessing";

  type Props = {
    movies: TMovie[];
    width?: number;
    height?: number;
  };

  let { movies, width = 600, height = 500 }: Props = $props();

  const margin = { top: 20, bottom: 60, left: 60, right: 40 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
  };

  const topByYear = $derived(getTopGenresByYear(movies, 3));

  // Hovering state
  let hoveredYear: number | null = $state(null);

  // NEW: X-axis = Year (time), Y-axis = Ranking (1st, 2nd, 3rd), Z-axis = Count (height)
  const xScale = $derived(
    d3.scaleLinear()
      .domain(d3.extent(topByYear.map(d => d.year)) as [number, number])
      .range([usableArea.left, usableArea.right])
  );

  const yOffset = 60; // Spacing between ridges in 3D space

  const heightScale = $derived(
    d3.scaleLinear()
      .domain([0, d3.max(topByYear.flatMap(y => y.genres.map(g => g.count))) || 0])
      .range([0, 120]) // Max height
  );

  // Better color scale - from light yellow to dark red for better contrast
  const colorScale = $derived(
    d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, d3.max(topByYear.flatMap(y => y.genres.map(g => g.count))) || 0])
  );

  // 3D projection: isometric-like
  function project3D(x: number, y: number, z: number) {
    const isoX = x + y * 0.5;
    const isoY = usableArea.bottom - z - y * 0.3;
    return { x: isoX, y: isoY };
  }

  // Generate ridge paths for each rank
  const ridgeData = $derived(() => {
    const ranks = ['1st', '2nd', '3rd'];
    return ranks.map((rank, rankIdx) => {
      const points = topByYear.map(yearData => {
        const genre = yearData.genres[rankIdx];
        const x = xScale(yearData.year);
        const y = rankIdx * yOffset;
        const z = genre ? heightScale(genre.count) : 0;

        return {
          year: yearData.year,
          x,
          y,
          z,
          genre: genre?.genre || '',
          count: genre?.count || 0,
          color: genre ? colorScale(genre.count) : '#ccc'
        };
      });

      return { rank, rankIdx, points };
    });
  });

  // Create smooth path for ridge
  function createRidgePath(points: any[], baseline: number) {
    if (points.length === 0) return '';

    const line = d3.line<any>()
      .x(d => project3D(d.x, d.y, d.z).x)
      .y(d => project3D(d.x, d.y, d.z).y)
      .curve(d3.curveCatmullRom.alpha(0.5)); // Smooth curve

    const baselinePoints = points.map(p => ({
      ...p,
      z: 0
    }));

    const topPath = line(points);
    const bottomPath = line(baselinePoints.reverse());

    return `${topPath} L ${bottomPath?.substring(1)} Z`;
  }

  // Generate gradient for each point
  function getPointColor(point: any, isHovered: boolean) {
    if (hoveredYear === null) return point.color;
    if (isHovered) return point.color;
    return d3.color(point.color)?.copy({opacity: 0.2}).toString() || '#ccc';
  }
</script>

<div class="chart-container">
  <h4>Design 1: 3D Ridge/Mountain Chart</h4>
  <p class="description">
    Smooth mountain ridges showing top 3 genres over time. X-axis = Year, each ridge = ranking position, height = movie count. Hover to highlight a year.
  </p>

  {#if topByYear.length > 0}
    <svg {width} {height}>
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
        <!-- Gradient for better depth -->
        {#each ridgeData() as ridge, idx}
          <linearGradient id="ridge-gradient-{idx}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#fff;stop-opacity:0.4" />
            <stop offset="100%" style="stop-color:#000;stop-opacity:0.1" />
          </linearGradient>
        {/each}
      </defs>

      <!-- Draw ridges from back to front (3rd -> 1st) -->
      <g class="ridges">
        {#each ridgeData().slice().reverse() as ridge}
          {@const path = createRidgePath(ridge.points, 0)}

          <!-- Ridge fill with gradient -->
          <path
            d={path}
            fill="url(#ridge-gradient-{ridge.rankIdx})"
            stroke="#333"
            stroke-width="1.5"
            opacity={hoveredYear === null ? 0.85 : 0.4}
            filter="url(#shadow)"
          />

          <!-- Individual segments for coloring and interaction -->
          {#each ridge.points as point, i}
            {#if i < ridge.points.length - 1}
              {@const nextPoint = ridge.points[i + 1]}
              {@const isHovered = hoveredYear === point.year}

              <!-- Create a quad for this segment -->
              {@const p1 = project3D(point.x, point.y, point.z)}
              {@const p2 = project3D(nextPoint.x, nextPoint.y, nextPoint.z)}
              {@const p3 = project3D(nextPoint.x, nextPoint.y, 0)}
              {@const p4 = project3D(point.x, point.y, 0)}

              <path
                d="M {p1.x},{p1.y} L {p2.x},{p2.y} L {p3.x},{p3.y} L {p4.x},{p4.y} Z"
                fill={getPointColor(point, isHovered)}
                stroke="#555"
                stroke-width="0.5"
                opacity={hoveredYear === null ? 0.9 : (isHovered ? 1 : 0.15)}
                class="ridge-segment"
                onmouseover={() => hoveredYear = point.year}
                onmouseout={() => hoveredYear = null}
              />

              <!-- Show label when hovered -->
              {#if isHovered}
                {@const labelPos = project3D(point.x, point.y, point.z + 15)}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  text-anchor="middle"
                  font-size="11"
                  font-weight="bold"
                  fill="#333"
                  style="pointer-events: none;"
                >
                  {point.genre}: {point.count}
                </text>
              {/if}
            {/if}
          {/each}
        {/each}
      </g>

      <!-- Axes and labels -->
      <g class="axes">
        <!-- X-axis (Year) -->
        <line
          x1={usableArea.left}
          y1={usableArea.bottom}
          x2={usableArea.right}
          y2={usableArea.bottom}
          stroke="#333"
          stroke-width="2"
        />
        <text
          x={width / 2}
          y={usableArea.bottom + 40}
          text-anchor="middle"
          font-size="13"
          font-weight="bold"
        >
          Year
        </text>

        <!-- Year tick marks -->
        {#each topByYear.filter((_, i) => i % 5 === 0) as yearData}
          {@const x = xScale(yearData.year)}
          <line
            x1={x}
            y1={usableArea.bottom}
            x2={x}
            y2={usableArea.bottom + 5}
            stroke="#333"
            stroke-width="1"
          />
          <text
            x={x}
            y={usableArea.bottom + 20}
            text-anchor="middle"
            font-size="10"
          >
            {yearData.year}
          </text>
        {/each}

        <!-- Ridge labels (Ranking) -->
        {#each ridgeData() as ridge}
          {@const firstPoint = ridge.points[0]}
          {@const labelPos = project3D(usableArea.left - 40, firstPoint.y, 0)}
          <text
            x={labelPos.x}
            y={labelPos.y}
            text-anchor="end"
            font-size="12"
            font-weight="bold"
            fill="#333"
          >
            {ridge.rank}
          </text>
        {/each}
      </g>

      <!-- Hover year indicator -->
      {#if hoveredYear !== null}
        {@const x = xScale(hoveredYear)}
        <!-- Vertical line through all ridges -->
        <line
          x1={x}
          y1={usableArea.top}
          x2={x}
          y2={usableArea.bottom}
          stroke="#e63946"
          stroke-width="2"
          stroke-dasharray="5,5"
          style="pointer-events: none;"
        />
        <text
          x={x}
          y={usableArea.top - 5}
          text-anchor="middle"
          font-size="13"
          font-weight="bold"
          fill="#e63946"
          style="pointer-events: none;"
        >
          {hoveredYear}
        </text>
      {/if}
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

  .ridge-segment {
    cursor: pointer;
    transition: opacity 0.15s ease, fill 0.15s ease;
  }

  .ridge-segment:hover {
    stroke-width: 1.5;
  }
</style>
