//set svg width for cirlce layout svg
const circleLayoutWidth = window.innerWidth;

//make the svg for this layout
const circlesSVG = d3
  .select("#circleLayout")
  .append("svg")
  .attr("width", circleLayoutWidth + 8)
  .attr("height", height)
  .style("border", "1px solid #555555")
  .append("g");

//make force simulation
let simulation = d3
  .forceSimulation()
  .force(
    "forceX",
    d3
      .forceX()
      .strength(0.05)
      .x(circleLayoutWidth * 0.5)
  )
  .force(
    "forceY",
    d3
      .forceY()
      .strength(0.1)
      .y(height * 0.5)
  )
  .force(
    "center",
    d3
      .forceCenter()
      .x(circleLayoutWidth * 0.5)
      .y(height * 0.5)
  )
  .force("charge", d3.forceManyBody().strength(-15));

let color;

//make tooltip (display info when mouseover a circle)
let tooltip = d3
  .select("#circleLayout")
  .append("div")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

//////////////// Brush Vars ////////////////////////
//var for brush toggle
let brush = false;

function updateCircles(data, clickable) {
  d3.selectAll(".node").remove();

  //populate the brushedData so that the graphs can be drawn
  brushedData = data;
  console.log(brushedData);

  d3.select(".btn1").style("visibility", "hidden");

  //makes a scale for to assign a radius to each node (domain is the extent of the number of cars sold for each group (make or manufacturer))
  const radius = d3
    .scaleLinear()
    .domain(d3.extent(data, (obj) => obj.sold))
    .range([30, 100]);

  //makes a colour scale so that each of the nodes get a different colour
  color = d3
    .scaleOrdinal()
    .domain([0, data.length - 1])
    .range(d3.schemeSet3);

  // makes one g element for all the nodes and then one g element for each individual node (so that circles and text can be appended to them)
  let node = circlesSVG
    .append("g")
    .attr("class", "node")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .on("click", (event, data) => {
      if (clickable) {
        getModels(data.make);
        updateCircles(byModel, false);
        d3.select(".btn1").style("visibility", "visible");
        udpateGraph(filterGraphData());
        updatePie(filterPieData());
      } else if (!clickable) {
        brushedData = [];
        brushedData.push(data);
        udpateGraph(filterGraphData());
        updatePie(filterPieData());
      }
    })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  //make the circles
  let circles = node
    .append("circle")
    .transition()
    .attr("class", "dataCirlce")
    .attr("r", (data) => radius(data.sold))
    .attr("fill", (data, index) => color(index));

  //makes the drag handlers for all the nodes
  let drag_handler = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  drag_handler(node);

  //adds lables to the center of the circles (car make or model)
  let lables = node
    .append("text")
    .text((d) => d.make)
    .attr("text-anchor", "middle")
    //the each is used to check whether the length of the text is too big to fit inside the circle
    //if it is, it's removed immedietly after its rendered.
    .each(function (d, i) {
      let thisWidth = this.getComputedTextLength();
      if (thisWidth > radius(d.sold) * 2) {
        this.remove();
      }
    });

  // update the simulation (which updates the location of the nodes for every tick)
  simulation
    .nodes(data)
    .force(
      "collide",
      d3
        .forceCollide()
        .strength(0.5)
        .radius(function (d) {
          return radius(d.sold) + 2.5;
        })
        .iterations(1)
    )
    .on("tick", function (d) {
      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    });

  d3.select(".layoutInfo1").remove();

  //layout info text
  d3.select("#circleLayout")
    .append("div")
    .attr("class", "layoutInfo1")
    .style("position", "absolute")
    .style("top", margin.top + 100 + "px")
    .style("left", margin.left + 10 + "px")
    .html(() => {
      if (clickable) {
        return "Popularity of </br> sold cars </br> by </br> make";
      } else {
        return "Popularity of </br> sold cars </br> by </br> model";
      }
    });

  /////// Make legend //////////

  //get min max values from the data and calculate the value inbetween them
  let minMax = d3.extent(data, (obj) => obj.sold);
  //position for the legend
  const xPos = circleLayoutWidth - 250,
    yPos = height - 20,
    labelPos = circleLayoutWidth - 100;
  let valsToShow = [minMax[0], (minMax[0] + minMax[1]) / 2, minMax[1]];

  //add the legend circles
  circlesSVG
    .selectAll("legend")
    .data(valsToShow)
    .enter()
    .append("circle")
    .attr("cx", xPos)
    .attr("cy", (d) => yPos - radius(d))
    .attr("r", (d) => radius(d))
    .style("fill", "none")
    .attr("stroke", "black");

  //add the legend lines
  circlesSVG
    .selectAll("legend")
    .data(valsToShow)
    .enter()
    .append("line")
    .attr("x1", (d) => xPos + radius(d))
    .attr("x2", labelPos)
    .attr("y1", (d) => yPos - radius(d))
    .attr("y2", (d) => yPos - radius(d))
    .attr("stroke", "black")
    .style("stroke-dasharray", "2,2");

  //remove any existing legend text (would have to remove circles and lines but they don't actually change)
  d3.selectAll(".legendText").remove();
  circlesSVG
    .selectAll("legend")
    .data(valsToShow)
    .enter()
    .append("text")
    .attr("class", "legendText")
    .attr("x", labelPos)
    .attr("y", (d) => yPos - radius(d))
    .text((d) => Math.round(d).toLocaleString())
    .style("font-size", 15)
    .attr("alignment-baseline", "middle");

  ////////// Make brush /////////////////

  // d3.select(".brush").remove();
}

