function render(widget, done, deviceStatusData) {
  var dataset = {
    target: [
      {
        displayName: '{i18n_ServCloud_target}',
        score: 85,
        color: servkit.colors.red,
      },
      {
        displayName: '小白',
        score: 15,
        color: 'rgba(255, 255, 255, 0.0)',
      },
    ],
    general: [
      {
        displayName: '{i18n_ServCloud_General}',
        score: 69,
        color: servkit.colors.blue,
      },
      {
        displayName: '小白',
        score: 31,
        color: 'rgba(255, 255, 255, 0.0)',
      },
    ],
    effective: [
      {
        displayName: '{i18n_ServCloud_Effective}',
        score: 55,
        color: servkit.colors.green,
      },
      {
        displayName: '小白',
        score: 45,
        color: 'rgba(255, 255, 255, 0.0)',
      },
    ],
  }

  var width =
      ((widget.isRotating() ? $(window).width() : widget.asJquery().width()) -
        10) /
      4,
    height = width,
    param = {
      width: width,
      height: width,
      radius: Math.min(width, height) / 2,
    }

  if (!widget.showCount) {
    widget.showCount = 0

    servkit.eachMachine(function (machineId, machineName) {
      if (machineId.startsWith('_') && widget.showCount < 8) {
        var svg = d3
          .select('#test-svg')
          .append('svg')
          .attr('width', param.width)
          .attr('height', param.height)
          .append('g')
          .attr(
            'transform',
            'translate(' + param.width / 2 + ',' + param.height / 2 + ')'
          )

        dataset = getDatSet(machineId)
        makeCircle(svg, param, dataset.target, '1', 70, 55, 5)
        makeCircle(svg, param, dataset.general, '2', 95, 80, 0)
        makeCircle(svg, param, dataset.effective, '3', 120, 105, 0)
        svg
          .append('text')
          // .attr("x", -40)
          .attr('y', -20)
          .style('font-size', 18)
          .style('text-anchor', 'middle')
          .text(machineName)
        // svg.append("text")
        //    .attr("x", -40)
        //    .attr("y", -10)
        //    .text(dataset.general[0].score + '% / ' + dataset.effective[0].score + '%');
        svg
          .append('text')
          // .attr("x", -40)
          .attr('y', 10)
          .attr(
            'fill',
            dataset.general[0].score < dataset.target[0].score
              ? servkit.colors.red
              : servkit.colors.blue
          )
          .style('font-size', 22)
          .style('font-weight', 'bold')
          .style('text-anchor', 'middle')
          .text('{i18n_ServCloud_General}: ' + dataset.general[0].score + '%')

        widget.showCount += 1
      }
    })

    widget
      .asJquery()
      .find('#test-svg-wrapper')
      .width(param.width * 4)

    // _.each(_.range(param.number), function (i) {

    //     //make an SVG
    //     var svg = d3.select("#test-svg")
    //                 .append("svg")
    //                 .attr("width", param.width)
    //                 .attr("height", param.height)
    //                 .append("g")
    //                 .attr("transform", "translate(" + param.width / 2 + "," + param.height / 2 + ")");

    //     // makeCircle(svg, param, dataset.target, "1", 70, 50);
    //     makeCircle(svg, param, dataset.general, "2", 90, 70);
    //     makeCircle(svg, param, dataset.effective, "3", 110, 90);
    //     svg.append("text")
    //        .attr("x", -10)
    //        .attr("y", 0)
    //        .text(param.machine);

    // });
  }

  function getDatSet(mid) {
    var base1 = 75
    var base2 = 60

    if (mid === '_M03') {
      base1 = 60
      base2 = 50
    }

    var g1 = Math.floor(Math.random() * 5) + base1

    var g2 = Math.floor(Math.random() * 10) + base2

    if (g1 == g2) g2 = g1 - 5

    var g1r = 100 - g1
    var g2r = 100 - g2

    var dt = {
      target: [
        {
          displayName: '{i18n_ServCloud_target}',
          score: 75,
          color: 'rgba(255,127,14,1.0)',
        },
        {
          displayName: '小白',
          score: 25,
          color: 'rgba(255, 255, 255, 0.0)',
        },
      ],
      general: [
        {
          displayName: '{i18n_ServCloud_General}',
          score: g1, // 69,
          color: servkit.colors.blue,
        },
        {
          displayName: '小白',
          score: g1r, //31,
          color: 'rgba(255, 255, 255, 0.0)',
        },
      ],
      effective: [
        {
          displayName: '{i18n_ServCloud_Effective}',
          score: g2, //55,
          color: servkit.colors.green,
        },
        {
          displayName: '小白',
          score: g2r, //45,
          color: 'rgba(255, 255, 255, 0.0)',
        },
      ],
    }

    return dt
  }

  function makeCircle(
    svg,
    param,
    dataset,
    count,
    innerRadiusOffset,
    outerRadiusOffset,
    offset
  ) {
    var pie = d3.layout
      .pie()
      .sort(null)
      .value(function (d) {
        return d.score
      })

    var arc = d3.svg
      .arc()
      .innerRadius(param.radius - innerRadiusOffset + offset)
      .outerRadius(param.radius - outerRadiusOffset - offset)
      .cornerRadius(3)

    var g = svg
      .selectAll('.arc' + count)
      .data(pie(dataset))
      .enter()
      .append('g')
      .attr('class', 'arc' + count)

    g.append('path')
      .attr('d', arc)
      .style('fill', function (d) {
        return d.data.color
      }) /*
         .on("mouseover", function () {
            d3.select(this.parentNode).select("text").style("display", "block");
         })
         .on("mouseout", function () {
            d3.select(this.parentNode).select("text").style("display", "none");
         })*/

    g.append('text')
      .attr('transform', function (d) {
        // return "translate(" + arc.centroid(d) + ")";
        return 'translate(-5,-' + (param.radius - outerRadiusOffset - 8) + ')'
      })
      .attr('text-anchor', 'end')
      .style('display', function (d, i) {
        return i === 0 ? 'block' : 'none'
      })
      .attr('dy', '.35em')
      .text(function (d) {
        return d.data.displayName + ': ' + d.data.score + ' %'
      })
  }

  done()
}
