'use strict';

(function() {
  const colors = {
    "Bug": "#4E79A7",
    "Dark": "#A0CBE8",
    "Electric": "#F28E2B",
    "Fairy": "#FFBE7D",
    "Fighting": "#59A14F",
    "Fire": "#8CD17D",
    "Ghost": "#B6992D",
    "Grass": "#499894",
    "Ground": "#86BCB6",
    "Ice": "#FABFD2",
    "Normal": "#E15759",
    "Poison": "#FF9D9A",
    "Psychic": "#79706E",
    "Steel": "#BAB0AC",
    "Water": "#D37295"
  }
  const generations = ['(All)',1,2,3,4,5,6]

  const legendaryType = ['(All)','True', 'False']

  let data = "";
  let svgContainer = "";
  let filteredData = [];
  let generation = "";
  let legendary = "";
  let width = 500;
  let heigh = 500;

  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

      d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => makeScatterPlot());

    legendary = d3.select('body')
        .append('select')
        .selectAll('option')
        .data(legendaryType)
        .enter()
          .append('option')
          .attr('value', function(d) { return d })
          .html(function(d) { return d })

    generation = d3.select('body')
        .append('select')
        .selectAll('option')
        .data(generations)
        .enter()
          .append('option')
          .html(function(d) { return d })
          .attr('value', function(d) { return d })


    generation.on("change",makeScatterPlot());
    legendary.on("change",makeScatterPlot());
  }

  function makeScatterPlot() {
    let generationData = generation.property("value");

    let legendaryData = legendary.property("value");
    console.log(generationData);
    d3.select('svg').remove();
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width',700)
      .attr('height',500);

    filteredData = [];
    data.forEach(function(row){
      if ((row['Generation'] == generationData || generationData == '(All)') && (row['Legendary'] == legendaryData || legendaryData == '(All)')) {
        filteredData.push({
          'Name':row['Name'],
          'Type 1':row['Type 1'],
          'Type 2':row['Type 2'],
          'Total':parseInt(row["Total"]),
          'Sp. Def':parseInt(row["Sp. Def"])
        });
      }
    })
    let def = filteredData.map((row) => parseInt(row["Sp. Def"]))
    let total = filteredData.map((row) => parseInt(row["Total"]));

    svgContainer.append('text')
      .attr('x', 10)
      .attr('y', 40)
      .style('font-size', '16pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', width / 2)
      .attr('y', heigh-10)
      .style('font-size', '8pt')
      .text('Sp.def');

    svgContainer.append('text')
      .attr('transform', 'translate(10, '+(heigh/2)+')rotate(-90)')
      .style('font-size', '8pt')
      .text('Total');

    let axesLimits = findMinMax(def, total);

    let mapFunctions = drawTicks(axesLimits);

    plotData(mapFunctions);

    makeLegend();

  }

  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;

    d3.select('div').remove();
    let div = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    svgContainer.selectAll('.dots')
      .data(filteredData)
      .enter()
      .append('circle')
        .attr("class","dots")
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 5)
        .attr('fill', map.color)
        .on("mouseover",(d) => {
          div.transition()
            .duration(800).style("opacity",1);
          div.html(d['Name'] + "<br/>" + d['Type 1'] + "<br/>" + d['Type 2'])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 50) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(800)
            .style("opacity", 0);
            // .style("cursor", "default");
        });

  // var myCircle = svgContainer.selectAll(".dots")
  //       .data(filteredData).enter().append("circle")
  //       .attr("class", "dots")
  //       .attr("cx", function(d, i) {return d.centerX})
  //       .attr("cy", function(d, i) {return d.centerY})
  //       .attr("r", 5)
  //       .attr("stroke-width", 0)
  //       .attr("fill", function(d, i) {return "red"})
  //       .style("display", "block")
  //       .style("cursor", "pointer");
      //   circle.transition()
  		// .duration(800).style("opacity", 1)
  		// .attr("r", 16).ease("elastic");
  }

  function drawTicks(limits) {
    let color = function(d) { return colors[d["Type 1"]]; }
    let xValue = function(d) { return + d["Sp. Def"];}

    let xScale = d3.scaleLinear()
      .domain([limits.xMin-10, limits.xMax - 10])
      .range([50, heigh - 50]);

    let xMap = function(d) { return xScale(xValue(d)); };

    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, '+(heigh-50)+')')
      .call(xAxis);

    let yValue = function(d) { return + d['Total']}

    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin - 40]) // give domain buffer
      .range([50, heigh-50]);

    let yMap = function (d) { return yScale(yValue(d)); };

    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale,
      color: color
    };
  }

  function findMinMax(x, y) {

    let xMin = d3.min(x);
    let xMax = d3.max(x);

    let yMin = d3.min(y);
    let yMax = d3.max(y);

    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }
  function makeLegend() {
    let i = 0;
    let duplicate = []
    filteredData.forEach(function(row){
      if (duplicate.indexOf(row['Type 1']) === -1) {
        duplicate.push(row['Type 1']);
        svgContainer.append('rect')
          .attr('x', 500)
          .attr('y', 50 + i * 15)
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', colors[row['Type 1']]);
        svgContainer.append('text')
          .attr('x', 520)
          .attr('y', 60 + i * 15)
          .style('font-size', '10pt')
          .text(row['Type 1']);
        i = i + 1;
      }
    });
  }

})();