/////////////// Event Handlers ////////////////

function dragstarted(event, node) {
  if (!event.active) simulation.alphaTarget(0.03).restart();
  node.fx = node.x;
  node.fy = node.y;
}

function dragged(event, node) {
  node.fx = event.x;
  node.fy = event.y;
}

function dragended(event, node) {
  if (!event.active) simulation.alphaTarget(0.03);
  node.fx = null;
  node.fy = null;
}

function mouseover(event, data) {
  //make the tooltip visible
  tooltip.style("visibility", "visible");
}

function mousemove(event, data) {
  //update the location of the tooltip
  tooltip
    .html(
      "<b>Make:</b> " +
        data.make +
        "<br>" +
        "<b>No. Sold:</b> " +
        data.sold.toLocaleString()
    )
    .style("top", event.pageY + 15 + "px")
    .style("left", event.pageX + 10 + "px");
}

function mousemove2(event, data) {
  //update the location of the tooltip
  tooltip
    .html(
      "<b>Model:</b> " +
        data.model +
        "<br>" +
        "<b>No. Sold:</b> " +
        data.sold.toLocaleString()
    )
    .style("top", event.pageY + 15 + "px")
    .style("left", event.pageX + 10 + "px");
}

function mouseleave(event, data) {
  //hide the tooltip again
  tooltip.style("visibility", "hidden");
}

function toggleBrush() {
  brush = !brush;
  if (brush) {
    // make brush
    let brush = circlesSVG
      .append("g")
      .attr("class", "brush")
      .call(
        d3
          .brush()
          .extent([
            [0, 0],
            [circleLayoutWidth, height],
          ])
          .on("end", function (event) {
            //reset the brushed data
            brushedData = [];
            //get all the data circles...
            d3.selectAll(".dataCirlce").each(function (data) {
              //...then check to see if each of them are within the brush extent
              if (!checkBounds(data, event.selection)) {
                //if not then reduce its opacity so it's no longer in focus
                d3.select(this).style("opacity", 0.2);
              } else {
                //if it is then don't change its opacity and push its data to the brushedData list
                d3.select(this).style("opacity", 1);
                brushedData.push(data);
              }
            });
            console.log(brushedData);
            udpateGraph(filterGraphData());
            updatePie(filterPieData());
          })
      );
    d3.select(".btn2").text("Disable selection");
  } else {
    d3.select(".brush").remove();
    d3.select(".btn2").text("Enable selection");
  }
}

//used to check whether or not the circle is inside the brush extent
function checkBounds(d, brushExtent) {
  //return true if there is no brush extent
  if (brushExtent === null) {
    return true;
  } else {
    return (
      d.x >= brushExtent[0][0] &&
      d.x <= brushExtent[1][0] &&
      d.y >= brushExtent[0][1] &&
      d.y <= brushExtent[1][1]
    );
  }
}
