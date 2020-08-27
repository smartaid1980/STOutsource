(function($) {

  // Chart design based on the recommendations of Stephen Few. Implementation
  // based on the work of Clint Ivy, Jamie Love, and Jason Davies.
  // http://projects.instantcognition.com/protovis/bulletchart/
  d3.bullet = function() {
    var orient = "left", // TODO top & bottom
      reverse = bulletReverse,
      duration = 0,
      ranges = bulletRanges,
      markers = bulletMarkers,
      measures = bulletMeasures,
      ticks = bulletTicks,
      max = bulletMax,
      min = bulletMin,
      mrasureHeight = 0.5
    width = 380,
    height = 30,
    tickFormat = null;

    // For each small multiple…
    function bullet(g) {
      g.each(function(d, i) {
        var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
          markerz = markers.call(this, d, i).slice().sort(d3.descending),
          measurez = measures.call(this, d, i).slice().sort(d3.descending),
          tickz = ticks.call(this, d, i) || 8,
          maz = max.call(this, d, i) || Math.max(rangez[0], markerz[0], measurez[0]),
          miz = min.call(this, d, i) || 0,
          reverz = reverse.call(this, d, i) || false,
          g = d3.select(this);
        // Compute the new x-scale.
        var x1 = d3.scale.linear()
          .domain([miz, maz])
          .range(reverz ? [width, 0] : [0, width]);

        // Retrieve the old x-scale, if this is an update.
        var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
          .range(x1.range());

        // Stash the new scale.
        this.__chart__ = x1;

        // Derive width-scales from the x-scales.
        var w0 = bulletWidth(x0),
          w1 = bulletWidth(x1);

        // Update the range rects.
        var range = g.selectAll("rect.range")
          .data(rangez);

        range.enter().append("rect")
          .attr("class", function(d, i) { return "range s" + i; })
          .attr("width", w0)
          .attr("height", height)
          .attr("x", reverz ? x0 : 0)
          .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverz ? x1 : 0);

        range.transition()
          .duration(duration)
          .attr("x", reverz ? x1 : 0)
          .attr("width", w1)
          .attr("height", height);

        // Update the measure rects.
        var measure = g.selectAll("rect.measure")
          .data(measurez);

        measure.enter().append("rect")
          .attr("class", function(d, i) { return "measure s" + i; })
          .attr("width", w0)
          .attr("height", height * mrasureHeight)
          .attr("x", reverz ? x0 : 0)
          .attr("y", height * (1 - mrasureHeight) / 2)
          .transition()
          .duration(duration)
          .attr("width", w1)
          .attr("x", reverz ? x1 : 0);

        measure.transition()
          .duration(duration)
          .attr("width", w1)
          .attr("height", height  * mrasureHeight)
          .attr("x", reverz ? x1 : 0)
          .attr("y", height * (1 - mrasureHeight) / 2);

        // Update the marker lines.
        var marker = g.selectAll("line.marker")
          .data(markerz);

        marker.enter().append("line")
          .attr("class", "marker")
          .attr("x1", x0)
          .attr("x2", x0)
          .attr("y1", height / 6)
          .attr("y2", height * 5 / 6)
          .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1);

        marker.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .attr("y1", height / 6)
          .attr("y2", height * 5 / 6);

        // Compute the tick format.
        var format = tickFormat || x1.tickFormat(8);
			
        if (tick) {
          // Update the tick groups.
          var tick = g.selectAll("g.tick")
            .data(d3.range(miz, maz+1, (Math.abs(maz-miz) / tickz)), function(d) {
              return this.textContent || format(d);
            });

          // Initialize the ticks with the old scale, x0.
          var tickEnter = tick.enter().append("g")
            .attr("class", "tick")
            .attr("transform", bulletTranslate(x0))
            .style("opacity", 1e-6);

          tickEnter.append("line")
            .attr("y1", height)
            .attr("y2", height * 7 / 6);

          tickEnter.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("y", height * 7 / 6)
            .text(format);

          // Transition the entering ticks to the new scale, x1.
          tickEnter.transition()
            .duration(duration)
            .attr("transform", bulletTranslate(x1))
            .style("opacity", 1);

          // Transition the updating ticks to the new scale, x1.
          var tickUpdate = tick.transition()
            .duration(duration)
            .attr("transform", bulletTranslate(x1))
            .style("opacity", 1);

          tickUpdate.select("line")
            .attr("y1", height)
            .attr("y2", height * 7 / 6);

          tickUpdate.select("text")
            .attr("y", height * 7 / 6);

          // Transition the exiting ticks to the new scale, x1.
          tick.exit().transition()
            .duration(duration)
            .attr("transform", bulletTranslate(x1))
            .style("opacity", 1e-6)
            .remove();
        }
      });
		
      d3.timer.flush();
    }

    // left, right, top, bottom
    bullet.orient = function(x) {
      if (!arguments.length) return orient;
      orient = x;
      reverse = orient == "right" || orient == "bottom";
      return bullet;
    };

    // ranges (bad, satisfactory, good)
    bullet.ranges = function(x) {
      if (!arguments.length) return ranges;
      ranges = x;
      return bullet;
    };

    // markers (previous, goal)
    bullet.markers = function(x) {
      if (!arguments.length) return markers;
      markers = x;
      return bullet;
    };

    // measures (actual, forecast)
    bullet.measures = function(x) {
      if (!arguments.length) return measures;
      measures = x;
      return bullet;
    };

    bullet.width = function(x) {
      if (!arguments.length) return width;
      width = x;
      return bullet;
    };

    bullet.height = function(x) {
      if (!arguments.length) return height;
      height = x;
      return bullet;
    };

    bullet.tickFormat = function(x) {
      if (!arguments.length) return tickFormat;
      tickFormat = x;
      return bullet;
    };

    bullet.duration = function(x) {
      if (!arguments.length) return duration;
      duration = x;
      return bullet;
    };

    return bullet;
  };

  function bulletReverse(d) {
    return d.reverse;
  }

  function bulletRanges(d) {
    return d.ranges;
  }

  function bulletMarkers(d) {
    return d.markers;
  }

  function bulletMeasures(d) {
    return d.measures;
  }

  function bulletTicks(d) {
    return d.ticks;
  }

  function bulletMin(d) {
    return d.min;
  }

  function bulletMax(d) {
    return d.max;
  }

  function bulletTranslate(x) {
    return function(d) {
      return "translate(" + x(d) + ",0)";
    };
  }

  function bulletWidth(x) {
    var x0 = x(0);
    return function(d) {
      return Math.abs(x(d) - x0);
    };
  }

  $.fn.bullet = function(params) {
    params = $.extend({
      margin: {top: 5, right: 25, bottom: 20, left: 10},
      ranges: [10, 50, 60],
      measures: [40],
      markers: [80],
      ticks: 3,
      min: 0,
      max: 100
    }, params);
		
    return this.each(function() {
      var $el = $(this).empty();

      var data = $el.data('bulletChart') ? $el.data('bulletChart').data : params;
			
      var margin = params.margin,
        width = (params.width || $el.width()) - margin.left - margin.right,
        height = (params.height || $el.height()) - margin.top - margin.bottom;

      var chart = d3.bullet()
        .width(width)
        .height(height);

      var svg = d3.select(this).selectAll('svg')
        .data([data])
        .enter().append("svg")
        .attr("class", "bullet")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(chart);
			
      $el.data('bulletChart', {
        chart: chart,
        svg: svg,
        data: data,
        update: function(x) {
          this.data = $.extend(this.data, x);
          svg.data([this.data]).call(chart.duration(1000));
        }
      });
    });
  }

})(jQuery);
