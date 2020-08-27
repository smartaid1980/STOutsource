function render(widget, done) {
  var $drawEle = widget.asJquery().find('#daily-report-compare-demo')

  if (widget.isRotating()) {
    $drawEle.css({
      height: $(window).height() * 0.7,
    })
  } else {
    $drawEle.css({
      height: '',
    })
  }

  var date = moment().format('YYYY/MM/DD')
  if (servtechConfig.ST_DASHBOARD_UTILIZATION_ALARMHISTORY_SHOW_DEMO) {
    date = servkit.showdemoConfig['UtilizationStd']['10_daily'].startDate
    console.warn(
      'query demo start date due to servtechConfig.ST_DASHBOARD_UTILIZATION_ALARMHISTORY_SHOW_DEMO'
    )
  }
  console.info('oee dashboard date ' + date)
  widget.commons.composeDayReport(
    date,
    date,
    servkit.getMachineList(),
    widget.commons.composeDayReportCallBack,
    function (result) {
      var dataToDraw = [
        {
          label: '{i18n_ServCloud_Utilization}',
          data: _(result.length).times(function (n) {
            return [n, parseFloat(result[n][7])]
          }),
          color: servkit.colors.blue,
          /*valueLabels: {
       show: true,
       labelFormatter: function(val) {
       // return Math.floor(val) + "%";
       return Number(val).toFixed(2);
       },
       valign: 'top',
       align: 'center'
       },*/
          bars: {
            show: true,
            // align: 'center',
            barWidth: 0.2,
            order: 1,
          },
        },
        {
          label: '{i18n_ServCloud_Effective_Utiliziation}',
          data: _(result.length).times(function (n) {
            return [n, parseFloat(result[n][8])]
          }),
          color: servkit.colors.green,
          /*valueLabels: {
       show: true,
       labelFormatter: function(val) {
       // return Math.floor(val) + "%";
       return Number(val).toFixed(2);
       },
       valign: 'top',
       align: 'center'
       },*/
          bars: {
            show: true,
            // align: 'center',
            barWidth: 0.2,
            order: 2,
          },
        } /*, {
      label: "{i18n_ServCloud_target}",
      data: _(result.length).times(function(n){return [n, 80]; }),
      color: '#E24913',
      lines: {
        show: true,
        lineWidth: 1
      },
      points: {
        show: true,
        lineWidth: 1,
        fill: true
      }
    }*/,
      ]

      var tickFont = {
        size: widget.isRotating() ? 28 : 12,
        weight: widget.isRotating() ? 'bold' : 'normal',
        family: 'sans-serif',
        variant: 'small-caps',
        color: '#000',
      }

      var options = {
        grid: {
          hoverable: true,
        },
        legend: {
          show: true,
          margin: '0px',
          position: 'ne',
        },
        tooltip: true,
        tooltipOpts: {
          content: "<b style='display:none;'>%x</b><span class='%s'>%y%</span>",
          defaultTheme: false,
        },
        xaxis: {
          ticks: _(result.length).times(function (n) {
            return [n, result[n][0]]
          }),
          font: tickFont,
        },
        yaxis: {
          tickFormatter: function (val) {
            return Math.floor(val) + '%'
          },
          font: tickFont,
          min: 0,
          max: 100,
        },
      }

      if (result.length == 0) {
        $('#daily-info').text(date + ' {i18n_ServCloud_DataStillCalc}')
      } else {
        $('#daily-info').text(date)
        $.plot($drawEle, dataToDraw, options)
      }
    }
  )

  done()
}
