# A1: Visual Encoding - Summer Movies Analysis

**Dataset:** IMDb Summer Movies (1,549 movies, 1946-present)

**Visualizations:** D3.js + SvelteKit

**Screenshots:** See PDF submission appendix 

(http://localhost:5174/A1)

---

## a) Visual Design Sketches & Encodings

### Q1: How do the annual top 3 genres change over time?

#### Design 1: 3D Ridge/Mountain Chart
- **Mark:** Smooth area paths (ridgelines)
- **Visual Channels:**
  - X-axis → Year (quantitative, temporal)
  - Y-axis position → Ranking (1st, 2nd, 3rd) - each ridge represents one rank
  - Z-axis (height) → Movie count (quantitative)
  - Color → Movie count (yellow-to-red gradient)
- **Interaction:** Hover year to highlight vertical slice, show genre names + counts

#### Design 2: Stacked Area Chart
- **Mark:** Area regions
- **Visual Channels:**
  - X-axis → Year (temporal)
  - Y-axis → Movie count (quantitative)
  - Color → Genre category
  - Area size → Number of movies
- **Strengths:**
  - Shows cumulative totals over time
  - Good for seeing overall trends in volume
  - Preserves quantitative information
- **Weaknesses:**
  - Hard to track individual genre trajectories
  - Top 3 may change yearly, making stacking inconsistent
  - Difficult to compare exact values

#### Design 3: Grouped Bar Chart with Time Slider  **RECOMMENDED**
- **Mark:** Rectangular bars
- **Visual Channels:**
  - X-axis → Ranking position (1st, 2nd, 3rd)
  - Y-axis → Movie count (quantitative)
  - Color → Genre category (changes per year)
  - Interactive slider → Year selection
- **Strengths:**
  - Clear ranking hierarchy - positions are explicit
  - Quantitative precision - exact counts visible
  - Interactive exploration - year-by-year examination
  - Simple and intuitive - familiar bar chart metaphor
  - **Direct labels** - genre names on bars
- **Weaknesses:**
  - Requires interaction to see temporal changes
  - Can't see overall trends at a glance

### b) Design Choice Rationale (Q1)

**Why Grouped Bar Chart with Slider?**

1. **Explicit Rankings:** Position on X-axis directly encodes 1st, 2nd, 3rd place - no interpretation needed.

2. **Dual Encoding:** Position shows rank, height shows count. Answers "what" and "by how much" simultaneously.

3. **Familiar + Interactive:** Bar charts need no explanation. Slider enables year-by-year exploration without clutter.

4. **Quantitative Precision:** Exact counts visible, not relative sizes that require estimation.

### d) Key Insights (Q1)

1. **Drama Dominance:** Drama holds 1st place in most years, consistently appearing in top 3.

2. **Comedy Stability:** Comedy alternates between 1st and 2nd place across decades - steady popularity with variable production volume.

3. **Romance's Rise:** Romance increases in recent decades (2000s+), moving from occasional top 3 to regular appearance.

4. **Documentary Emergence:** Documentary breaks into top 3 starting 2000s, previously absent.

5. **Limited Genre Pool:** Same 4-5 genres (Drama, Comedy, Romance, Documentary, Horror) dominate throughout 70+ years - stable preferences in "summer" themed content.

---

## Q2: What are the correlations between different genres?

*Example: Which genre often co-occurs with comedy in a movie?*

**Three visual encodings explored:**

#### Design 1: Heatmap / Co-occurrence Matrix ⭐ **RECOMMENDED**
- **Mark:** Rectangular cells (matrix)
- **Visual Channels:**
  - X-axis → Genre A
  - Y-axis → Genre B
  - Color intensity → Co-occurrence frequency
  - Text → Exact counts
- **Strengths:**
  - **Complete overview** - all pairwise relationships visible
  - **Pattern recognition** - color gradients reveal strong/weak relationships
  - **Symmetry** - easy to compare bidirectional relationships
  - **Precise values** - numbers displayed in cells
  - **Scalable** - works well with many genres
- **Weaknesses:**
  - Can be dense with many genres
  - Requires understanding of matrix visualization

#### Design 2: Network Graph
- **Mark:** Nodes (circles) and edges (lines)
- **Visual Channels:**
  - Node → Genre
  - Node size → Genre popularity (total movies)
  - Edge thickness → Co-occurrence frequency
  - Edge presence → Relationship exists
- **Strengths:**
  - Intuitive relationship metaphor
  - Shows network structure and "central" genres
  - Visually appealing
  - Good for identifying clusters
- **Weaknesses:**
  - Layout can be unstable/cluttered
  - Difficult to get precise values
  - Limited to showing strongest connections (filtered to top 30%)
  - Occlusion with many genres

#### Design 3: Interactive Bar Chart
- **Mark:** Rectangular bars
- **Visual Channels:**
  - Dropdown → Select reference genre
  - X-axis → Other genres
  - Y-axis → Co-occurrence count
  - Bar height → Frequency
- **Strengths:**
  - Very simple and clear
  - Easy to compare specific relationships
  - Precise quantitative values
  - Familiar visualization
- **Weaknesses:**
  - One genre at a time - limited overview
  - Requires many interactions to explore all relationships
  - No global pattern visible

### b) Design Choice Rationale (Q2)

**Why Heatmap?**

1. **Complete Coverage:** Shows all genre pairs simultaneously. Network graph filters to top 30%, interactive bar shows one genre at a time.

2. **Pattern Recognition:** Color intensity reveals strong/weak relationships instantly. Symmetric structure confirms data validity.

3. **No Data Loss:** All relationships preserved, including weak correlations. Network graph hides weaker connections.

4. **Quantitative Comparison:** Exact counts in cells enable precise comparisons (e.g., Comedy-Romance vs Comedy-Drama).

5. **Scalability:** Works with many genres. Network graphs become cluttered; bar charts require excessive interaction.

### d) Key Insights (Q2)

1. **Drama-Romance Strongest:** Drama+Romance has highest co-occurrence (200+ movies, darkest cell). Summer movies frequently combine these genres.

2. **Comedy as Mixer:** Comedy co-occurs broadly:
   - Comedy+Romance: 150+ movies
   - Comedy+Drama: high frequency
   - Comedy+Family: moderate frequency

   Comedy enhances other genres rather than standing alone.

3. **Documentary Isolation:** Documentary has low co-occurrence with all genres (light colors) - typically appears solo.

4. **Horror-Thriller Pairing:** Horror+Thriller shows significant co-occurrence - thematic overlap.

5. **Family Film Cluster:**
   - Family+Animation: strong
   - Family+Comedy: strong
   - Family+Adventure: moderate

   Kid-friendly genres combine frequently.

6. **Genre Compatibility Patterns:**
   - High: Drama-Romance, Comedy-Romance
   - Low: Documentary-Horror, Documentary-Thriller

   Cultural norms dictate acceptable combinations.

7. **Comedy Co-occurrence Answer:**
   - Top: Romance, Drama, Family
   - Least: Documentary, Horror
   - Comedy pairs with upbeat genres, not dark/serious content.

---

## c) Design Process

**Systematic approach for both questions:**

1. **Data Attributes:**
   - Q1: Year (temporal), Genre (categorical), Rank (ordinal), Count (quantitative)
   - Q2: Genre A/B (categorical), Co-occurrence (quantitative)

2. **Mark Selection:**
   - Bars for counts, areas for cumulative, cells for matrices

3. **Channel Mapping:**
   - Position for primary comparisons (most accurate)
   - Color for categories and quantities
   - Interaction where static views become cluttered

4. **Selection Criteria:**
   - Effectiveness: Answers question clearly
   - Efficiency: Quick insight extraction
   - Expressiveness: Shows patterns without distortion

---

## Summary

Visual encoding choices directly impact analytical capabilities. Multiple design iterations revealed:

1. **Same data, different stories:** Encoding determines what's visible. It's more like putting on extra human-deciding biases, which manifests how hard it could be for decision making and evaluation in visualization.
2. **Position and color dominate:** Most effective channels for comparison and patterns, which also reveals the challenges of automation of best visualizations for different datasets
3. **Interaction adds depth:** Sliders and hover enable complexity without clutter. Generally, instead of applying biases directly, it provides options for users to filter the data through their interests to better look into the visualizations that matter the most to them


**Answers:**
- **Q1:** Drama and Comedy dominate consistently; Romance rises in recent decades
- **Q2:** Comedy pairs with Romance/Drama; 
Family clusters with Animation/Adventure; Documentary stays isolated

---

## e) References & Links

- **Dataset:** IMDb Non-Commercial Datasets 

- **Design Principles:** Tufte's visual encoding, Munzner's *Visualization Analysis and Design*

- **Repository Structure:**
  - Visualizations: `src/lib/Q1_*.svelte`, `src/lib/Q2_*.svelte`
  - Data Processing: `src/lib/dataProcessing.ts`
  - Main Page: `src/routes/A1/+page.svelte`

