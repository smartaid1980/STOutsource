;(function (global, $, _, undefined) {
  global.servkit = global.servkit || {}

  /*
  範例
  var config = {
            chartContainer: '#sin-chart',
            tableContainer: '#data-table',
            colHeaders: ["Q1", "Q2", "M3", "M4", "M5", "W20", "2015/05/11", "2015/05/12", "2015/05/13", "2015/05/14", "2015/05/15", "2015/05/16", "2015/05/18", "2015/05/19"],
            rowHeaders: ['作業效率', '稼動(有效率)'],
            percentColumn: ['作業效率', '稼動(有效率)'],
            dataMatrix:[
                [92.11,95.35,93.07,94.08999999999999,97.66,97.7,96.66,97.26,98.28,98.16,96.97,98.9,97.72999999999999,97.75],
                [97.18,98.48,97.13000000000001,98.07000000000001,99.22,99.11999999999999,97.43,99.36,99.37,99.76,99.02,99.72999999999999,98.38,98.65]
            ],
            chartYAxisUnit: '%',
            isOpenSeriesFilter: true,
            isShowTarget: true,
            targetData: [80, 90, 80, 99, 80, 99, 80, 50, 80, 50, 99, 50, 80, 50],
            useClickTipEventLabel: ['工單達成率'],
  }
  servkit.chartEx(config);
  */

  servkit.chartEx = function (configObj) {
    var config = {
      dateRegExp: /^\d{4}\/\d{1,2}\/\d{1,2}/,
      percentColumn: [],
      tableContainer: '',
      chartContainer: '',
      // 資料顯示單位(後製字串)
      dataUnit: '',
      columns: [],
      targetData: [],
      // 是否開啟過濾功能
      isOpenSeriesFilter: false,
      // table每行幾個
      tableSplit: 11,
      // table欄位平均
      tableColumnAverage: true,
      // table標題寬度(%)
      tableTitleSize: 15,
      // 是否顯示目標數值
      isShowTarget: true,
      // 目標數值
      target: {
        label: 'Target',
        value: 80,
        color: servkit.colors.red,
        tipTemplate:
          '<div class="popover fade bottom in" role="tooltip" id="targettip-<%=label%>-<%=key%>"><div class="arrow"></div><div style="margin:6px; overflow: hidden;"><div><%=value%></div><div><%=comment%></div></div></div>',
        showOverTip: true,
      },
      colorList: [
        servkit.colors.blue,
        servkit.colors.green,
        servkit.colors.red,
        servkit.colors.orange,
        '#356e35',
        '#57889c',
        '#ac5287',
        '#6e3671',
        '#a65858',
        '#b09b5b',
        '#71843f',
        '#568a89',
        '#a8829f',
        '#6e587a',
      ],
      // 報表用的顏色
      tickColor: '#efefef',
      borderColor: '#efefef',
      // 綁定事件
      /**
       * plotclick: 報表上原點的事件
       * plothover: 報表上滑鼠在點上時的事件
       * tableclick: 表格欄位點擊事件
       */
      event: {
        plotclick: _eventClickTip,
        plothover: _eventHoverTip,
      },
      // tip上面的事件
      clickTipEvent: {
        '.skt-comment': _eventCommentModal,
      },
      // Click的Tooltip樣式(會帶入label, key, value, comment)
      clickTipTemplate:
        '<div><%=label%> <%=key%>: <%=value%></div><div style="margin-top: .5em;">', //<button class="btn btn-success btn-xs skt-comment" data-skt-label="<%=label%>" data-skt-key="<%=key%>">Comment</button></div>',
      // Hover的Tooltip樣式(會帶入label, key, value, comment)
      hoverTipTemplate:
        '<div><%=label%> <%=key%>: <%=value%></div><div><%=comment%></div>',
      useClickTipEventLabel: [],
    }
    // combin config
    $.extend(true, config, configObj)
    config.columns = configObj.rowHeaders //例外，因為叫columns無法清楚表達其實是head
    config.dataUnit = configObj.chartYAxisUnit //例外，唉...其實只是chart的y軸單位，並不會套用到全部資料

    //　報表繪製時使用
    var _chart = {
      keys: [],
      values: [],
    }
    // comment物件
    var _comment = {}
    // 繪製後的plot
    var _plot
    // click用的tooltip compiler
    var clickTipCompiled
    // hover用的tooltip compile
    var hoverTipCompiled
    // target用的tooltip compiler
    var targetTipCompiled

    function draw() {
      _chart.keys = configObj.colHeaders
      _chart.values = configObj.dataMatrix

      drawTable()
      drawChart()
      drawTargetTips()
    }

    function drawTable() {
      var isColumnEvent =
        !_.isUndefined(config.event) && _.isFunction(config.event['tableclick'])

      var $table = $(config.tableContainer)

      if ($table.length == 0) {
        //      alert('table div undefined');
        return
      }

      var table = []
      var html = []
      var split = config.tableSplit

      // 如果資料數量小於原本的
      if (split > _chart.keys.length) {
        split = _chart.keys.length
      }

      // 先將資料區分出表格
      _.each(_chart.keys, function (k, i) {
        // 第幾個table
        var ti = Math.floor(i / split)
        // 第幾欄
        var ci = i % split
        var t = (table[ti] = table[ti] || [])
        if (_.isUndefined(table[ti][0])) {
          table[ti][0] = []
          table[ti][0].length = split
          table[ti][0].fill('')
        }
        table[ti][0][ci] = k
      })
      _.each(_chart.values, function (vs, i) {
        _.each(vs, function (v, j) {
          // 第幾個table
          var ti = Math.floor(j / split)
          // 第幾欄
          var ci = j % split
          var t = (table[ti] = table[ti] || [])
          if (_.isUndefined(table[ti][i + 1])) {
            table[ti][i + 1] = []
            table[ti][i + 1].length = split
            table[ti][i + 1].fill('')
          }
          table[ti][i + 1][ci] = v
        })
      })

      // 繪製表格
      var title = _.union([i18n('date')], config.columns)
      var aw = Math.floor((100 - config.tableTitleSize) / config.tableSplit)
      html.push('<table class="table table-bordered smart-form">')
      _.each(table, function (t, i) {
        var label
        var keys = []
        _.each(t, function (r, j) {
          html.push(j == 0 ? '<tr class="success">' : '<tr>')
          label = title[j]
          _.each(r, function (c, k) {
            var str = showDateFormat(
              valueProcess(c) +
                (j > 0 &&
                _.contains(config.percentColumn, label) &&
                $.isNumeric(c)
                  ? '%'
                  : '')
            )
            // 用來keep欄位
            if (j == 0) {
              keys.push(c)
            }
            // 資料標題
            if (k == 0) {
              if (config.isOpenSeriesFilter && i == 0 && j > 0) {
                html.push(
                  '<td class="inline-group" width="' +
                    config.tableTitleSize +
                    '%">' +
                    '<strong style=" float: left; margin-right: 1em;">' +
                    label +
                    '</strong>' +
                    '<label class="checkbox"><input type="checkbox" name="showSeries" value="' +
                    label +
                    '" checked="true"><i></i></label>' +
                    '</td>'
                )
              } else {
                html.push(
                  '<td width="' +
                    config.tableTitleSize +
                    '%"><strong>' +
                    label +
                    '</strong></td>'
                )
              }
            }
            // 資料內容
            // 非第一行(時間)或有開啟comment才顯示
            if (j > 0 && isColumnEvent) {
              html.push(
                '<td class="text-right" width="' +
                  aw +
                  '%"><a href="#" class="txt-value skt-column-event" data-label="' +
                  label +
                  '" data-key="' +
                  keys[k] +
                  '">' +
                  str +
                  '</a></td>'
              )
            } else {
              html.push(
                '<td class="text-right" width="' +
                  aw +
                  '%"><div class="txt-value">' +
                  str +
                  '</div></td>'
              )
            }
          })
          html.push('</td>')
        })
      })
      html.push('</table>')
      // draw table
      $table.html(html.join(''))

      // table event
      // 過濾事件
      $table
        .off('click', ':checkbox[name="showSeries"]')
        .on('click', ':checkbox[name="showSeries"]', function (ev) {
          var showSeries = []
          $table.find(':checkbox[name="showSeries"]:checked').each(function () {
            showSeries.push($(this).val())
          })
          drawChart(showSeries)
        })

      // 欄位事件
      if (isColumnEvent) {
        $table
          .off('click', '.skt-column-event')
          .on('click', '.skt-column-event', config.event['tableclick'])
      }
    }

    function drawChart(showSeries, targetConfig) {
      var $chart = $(config.chartContainer)

      if ($chart.length == 0) {
        //        alert('chart div undefined');
        return
      }
      // 確定要顯示的series
      showSeries = showSeries || config.columns
      config.isShowTarget = targetConfig
        ? targetConfig.isShow
        : config.isShowTarget
      config.target.value = targetConfig
        ? targetConfig.value
        : config.target.value
      // debug filter series
      // console.debug('show series:' + showSeries.join(','));
      // 清除目前的clicktip
      _clearClickTip()

      // 全部的Series
      var lines = []
      // series類別
      var label = config.columns
      // x軸的label,必須是[[0,x], [1,x], [2,x]]的格是
      var xAxisLabels = []
      // 資料
      var values = _chart.values
      // 最終要顯示的series
      var result = []
      // 全部內容的最大最小值
      var vMax = 100,
        vMin = 0

      _.each(_chart.keys, function (k, i) {
        xAxisLabels.push([i, k])
      })

      _.each(values, function (val, i) {
        var obj = lines[i]
        var data = values[i]
        if (typeof obj == 'undefined') {
          obj = {
            label: label[i],
            data: [],
            color: config.colorList[i],
          }
          if (config.valueLabels && config.valueLabels[i]) {
            obj.valueLabels = config.valueLabels[i]
            obj.valueLabels.fontcolor = obj.color
          }
          lines[i] = obj
        }

        _.each(val, function (v, j) {
          v = valueProcess(v)
          obj.data.push([j, v])
          if (vMax < v) vMax = v
          if (vMin > v) vMin = v
        })
      })

      // debug chart data
      // console.debug('line ' + lines.length);
      // console.debug(xAxisLabels);
      // console.debug(lines);

      // filter
      _.each(lines, function (obj) {
        var label = obj.label
        if (_.indexOf(showSeries, label) > -1) {
          result.push(obj)
        }
      })

      // todo put target
      if (config.isShowTarget) {
        var data = []
        var label = config.target.label
        var values = config.targetData
        var color = config.target.color
        _.each(xAxisLabels, function (l, i) {
          data.push([i, values[i]])
        })
        result.push({
          label: label,
          data: data,
          color: color,
          points: {
            show: true,
            symbol: function (ctx, x, y, radius, shadow) {
              var size = radius * Math.sqrt(Math.PI) // / 2
              ctx.moveTo(x - size, y - size)
              ctx.lineTo(x + size, y + size)
              ctx.moveTo(x - size, y + size)
              ctx.lineTo(x + size, y - size)
            },
          },
        })
      }

      // draw plot
      _plot = $.plot($chart, result, {
        series: {
          lines: {
            show: true,
          },
          points: {
            show: true,
          },
        },
        grid: {
          hoverable: true,
          clickable: true,
          tickColor: config.tickColor,
          borderWidth: 0,
          borderColor: config.borderColor,
        },
        // tooltip : true,
        // tooltipOpts : {
        //    content : '%y' + (config.typeUnit[config.type] || ''),
        //    defaultTheme : false
        // },
        colors: config.colorList,
        yaxis: {
          tickFormatter: function (y, axis) {
            return y + (config.dataUnit || '')
          },
          min: vMin,
          max: Math.floor(vMax * 1.2),
          font: config.tickFont || undefined,
        },
        xaxis: {
          ticks: _.map(xAxisLabels, function (elem, index) {
            return [index, showDateFormat(elem[1])]
          }),
          //        ticks : xAxisLabels,
          min: 0,
          max: xAxisLabels.length - 1,
          font: config.tickFont || undefined,
          //        tickFormatter: function (val, axis) {
          //          // console.debug('x tick format');
          //          console.log(val);
          //          // console.debug(axis);
          //          return showDateFormat(val);
          //        }
        },
        legend: {
          show: true,
          margin: '0px',
          position: 'ne',
        },
      })

      // draw target tip
      drawTargetTips()

      // console.debug('event');
      // console.debug(config.event);
      if (
        !_.isUndefined(config.event) &&
        _.isFunction(config.event['plotclick'])
      ) {
        $chart
          .unbind('plotclick')
          .bind('plotclick', function (event, pos, item) {
            var fn = config.event['plotclick']
            var obj = {
              event: event,
              pos: pos,
              item: item,
            }
            if (item) {
              obj['index'] = item.dataIndex
              obj['label'] = item.series.label
              obj['key'] = _chart.keys[item.dataIndex]
              obj['value'] = item.datapoint[1]
            }
            fn(obj)
          })
      }
      //
      if (
        !_.isUndefined(config.event) &&
        _.isFunction(config.event['plothover'])
      ) {
        $chart
          .unbind('plothover')
          .bind('plothover', function (event, pos, item) {
            var fn = config.event['plothover']
            var obj = {
              event: event,
              pos: pos,
              item: item,
            }
            if (item) {
              obj['index'] = item.dataIndex
              obj['label'] = item.series.label
              obj['key'] = _chart.keys[item.dataIndex]
              obj['value'] = item.datapoint[1]
            }
            fn(obj)
          })
      }
      // 重新繪製
      $chart.unbind('resize', _resizeEvent).bind('resize', _resizeEvent)
    }

    function showDateFormat(val) {
      // console.debug('date format regex ' + val + '>' + val.match(config.dateRegExp));
      return typeof val === 'string' && val.match(config.dateRegExp) != null
        ? val.substring(5)
        : val
    }

    function valueProcess(val) {
      return $.isNumeric(val) ? formatFloat(val, 2) : val
    }

    function formatFloat(num, pos) {
      var size = Math.pow(10, pos)
      return Math.round(num * size) / size
    }

    function drawTargetTips() {
      var tvs = config.targetData
      var chartData = _plot.getData()
      var chartOffset = _plot.offset()
      // 清除原本的tip
      _clearTargetTip()
      // 開始繪製新的tip
      // 依序處理chart的series
      _.each(chartData, function (d, i) {
        // 只處理user指定的
        if (_.contains(config.columns, d.label)) {
          // console.debug('process ' + d.label);
          // console.debug(d);
          // 依序處理series的每筆資料
          var dd = d.data
          var ticks = d.xaxis.ticks
          _.each(dd, function (ddd, j) {
            var x = ddd[0]
            var y = ddd[1]
            var k = ticks[j].label
            var v = y
            var pos
            var tv = tvs[j]
            if (config.isShowTarget && config.target.showOverTip && v < tv) {
              pos = _plot.p2c({ x: x, y: y })
              _buildTargetTip(
                d.label,
                k,
                v,
                pos.top + chartOffset.top,
                pos.left + chartOffset.left,
                d.color
              )
            } else if (config.isShowComment && _findComment(d.label, k)) {
              pos = _plot.p2c({ x: x, y: y })
              _buildTargetTip(
                d.label,
                k,
                v,
                pos.top + chartOffset.top,
                pos.left + chartOffset.left,
                d.color
              )
            }
          })
        }
      })
    }

    function _resizeEvent() {
      // 清除clicktip
      _clearClickTip()
      // 重畫tip
      drawTargetTips()
    }

    // 建立target tip
    function _buildTargetTip(label, key, value, posX, posY, color) {
      // console.debug('draw target tip l:' + label + ' k:' + key + ' v:' + value + ' x:' + posX + ' y:' + posY);
      if (_.isUndefined(targetTipCompiled)) {
        targetTipCompiled = _.template(config.target.tipTemplate || '')
      }
      var data = {
        label: label,
        key: key,
        value: value,
        comment: _findComment(label, key) || '',
      }

      var $tooltip = $(targetTipCompiled(data))
        .css({
          'display': 'block',
          'max-width': '5em',
          'color': color,
          'font-size': '.8em',
          'font-weight': 'bold',
        })
        .addClass('target-tip')
        .appendTo('body')
      // 移動tooltip的位置
      $tooltip.css({ top: posX + 5, left: posY - $tooltip.outerWidth() / 2 })
    }

    // 清除target tip
    function _clearTargetTip() {
      $('.target-tip').remove()
    }

    // 清除click的tooltip
    function _clearClickTip() {
      var $tooltip = $('#plot-clicktip')
      $tooltip.hide()
    }

    function _findComment(label, key) {
      return _comment[label + '_' + key] || ''
    }

    // 用來建立click的tooltip
    function _eventClickTip(conf) {
      //console.log(conf.label);
      //useClickTipEventLabel裡面的值表示要使用clickTipEvent，若沒設的話，就不需要tip，直接結束
      if (!_.contains(config.useClickTipEventLabel, conf.label)) {
        return
      }
      // console.debug('clicktip');
      var $tooltip = $('#plot-clicktip')
      if (conf.item) {
        // check is show label
        if (!_.contains(config.columns, conf.label)) {
          return
        }
        if ($tooltip.length == 0) {
          $tooltip = $("<div id='plot-clicktip'></div>")
            .css({
              'position': 'absolute',
              'display': 'none',
              'border': '1px solid gray',
              'padding': '6px',
              'background-color': '#fff',
              'opacity': 1,
              'z-index': 1012,
            })
            .appendTo('body')

          // bind events
          if (!_.isUndefined(config.clickTipEvent)) {
            _.each(config.clickTipEvent, function (v, k, l) {
              $tooltip.off(k).on('click', k, v)
            })
          }
        }
        if (_.isUndefined(clickTipCompiled)) {
          clickTipCompiled = _.template(config.clickTipTemplate || '')
        }
        var item = conf.item
        var label = conf.label,
          key = conf.key,
          val =
            conf.value + (_.contains(config.percentColumn, label) ? '%' : ''),
          comment = config.enableComment ? _findComment(label, key) || '' : ''
        var data = {
          label: label,
          key: key,
          value: val,
          comment: comment,
        }
        // var x = item.datapoint[0].toFixed(2),
        //     y = item.datapoint[1].toFixed(2);
        $tooltip
          .html(clickTipCompiled(data))
          .css({ top: item.pageY + 5, left: item.pageX + 5 })
          .fadeIn(200)
      } else {
        $tooltip.hide()
      }
    }

    // 用來建立hover的tooltip
    function _eventHoverTip(conf) {
      // console.debug('hovertip');
      var $tooltip = $('#plot-hovertip')
      if (conf.item) {
        // check is show label
        if (!_.contains(config.columns, conf.label)) {
          return
        }
        if ($tooltip.length == 0) {
          $tooltip = $("<div id='plot-hovertip'></div>")
            .css({
              'position': 'absolute',
              'display': 'none',
              'border': '1px solid #cca300',
              'padding': '6px',
              'background-color': '#ffdb4d',
              'opacity': 0.9,
              'z-index': 1011,
            })
            .appendTo('body')
        }
        if (_.isUndefined(hoverTipCompiled)) {
          hoverTipCompiled = _.template(config.hoverTipTemplate || '')
        }
        var item = conf.item
        var label = conf.label,
          key = conf.key,
          val =
            conf.value + (_.contains(config.percentColumn, label) ? '%' : ''),
          comment = config.enableComment ? _findComment(label, key) || '' : ''
        var data = {
          label: label,
          key: key,
          value: val,
          comment: comment,
        }
        // var x = item.datapoint[0].toFixed(2),
        //     y = item.datapoint[1].toFixed(2);
        $tooltip
          .html(hoverTipCompiled(data))
          .css({
            top: item.pageY - $tooltip.outerHeight() - 5,
            left: item.pageX + 5,
          })
          .fadeIn(200)
      } else {
        $tooltip.hide()
      }
    }

    // 用來建立comment modal
    function _eventCommentModal(ev) {
      var $modal = $('#commentModal')
      if ($modal.length == 0) {
        $modal = $(
          '<div class="modal fade" id="commentModal" tabindex="-1" role="dialog" aria-hidden="true">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
            '<h4 class="modal-title">Comment</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<form id="comment-form" class="smart-form" novalidate="novalidate">' +
            '<input type="hidden" name="label" value="">' +
            '<input type="hidden" name="key" value="">' +
            '<fieldset>' +
            '<section>' +
            '<label class="label">' +
            '<span>Comment</span>' +
            '<span id="comment-form-info"></span>' +
            '</label>' +
            '<label class="input">' +
            '<input type="text" name="comment">' +
            '</label>' +
            '</section>' +
            '</fieldset>' +
            '</form>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
            '<button type="button" class="btn btn-primary">Save</button>' +
            '</div>' +
            '</div>  ' +
            '</div>' +
            '</div>'
        ).insertAfter($(config.tableContainer))
        $modal.modal()
      }

      ev.preventDefault()
      return false
    }

    servkit.requireJsAsync(
      [
        [
          '/js/plugin/flot/jquery.flot.cust.min.js',
          '/js/plugin/flot/jquery.flot.resize.min.js',
          '/js/plugin/flot/jquery.flot.fillbetween.min.js',
          '/js/plugin/flot/jquery.flot.orderBar.min.js',
          '/js/plugin/flot/jquery.flot.pie.min.js',
          '/js/plugin/flot/jquery.flot.tooltip.min.js',
          '/js/plugin/flot/jquery.flot.time.min.js',
          '/js/plugin/flot/jquery.flot.stack.min.js',
          '/js/plugin/flot/jquery.flot.axislabels.js',
          //"/js/plugin/flot/jquery.flot.valuelabels.js"
          '/js/servtech/jquery.flot.valuelabels.js',
        ],
      ],
      draw
    )

    return {
      draw: draw,
    }
  }
})(this, $, _)
