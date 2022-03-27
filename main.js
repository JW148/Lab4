///////////////////////// Global Vars ////////////////////////

//define margin to add some padding to the elements inside the svg
const margin = { top: 30, bottom: 70, left: 50, right: 30 };
//define the dimensions of the svg
const width = window.innerWidth / 2;
const height = window.innerHeight / 2;

////////// Data Vars //////////
//Sort the data into several different maps for easier data manipulation

let byMake = [];
//stores the models of the current make
let byModel = [];

////////// Graph Vars ///////////
let xField = "year";
let yField = "price";
let xFieldDisp = "Year";
let yFieldDisp = "Price";

///////// Pie Vars //////////////
let pieField = "transmission";
let pieFieldDisp = "Transmission";
///////// CircleLayout Vars //////////
//the current selection of brushed data
let brushedData = [];

/////////////// Loading the data ////////////////
Promise.all([
  // NOTE: all objects in these csv files have the same keys/columns
  // model, year, price, transmission, mileage, fuelType, tax, mpg, engineSize
  // BUT for the hyundi.csv file tax -> tax(£)
  d3.csv("/data/audi.csv"),
  d3.csv("/data/bmw.csv"),
  d3.csv("/data/ford.csv"),
  d3.csv("/data/hyundi.csv"),
  d3.csv("/data/merc.csv"),
  d3.csv("/data/skoda.csv"),
  d3.csv("/data/toyota.csv"),
  d3.csv("/data/vauxhall.csv"),
  d3.csv("/data/vw.csv"),
]).then(function (data) {
  byMake.push({ make: "Audi", data: data[0], sold: data[0].length });
  byMake.push({ make: "BMW", data: data[1], sold: data[1].length });
  byMake.push({ make: "Ford", data: data[2], sold: data[2].length });
  byMake.push({ make: "Hyundai", data: data[3], sold: data[3].length });
  byMake.push({ make: "Mercedes", data: data[4], sold: data[4].length });
  byMake.push({ make: "Skoda", data: data[5], sold: data[5].length });
  byMake.push({ make: "Toyota", data: data[6], sold: data[6].length });
  byMake.push({ make: "Vauxhall", data: data[7], sold: data[7].length });
  byMake.push({ make: "VW", data: data[8], sold: data[8].length });

  updateCircles(byMake, true);

  getModels("Audi");
  makeGraphDropDown();
  makePieDropDown();
  udpateGraph(filterGraphData());
  updatePie(filterPieData());
});

//count the number of cars sold by make
function byMakeSold() {
  let data = [];
  byMake.forEach((value, key) => {
    data.push({ make: key, sold: value.length });
  });
  return data;
}
const layout3 = d3
  .select("#layout3")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("border", "1px solid #555555");

//returns an array of
function getModels(make) {
  byModel = [];
  let dataMap = new Map();
  byMake.forEach((item) => {
    if (item.make === make) {
      item.data.forEach((obj) => {
        if (!dataMap.has(obj.model)) {
          dataMap.set(obj.model, [obj]);
        } else {
          dataMap.get(obj.model).push(obj);
        }
      });
    }
  });
  dataMap.forEach((value, key) =>
    byModel.push({ make: key, data: value, sold: value.length })
  );
}

function filterGraphData() {
  let dataMap = new Map();
  //item is an array of objects (the data for a specific make or model)
  brushedData.forEach((item) => {
    let tempMap = new Map();
    item.data.forEach((obj) => {
      if (!tempMap.has(obj[xField])) {
        tempMap.set(obj[xField], [obj]);
      } else {
        tempMap.get(obj[xField]).push(obj);
      }
    });
    dataMap.set(item.make, { data: tempMap, index: item.index });
  });
  let data = [];
  dataMap.forEach((value, key) => {
    let tempData = [];
    value.data.forEach((values, key) => {
      let count = 0;
      values.forEach((obj) => {
        count += +obj[yField];
      });
      tempData.push({ year: +key, count: count / values.length });
    });
    tempData.sort((a, b) => {
      return a.year - b.year;
    });
    console.log(tempData);
    data.push({ key: key, values: tempData, index: value.index });
  });
  return data;
}

function filterPieData() {
  //pie data needs to be an array of integers
  //so need to go through all the brushed/selected data and calculate the total number of instances
  //for each category of the selected field (e.e. transmission consists of manual, automatic, Semi-Auto)

  //temp map for filtering
  let dataMap = new Map();
  //data to return
  let data = [];
  brushedData.forEach((item) => {
    item.data.forEach((obj) => {
      if (!dataMap.has(obj[pieField])) {
        dataMap.set(obj[pieField], { count: 1 });
      } else {
        dataMap.get(obj[pieField]).count++;
      }
    });
  });
  dataMap.forEach((value, key) => data.push({ type: key, value: value.count }));
  return data;
}
