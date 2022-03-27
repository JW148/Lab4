///////////// Pie Chart Initialisation /////////////////

//make the svg and chart container (with padding)
const pieSVG = d3
  .select("#pieLayout")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "pieSVG")
  .style("border", "1px solid green")
  .append("g")
  .attr("transform", `translate(${width / 2},${height / 2})`);

const radius = 180;
let pie = d3.pie().value((data) => data.value);
let arc = d3.arc().innerRadius(0).outerRadius(radius);

function updatePie(data) {
  console.log(data);
  //make tooltip for arc hover
  let tooltip = d3
    .select("#pieLayout")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  //arc groups
  let arcs = pieSVG
    .selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  //draw the arcs
  arcs
    .append("path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", arc)
    .attr("stroke", "#ffff")
    .attr("stroke-width", "2px")
    .on("mouseover", function (event) {
      d3.select(this)
        .transition()
        .ease(d3.easeBounce)
        .duration(1000)
        .attr("d", (d) => d3.arc().innerRadius(0).outerRadius(200)(d));

      //make the tooltip visible
      tooltip.style("visibility", "visible");
    })
    .on("mousemove", function (event, data) {
      //update the location of the tooltip
      tooltip
        .html(
          "<b>" +
            data.data.type +
            "</b>" +
            "<br>" +
            data.data.value.toLocaleString()
        )
        .style("top", event.pageY + 10 + "px")
        .style("left", event.pageX + "px");
    })
    .on("mouseleave", function (event) {
      d3.select(this)
        .transition()
        .ease(d3.easeBounce)
        .duration(1000)
        .attr("d", (d) => d3.arc().innerRadius(0).outerRadius(radius)(d));

      //hide the tooltip again
      tooltip.style("visibility", "hidden");
    });

  //////////// Make Pie Chart info table ////////////////
  //http://bl.ocks.org/jfreels/6734025

  d3.select(".pieTable").remove();

  //make table to show pie data
  let table = d3
    .select("#pieLayout")
    .append("div")
    .attr("class", "pieTable")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("top", "85%")
    .style("left", "53%")
    .append("table");
  let thead = table.append("thead");
  let tbody = table.append("tbody");

  let columns = ["type", "value"];

  //append the header row
  thead
    .append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text((column) => column);

  //create rows
  let rows = tbody.selectAll("tr").data(data).enter().append("tr");

  //create a cell in each row for each column
  let cells = rows
    .selectAll("tr")
    .data(function (row) {
      return columns.map(function (column) {
        return { column: column, value: row[column] };
      });
    })
    .enter()
    .append("td")
    .text(function (data) {
      return data.value.toLocaleString();
    });

  /////////////// Make Chart Legend ////////////////
}
