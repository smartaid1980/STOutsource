function render(widget, done, machineMap) {
  var is1366 = window.innerWidth >= 1366 && window.innerWidth < 1600,
    is1600 = window.innerWidth >= 1600 && window.innerWidth < 1920,
    is1920 = window.innerWidth == 1920

  var _chartSize = widget.isRotating() ? (is1366 ? 170 : 250) : 160

  var _prefix_list = 'LD_'

  var compiled_list = _.template(
    '<div id="<%=prefix%><%=id%>" class="<%=clazz%>" data-id="<%=id%>">' +
      '<div class="header">' +
      '<div class="title"><%=name%></div>' +
      '<div class="status"></div>' +
      '</div>' +
      '<div class="content" align="center">' +
      '<div id="<%=id%>" style="height:<%=chartSize%>px; width:<%=chartSize%>px;"></div>' +
      '</div>' +
      '</div>'
  )

  getCurrentShift(updateCurrentDeviceData)

  function _buildDevice(data) {
    console.warn('not build')
    data.name = servkit.getMachineName(data.id)
    if (data.name.length >= 10) {
      data.name =
        '...' + data.name.substring(data.name.length - 7, data.name.length)
    }

    var $container = widget.asJquery().find('.monitor-overall')
    var $list = $container.find('.list')

    if ($list.length) {
      _buildDeviceList($list, data)
    }
    $container = null
    $list = null
  }

  function _buildDeviceList(container, data) {
    var obj = $.extend(data, {
      prefix: _prefix_list,
      clazz: 'item card',
      chartSize: _chartSize,
    })
    $(compiled_list(obj)).appendTo(container).data('source', data)
  }

  function _updateBarChart(chart, dataArr) {
    var barValueKeys = ['expectedPart', 'part']
    var colors = [servkit.colors.blue, servkit.colors.green]
    var chartDatas = _.map(barValueKeys, function (barValueKey, barI) {
      return {
        data: _.map(dataArr, function (obj, index) {
          return [barI, obj[barValueKey]]
        }),
        bars: {
          show: true,
        },
        color: colors[barI],
        valueLabels: {
          show: true,
          labelFormatter: function (v) {
            return parseFloat(v).toFixed(2)
          },
          font: '12pt ' + servkit.fonts,
          valign: 'above', // above, below, middle, bottom
        },
      }
    })

    var options = {
      series: {
        bars: {
          show: true,
        },
      },
      bars: {
        align: 'center',
        barWidth: 1,
      },
      xaxis: {
        ticks: [
          [0, ''],
          [1, ''],
        ],
      },
      yaxis: {
        show: true,
        min: 0,
        tickDecimals: 0,
        autoscaleMargin: 0.05,
      },
      grid: {
        tickColor: '#EFEFEF',
        borderWidth: 0,
        borderColor: '#EFEFEF',
      },
      legend: true,
    }

    $.plot(chart, chartDatas, options)
  }

  function restore(machines) {
    var title =
      "<i class='fa fa-bar-chart-o'></i> <strong>" +
      '{i18n_ServCloud_Machine_List}' +
      '-' +
      servkit.getPlantAreaName(widget.plantId) +
      '</strong>'

    var barDefineTag =
      '<div align="right">' +
      '<span class="btn" style="background:' +
      servkit.colors.blue +
      '"></span>&nbsp;' +
      '<span>{i18n_ServCloud_Ext_Qty}</span>&nbsp;&nbsp;' +
      '<span class="btn" style="background:' +
      servkit.colors.green +
      '"></span>&nbsp;' +
      '<span>{i18n_ServCloud_Part_Count}</span></div>'

    widget
      .asJquery()
      .find('h2')
      .replaceWith('<h2>' + title + '</h2>')

    var $widgetBody = widget.asJquery().find('.widget-body')
    $widgetBody.find('span').remove()
    widget.asJquery().find('.widget-body').append(barDefineTag)

    var $container = widget.asJquery().find('.monitor-overall')
    var $list = $container.find('.list')

    // empty
    // $space.find('.device').remove();
    $list.find('.item').remove()
    // build
    _.each(machines, function (m) {
      _buildDevice({ id: m })
    })
    pageSetUp()
    $container = null
    $list = null
  }

  if (!widget.isRestored || widget._current_rotating != widget.isRotating()) {
    ;(function () {
      var $container = widget.asJquery().find('.monitor-overall')
      var $list = $container.find('.list')

      // var machineIdList = [];
      widget.build = false

      if (widget.parameter.disable) {
        // disable
        if (typeof done === 'function') {
          done()
        }
        return
      }

      restore(widget.plantMachines)
      // size
      if (widget.isRotating()) {
        // 判斷為指定尺寸時加上判斷
        // alert('window i: ' + $w.innerWidth(true) + ' html:' + $('html').width() + ' doc:' + $(document).width());
        if (is1366) {
          // alert('1366');
          $container.addClass('w1366')
        } else if (is1600) {
          // alert('1600')
          $container.addClass('w1600')
        } else if (is1920) {
          // alert('1920')
          $container.addClass('w1920')
        } else {
          console.warn('undefined size ' + window.innerWidth || $w.width())
        }
        // 輪播時要使用大版

        $container.addClass('large')
        var $w = $(window),
          $c = $list.find('.card:first'),
          ww = $w.width(),
          wh = $w.height() * 0.85,
          cw = $c.outerWidth(true) || $c.width(),
          ch = $c.outerHeight(true) || $c.height(),
          wi = 1,
          hi = 1,
          nw = ww,
          nh = wh

        if (ww && wh && cw && ch) {
          while (cw * wi < ww) {
            wi++
          }
          while (ch * hi < wh) {
            hi++
          }

          // 是1366, 1600, 1920時，限制寬度最多顯示5台，高度最多2排，共10台
          nw = is1920 ? 1490 : cw * --wi
          nh = ch * (is1366 || is1600 || is1920 ? 2 : --hi)

          $list.width(nw)
          $list.height(nh)
        }
      } else {
        $container.removeClass('large')
        //                $list.width('auto');
        $list.css({
          width: 'auto',
          overflow: 'hidden',
        })
      }

      $container = null
      $list = null
    })()
    widget._current_rotating = widget.isRotating()
  }
  widget.isRestored = true

  function updateCurrentDeviceData(workShift) {
    var allmachine = servkit.getMachineList()
    var today = moment().format('YYYYMMDD')
    hippo
      .newSimpleExhaler()
      .space('product_work_utilization')
      .index('machine_id', allmachine)
      .indexRange('date', today, today)
      .columns(
        'machine_id',
        'date',
        'work_shift',
        'program_name',
        'part',
        'n1',
        'n2',
        'n3',
        'power',
        'operate',
        'cutting'
      )
      .exhale(function (exhalable) {
        var currentWorkShiftData = _.where(exhalable.exhalable, {
          work_shift: workShift,
        })
        var groupByMachinePgStdhour = _.groupBy(currentWorkShiftData, function (
          obj
        ) {
          var n3 = obj.n3 == null ? '---' : obj.n3
          var machineId = obj.machine_id
          return machineId + obj.program_name + n3
        })

        var groupCalc = _.map(groupByMachinePgStdhour, function (arr, key) {
          var powerSum = _.reduce(
            arr,
            function (memo, obj) {
              return memo + obj.power
            },
            0
          )
          var partSum = _.reduce(
            arr,
            function (memo, obj) {
              return memo + obj.part
            },
            0
          )
          var expectedPart = arr[0].n3 == 0 ? 0 : powerSum / arr[0].n3

          return {
            machineId: arr[0].machine_id,
            productId: arr[0].n1,
            workId: arr[0].n2,
            stdHour: arr[0].n3,
            power: powerSum,
            part: partSum,
            expectedPart: expectedPart,
          }
        })

        var groupByMachine = _.groupBy(groupCalc, function (obj) {
          return obj.machineId
        })

        var result = {}
        _.map(groupByMachine, function (arr, key) {
          var partSum = _.reduce(
            arr,
            function (memo, obj) {
              return memo + obj.part
            },
            0
          )
          var expectedPartSum = _.reduce(
            arr,
            function (memo, obj) {
              return memo + obj.expectedPart
            },
            0
          )

          result[arr[0].machineId] = [
            {
              machineId: arr[0].machineId,
              part: partSum,
              expectedPart: expectedPartSum,
            },
          ]
        })

        widget.shiftData = result

        // servkit.politeCheck()
        //   .until(function () {
        //     return result;
        //   }).thenDo(function () {
        //     _.map(result, function (arr, key) {
        //       var $chart = $("#" + key);
        //       if ($chart.length) {
        //         _updateBarChart($chart, arr);
        //       }
        //       $chart = null;
        //     })
        //   }).tryDuration(0)
        //   .start();
      })
  }

  function getCurrentShift(callback) {
    servkit.ajax(
      {
        url: 'api/workshift/now',
        type: 'GET',
        contentType: 'application/json',
      },
      {
        success: function success(data) {
          var currentWorkShiftName = data.name
          callback(currentWorkShiftName)
        },
      }
    )
  }

  if (!widget.parameter.disable) {
    _.map(widget.shiftData, function (arr, key) {
      var $chart = $('#' + key)
      if ($chart.length) {
        _updateBarChart($chart, arr)
      }
      $chart = null
    })
  }

  if (typeof done === 'function') {
    done()
  }
}
