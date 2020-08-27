;(function (widget, done) {
  var $horizontalBarChart = widget
      .asJquery()
      .find('#downtime-analysis-idle-chart'),
    $horizontalBarChart2 = widget
      .asJquery()
      .find('#downtime-analysis-idle-chart2'),
    $horizontalBarChart3 = widget
      .asJquery()
      .find('#downtime-analysis-idle-chart3'),
    $horizontalBarChart4 = widget
      .asJquery()
      .find('#downtime-analysis-idle-chart4'),
    // $idleTable = widget.asJquery().find('#downtime-analysis-idle-table'),
    tickFont = {
      size: widget.isRotating() ? 20 : 12,
      weight: widget.isRotating() ? 'bold' : 'normal',
      family: servkit.fonts, //"sans-serif",
      variant: 'small-caps',
      color: '#000',
    },
    chart = [$horizontalBarChart]

  widget
    .asJquery()
    .find('.alibuda1-machine-name')
    .text(servkit.getMachineName('Machine01'))
  widget
    .asJquery()
    .find('.alibuda2-machine-name')
    .text(servkit.getMachineName('Machine02'))
  widget
    .asJquery()
    .find('.alibuda3-machine-name')
    .text(servkit.getMachineName('Machine03'))
  widget
    .asJquery()
    .find('.alibuda4-machine-name')
    .text(servkit.getMachineName('Machine04'))

  if (widget.isRotating()) {
    // $horizontalBarChart.css({
    //   height: $(window).height() * 0.8
    // });
    widget.asJquery().find('table thead th').css('font-size', '2.5em')

    widget
      .asJquery()
      .find('.alibuda1, .alibuda2, .alibuda3, .alibuda4')
      .css({
        width: $(window).width() * 0.5,
        height: $(window).height() * 0.4,
      })
      .show()

    chart.push($horizontalBarChart2)
    chart.push($horizontalBarChart3)
    chart.push($horizontalBarChart4)
    // $idleTable.css('font-size', '2.1em');
    // $idleTable.find('thead th').css('font-size', '2.1em');
  } else {
    // $idleTable.css('font-size', '');
    // $idleTable.find('thead th').css('font-size', '');
    // $horizontalBarChart.css({
    //   height: $idleTable.height()
    // });
    widget.asJquery().find('table thead th').css('font-size', '')

    widget.asJquery().find('.alibuda1').css({
      width: '',
      height: '',
    })

    widget.asJquery().find('.alibuda2, .alibuda3, .alibuda4').hide()
  }

  if (!widget.data) {
    // widget.data = [
    //                 [148.58, 0], [1129.46, 1], [0, 2], [0, 3], [119.24, 4],
    //                 [0, 5], [0, 6], [0, 7], [0, 8], [0, 9]
    //               ];
    widget.data = [
      [
        [1129.46, 0],
        [148.58, 1],
        [119.24, 2],
      ],
      [
        [1070.15, 0],
        [244.58, 1],
        [125.27, 2],
      ],
      [
        [1241.97, 0],
        [99.78, 1],
        [98.55, 2],
      ],
      [
        [1117.45, 0],
        [167.44, 1],
        [155.11, 2],
      ],
    ]
    widget.tick = [
      [
        [0, '{i18n_ServCloud_M4}'],
        [1, '{i18n_ServCloud_M2}'],
        [2, '{i18n_ServCloud_M1}'],
      ],
      [
        [0, '{i18n_ServCloud_M2}'],
        [1, '{i18n_ServCloud_M3}'],
        [2, '{i18n_ServCloud_M6}'],
      ],
      [
        [0, '{i18n_ServCloud_M9}'],
        [1, '{i18n_ServCloud_M3}'],
        [2, '{i18n_ServCloud_M7}'],
      ],
      [
        [0, '{i18n_ServCloud_M2}'],
        [1, '{i18n_ServCloud_M5}'],
        [2, '{i18n_ServCloud_M1}'],
      ],
    ]
  }

  _.each(chart, function ($chart, index) {
    $.plot(
      $chart,
      [
        {
          data: widget.data[index],
          bars: {
            horizontal: true,
            align: 'center',
            show: true,
            barWidth: 0.7,
          },
          color: servkit.colors.blue,
          valueLabels: {
            show: true,
            labelFormatter: function (val) {
              // return Math.floor(val) + "%";
              return widget.data[index][val][0] === 0
                ? ''
                : widget.data[index][val][0]
            },
            showAsHtml: true,
            xoffset: 10,
            yoffset: -5,
            //              font: (widget.isRotating() ? 24 : 12) + 'pt "' + servkit.fonts + '"',
            //              valign: 'above',
            //              align: 'start'
          },
        },
      ],
      {
        grid: {
          show: true,
          hoverable: true,
          clickable: true,
          tickColor: '#efefef',
          borderWidth: 0,
          borderColor: '#efefef',
        },
        legend: true,
        tooltip: true,
        tooltipOpts: {
          content: '<span><b>%x</b></span>',
          defaultTheme: false,
        },
        xaxis: {
          axisLabel: 'Time(minutes)',
          axisLabelUseCanvas: true,
          axisLabelFontSizePixels: widget.isRotating() ? 20 : 12,
          axisLabelFontFamily: servkit.fonts, //'Verdana, Arial',
          axisLabelPadding: 10,
          min: 0,
          max: 1400,
          font: tickFont,
        },
        yaxis: {
          ticks: widget.tick[index],
          font: tickFont,
        },
      }
    )
  })

  done()
})
