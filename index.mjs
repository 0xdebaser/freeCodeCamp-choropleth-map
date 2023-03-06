import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import usEducationData from "./data/usEducationData.js";
import usCountyData from "./data/usCountyData.js";

const h = 700;
const w = 1200;

function getEdDataById(id) {
  for (let i = 0; i < usEducationData.length; i++) {
    if (usEducationData[i].fips === id) return usEducationData[i];
  }
  console.log(`County ${id} not found!`);
  return false;
}

const svg = d3
  .select("#graph-container")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

let minCompletion = 100;
let maxCompleteion = 0;
for (let i = 0; i < usEducationData.length; i++) {
  if (usEducationData[i].bachelorsOrHigher < minCompletion)
    minCompletion = usEducationData[i].bachelorsOrHigher;
  if (usEducationData[i].bachelorsOrHigher > maxCompleteion)
    maxCompleteion = usEducationData[i].bachelorsOrHigher;
}

console.log(minCompletion);
console.log(maxCompleteion);

const feature = topojson.feature(usCountyData, usCountyData.objects.counties);
const path = d3.geoPath();

svg
  .selectAll("path")
  .data(feature.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("fill", (d) => {
    const countyEdData = getEdDataById(d.id);
    const compPercentage = countyEdData.bachelorsOrHigher;
    return `rgb(${Math.floor((1 - compPercentage / 100) * 255)}, ${Math.floor(
      (1 - compPercentage / 100) * 255
    )}, 255)`;
  })
  .attr("transform", "translate(100, 0)")
  .attr("class", "county")
  .attr("data-fips", (d) => {
    const countyEdData = getEdDataById(d.id);
    const fips = countyEdData.fips;
    return fips;
  })
  .attr("data-education", (d) => {
    const countyEdData = getEdDataById(d.id);
    const percentage = countyEdData.bachelorsOrHigher;
    return percentage;
  });

const legendHeight = 40;
const legendWidth = legendHeight * 15;

const legendSvg = d3
  .select("#legend-svg-container")
  .append("svg")
  .attr("height", legendHeight)
  .attr("width", legendWidth);

const tempColors = [];
for (let i = 0; i < 15; i++) {
  const compPercentage = (i + 1) * 5;
  const rgb = `rgb(${Math.floor(
    (1 - compPercentage / 100) * 255
  )}, ${Math.floor((1 - compPercentage / 100) * 255)}, 255)`;
  tempColors.push(rgb);
}

legendSvg
  .selectAll("rect")
  .data(tempColors)
  .enter()
  .append("rect")
  .attr("height", legendHeight)
  .attr("width", legendHeight)
  .attr("x", (_, i) => i * legendHeight)
  .attr("fill", (d) => d);

const tooltip = d3
  .select("body")
  .data(feature.features)
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip");

svg
  .selectAll("path")
  .on("mouseover", (_, d) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    const countyEdData = getEdDataById(d.id);
    tooltip.html(
      `${countyEdData.area_name}, ${countyEdData.state}<br>${countyEdData.bachelorsOrHigher}%`
    );
    tooltip.attr("data-education", countyEdData.bachelorsOrHigher);
    tooltip
      .style("left", event.pageX + 20 + "px")
      .style("top", event.pageY + 20 + "px");
  })
  .on("mouseout", (d) => {
    tooltip.transition().duration(400).style("opacity", 0);
  });
