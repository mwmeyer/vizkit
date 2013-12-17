  

  //---------------------
  // Pie Chart
  //---------------------
  vizkit.piechart = function(data) {

    var foo = 1;
    
    var viz = function(vizContainer) {
      var width = parseInt(vizContainer.style('width')),
          height = parseInt(vizContainer.style('height')),
          radius = height / 2,
          color = d3.scale.category20c();

      var svg = vizContainer.append("svg:svg")
                            .data([data])
                            .attr('width', width)
                            .attr('height', height);

      var arc = d3.svg.arc()
                  .outerRadius(radius);

      var pie = d3.layout.pie()
                  .value(function(d) { return d.value; });

      var arcs = svg.selectAll("g.slice")
                    .data(pie)
                    .enter()
                    .append("svg:g")
                    .attr("class", "slice")
                    .attr("transform", "translate("+width/2+","+ height/2 +")");

          arcs.append("svg:path")
                  .attr("fill", function(d, i) { return color(i); } )
                  .attr("d", arc);

          arcs.append("svg:text")
              .attr("transform", function(d) {
                  d.innerRadius = 0;
                  d.outerRadius = radius;
                  return "translate(" + arc.centroid(d) + ")";
              })
              .attr("text-anchor", "middle")
              .text(function(d, i) { return data[i].key; });
    };

    viz.foo = function(value) {
      if(!arguments.length) return foo;
      return viz;
    };

    return viz;
  };