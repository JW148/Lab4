//make the svg for this layout
const graphSVG = d3
  .select("#graphLayout")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("border", "1px solid #555555")
  .append("g")
  .attr("transform", `translate(${margin.left + 30}, ${margin.top})`);

//initialise x axis
const x = d3.scaleLinear().range([0, width - 100]);
const xAxis = d3.axisBottom().scale(x).tickFormat(d3.format("d"));
graphSVG
  .append("g")
  .attr("transform", `translate(0, ${height - 100})`)
  .attr("class", "xAxis");

//initialise y axis
const y = d3.scaleLinear().range([height - 100, 0]);
const yAxis = d3.axisLeft().scale(y);
graphSVG.append("g").attr("class", "yAxis");

//make tooltip (display info when mouseover a line in the graph)
let graphTooltip = d3
  .select("#circleLayout")
  .append("div")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

function udpateGraph(data) {
  console.log("brushed data", data);

  ///////// get the extent for the x axis/////////////////////
  let set = new Set();
  data.forEach((item) => {
    item.values.forEach((obj) => set.add(obj.year));
  });

  const years = Array.from(set);

  //get the minimum and maximum years from the data
  console.log(d3.extent(years));

  x.domain(d3.extent(years));
  graphSVG.selectAll(".xAxis").transition().call(xAxis);

  ////////////// get the extent for the y axis //////////////
  let allCounts = [];
  data.forEach((item) => {
    item.values.forEach((obj) => allCounts.push(obj.count));
  });
  console.log(d3.extent(allCounts));

  y.domain([0, d3.max(allCounts)]);
  graphSVG.selectAll(".yAxis").transition().call(yAxis);

  //make function that draws the line
  let lineFunc = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.count));

  let line = graphSVG.selectAll(".line").data(data);

  line
    .enter()
    .append("path")
    .merge(line)
    .attr("class", "line")
    .transition()
    .attr("d", (d) => lineFunc(d.values))
    .attr("fill", "none")
    .attr("stroke", (d) => color(d.index))
    .attr("stroke-width", 2)
    .attr("pointer-events", "visibleStroke");

  d3.selectAll(".line")
    .on("mouseover", function (event, d) {
      //make the line that is being hovered over in focus
      d3.selectAll(".line").attr("opacity", 0.2);
      d3.select(this).attr("stroke-width", 5);
      d3.select(this).attr("opacity", 1);
      //make the tooltip visible
      graphTooltip.style("visibility", "visible");
    })
    .on("mousemove", function (event, d) {
      //update the location and contents of the tooltip
      graphTooltip
        .html(
          "<b>" +
            d.key +
            "</b>" +
            "<br> <b>Year</b>: " +
            String(
              Math.round(x.invert(d3.pointer(event)[0])) +
                "<br> <b>" +
                yFieldDisp +
                "</b>: " +
                Math.round(y.invert(d3.pointer(event)[1])).toLocaleString()
            )
        )
        .style("top", event.pageY + 15 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseleave", function (event, d) {
      //hide the tooltip again
      graphTooltip.style("visibility", "hidden");
      //make all the lines in focus again
      d3.selectAll(".line").attr("opacity", 1);
      d3.select(this).attr("stroke-width", 2);
    });

  line.exit().remove().transition();

  //append title and axes lables

  //remove existing labels before appending new ones
  d3.select(".yLabel").remove();
  d3.select(".xLabel").remove();
  d3.select(".graphTitle").remove();

  //y axis label
  graphSVG
    .append("g")
    .attr("transform", `translate(-50, ${height / 2 - 30})`)
    .append("text")
    .attr("class", "yLabel")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .style("font-weight", "bold")
    .text(() => yFieldDisp);

  //x axis label
  graphSVG
    .append("text")
    .style("text-anchor", "middle")
    .attr("x", width / 2 - 40)
    .attr("y", height - 50)
    .attr("class", "xLabel")
    .style("font-weight", "bold")
    .text(() => xFieldDisp);

  // graph title
  graphSVG
    .append("text")
    .attr("class", "graphTitle")
    .attr("text-anchor", "middle")
    .attr("y", -10)
    .attr("x", width / 2 - 30)
    .style("font-weight", "bold")
    .text(() => `Average ${yFieldDisp} over the years`)
    .style("fill", "black");
}

//////// graphs ////////
//average price vs year
//average tax vs year
//average engine size vs year
//average mpg vs year
//average mileage

//////// pie chart ///////////
//transmission
//fuel type
