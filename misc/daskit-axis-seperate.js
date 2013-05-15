/*
 * dashkit
 * Copyright (c) 2013 Matthew Meyer <matthewwilliammeyer@gmail.com>
 * MIT License
 */

dashkit = function() {

  var dashkit = {
    version: "0.0.1"
  }

  //---------------------
  // Chart Axis
  //---------------------
  dashkit.makeAxis = function(params){

    if (params.yAxis.dataFormat){
      var dataFormat = d3.format(".0%");
    }
    
    var scale = 'ordinal';

    if (scale == 'linear'){

      var x = d3.scale.linear();

      x_data_min = d3.min(data.map(function(d) { return d.xValue; }));
      x_data_max = d3.max(data.map(function(d) { return d.xValue; }));

      x.domain([x_data_min, x_data_max]);

      x.range([params.padding, params.width - params.padding]);

    }
    else if (scale == 'ordinal'){
      var x = d3.scale.ordinal();

      x.domain(data.map(function(d) { return d.xValue; }));

      if (params.chart == 'bar'){
        x.rangeRoundBands([params.padding, params.width - params.padding], .5);
      }
      else if (params.chart == 'line'){
        x.rangePoints([params.padding, params.width - params.padding], 1); // second param controls tick pos
      }

    }

    var y = d3.scale.linear()
        .range([params.height - params.padding, params.padding]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(dataFormat);
  

    y_data_min = d3.min(data, function(d) { return d.yValue; });
    y_data_max = d3.max(data, function(d) { return d.yValue; })

    if(params.yAxis.minVal === undefined){
      y.domain([y_data_min, y_data_max]);
    }
    else {
      y.domain([params.yAxis.minVal, y_data_max]);
    }
    
    
    var tick_vals = params.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (params.height - params.padding) +")")
        .call(xAxis);

    params.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("+params.padding+", 0)")
        .call(yAxis);

    // add axis titles
    if (params.xAxis.title){
      params.svg.append("text")
        .attr("transform", "translate("+ (params.width/2) +","+(params.height-(params.padding/2))+")")  // centre below axis
        .attr("text-anchor", "middle")
        .text(params.xAxis.title);
    }

    if (params.yAxis.title){
      params.svg.append("text")
        .attr("transform", "translate("+ (params.padding/2) +","+(params.height/2)+")rotate(-90)")
        .attr("text-anchor", "middle")
        .text(params.yAxis.title);
    }

    return [x, y];
  }

  //---------------------
  // Line Chart
  //---------------------
  dashkit.linechart = function(data) {
    var width = 300;
    var height = 300;
    var padding = 50;
    var xAxis = {};
    var yAxis = {};
    var fill_area = false;
    
    var chart = function(div) {

      /* over ride "defaults" to make chart fit in div better?
      if (default_w === true){
        width = parseInt(div.style('width'));
      }
      if (default_h === true){
        height = parseInt(div.style('height'));
      }
      */

      svg = div.append('svg');

      svg.attr('width', width).attr('height', height);

      params = {
                chart: 'line',
                xAxis: xAxis,
                yAxis: yAxis,
                width: width,
                height: height,
                padding: padding,
                svg: svg
               }
    
      xy = dashkit.makeAxis(params);
      x = xy[0];
      y = xy[1];

      // add circles
      svg.selectAll(".circle")
          .data(data)
          .enter().append("circle")
          .attr("class", "circle")
          .attr("cx", function(d) { return x(d.xValue); })
          .attr("cy", function(d) { return y(d.yValue); })
          .attr("r", 2);

      // add lines
      var line = d3.svg.line()
          .x(function(d) { return x(d.xValue); })
          .y(function(d) { return y(d.yValue); });

      svg.selectAll("path")
              .data(data).enter()
              .append("path")
              .attr("d", function(d) { return line(data); }) 
              .attr("class", "line")
              .attr('fill', 'none');

      if (fill_area == true){
          var area = d3.svg.area()
            .x(function(d) { return x(d.xValue); })
            .y0(height - padding)
            .y1(function(d) { return y(d.yValue); });

          svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);
      }

    }

    chart.width = function(value) {
      if(!arguments.length) return width;
      width = value;
      return chart;
    }
    chart.height = function(value) {
      if(!arguments.length) return height;
      height = value;
      return chart;
    }
    chart.padding = function(value) {
      if(!arguments.length) return padding;
      padding = value;
      return chart;
    }
    chart.xAxis = function(value) {
      if(!arguments.length) return xAxis;
      xAxis = value;
      return chart;
    }
    chart.yAxis = function(value) {
      if(!arguments.length) return yAxis;
      yAxis = value;
      return chart;
    }
    chart.fill_area = function(value) {
      if(!arguments.length) return fill_area;
      fill_area = value;
      return chart;
    }

    return chart;
  }


  //---------------------
  // Bar Chart
  //---------------------
  dashkit.barchart = function(data) {
    var width = 300;
    var height = 300;
    var padding = 50;
    var xAxis = {};
    var yAxis = {};
    
    var chart = function(div) {

      svg = div.append('svg');

      svg.attr('width', width).attr('height', height);

      params = {
                chart: 'bar',
                xAxis: xAxis,
                yAxis: yAxis,
                width: width,
                padding: padding,
                height: height,
                svg: svg
               } 
    
      xy = dashkit.makeAxis(params);
      x = xy[0]
      y = xy[1]
      
      // add bars
      svg.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.xValue); })
          .attr("width", 10) //x.rangeBand()
          .attr("y", function(d) { return y(d.yValue); })
          .attr("height", function(d) { return (height - padding) - y(d.yValue); });

    }

    chart.width = function(value) {
      if(!arguments.length) return width;
      width = value;
      return chart;
    }
    chart.height = function(value) {
      if(!arguments.length) return height;
      height = value;
      return chart;
    }
    chart.padding = function(value) {
      if(!arguments.length) return padding;
      padding = value;
      return chart;
    }
    chart.xAxis = function(value) {
      if(!arguments.length) return xAxis;
      xAxis = value;
      return chart;
    }
    chart.yAxis = function(value) {
      if(!arguments.length) return yAxis;
      yAxis = value;
      return chart;
    }

    return chart;
  }


  //---------------------
  // Pie Chart
  //---------------------
  dashkit.piechart = function(data) {
    var width = 300;
    var height = 300;
    var padding = 75;
    var radius = Math.min(width, height) / 2;
    
    var chart = function(div) {

      svg = div.append('svg');

      svg.attr('width', width).attr('height', height);

      var color = d3.scale.ordinal()
          .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

      var arc = d3.svg.arc()
          .outerRadius(radius - 10)
          .innerRadius(radius - 70);

      var pie = d3.layout.pie()
          .value(function(d) { return d.value; });

      var g = svg.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var arc_section = g.selectAll(".arc")
          .data(pie(data))
          .enter().append("g")
          .attr("class", "arc");

      arc_section.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color(d.data.title); });

      arc_section.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return d.data.title; });

    }

    chart.width = function(value) {
      if(!arguments.length) return width;
      width = value;
      return chart;
    }
    chart.height = function(value) {
      if(!arguments.length) return height;
      height = value;
      return chart;
    }
    chart.padding = function(value) {
      if(!arguments.length) return padding;
      padding = value;
      return chart;
    }
    chart.radius = function(value) {
      if(!arguments.length) return radius;
      radius = value;
      return chart;
    }

    return chart;
  }

return dashkit;
}();