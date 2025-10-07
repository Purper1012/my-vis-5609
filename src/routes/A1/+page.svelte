<script lang="ts">
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import type { TMovie } from "../../types";
  import Bar from "$lib/Bar.svelte";
  import {
    Q1_3DRidgeline,
    Q1_StackedArea,
    Q1_GroupedBar,
    Q2_Heatmap,
    Q2_NetworkGraph,
    Q2_InteractiveBar
  } from "$lib";

  // Reactive variable for storing the data
  let movies: TMovie[] = [];

  // Function to load the CSV
  async function loadCsv() {
    try {
      const csvUrl = "./summer_movies.csv";
      movies = await d3.csv(csvUrl, (row) => {
        // TIP: in row, all values are strings, so we need to use a row conversion function here to format them
        return {
          tconst: row.tconst!,
          title_type: row.title_type!,
          primary_title: row.primary_title!,
          original_title: row.original_title!,
          year: new Date(row.year!),
          runtime_minutes: Number(row.runtime_minutes),
          genres: row.genres!.split(","),
          average_rating: Number(row.average_rating),
          num_votes: Number(row.num_votes),
        };
      });

      console.log("Loaded CSV Data:", movies);
    } catch (error) {
      console.error("Error loading CSV:", error);
    }
  }
  // Call the loader when the component mounts
  onMount(loadCsv);
</script>

<div class="page-container">
  <header>
    <h1>A1: Visual Encoding - Summer Movies Analysis</h1>
    <p class="subtitle">
      Exploring {movies.length == 0 ? "..." : movies.length} movies with "summer" in their title from IMDb
    </p>
  </header>

  <section class="overview">
    <h2>Dataset Overview: Genre Distribution</h2>
    <Bar {movies} />
  </section>

  <section class="question-section">
    <div class="question-header">
      <h2>Q1: How do the annual top 3 genres change over time?</h2>
      <p class="question-desc">
        This question explores temporal patterns in genre popularity. We need to encode:
        <strong>Time (Year)</strong>, <strong>Ranking</strong>, <strong>Genre Category</strong>, and <strong>Count</strong>.
      </p>
    </div>

    <div class="design-thinking">
      <h3>Design Exploration</h3>
      <p>Three different approaches to visualize temporal ranking changes:</p>
    </div>

    <div class="visualizations">
      <div class="vis-small">
        <Q1_3DRidgeline {movies} width={550} height={480} />
      </div>

      <div class="vis-large">
        <Q1_GroupedBar {movies} width={700} height={450} />
        <div class="design-rationale">
          <h4>Why This Design?</h4>
          <ul>
            <li><strong>Clear Rankings:</strong> Each position (1st, 2nd, 3rd) is explicitly shown</li>
            <li><strong>Quantitative Comparison:</strong> Bar heights show exact counts, not just ranks</li>
            <li><strong>Interactive Exploration:</strong> Slider allows examining year-by-year changes</li>
            <li><strong>Genre Identification:</strong> Labels directly on bars for easy reading</li>
          </ul>
        </div>
      </div>

      <div class="vis-small">
        <Q1_StackedArea {movies} width={550} height={380} />
      </div>
    </div>
  </section>

  <section class="question-section">
    <div class="question-header">
      <h2>Q2: What are the correlations between different genres?</h2>
      <p class="question-desc">
        This question investigates genre co-occurrence patterns. We need to encode:
        <strong>Genre A</strong>, <strong>Genre B</strong>, and <strong>Co-occurrence Frequency</strong>.
      </p>
    </div>

    <div class="design-thinking">
      <h3>Design Exploration</h3>
      <p>Three different approaches to visualize genre relationships:</p>
    </div>

    <div class="visualizations">
      <div class="vis-small">
        <Q2_NetworkGraph {movies} width={550} height={480} />
      </div>

      <div class="vis-large">
        <Q2_Heatmap {movies} width={700} height={700} />
        <div class="design-rationale">
          <h4>Why This Design?</h4>
          <ul>
            <li><strong>Complete Overview:</strong> All genre pairs visible at once</li>
            <li><strong>Pattern Recognition:</strong> Color intensity reveals strong/weak relationships</li>
            <li><strong>Symmetric Matrix:</strong> Easy to compare bidirectional relationships</li>
            <li><strong>Precise Values:</strong> Numbers shown in cells for exact counts</li>
          </ul>
        </div>
      </div>

      <div class="vis-small">
        <Q2_InteractiveBar {movies} width={550} height={380} />
      </div>
    </div>
  </section>

  <footer>
    <p>
      📊 For detailed insights and analysis, see
      <a href="https://github.com/yourusername/my-vis-5609/blob/main/A1_Analysis.md" target="_blank">A1_Analysis.md</a>
    </p>
  </footer>
</div>

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  header {
    text-align: center;
    padding: 30px 0;
    border-bottom: 3px solid #333;
    margin-bottom: 40px;
  }

  h1 {
    font-size: 2.5em;
    margin: 0 0 10px 0;
    color: #2c3e50;
  }

  .subtitle {
    font-size: 1.1em;
    color: #666;
    margin: 0;
  }

  section {
    margin: 50px 0;
  }

  h2 {
    font-size: 1.8em;
    color: #2c3e50;
    margin-bottom: 15px;
    border-left: 5px solid #3498db;
    padding-left: 15px;
  }

  .question-section {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 10px;
    margin: 40px 0;
  }

  .question-header {
    margin-bottom: 30px;
  }

  .question-desc {
    font-size: 1.05em;
    color: #555;
    line-height: 1.6;
  }

  .design-thinking {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #e74c3c;
  }

  .design-thinking h3 {
    margin-top: 0;
    color: #e74c3c;
  }

  .visualizations {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }

  .vis-large {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .vis-small {
    justify-self: center;
  }

  .design-rationale {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
    max-width: 700px;
    border: 2px solid #4CAF50;
  }

  .design-rationale h4 {
    color: #4CAF50;
    margin-top: 0;
  }

  .design-rationale ul {
    margin: 10px 0;
    padding-left: 25px;
  }

  .design-rationale li {
    margin: 8px 0;
    line-height: 1.5;
  }

  footer {
    text-align: center;
    padding: 30px 0;
    margin-top: 60px;
    border-top: 2px solid #ddd;
    color: #666;
  }

  footer a {
    color: #3498db;
    text-decoration: none;
    font-weight: bold;
  }

  footer a:hover {
    text-decoration: underline;
  }
</style>
