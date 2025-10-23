# Assignment 2: Multi-View Visualization Analysis

**Student Name:** [Your Name]
**Date:** October 23, 2025

---

## Project Links

- **Demo URL:** [Your GitHub Pages URL]/A2
- **GitHub Repository:** [Your GitHub Repo URL]

---

## Part 1: Design Reflection

### Question 1: Why do we use opacity = 0.5 for points in the scatter plot? What would happen if the default transparency of all points were set to 1?

Using opacity = 0.5 is a technique to address **overplotting** - when multiple data points occupy the same or very similar positions on the plot. With 895 movies in the dataset, many points will naturally overlap, especially when certain attribute combinations are common (for example, many movies might have similar ratings and release years).

**Benefits of opacity = 0.5:**
- Overlapping points create darker regions, visually indicating **data density**
- We can see "hot spots" where many movies cluster together
- Individual points remain visible without completely obscuring each other
- The visualization provides both individual and aggregate information simultaneously

**If opacity = 1 (fully opaque):**
- Overlapping points would completely hide each other
- We'd lose information about how many movies share similar values
- The last-rendered point would always be on top, hiding all others beneath it
- Dense regions would look identical to sparse regions with just a few points
- We might underestimate the total number of data points or miss important patterns in data distribution

In essence, the semi-transparent circles turn the scatter plot into a pseudo-heatmap, where darkness indicates concentration - a crucial feature for exploring patterns in large datasets.

### Question 2: In the current implementation, all attributes can be bound with the three visual channels, leading to inappropriate encodings (e.g., using the x-axis for the title of 895 movies). Which attribute should be removed from the dropdown list for each channel?

The current implementation allows any attribute to be mapped to any visual channel, which creates some problematic combinations. Here's what should be filtered out:

**X Axis dropdown - should REMOVE:**
- `title` - 895 unique values create an unreadable axis with massive overlap
- `original_title` - same issue as title

**Y Axis dropdown - should REMOVE:**
- `title` - not quantitative or ordinal
- `original_title` - not quantitative or ordinal
- `genres` - already filtered out in the code, which is correct

**Size dropdown - should REMOVE:**
- `title` - categorical with too many unique values, no meaningful ordering
- `original_title` - same issue as title
- `genres` - already filtered out in the code
- Potentially `year` - while it's numeric, using it for size doesn't convey meaningful information (circle size for dates is confusing)

**Reasoning:**
- X and Y axes work best with **quantitative** (numeric) or **ordinal** (ordered categories) data with reasonable cardinality
- Size encoding should represent **magnitude** - it works for numeric attributes like votes, runtime, or rating
- High-cardinality categorical data (like movie titles) should be reserved for tooltips or detail views, not primary visual encodings

The ideal configuration would be:
- X/Y axes: `year`, `average_rating`, `num_votes`, `runtime_minutes`, possibly `genres` for X-axis categorical distribution
- Size: `num_votes`, `runtime_minutes`, `average_rating` (with careful interpretation)

### Question 3: I use curves for the year distribution to showcase how to implement the path generator. But is using curve the best choice here? Anything wrong with using the basic curve?

Using `d3.curveBasis` for the year distribution is **not the best choice** for this particular data, even though it demonstrates the technical capability. Here's why:

**Problems with the curve approach:**

1. **Misrepresents discrete data**: The number of movies released each year is a discrete count (1, 2, 3, etc.), not a continuous measurement. The curve suggests smooth interpolation between years, implying fractional values that don't exist (you can't have 3.7 movies).

2. **Creates false intermediate values**: The curve passes through areas that don't represent actual data. For example, between 2000 (say, 15 movies) and 2001 (say, 20 movies), the curve suggests smooth growth throughout the year 2000.5, which is meaningless.

3. **Can overshoot actual values**: Basis splines can create curves that go above or below the actual data points, potentially showing negative movie counts or impossible peaks.

4. **Obscures actual distribution**: The smoothing effect might hide important patterns like sudden spikes or drops in movie production during specific years.

**Better alternatives:**

- **Bar chart**: Most appropriate for discrete counts over time. Each bar represents a year's count clearly.
- **Line chart with linear interpolation** (`d3.curveLinear`): Connects points with straight lines, doesn't suggest intermediate values as strongly.
- **Step chart** (`d3.curveStepAfter` or `d3.curveStepBefore`): Shows discrete jumps between years, correctly representing that counts change only at year boundaries.
- **Area chart with linear curves**: If you want to emphasize volume while maintaining accuracy.

**When curves ARE appropriate:**
Smooth curves work well for truly continuous data like temperature over time, stock prices, or sensor readings where intermediate values meaningfully exist.

For this dataset, I'd recommend **either a bar chart or a line chart with linear interpolation** - they accurately represent the discrete nature of movie counts while still showing trends over time.

---

## Part 2: Exploratory Data Analysis (EDA)

### Research Question: Which factors influence the ratings of summer movies?

Based on domain knowledge and intuition, I propose three factors that might influence movie ratings:

### Factor 1: Runtime (Movie Length)

