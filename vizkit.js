/*
 * vizkit
 * Copyright (c) 2013 Matthew Meyer <matthewwilliammeyer@gmail.com>
 * MIT License
 */

vizkit = function() {

  var vizkit = {
    version: "0.0.1"
  }

  vizkit.utils = {};
vizkit.utils.merge_objs = function(obj1,obj2){
  var obj3 = {};
  for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
  return obj3;
}  

  //---------------------
  // Line Chart
  //---------------------
  vizkit.linechart = function(data) {

    var xAxis = {scale: 'linear', gridLine: false},
        yAxis = {scale: 'linear', gridLine: false},
        line = {interpolate: 'linear'},
        legend = {},
        tooltip = {content: "<h1>{{key}}:</h1><p>{{xValue}}, {{yValue}}</p>"};
    
    var chart = function(vizContainer) {

      var width  = parseInt(vizContainer.style('width')),
          height = parseInt(vizContainer.style('height')),
          margin = 100,
          svg = vizContainer.append('svg');

      svg.attr('width', width).attr('height', height);


      /* ---- Tick Formats ---- */
      if (yAxis.tickFormat !== undefined && yAxis.scale !== 'time'){
        var ytFormat = d3.format(yAxis.tickFormat);
      }
      else if (yAxis.scale === 'time'){
        // time format requires default xtFormat for date parsing
        var ytFormat = d3.time.format.iso;
        if (yAxis.tickFormat !== undefined){
          ytFormat = d3.time.format(yAxis.tickFormat);
        }
      }

      if (xAxis.tickFormat !== undefined && xAxis.scale !== 'time'){
        var xtFormat = d3.format(xAxis.tickFormat);
      }
      else if (xAxis.scale === 'time'){
        // time format requires default xtFormat for date parsing
        var xtFormat = d3.time.format.iso;
        if (xAxis.tickFormat !== undefined){
          xtFormat = d3.time.format(xAxis.tickFormat);
        }
      }


      /* ---- X Scale ---- */
      if (xAxis.scale == 'linear'){
        var x = d3.scale.linear(),
            xDataIter = function(d){return x(d.xValue);},
            xExtents = d3.extent(d3.merge(data), xDataIter),
            x_data_min = xExtents[0],
            x_data_max = xExtents[1];

        if(xAxis.minVal) x_data_min = xAxis.minVal;
        if(xAxis.maxVal) x_data_max = xAxis.maxVal;

        x.domain([x_data_min, x_data_max]);
        x.range([margin, width - margin]);
      }
      else if (xAxis.scale == 'ordinal'){
        var x = d3.scale.ordinal(),
            xDataIter = function(d){return x(d.xValue);};

        x.domain(d3.merge(data).map(function(d) { return d.xValue; }));

        x.rangePoints([margin, width - margin], 1); // second param controls tick pos
      }
      else if (xAxis.scale == 'time'){
        var x = d3.time.scale(),
            parseDate = xtFormat.parse,
            xDataIter = function(d){return x(parseDate(d.xValue));};

        x.domain(d3.extent(d3.merge(data), xDataIter));

        x.range([margin, width - margin]);
      }


      /* ---- Y Scale ---- */
      if (yAxis.scale == 'linear'){
        var y = d3.scale.linear(),
            yDataIter = function(d){ return y(d.yValue);},
            yExtents = d3.extent(d3.merge(data), yDataIter),
            y_data_min = yExtents[0], 
            y_data_max = yExtents[1];

        if(yAxis.minVal) y_data_min = yAxis.minVal;
        if(yAxis.maxVal) y_data_max = yAxis.maxVal;

        y.domain([y_data_min, y_data_max]);
        y.range([height - margin, margin]);
      }
      else if (yAxis.scale == 'ordinal'){
        var y = d3.scale.ordinal(),
            yDataIter = function(d){return y(d.yValue);};

        y.domain(d3.merge(data).map(function(d) { return d.yValue; }));

        y.rangePoints([height - margin, margin], 1); // second param controls tick pos
      }
      else if (yAxis.scale == 'time'){
        var y = d3.time.scale(),
            parseDate = ytFormat.parse,
            yDataIter = function(d){return y(parseDate(d.yValue));};

        y.domain(d3.extent(d3.merge(data), yDataIter));

        y.range([height - margin, margin]);
      }
      

      /* ---- XY Axis ---- */
      var xAx = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickFormat(xtFormat);

      if (xAxis.gridLine) xAx.tickSize(-height + (margin * 2), 10, 0).tickPadding(5); 
      if (xAxis.ticks) xAx.ticks(xAxis.ticks);

      var yAx = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(ytFormat);

      if (yAxis.gridLine) yAx.tickSize(-width + (margin  * 2), 0, 0).tickPadding(5);  
      if (yAxis.ticks) yAx.ticks(yAxis.ticks);
      
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + (height - margin) +")")
          .call(xAx);

      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate("+margin+", 0)")
          .call(yAx);


      /* ---- Graph Line/s ---- */
      var pathContainers = svg.selectAll('g.line')
                              .data(data)
                              .enter().append('g')
                              .attr('class', function(d){ return 'line-' +  (data.indexOf(d) + 1) });

      var line_path = d3.svg.line().x(xDataIter).y(yDataIter);
      if (line.interpolate) line_path.interpolate(line.interpolate);

      pathContainers.selectAll('path')
        .data(function (d) { return [d]; })
        .enter().append('path')
        .attr('d', line_path);


      /* ---- Peak Symbols ---- */
      var peakSymbol = d3.svg.symbol().type('circle').size(20);
      if (line.symbol && line.symbol.type) peakSymbol.type(line.symbol.type);
      if (line.symbol && line.symbol.size) peakSymbol.size(line.symbol.size);

      var peaks = pathContainers.selectAll('path')
                                .data(function (d) { return d; })
                                .enter().append('path')
                                .attr("transform", function(d) { return "translate(" + x(d.xValue) + "," + y(d.yValue) + ")"; })
                                .attr('d', peakSymbol)
                                .attr('class', 'symbol');


      /* ---- Peak Tooltip ---- */
      var chartTooltip = vizContainer.append("div")
                      .attr('class', 'vizkit-tooltip')
                      .style("position", "absolute")
                      .style("z-index", "10")
                      .style("visibility", "hidden");

      peaks.on("mouseover", function(d){

                      return chartTooltip.style("visibility", "visible")
                                    .html(tooltip.content.replace('{{key}}', d.key)
                                                         .replace('{{xValue}}', d.xValue)
                                                         .replace('{{yValue}}', d.yValue));
                })
           .on("mousemove", function(){return chartTooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
           .on("mouseout", function(){return chartTooltip.style("visibility", "hidden");});
                                


      /* ---- Axis Titles ---- */
      if (xAxis.title){
        svg.append("text")
          .attr('class', 'x-title')
          .attr("transform", "translate("+ (width/2) +","+(height-(margin/2))+")")  // centre below axis
          .attr("text-anchor", "middle")
          .text(xAxis.title);
      }
      if (yAxis.title){
        svg.append("text")
          .attr('class', 'y-title')
          .attr("transform", "translate("+ (margin/2) +","+(height/2)+")rotate(-90)")
          .attr("text-anchor", "middle")
          .text(yAxis.title);
      }


      /* ---- Legend ---- */
      if(legend !== null){

        var chartLegend = svg.append("g")
                        .attr("class", "legend")
                        .attr("height", 100)
                        .attr("width", 100)
                        .attr('transform', 'translate(' + (width - 85) + ',' + 100 + ')');   


        var legendSymbol = d3.svg.symbol().type('square').size(100);
        if (legend.symbol && legend.symbol.type) legendSymbol.type(legend.symbol.type);
        if (legend.symbol && legend.symbol.size) legendSymbol.size(legend.symbol.size);

        var LegendSymbols = chartLegend.selectAll('path')
                                      .data(data)
                                      .enter().append('path')
                                      .attr('d', legendSymbol)
                                      .attr("transform", function(d, i) { return "translate(" + 0 + "," + i *  20 + ")"; })
                                      .attr('class', function(d){ return 'key-' +  (data.indexOf(d) + 1) });


        if (legend.addMouseoverClasses){

          LegendSymbols.on("mouseover", function(d){
                      var curr_hover = data.indexOf(d) + 1;
                      for (var i=1; i <= data.length; i++){
                        if (i !== curr_hover){
                          d3.select('.key-' +  i).classed('key-nomo', true);
                          d3.select('.line-' + i).classed('line-nomo', true);
                        }
                        else if (i === curr_hover){
                          d3.select('.key-' +  i).classed('key-mo', true);
                          d3.select('.line-' + i).classed('line-mo', true);
                        }

                      }
                      })
                      .on("mouseout", function(d){
                      var curr_hover = data.indexOf(d) + 1;
                      for (var i=1; i <= data.length; i++){
                        if (i !== curr_hover){
                          d3.select('.key-' +  i).classed('key-nomo', false);
                          d3.select('.line-' + i).classed('line-nomo', false);
                        }
                        else if (i === curr_hover){
                          d3.select('.key-' +  i).classed('key-mo', false);
                          d3.select('.line-' + i).classed('line-mo', false);
                        }
                      }
                      });
        }

         chartLegend.selectAll('text')
                .data(data)
                .enter()
                .append("text")
                .attr('x', function(d, i){ 
                  if (true) return 15;
                })
                .attr("y", function(d, i){ 
                  if (true) return i *  20 + 4;
                })
                .text(function(d){ return d[0].key; });
        }

    }


    chart.xAxis = function(value) {
      if(!arguments.length) return xAxis;
      xAxis = vizkit.utils.merge_objs(xAxis, value);
      return chart;
    }
    chart.yAxis = function(value) {
      if(!arguments.length) return yAxis;
      yAxis = vizkit.utils.merge_objs(yAxis, value);
      return chart;
    }
    chart.line = function(value) {
      if(!arguments.length) return line;
      line = vizkit.utils.merge_objs(line, value);
      return chart;
    }
    chart.legend = function(value) {
      if(!arguments.length) return legend;
      legend = value;
      return chart;
    }
    chart.tooltip = function(value) {
      if(!arguments.length) return line;
      tooltip = vizkit.utils.merge_objs(tooltip, value);
      return chart;
    }


    return chart;
  }  

  //---------------------
  // Gauge
  //---------------------
  vizkit.gauge = function(gauge_value) {

    var max = 100,
        min = 0,
        range = max - min;
    
    var viz = function(vizContainer) {

      var width = parseInt(vizContainer.style('width')),
          height = parseInt(vizContainer.style('height')),
          pi = Math.PI;

      var inner, outer, limit; 
            
      width < height ? limit = width : limit = height

      inner = limit / 4; 
            
      outer = limit / 2; 

      var svg = vizContainer.append("svg").attr('width', width).attr('height', height);

      valueToDegrees = function(value){
        return value / range * 180 - 90;
      }

      valueToRadians = function(value){
        return valueToDegrees(value) * Math.PI / 180;
      }

      var bg = d3.svg.arc()
          .innerRadius(inner)
          .outerRadius(outer)
          .startAngle(-90 * (pi/180)) //converting from degs to radians
          .endAngle(90 * (pi/180)) //converting from degs to radians

      var overlay = d3.svg.arc()
          .innerRadius(inner)
          .outerRadius(outer)
          .startAngle(valueToRadians(0)) //converting from degs to radians
          .endAngle(valueToRadians(gauge_value)) //converting from degs to radians

      var gauge = svg.append('g').attr("transform", "translate("+width/2+","+ height/1.5 +")");

      var bg = gauge.append("path")
          .attr("d", bg)
          .attr("class", "bg");

      gauge.append("path")
          .attr("d", overlay)
          .attr("class", "overlay");

      gauge.append("text")
           .attr("class", "count")
           .attr("dx", 0)
           .attr("dy", 0)
           .attr("text-anchor", "middle")
           .text(gauge_value);

      gauge.append("text")
           .attr("class", "title")
           .attr("dx", 0)
           .attr("dy", - ( width / 1.75))
           .attr("text-anchor", "middle")
           .text("Concurrent Calls");

      gauge.append("text")
           .attr("class", "bound")
           .attr("dx", - (width / 2.5))
           .attr("dy", width / 15)
           .attr("text-anchor", "middle")
           .text(min);

      gauge.append("text")
           .attr("class", "bound")
           .attr("dx", width / 2.5)
           .attr("dy", width / 15)
           .attr("text-anchor", "middle")
           .text(max);

    }

    viz.range = function(value) {
      if(!arguments.length) return range;
      max = value[1];
      min = value[0];
      range = max - min;
      return viz;
    }

    return viz;
  }

	return vizkit;
}();