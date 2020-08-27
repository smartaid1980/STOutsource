;(function (global, $, _, undefined) {
  global.servkit = global.servkit || {}

  servkit.chart = function (configObj) {
    var config = {
      // 專案
      project: undefined,
      // 日期
      date: undefined,
      // 資料代碼
      dataType: undefined,
      // 資料檔案
      dataFile: undefined,
      // 資料顯示單位(後製字串)
      dataUnit: '',
      // 資料範圍
      dataScope: ['quarter', 'month', 'week', 'date'],
      // 日期隔式
      dateRegExp: /^\d{4}\/\d{1,2}\/\d{1,2}/,
      // dataPathPattern = '{scope}/{file}.csv',
      // dataPathParam = {
      //   scope: '{dataScope}',
      // },
      // 資料時間
      times: [],
      // 資料欄位
      columns: [],
      // 需要轉換為百分比的資料
      percentColumn: [
        i18n('Work_Efficiency'),
        i18n('Utilization_Efficiency'),
        i18n('Yield_Rate'),
        i18n('Yield_Target'),
        i18n('Production_Efficiency_Target'),
      ], //['作业效率', '稼动(有效率)', '良率', '良率目标', '生产效率目标'],
      // Click的Tooltip樣式(會帶入label, key, value, comment)
      clickTipTemplate:
        '<div><%=label%> <%=key%>: <%=value%></div><div style="margin-top: .5em;"><button class="btn btn-success btn-xs skt-comment" data-skt-label="<%=label%>" data-skt-key="<%=key%>">Comment</button></div>',
      // Hover的Tooltip樣式(會帶入label, key, value, comment)
      hoverTipTemplate:
        '<div><%=label%> <%=key%>: <%=value%></div><div><%=comment%></div>',
      // 是否顯示目標數值
      isShowTarget: false,
      // 目標數值
      target: {
        label: 'Target',
        value: 80,
        color: servkit.colors.red,
        tipTemplate:
          '<div class="popover fade bottom in" role="tooltip" id="targettip-<%=label%>-<%=key%>"><div class="arrow"></div><div style="margin:6px; overflow: hidden;"><div><%=value%></div><div><%=comment%></div></div></div>',
        showOverTip: true,
      },
      // 是否自動填補
      isAutoFill: false,
      // commentPathPattern = '',
      // commentPathParam = {}
      // 是否要啟用comment
      enableComment: true,
      // 是否要顯示comment
      isShowComment: true,
      // table每行幾個
      tableSplit: 11,
      // table欄位平均
      tableColumnAverage: true,
      // table標題寬度(%)
      tableTitleSize: 15,
      // 是否開啟過濾功能
      isOpenSeriesFilter: false,
      // 是否開起快取功能
      isCache: false,
      // 是否自動resize
      isAutoResize: true,
      // 各類型檔案名稱（預設前面會帶年分，若有設定會在年分後加上"_"區隔）
      typeFileMap: {
        production: '',
        yield: '',
        invalid: 'alarmCode',
        changeline: 'alarmCode_changeLine',
      },
      // 各種資料類型顯示的欄位
      typeColumnMap: {
        production: [
          i18n('Work_Efficiency'),
          i18n('Utilization_Efficiency'),
          i18n('Production_Efficiency_Target'),
        ], // ['作业效率', '稼动(有效率)', '生产效率目标'],
        yield: [i18n('Yield'), i18n('Yield_Target')], //['良率', '良率目标'],
        invalid: [i18n('Invalid_Man_Hour')], //['无效人时'],
        changeline: [i18n('Change_Line_Time')], //['换线时间']
      },
      // 資料類型顯示時的單位
      typeUnitMap: {
        production: '%',
        yield: '%',
        invalid: '',
        changeline: '',
      },
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
      // 繪製時用的顏色
      //      colorList: ['blueDark', 'green', 'red', 'orange', 'yellow', 'green', 'blue', 'pink', 'purple'],
      //      colorList: ['#3276B1', '#71843f', '#a90329', '#c79121', '#356e35', '#57889c', '#ac5287', '#6e3671',
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
    }
    // combin config
    $.extend(true, config, configObj)

    // 原始資料
    var _source
    // 原始資料欄位
    var _column = []
    // 原始資料物件
    var _data = {}
    // comment物件
    var _comment = {}
    // 欄位數量，主要是長資料跟查資料時需要參考
    var _allScope, _overviewScope, _dateScope
    // 報表繪製時使用
    var _chart = {
      keys: [],
      values: [],
    }
    // 繪製後的plot
    var _plot
    // click用的tooltip compiler
    var clickTipCompiled
    // hover用的tooltip compile
    var hoverTipCompiled
    // target用的tooltip compiler
    var targetTipCompiled

    // 產生假報表資料用的,後續應該用不到
    function getRandomData(col, row) {
      var i, j
      var a = []
      var ah = []
      for (i = 0; i < col.length; i++) {
        ah.push(col[i])
      }
      a.push(ah)
      for (i = 0; i < row.length; i++) {
        var aa = []
        aa.push(row[i])
        for (j = 1; j < col.length; j++) {
          aa.push(Math.random())
        }
        a.push(aa)
      }
      return a
    }

    // 取得資料
    function _loadData(project, datatype, year, scope, store) {
      servkit.ajax(
        {
          url: 'api/getdata/file',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            type: 'aheadmaster',
            pathPattern: project + '/output/{type}/trend/{year}/{scope}.csv',
            pathParam: {
              type: _.isArray(datatype) ? datatype : [datatype],
              year: _.isArray(year) ? year : [year],
              scope: _.isArray(scope) ? scope : [scope],
              // 'file': [year + (config.typeFile[type] && config.typeFile[type].length ? '_' + config.typeFile[type] : '')]
            },
          }),
          async: false,
        },
        {
          success: function (data) {
            _source = data
            _.each(data, function (d, i) {
              // 保留欄位名稱
              if (i == 0) {
                _column = d
              }
              // 處理資料
              var k = d[0]
              if (_.isUndefined(store[k])) {
                store[k] = [d]
              } else {
                store[k].push(d)
              }
            })
          },
          fail: function (data) {
            store = {}
          },
        }
      )
    }

    // 取得評論
    // function _loadComment(project, datatype, year, store) {
    function _loadComment(project, datatype, year, store) {
      servkit.ajax(
        {
          url: 'api/getdata/file',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            type: 'aheadmaster',
            pathPattern: project + '/comment/{type}/trend/{year}.csv',
            pathParam: {
              type: _.isArray(datatype) ? datatype : [datatype],
              year: _.isArray(year) ? year : [year],
              // 'file': [year + (config.typeFile[type] && config.typeFile[type].length ? '_' + config.typeFile[type] : '')]
            },
            // 'pathPattern': project + '/comment/{file}.csv',
            // 'pathParam': {
            //     'file': [year + '_comment_' + datatype]
            // }
          }),
        },
        {
          success: function (data) {
            _.each(data, function (d, i) {
              var key = d[0],
                value = d[1]
              store[key] = value
            })
            drawTargetTips()
          },
        }
      )
    }

    // 用來搜尋資料,但若沒資料會自動填補
    function _findWithFill(times, cols, data, isSum) {
      var title = data[0]
      var index = []
      var percent = []
      var result = []
      var ncols = ['KEY']

      // find col index
      _.each(cols, function (col, i) {
        var idx = _.indexOf(title, col)
        //            console.debug('col' + col + ' idx:' + idx);
        index.push(idx)
        if (_.indexOf(config.percentColumn, col) > -1) {
          percent.push(idx)
        }
        ncols.push(col)
      })
      result.push(ncols)
      // build empty
      _.each(times, function (t, i) {
        var ary = []
        ary.length = index.length + 1
        ary[0] = t
        ary.fill(0, 1)
        //            console.debug('ary');
        //            console.debug(ary);
        result.push(ary)
      })
      //        console.debug('result');
      //        console.debug(result);
      // find and put data
      //        console.debug('index');
      //        console.debug(index);
      _.each(data, function (d, i) {
        var k = d[0]
        var idx = _.indexOf(times, k)
        //            console.debug('data ' + k + ' ' + idx);
        if (idx > -1) {
          //                console.debug('\tdata ' + k + ':[' + d.join(',') + ']');
          _.each(index, function (p, j) {
            // row 第一行是title所以要加1, col 第一筆是key,也要加1
            var val = $.isNumeric(d[p]) ? parseFloat(d[p]) : d[p]
            val = _.isNaN(val) ? 0 : val
            result[idx + 1][j + 1] +=
              isSum && _.indexOf(percent, p) > -1 ? val * 100 : val
          })
        }
      })
      return result
    }

    // 取得原始資料
    function loadSourceData() {
      var p = config.project
      var t = config.dataType
      var y = config.date.getFullYear()
      var s = config.dataScope
      _data = {}
      _loadData(p, t, y, s, _data)
    }

    // 取得評論
    function loadComment() {
      if (config.enableComment) {
        var p = config.project
        var t = config.dataType
        var y = config.date.getFullYear()
        _comment = {}
        _loadComment(p, t, y, _comment)
      }
    }

    // 轉換資料
    function convertData() {
      var times = config.times
      var columns = config.columns
      var colIdx = []
      var percentIdx = []
      var keys = []
      var values = []

      // debug
      // console.debug('convert data');
      // console.debug(_column);
      // console.debug(_data);

      _.each(columns, function (c, i) {
        // 找到欄位在資料中的位置
        var idx = _.indexOf(_column, c)
        if (idx > -1) colIdx.push(idx)
        else console.warn('no column[' + c + '] in data')
        if (_.indexOf(config.percentColumn, c) > -1) {
          percentIdx.push(idx)
        }
        // 建立資料的陣列
        values[i] = []
      })
      // debug
      // console.debug('col index:' + colIdx.join(','));

      _.each(times, function (t, i) {
        var row = _data[t]
        // 先檢查是否為空,並決定是否要填補
        if (_.isUndefined(row) && config.isAutoFill) {
          row = []
          row.length = _column.length
          row[0] = t
          row.fill(0, 1)
          row = [row]
        }
        // 正式處理
        if (!_.isUndefined(row)) {
          _.each(colIdx, function (idx, j) {
            var val
            _.each(row, function (r, k) {
              var s = r[idx]
              val = $.isNumeric(s) ? parseFloat(s) + (val || 0) : s
              // debug
              //               console.debug(t + ' v:' + val + ' s:' + s + ' num?' + _.isNumber(s) + ':' + $.isNumeric(s));
            })
            values[j].push(_.contains(percentIdx, idx) ? val * 100 : val)
          })
          keys.push(t)
        }
      })
      // debug
      // console.debug('\tkeys:');
      // console.debug(keys);
      // console.debug('\tvalues:');
      // console.debug(values);
      _chart.keys = keys
      _chart.values = values
    }

    function draw() {
      // 取得資料
      loadSourceData()
      // 取得評論
      loadComment()
      // 轉換資料
      convertData()
      // 繪製表格
      drawTable()
      // 繪製報表
      drawChart()
    }

    function formatFloat(num, pos) {
      var size = Math.pow(10, pos)
      return Math.round(num * size) / size
    }

    function valueProcess(val) {
      return $.isNumeric(val) ? formatFloat(val, 2) : val
    }

    function showDateFormat(val) {
      // console.debug('date format regex ' + val + '>' + val.match(config.dateRegExp));
      return typeof val === 'string' && val.match(config.dateRegExp) != null
        ? val.substring(5)
        : val
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
        var value = config.target.value
        var color = config.target.color
        _.each(xAxisLabels, function (l, i) {
          data.push([i, value])
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
            return (
              y + (config.dataUnit || config.typeUnitMap[config.dataType] || '')
            )
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

    function _resizeEvent() {
      // 清除clicktip
      _clearClickTip()
      // 重畫tip
      drawTargetTips()
    }

    function drawTargetTips() {
      var tv = config.target.value
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

    // 清除target tip
    function _clearTargetTip() {
      $('.target-tip').remove()
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

    // 清除click的tooltip
    function _clearClickTip() {
      var $tooltip = $('#plot-clicktip')
      $tooltip.hide()
    }

    // 用來建立click的tooltip
    function _eventClickTip(conf) {
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

      if (_.isUndefined($modal.attr('data-bind'))) {
        function save(e) {
          e.preventDefault()
          var $form = $('#comment-form')
          var label = $form.find(':input[name="label"]').val()
          var key = $form.find(':input[name="key"]').val()
          var comment = $form.find(':input[name="comment"]').val()
          _saveComment(label, key, comment, function () {
            $modal.modal('hide')
          })
          return false
        }

        $('#saveComment').off('click').on('click', save)
        $('#comment-form').off('click').on('submit', save)

        $modal.attr('data-bind', true)
      }

      ev.preventDefault()
      var $form = $('#comment-form')
      var $t = $(ev.target)
      var label = $t.attr('data-skt-label')
      var key = $t.attr('data-skt-key')

      $modal.modal('show')
      // 把值定到表單中
      $('#comment-point-info').text(' (' + label + ',' + key + ')')
      $('#comment-form')
        .find(':input[name="label"]')
        .val(label)
        .end()
        .find(':input[name="key"]')
        .val(key)
        .end()
        .find(':input[name="comment"]')
        .val(_findComment(label, key))

      return false
    }

    function _findComment(label, key) {
      return _comment[label + '_' + key] || ''
    }

    function _saveComment(label, key, comment, fn) {
      servkit.ajax(
        {
          url: 'api/aheadmaster/comment/save',
          type: 'POST',
          data: {
            project: config.project,
            type: config.dataType,
            mode: 'trend',
            year: config.date.getFullYear(),
            key: label + '_' + key,
            comment: comment,
          },
        },
        {
          success: function (data, textStatus, jqXHR) {
            loadComment()
            $.smallBox({
              title: 'Comment save success.',
              content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
              color: '#296191',
              iconSmall: 'fa fa-thumbs-up bounce animated',
              timeout: 4000,
            })
            fn(data, textStatus, jqXHR)
          },
          error: function (data, textStatus, jqXHR) {},
          always: function () {},
        }
      )
    }

    // hash
    function _hashFnv32a(str, asString, seed) {
      /*jshint bitwise:false */
      var i,
        l,
        hval = seed === undefined ? 0x811c9dc5 : seed

      for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i)
        hval +=
          (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
      }
      if (asString) {
        // Convert to 8 digit hex string
        return ('0000000' + (hval >>> 0).toString(16)).substr(-8)
      }
      return hval >>> 0
    }

    /* comment */

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
          '/js/plugin/flot/jquery.flot.valuelabels.js',
        ],
      ],
      draw
    )

    return {
      chart: this,
      plot: _plot,
      getData: function () {
        return _source
      },
      drawChart: drawChart,
      findData: _findWithFill,
      getComment: _findComment,
      saveComment: _saveComment,
    }
  }

  servkit.chart.getYearWeek = function (date) {
    var d = new Date(date)
    var date2 = new Date(d.getFullYear(), 0, 1)
    var day1 = date.getDay()
    var day2 = date2.getDay()
    if (day1 == 0) day1 = 7
    if (day2 == 0) day2 = 7
    d = Math.round(
      (d.getTime() - date2.getTime() + (day2 - day1) * (24 * 60 * 60 * 1000)) /
        86400000
    )
    return Math.ceil(d / 7) + 1
  }

  servkit.chart.getShowMonths = function (date, num) {
    var r = []
    var d = new Date(date)
    for (var i = num - 1; i >= 0; i--) {
      var m = new Date(d)
      m.setMonth(m.getMonth() - i)
      r.push(m)
    }
    return r
  }

  servkit.chart.getShowDatesAtWeek = function (date, num) {
    var r = []
    var d = new Date(date)
    d.setDate(d.getDate() - d.getDay() - 7)
    for (var i = 0; i < num * 7; i++) {
      r.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return r
  }
})(this, $, _)
