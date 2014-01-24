  

  //---------------------
  // Gauge
  //---------------------
  vizkit.gauge = function(gauge_value) {

    var title = '';
        max = 100,
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
           .text(title);

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

    viz.title = function(value) {
      if(!arguments.length) return title;
      title = value;
      return viz;
    }

    return viz;
  }