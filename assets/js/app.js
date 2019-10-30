// Sets the height and width of the graph
const svgWidth = 900;
const svgHeight = 500;

//Sets margin for graph
const margin = { top: 20, right: 40, bottom: 80, left: 100 };

// Sets Padding for graph
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Imports everything into a namespace 
import * as d3 from "d3";

// Requires modules
const d3 = require("d3");

// Append an SVG group
const chart = svg.append("g");

// Append a div to the body to create tooltips, assign it a class
d3.select(".chart").append("div").attr("class", "tooltip").style("opacity", 0);

// Retrieve data from the CSV file and execute everything below
d3.csv("../../data.csv", function(err, myData) {
  if (err) throw err;

  myData.forEach(function(data) {
    data.obesity = Number(data.obesity);
    data.incomeMoe = Number(data.incomeMoe);
    data.currentSmoker = Number(data.currentSmoker);
  });

  console.log(myData);

  // Create scale functions
  let yLinearScale = d3.scaleLinear().range([height, 0]);

  let xLinearScale = d3.scaleLinear().range([0, width]);

  // Create axis functions
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  // constiables store minimum and maximum values in a column in data.csv
  const xMin;
  const xMax;
  const yMax;

  // Function identifies the minimum and maximum values in a column in data.csv
  // and assigns them to xMin and xMax constiables, which defines the axis domain
  function findMinAndMax(dataColumnX) {
    xMin = d3.min(myData, function(data) {
      return Number(data[dataColumnX]) * 0.8;
    });

    xMax = d3.max(myData, function(data) {
      return Number(data[dataColumnX]) * 1.1;
    });

    yMax = d3.max(myData, function(data) {
      return Number(data.incomeMoe) * 1.1;
    });
  }

  // The default x-axis is 'obesity'
  // Another axis can be assigned to the constiable during an onclick event.
  const currentAxisLabelX = "obesity";

  const currentAxisLabelY = "incomeMoe";

  writeAnalysis(currentAxisLabelX, currentAxisLabelY);

  // Call findMinAndMax() with default
  findMinAndMax(currentAxisLabelX);

  // Set domain of an axis to extend from min to max values of the data column
  xLinearScale.domain([xMin, xMax]);
  yLinearScale.domain([0, yMax]);

  // Initializes tooltip
  const toolTip = d3
    .tip()
    .attr("class", "tooltip")
    // Define position
    .offset([80, -60])
    // The html() method allows mix of JS and HTML in callback function
    .html(function(data) {
      const itemName = data.state;
      const itemIncome = Number(data.incomeMoe);
      const itemInfo = Number(data[currentAxisLabelX]);
      const itemString;
      // Tooltip text depends on which axis is active
      if (currentAxisLabelX === "obesity") {
        itemString = "obesity: ";
      }
      else {
        itemString = "Smoker: ";
      }
      if (currentAxisLabelY === "incomeMoe") {
        incomeString = "Healthcare: ";
      }
      else {
        incomeString = "Poverty Stricken: ";
      }
      return itemName +
        "<hr>" +
        incomeString +
        itemIncome + "%<br>" +
        itemString +
        itemInfo + "%";
    });

  // Create tooltip
  chart.call(toolTip);

  chart
    .selectAll("circle")
    .data(myData)
    .enter()
    .append("circle")
    .attr("cx", function(data, index) {
      return xLinearScale(Number(data[currentAxisLabelX]));
    })
    .attr("cy", function(data, index) {
      return yLinearScale(Number(data.incomeMoe));
    })
    .attr("r", "12")
    .attr("fill", "lightblue")
    // Both circle and text instances have mouseover & mouseout event handlers
    .on("mouseover", function(data) {
      toolTip.show(data)})
    .on("mouseout", function(data) {
      toolTip.hide(data)});

  chart
    .selectAll("text")
    .data(myData)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("class","stateText")
    .style("fill", "white")
    .style("font", "10px sans-serif")
    .style("font-weight", "bold")
    .text(function(data) {
      return data.abbr;})
    .on("mouseover", function(data) {
      toolTip.show(data)})
    .on("mouseout", function(data) {
      toolTip.hide(data)})
    .attr("x", function(data, index) {
      return xLinearScale(Number(data[currentAxisLabelX]));
    })
    .attr("y", function(data, index) {
      return yLinearScale(Number(data.incomeMoe))+4;
    });

  // Append an SVG group for the x-axis, then display the x-axis
  chart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    // The class name assigned here will be used for transition effects
    .attr("class", "x-axis")
    .call(bottomAxis);

  // Append a group for y-axis, then display it
  chart.append("g")
    .attr("class", "y-axis")
    .call(leftAxis);

  // Append y-axis label
  chart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .attr("class", "axis-text")
    .attr("data-axis-name", "incomeMoe")
    .text("Healthcare");

  // Append x-axis labels
  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
    )
    // This axis label is active by default
    .attr("class", "axis-text active")
    .attr("data-axis-name", "obesity")
    .text("obesity (BMI > 30)(%)");

  chart
    .append("text")
    .attr(
      "transform",
      "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")"
    )
    // This axis label is inactive by default
    .attr("class", "axis-text inactive")
    .attr("data-axis-name", "currentSmoker")
    .text("Current Smoker (%)");

  

  // Change an axis's status from inactive to active when clicked (if it was inactive)
  // Change the status of all active axes to inactive otherwise
  function labelChange(clickedAxis) {
    d3
      .selectAll(".axis-text")
      .filter(".active")
      // An alternative to .attr("class", <className>) method. Used to toggle classes.
      .classed("active", false)
      .classed("inactive", true);

    clickedAxis.classed("inactive", false).classed("active", true);
    writeAnalysis(currentAxisLabelX, currentAxisLabelY);
  }

  d3.selectAll(".axis-text").on("click", function() {
    // Assign a constiable to current axis
    const clickedSelection = d3.select(this);
    // "true" or "false" based on whether the axis is currently selected
    const isClickedSelectionInactive = clickedSelection.classed("inactive");
    // console.log("this axis is inactive", isClickedSelectionInactive)
    // Grab the data-attribute of the axis and assign it to a constiable
    // e.g. if data-axisName is "poverty," const clickedAxis = "poverty"
    const clickedAxis = clickedSelection.attr("data-axis-name");

    // The onclick events below take place only if the x-axis is inactive
    // Clicking on an already active axis will therefore do nothing
    if (isClickedSelectionInactive) {
      // Assign the clicked axis to the constiable currentAxisLabelX
      currentAxisLabelX = clickedAxis;
      // Call findMinAndMax() to define the min and max domain values.
      findMinAndMax(currentAxisLabelX);
      // Set the domain for the x-axis
      xLinearScale.domain([xMin, xMax]);
      // Create a transition effect for the x-axis
      svg
        .select(".x-axis")
        .transition()
        // .ease(d3.easeElastic)
        .duration(1800)
        .call(bottomAxis);

      // Select all circles to create a transition effect, then relocate its horizontal location
      // based on the new axis that was selected/clicked
      d3.selectAll("circle").each(function() {
        d3
          .select(this)
          .transition()
          // .ease(d3.easeBounce)
          .attr("cx", function(data, index) {
            return xLinearScale(Number(data[currentAxisLabelX]));
          })
          .duration(1800);
      });

      d3.selectAll(".stateText").each(function() {
        d3
          .select(this)
          .transition()
          // .ease(d3.easeBounce)
          .attr("x", function(data, index) {
            return xLinearScale(Number(data[currentAxisLabelX]));
          })
          .duration(1800);
      });

      // Change the status of the axes. See above for more info on this function.
      labelChange(clickedSelection);
    }
  });
});

function writeAnalysis(xAxis, yAxis) {
  const analysisText = parent.document.getElementById('analysis');

  const responses = ["There is a strong negative correlation (-0.751735757) between having at least a low income and being obesity.",
                  "There is a negative correlation (-0.617179941) between having a Healthcare and being a current smoker.",
                  "There is a positive correlation (0.67396584) between being having healthcare and being obesity.",
                  "There is a strong positive correlation (0.757923374) between having a low income and being a current smoker."];

  const answer;

  if (xAxis === "obesity") {
    if (yAxis === "incomeMoe") {
      answer = responses[0];
    }
    else {
      answer = responses[2];
    }
  }
  else {
    if (yAxis === "incomeMoe") {
      answer = responses[1];
    }
    else {
      answer = responses[3];
    }
  }
  analysisText.innerHTML = answer;
};