**Hypothesis:** Longer movies might receive higher ratings because they allow for more complex storytelling, character development, and emotional investment. Alternatively, they might receive lower ratings if viewers find them too long or poorly paced.

**Analysis Approach:**
- Set X-axis to `runtime_minutes`, Y-axis to `average_rating`
- Look for correlation patterns (positive, negative, or none)
- Use brush to filter different time periods to see if the relationship changed over time

**Expected Patterns:**
- Possible sweet spot around 100-120 minutes with highest ratings
- Very short films (<80 min) might have lower ratings
- Very long films (>150 min) could go either way - either ambitious epics or poorly edited films

**Findings:** [TO BE FILLED AFTER TESTING THE VISUALIZATION]

---

### Factor 2: Popularity (Number of Votes)

**Hypothesis:** Movies with more votes might have different ratings than less-voted movies. This could go two ways:
1. Popular movies (more votes) might be higher quality, attracting more viewers and ratings
2. Or, very popular movies might have more polarizing ratings as they reach broader audiences with diverse tastes

**Analysis Approach:**
- Set X-axis to `num_votes`, Y-axis to `average_rating`
- Set size to `runtime_minutes` to add a third dimension
- Look for clusters - do highly-voted movies cluster at certain rating levels?
- Check if there's a minimum vote threshold for higher ratings

**Expected Patterns:**
- Possible positive correlation: better movies get watched more
- Potential "mainstream penalty": extremely popular movies might regress toward mean rating (~7.0)
- Low-vote movies might show high variance in ratings (small sample size effect)

**Findings:** [TO BE FILLED AFTER TESTING THE VISUALIZATION]

---

### Factor 3: Release Year (Temporal Trends)

**Hypothesis:** Movie ratings might vary across different eras due to changing filmmaking techniques, audience expectations, and potentially rating inflation/deflation on IMDb over time. Summer blockbusters from certain decades might be systematically rated higher or lower.

**Analysis Approach:**
- Set X-axis to `year`, Y-axis to `average_rating`
- Set size to `num_votes` to see if older or newer movies get more attention
- Use the line chart to brush different year ranges
- Look for generational patterns (e.g., 1980s vs 2000s vs 2020s)

**Expected Patterns:**
- Older movies might have selection bias (only "good" old movies are remembered)
- Recent movies might have recency bias or not enough time for ratings to stabilize
- Possible "golden age" periods where summer movies were particularly well-rated

**Findings:** [TO BE FILLED AFTER TESTING THE VISUALIZATION]

---

## Visual Analysis Screenshots

### Factor 1: Runtime vs Rating
[Screenshot showing the scatter plot with runtime_minutes on X-axis and average_rating on Y-axis]

**Observations:**
[Describe what you see - is there a correlation? What does the distribution look like? Any outliers?]

**Conclusion:**
[Does runtime influence rating? How strong is the relationship?]

---

### Factor 2: Popularity vs Rating
[Screenshot showing the scatter plot with num_votes on X-axis and average_rating on Y-axis]

**Observations:**
[Describe patterns - do popular movies tend to have certain ratings? Is there a threshold effect?]

**Conclusion:**
[Does popularity correlate with rating? What's the nature of the relationship?]

---

### Factor 3: Year vs Rating
[Screenshot showing the scatter plot with year on X-axis and average_rating on Y-axis, plus using brush to filter time periods]

**Observations:**
[Describe temporal trends - do certain eras produce better-rated summer movies? Has quality changed over time?]

**Conclusion:**
[Does release year influence rating? Are there distinct periods with different rating patterns?]

---

## Additional Exploration (Optional)

If you implemented additional visualizations or discovered interesting patterns using the multi-view interactions (e.g., brushing to filter by year and then examining runtime/rating relationships within that period), document them here.

### Combined Analysis: [Title]
[Screenshot and description]

**Insights:**
[What did you learn from combining multiple factors?]

---

## Summary of Findings

[Write a concluding paragraph summarizing which of your three proposed factors actually influence movie ratings, and how strong those influences are. Mention any surprising findings or patterns you didn't expect.]

Example structure:
"Based on the exploratory analysis, I found that [Factor X] has a [strong/moderate/weak] influence on movie ratings, with [specific pattern]. [Factor Y] showed [relationship], while [Factor Z] appeared to [finding]. The most surprising discovery was [insight], which suggests that [interpretation]. These findings indicate that summer movie ratings are primarily influenced by [key factors]."

---

## Technical Implementation Notes

All four required features have been successfully implemented:
1. ✅ **Click interaction** - Clicking points in the scatter plot selects/deselects them and displays movie details
2. ✅ **Line chart** - Year distribution curve shows movie counts over time
3. ✅ **Brush interaction** - Dragging on the line chart filters the scatter plot by year range
4. ✅ **Dynamic binding** - Three dropdown menus allow mapping any attribute to X, Y, and Size channels

The implementation uses Svelte 5's runes (`$state`, `$derived`, `$effect`) for reactivity and D3.js for scales and visual generation.
