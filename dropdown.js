function makeGraphDropDown() {
  const dropDownOptions = [
    {
      key: "Price",
      value: "price",
    },
    {
      key: "Mileage",
      value: "mileage",
    },
    {
      key: "Tax",
      value: "tax",
    },
    {
      key: "MPG",
      value: "mpg",
    },
    { key: "Engine Size", value: "engineSize" },
  ];

  ////////////// Make the DropDown //////////////
  let dropDown = d3
    .select("#main")
    .append("select")
    .attr("class", "selection1")
    .attr("name", "data-options")
    .on("change", function (event, d) {
      // recover the option that has been chosen
      yField = d3.select(this).property("value");
      yFieldDisp = dropDownOptions.find((o) => o.value === yField).key;
      udpateGraph(filterGraphData());
    });
  //make options for the dropdown
  let options = dropDown
    .selectAll("option")
    .data(dropDownOptions)
    .enter()
    .append("option")
    .text((d) => d.key)
    .attr("value", (d) => d.value);
}

function makePieDropDown() {
  const dropDownOptions = [
    {
      key: "Transmission",
      value: "transmission",
    },
    { key: "Fuel Type", value: "fuelType" },
  ];

  ////////////// Make the DropDown //////////////
  let dropDown = d3
    .select("#main")
    .append("select")
    .attr("class", "selection2")
    .attr("name", "data-options")
    .on("change", function (event, d) {
      // recover the option that has been chosen
      pieField = d3.select(this).property("value");
      pieFieldDisp = dropDownOptions.find((o) => o.value === pieField).key;
      updatePie(filterPieData());
    });
  //make options for the dropdown
  let options = dropDown
    .selectAll("option")
    .data(dropDownOptions)
    .enter()
    .append("option")
    .text((d) => d.key)
    .attr("value", (d) => d.value);
}
