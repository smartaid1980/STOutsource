;(function (widget, done) {
  var $horizontalBarChart = widget
      .asJquery()
      .find('#downtime-analysis-machine-time-chart'),
    $timeTable = widget
      .asJquery()
      .find('#downtime-analysis-machine-time-table'),
    tickFont = {
      size: widget.isRotating() ? 24 : 12,
      weight: widget.isRotating() ? 'bold' : 'normal',
      family: servkit.fonts, //"sans-serif",
      variant: 'small-caps',
      color: '#000',
    }

  if (widget.isRotating()) {
    $timeTable.css('font-size', '2.5em')
    $timeTable.find('thead th').css('font-size', '2.5em')
    $horizontalBarChart.css({
      height: ($(window).height() - $timeTable.height()) * 0.8,
    })
  } else {
    $timeTable.css('font-size', '')
    $timeTable.find('thead th').css('font-size', '')
    $horizontalBarChart.css({
      height: '',
    })
  }

  if (!widget.data) {
    widget.data = [
      [842.68, 0],
      [136.68, 1],
      [597.32, 2],
      [1440.0, 3],
    ]
  }

  $.plot(
    $horizontalBarChart,
    [
      {
        data: widget.data,
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
            return widget.data[val][0] === 0 ? '' : widget.data[val][0]
          },
          showAsHtml: true,
          fontsize: widget.isRotating() ? '1.5em' : '1em',
          xoffset: 10,
          yoffset: -10,
          // valign: 'top',
          //              font:(widget.isRotating() ? 24 : 12) +"pt '"+servkit.fonts+"'",
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
        axisLabelFontSizePixels: widget.isRotating() ? 24 : 12,
        axisLabelFontFamily: servkit.fonts, //'Verdana, Arial',
        axisLabelPadding: 10,
        min: 0,
        max: 1600,
        font: tickFont,
      },
      yaxis: {
        ticks: [
          [0, '{i18n_ServCloud_Total_Downtime}'],
          [1, '{i18n_ServCloud_Total_Cutting_Time}'],
          [2, '{i18n_ServCloud_Total_Operation_Time}'],
          [3, '{i18n_ServCloud_Total_Power_Time}'],
        ],
        font: tickFont,
      },
    }
  )

  done()
})
