/**
 * Name: BHR (BIRT to HTML Report || Black Hole Report)
 * Author: Vincent Liu
 * Description:
 *   This use to convert the .rptdesign file (from BIRT) to HTML Report.
 *   HTH
 *
 * Configuration:
 *   {
 *     el: the root container  --must--
 *
 *     template: the .rptdesign file name  --must--
 *
 *     debug: debug mode [true|false]  --option--  default=true
 *
 *     prefix: element id prefix for which element build by BHR  --option--  default=BHR_
 *
 *     static: is static follow the xml
 *
 *     layout: layout mode [normal | widget]
 *
 *     table: {
 *       sDom: the arch. of table ref. jquery.dataTable  --option--
 *       autoWidth: ref. jquery.dataTable
 *     }
 *
 *     chart: {
 *       colors: [color array]  --option--
 *       text: {
 *         xaxis: color  --option--
 *         yaxis: color  --option--
 *         color: color  --option--
 *       },
 *       legend: {
 *         margin: [top&bottom, left&right]  --option--
 *       },
 *       pie, line, bar, area, scatter: {  --option--
 *         legend: {
 *           margin: [top&bottom, left&right]  --option--
 *         }
 *       }
 *     }
 *
 *     fn: {  some default functions  --option--
 *
 *     }
 *
 *     reg: {  some default regex  --option--
 *       row:
 *       data:
 *       dynamic:
 *     }
 *   }
 *
 *
 */
;(function (global, $, _, servkit, undefined) {
  global.servkit = global.servkit || {}

  global.$birt

  var _conf = {
    el: '',
    template: '',

    // 若有些重要的element name跟html相衝需要改掉
    // xmlEscapeNodes: [
    //   // {original: 'body', target: 'view'},
    //   // {original: 'row', target: 'xrow'},
    //   // {original: 'cell', target: 'xcell'}
    // ],
    // 所有element id的前置字元
    prefix: 'BHR_',
    // 是否開啟模板快取，關閉時(false)取得模板時會帶上時間戳記
    cache: true,
    // 是否輸出debug log
    debug: false,
    // 是否使用指定報表長寬
    static: false,
    // layout切割模式
    layout: 'widget', // [panel | widget]
    // 表格的設定
    table: {
      sDom:
        "<'dt-toolbar'>" +
        't' +
        "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
      autoWidth: true,
    },
    // 報表的ㄧ些設定
    chart: {
      /* common chart conf */
      colors: ['#2381c4', '#2fa12f', '#ff7f0e', '#ffa500', '#d62728'],
      symbols: ['circle', 'square', 'diamond', 'triangle', 'cross'],
      // 圖表寬度佔容器比例
      width: 0.9,
      // 圖表高度佔容器比例
      height: 0.75,

      decimals: 2,
      // 有特別需要不一樣才需要設定
      text: {
        // xaxis: '#000',
        // yaxis: '#000'
      },
      legend: {
        margin: [0, 0],
      },
      markers: {
        label: '目標',
        line: {
          color: 'rgba(169, 3, 41, 1)',
        },
        range: {
          color: 'rgba(169, 3, 41, .33)',
        },
      },
      /* type conf */
      pie: {
        legend: {
          margin: [10, 0],
        },
        label: {
          formatter: function (v, p) {
            return new Number(p).toFixed(2)
          },
        },
      },
      line: {
        label: {
          formatter: function (v) {
            return v
          },
        },
      },
      bar: {
        label: {
          formatter: function (v) {
            return v
          },
        },
      },
      area: {
        label: {
          formatter: function (v) {
            return v
          },
        },
      },
      scatter: {
        label: {
          formatter: function (v) {
            return v
          },
        },
      },
    },

    fn: {
      measure: {
        sum: function (current, num) {
          return current + num
        },
        count: function (current) {
          return current + 1
        },
      },
    },
    reg: {
      row: /row\["(.+)"\]/,
      data: /data\["(.+)"\]/,
      dynamic: /^row\[".+"\]|^data\[".+"\]/,
    },
    tpl: {
      widget:
        '<article id="<%=id%>" class="col-xs-12 col-sm-<%=size%> col-md-<%=size%> col-lg-<%=size%> <%=clazz%>">' +
        '  <div class="jarviswidget jarviswidget-color-blueDark" id="QC" data-widget-sortable="false"' +
        '    data-widget-editbutton="false" data-widget-deletebutton="false" data-widget-colorbutton="false"' +
        '    data-widget-fullscreenbutton="false">' +
        '    <header>' +
        '      <span class="widget-icon"> <i class="fa fa-bar-chart-o"></i> </span>' +
        '      <h2><%=title%></h2>' +
        '    </header>' +
        '    <!-- widget div -->' +
        '    <div>' +
        '      <!-- widget content -->' +
        '      <div class="widget-body no-padding">' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</article>',
    },
  }

  var _ready = false

  function BlackHole(conf) {
    var self = this

    var $container

    var $template

    var styleNames = [
      'backgroundColor',
      'fontSize',
      'fontWeight',
      'fontStyle',
      'color',
      'textAlign',
      'display',
      'textLineThrough',
      'textUnderline',
    ]

    var _dataSet = {},
      _dataCube = {}

    var tpl = {}

    /* public function */
    this.findById = function (id) {
      return $('#' + conf.prefix + id)
    }

    this.draw = _draw

    /* private function */
    function debug(obj) {
      console && conf.debug && console.debug(obj)
    }

    function log(obj) {
      console && console.log(obj)
    }

    function warn(obj) {
      console && console.warn(obj)
    }

    function error(obj) {
      console && console.error(obj)
    }

    function _toBoolean(str) {
      return str === 'true'
    }

    function _getTemplate() {
      $.ajax({
        url:
          servkit.rootPath +
          '/report/' +
          conf.template +
          '.rptdesign' +
          (conf.cache ? '' : '?_' + new Date().getTime()),
        type: 'GET',
        dataType: 'text',
        async: false,
        success: function (data) {
          debug('get template success.')
          var xmlDoc = $.parseXML(data)
          $template = $(xmlDoc)
          global.$birt = $template
          global.birt = data
        },
        fail: function (data) {
          error('get template fail!')
        },
      })
    }

    function _getDomId(elem) {
      return conf.prefix + (elem.attr('name') || elem.attr('id'))
    }

    function _elementFilterByAttr(els, attr, value) {
      var el = _.find(els, function (el) {
        return $(el).attr(attr) === value
      })
      return el ? $(el) : el
    }

    function _elementText(el) {
      return el.text()
    }

    function _childElementText(el, tag, attr, value) {
      return attr && value
        ? _elementText(el.children(tag + '[' + attr + '="' + value + '"]'))
        : _elementText(el.children(tag))
    }

    function _childPropertyText(el, attr, value) {
      return _childElementText(el, 'property', attr, value)
    }

    function _childPropertyNameText(el, value) {
      return _childPropertyText(el, 'name', value)
    }

    function _buildPanelGrid(_grid, pel, lv) {
      var $grid = $('<div />', { id: _getDomId(_grid), class: 'bhr-grid' })
      _grid.children('row').each(function (i) {
        var _row = $(this),
          _cells = _row.children('cell')
        var $row = $('<div />', {
          id: _getDomId(_row),
          class: 'bhr-grid-row row',
        })
        var rcss = _parseStyle(_row.children('property'))
        var size = Math.floor(12 / _cells.length)
        _cells.each(function (j) {
          var _cell = $(this)
          var $cell = $('<div />', {
            id: _getDomId(_cell),
            class: 'bhr-grid-cell col-sm-' + size,
          })
          var ccss = _parseStyle(_cell.children('property'))
          _buildElement(_cell, $cell, lv)
          $cell.css(ccss).appendTo($row)
        })
        $row.css(rcss).appendTo($grid)
      })

      $grid.appendTo(pel)
    }

    function _buildWidgetGrid(_grid, pel, lv) {
      var $grid = $('<div />', { id: _getDomId(_grid), class: 'bhr-grid' })
      _grid.children('row').each(function (i) {
        var _row = $(this),
          _cells = _row.children('cell')
        var $row = $('<div />', {
          id: _getDomId(_row),
          class: 'bhr-grid-row row',
        })
        var rcss = _parseStyle(_row.children('property'))
        var size = Math.floor(12 / _cells.length)

        _cells.each(function (j) {
          var _cell = $(this)
          // debug('cell first label:' + _elementText(_cell.children('label').first().children('text-property')));
          var _title = _cell.children('label:first')
          var title =
            _childElementText(_title, 'text-property', 'name', 'text') || ''
          var $cellWrap = $(
            tpl.widget({
              id: _getDomId(_cell),
              clazz: 'bhr-grid-cell',
              size: size,
              title: title,
            })
          )
          var $cell = $cellWrap.find('.widget-body')
          var ccss = _parseStyle(_cell.children('property'))
          _title.remove()
          _buildElement(_cell, $cell, lv)
          $cell.css(ccss)
          $cellWrap.appendTo($row)
        })
        $row.css(rcss).appendTo($grid)
      })
      $grid.appendTo(pel)
    }

    function _buildGrid(_grid, pel, lv) {
      switch (conf.layout) {
        case 'panel':
          _buildPanelGrid(_grid, pel, lv)
          break
        case 'widget':
          _buildWidgetGrid(_grid, pel, lv)
          break
        default:
          throw new Error('Undefined Layout Mode ' + conf.layout)
      }
    }

    function _buildTableContent(_xel, pel, dom, lv) {
      _xel.children('row').each(function (i) {
        var _row = $(this)
        var $row = $('<tr />', { id: _getDomId(_row) })
        var rcss = _parseStyle(_row.children('property'))
        _row.children('cell').each(function (j) {
          var _cell = $(this)
          var $cell = $('<' + dom + ' />', { id: _getDomId(_cell) })
          var ccss = _parseStyle(_cell.children('property'))
          _buildElement(_cell, $cell, lv)
          $cell.css(ccss).appendTo($row)
        })
        $row.css(rcss).appendTo(pel)
      })
    }

    function _buildTable(_table, pel, lv) {
      var $table = $('<table />', {
        id: _getDomId(_table),
        class:
          'bhr-table table table-striped table-bordered table-hover dataTable no-footer',
      })
      _table.children('header').each(function (i) {
        var _header = $(this)
        var $header = $('<thead />', { id: _getDomId(_header) })
        _buildTableContent(_header, $header, 'th', lv)
        $header.appendTo($table)
      })
      _table.children('detail').each(function (i) {
        var _detail = $(this)
        var $detail = $('<tbody />', { id: _getDomId(_detail) })
        _buildTableContent(_detail, $detail, 'td', lv)
        $detail.appendTo($table)
      })
      _table.children('footer').each(function (i) {
        var _footer = $(this)
        var $footer = $('<tbody />', { id: _getDomId(_footer) })
        _buildTableContent(_footer, $footer, 'td', lv)
        $footer.appendTo($table)
      })

      $table.appendTo(pel).data('bhrSetup', _table)
    }

    function _buildList(_list, pel, lv) {
      $('<div />').append('List coming soon...').appendTo(pel)
    }

    function _buildLabel(_label, pel, lv) {
      var $label = $('<div />', { id: _getDomId(_label), class: 'bhr-label' })
      var css = _parseStyle(_label.children('property'))
      // debug(css)
      $label
        .append(_childElementText(_label, 'text-property', 'name', 'text'))
        .css(css)
        .appendTo(pel)
    }

    function _buildText(_text, pel, lv) {
      var $text = $('<div />', { id: _getDomId(_text), class: 'bhr-text' })
      var css = _parseStyle(_text.children('property'))
      $text
        .append(_childElementText(_text, 'text-property', 'name', 'content'))
        .css(css)
        .appendTo(pel)
    }

    function _buildDynamicText(_text, pel, lv) {
      var $text = $('<div />', {
        id: _getDomId(_text),
        class: 'bhr-dynamic-text',
      })
      var css = _parseStyle(_text.children('property'))
      $text
        .append(_childElementText(_text, 'expression', 'name', 'valueExpr'))
        .css(css)
        .appendTo(pel)
    }

    function _buildData(_data, pel, lv) {
      $('<div />').append('Data coming soon...').appendTo(pel)
    }

    function _buildImage(_img, pel, lv) {
      $('<div />').append('Image coming soon...').appendTo(pel)
    }

    function _buildChart(_chart, pel, lv) {
      $('<div />', { id: _getDomId(_chart), class: 'bhr-chart' })
        .data('bhrXML', _chart)
        .append($('<div />', { class: 'bhr-chart-title' }))
        .append(
          $('<div />', { class: 'bhr-chart-plot noselect' }).append(
            'Chart is Loading...'
          )
        )
        .appendTo(pel)
    }

    function _parseStyle(_props) {
      var css = {}
      _.each(_props, function (el) {
        var $prop = $(el)
        var name = $prop.attr('name'),
          value = $prop.text()
        if (_.contains(styleNames, name)) {
          switch (name) {
            case 'textLineThrough':
            case 'textUnderline':
              css['textDecoration'] = (
                (css['textDecoration'] || '') +
                ' ' +
                value
              ).trim()
              break
            default:
              css[name] = value
              break
          }
        }
      })
      return css
    }

    /**
     * 解析顏色格式 <Color>、<Background>
     */
    function _parseColor(_color) {
      var transparency = _childElementText(_color, 'Transparency'),
        red = _childElementText(_color, 'Red'),
        green = _childElementText(_color, 'Green'),
        blue = _childElementText(_color, 'Blue')
      return (
        'rgba(' +
        red +
        ',' +
        green +
        ',' +
        blue +
        ',' +
        (transparency ? parseInt(transparency) / 255 : 1) +
        ')'
      )
    }

    /**
     * 解析<Font>格式
     */
    function _parseFontStyle(_font) {
      // debug('font style ' + _font.length);
      var css = {},
        decoration = []
      var size = _elementText(_font.find('> Size')),
        bold = _elementText(_font.find('> Bold')),
        italic = _elementText(_font.find('> Italic')),
        strikethrough = _elementText(_font.find('> Strikethrough')),
        underline = _elementText(_font.find('> Underline')),
        alignment = _elementText(
          _font.find('> Alignment > horizontalAlignment')
        )
      // debug('size:' + size + ' bold:' + bold + ' italic:' + italic +
      //   ' strikethrough:' + strikethrough + ' underline:' + underline +
      //   ' alignment:' + alignment);
      if (size) css['fontSize'] = size + 'px'
      if (_toBoolean(bold)) css['fontWeight'] = 'bold'
      if (_toBoolean(italic)) css['fontStyle'] = 'italic'
      if (_toBoolean(strikethrough)) decoration.push('line-through')
      if (_toBoolean(underline)) decoration.push('underline')
      if (decoration.length) css['fontDecoration'] = decoration.join(' ')
      if (alignment) css['textAlign'] = alignment
      // debug(css);
      return css
    }

    /**
     * 依版型產生HTML Element
     */
    function _buildElement(_xel, pel, lv) {
      var $pel = $(pel)
      _xel
        .children(
          'grid, table, list, label, text, text-data, data, image, extended-item'
        )
        .each(function (i) {
          var _xel = $(this),
            tag = (this.localName || this.tagName || '').toLowerCase()
          switch (tag) {
            case 'grid':
              _buildGrid(_xel, $pel, lv)
              break
            case 'table':
              _buildTable(_xel, $pel, lv)
              break
            case 'list':
              _buildList(_xel, $pel, lv)
              break
            case 'label':
              _buildLabel(_xel, $pel, lv)
              break
            case 'text':
              _buildText(_xel, $pel, lv)
              break
            case 'text-data':
              _buildDynamicText(_xel, $pel, lv)
              break
            case 'data':
              _buildData(_xel, $pel, lv)
              break
            case 'image':
              _buildImage(_xel, $pel, lv)
              break
            case 'extended-item':
              _buildChart(_xel, $pel, lv)
              break
            default:
              alert('Undefined Element<' + tag + '>')
              console.error('Undefined Element<' + tag + '>')
              console.error(el)
              break
          }
        })
    }

    function _build() {
      var $view = $template.find('body')
      _buildElement($view, $container, 1)
    }

    // 轉換資料
    function _convertData(config) {
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

    function _loadData(params) {
      var context = {
        params: params,
      }
      // process data set
      _.each(conf.dataSet, function (fn, k) {
        if (!_.isFunction(fn)) {
          throw 'dataSet should be a function'
        }
        _dataSet[k] = fn.apply(global, [context]) || []
        // fn.call(global, context, function (data) {
        //   _dataSet[k] = data || [];
        // });
      })
      // process data cube
      _.each(conf.dataCube, function (fn, k) {
        if (!_.isFunction(fn)) {
          throw 'dataSet should be a function'
        }
        _dataCube[k] =
          fn.apply(global, [{ params: params, dataSet: _dataSet[k] }]) || []
      })

      // debug('load data');
      // debug(_dataSet);
      // debug(_dataCube);
    }

    /**
     * 判斷是否為動態資料內容
     */
    function _isDynamicColumn(str) {
      // debug('\t test:' + str);
      return conf.reg.dynamic.test(str)
    }

    /**
     * 取出動態欄位的欄位名稱
     */
    function _rowToColumn(str) {
      // debug('row to column: ' + str);
      // debug((/row\[\"(.+)\"\]/).exec(str));
      return conf.reg.row.exec(str)[1]
    }

    /**
     * 取得資料 from dataSet or dataCube
     */
    function _getDataSource(el) {
      return _childElementText(el, 'property', 'name', 'dataCube')
        ? _dataCube[_childElementText(el, 'property', 'name', 'dataCube')]
        : _dataSet[_childElementText(el, 'property', 'name', 'dataSet')]
    }

    /**
     * 資料的群組處理
     */
    function _groupData(data, groups, values, conn) {
      conn = conn || '-'

      var columns = _.first(data),
        rows = _.rest(data)
      var gs = _.isArray(groups) ? groups : [groups],
        vs = _.isArray(values) ? values : [values]
      var gi = _.map(gs, function (col) {
          return _.indexOf(columns, col)
        }),
        vi = _.map(vs, function (val) {
          return _.indexOf(columns, val.col)
        }),
        me = _.map(vs, function (val) {
          return val.meas
        })

      var nColumns = [gs.join(conn)].concat(
        _.map(vs, function (val) {
          return val.col
        })
      )

      // console.debug('group');
      // console.debug(gi);
      // console.debug(vi);
      // console.debug(me);

      var obj = {}
      _.each(rows, function (row) {
        var name = _.map(gi, function (g) {
          return row[g]
        }).join(conn)
        var ary = obj[name] || _.range(vi.length + 1).fill(0)
        ary[0] = name
        // console.debug(name);
        // console.debug(ary);
        _.each(vi, function (v, i) {
          var val = parseFloat(row[v]) || 0
          //    console.debug('i: ' + (i+1) + ' val:' + row[v]);
          switch (me[i]) {
            case 'sum':
              ary[i + 1] += val
              break
            case 'count':
              ary[i + 1] += 1
              break
            default:
              console.error('undefined measure function')
              break
          }
          //    console.debug('g:' + name + ' v:[' + ary.join(',') + ']');
        })
        obj[name] = ary
      })

      return [nColumns].concat(_.values(obj))
    }

    function _interactivity() {}

    function _parsePieData(cols, rows, category, series) {
      var cIdx = _.indexOf(cols, category),
        sIdx = _.indexOf(cols, series)

      var ds = _.map(rows, function (vs, i) {
        return {
          label: vs[cIdx],
          data: vs[sIdx],
        }
      })
      return ds
    }

    function __parseChartData(cols, rows, series) {
      var sIdxs = _.map(series, function (col) {
        return _.indexOf(cols, col)
      })
      return _.map(sIdxs, function (idx, i) {
        return {
          label: series[i],
          data: _.map(rows, function (vs, i) {
            return [i, vs[idx]]
          }),
        }
      })
    }

    function _parseXYAxisData(cols, rows, category, series, type) {
      var ds = __parseChartData(cols, rows, series)

      switch (type) {
        case 'bar':
          ds = _.map(ds, function (d, i, l) {
            return _.extend(d, {
              bars: {
                show: true,
                barWidth: 0.6 / l.length,
                order: i + 1,
                align: 'center',
              },
            })
          })
          break
        case 'line':
          ds = _.map(ds, function (d, i, l) {
            return _.extend(d, {
              lines: {
                show: true,
              },
              points: {
                show: true,
              },
            })
          })
          break
        case 'area':
          ds = _.map(ds, function (d, i, l) {
            return _.extend(d, {
              lines: {
                show: true,
                fill: true,
              },
              points: {
                show: false,
              },
            })
          })
          break
        case 'scatter':
          ds = _.map(ds, function (d, i, l) {
            return _.extend(d, {
              lines: {
                show: false,
              },
              points: {
                show: true,
                symbol: conf.chart.symbols[i],
              },
            })
          })
          break
        default:
          warn('undefined x-y axis chart type:' + type)
          break
      }
      return ds
    }

    function _drawTitle(el, _setup) {
      try {
        var _title = _elementFilterByAttr(
            _setup.find('> Block > Children'),
            'xsi:type',
            'layout:TitleBlock'
          ),
          _label,
          _elem

        var visible = _childElementText(_title, 'Visible')

        if (_toBoolean(visible)) {
          _label = _title.find('> Label')
          el.html(_elementText(_label.find('> Caption > Value')))
          el.css(_parseFontStyle(_label.find('> Caption > Font')))
          if (
            _conf.static &&
            (_elem = _label.find('> Caption > Color')).length
          ) {
            el.css('color', _parseColor(_elem))
          }
          if (_conf.static && (_elem = _labe.find('> Background').length)) {
            el.css('background', _parseColor(_elem))
          }
        }
      } catch (e) {
        warn(e)
      }
    }

    function _detectEventType(condition) {
      switch (condition) {
        case 'onclick':
          return 'click'
        case 'onmouseover':
          return 'hover'
        default:
          warn('unsupported condition:' + condition)
      }
    }

    function _parseDataPoint(_series) {
      var _dataPoint = _series.find('> DataPoint')
      var components = [],
        prefix = _childElementText(_dataPoint, 'Prefix'),
        suffix = _childElementText(_dataPoint, 'Suffix'),
        separator = _childElementText(_dataPoint, 'Separator')
      _.each(_dataPoint.find('> Components'), function (c, i) {
        var type = _childElementText($(c), 'Type').toLowerCase()
        switch (type) {
          case 'base_value':
          case 'basic_value':
            components.push('%s')
            break
          case 'orthogonal_value':
            components.push(
              '%y' + (conf.chart.decimals ? '.' + conf.chart.decimals : '')
            )
            break
          case 'percentile_orthogonal_value':
            components.push(
              '%p' +
                (conf.chart.decimals ? '.' + conf.chart.decimals : '') +
                '%'
            )
            break
          case 'series_value':
            components.push('%x')
            break
          default:
            warn('Unsupport Label Value:' + type)
        }
      })
      return prefix + components.join(separator) + suffix
    }

    function _parseEvent(_series, allowActions) {
      var opt = {}

      var dp = _parseDataPoint(_series)

      _.each(_series.find('> Triggers'), function (t, i) {
        var _triggers = $(t)
        var condition = _childElementText(_triggers, 'Condition'),
          action = _elementText(
            _triggers.find('> Action > Type')
          ).toLowerCase(),
          value

        var event = _detectEventType(condition)

        var act = {
          action: action,
        }

        if (_.contains(allowActions, action)) {
          return
        }
        switch (action) {
          case 'show_tooltip':
            value = _elementText(_triggers.find('> Action > Value > Text'))
            if (value && value.length) {
              act.content = value
            } else {
              act.content = dp
            }
            break
          case 'invoke_script':
            value = _elementText(_triggers.find('> Action > Value > Script'))
            act.content = value
            break
          case 'toggle_visibility':
            break
          default:
            warn('Unknow Event Action ' + action)
        }

        ;(opt[event] = opt[event] || []).push(action)

        ;(opt.event = opt.event || {})[action] = act
      })
      return opt
    }

    function _parseAxisOption(type, _axis, _setup) {
      var opt = {
        markers: {
          lines: null,
          ranges: null,
        },
      }
      // title
      var _title = _axis.find('> Title')
      if (_toBoolean(_childElementText(_title, 'Visible'))) {
        opt.title = _elementText(_title.find('> Caption > Value'))
      }
      // labels
      var _label = _axis.find('> Label')
      if (_toBoolean(_childElementText(_label, 'Visible'))) {
        opt.show = true
      }
      // grid
      var _majorGrid = _axis.find('> MajorGrid')
      if (
        _toBoolean(_elementText(_majorGrid.find('> LineAttributes > Visible')))
      ) {
        opt.grid = true
      }
      // marker line
      var _markerLines = _axis.find('> MarkerLines')
      if (_markerLines.length > 0) {
        opt.markers.lines = []
      }
      _.each(_markerLines, function (m, i) {
        var _markerLine = $(m)
        opt.markers.lines.push({
          value: new Number(
            _elementText(_markerLine.find('> Value > Value')) || 0
          ),
          color: _parseColor(_markerLine.find('> LineAttributes > Color')),
        })
      })
      // marker range
      var _markerRanges = _axis.find('> MarkerRanges')
      if (_markerRanges.length > 0) {
        opt.markers.ranges = []
      }
      _.each(_markerRanges, function (m, i) {
        var _markerRange = $(m)
        opt.markers.ranges.push({
          start: new Number(
            _elementText(_markerRange.find('> StartValue > Value')) || 0
          ),
          end: new Number(
            _elementText(_markerRange.find('> EndValue > Value')) || 0
          ),
          color: _parseColor(_markerRange.find('> Fill')),
        })
      })

      return opt
    }

    function _parseLegendOption(type, _setup, _chart) {
      var opt = {
        // show: true|false,
        // position: 'ne'|'nw'|'se'|'sw',
        // click: [],
        // hover: ['show_tooltip'],
        // event: {
        //   'show_tooltip': {
        //     action: 'show_tooltip',
        //     content: '%y'
        //   }
        // }
      }

      var _childs = _setup.find('> Block > Children'),
        _legend = _elementFilterByAttr(_childs, 'xsi:type', 'layout:Legend')

      opt.show = _childElementText(_legend, 'Visible') === 'true'

      if (opt.show) {
        var anchor = _childElementText(_legend, 'Anchor'),
          position = _childElementText(_legend, 'Position')
        //
        opt.position =
          (anchor === 'South' ? 's' : 'n') + (position === 'Left' ? 'w' : 'e')
        // action
        _.each(_legend.find('> Triggers'), function (t, i) {
          var _triggers = $(t)
          var condition = _childElementText(_triggers, 'Condition'),
            action = _elementText(
              _triggers.find('> Action > Type')
            ).toLowerCase(),
            text = _elementText(_triggers.find('> Action > Value > Text'))

          var event = _detectEventType(condition)

          var act = {
            action: action,
          }

          switch (action) {
            case 'show_tooltip':
              if (text && text.length) {
                act.content = text
              }
              break
            case 'invoke_script':
              break
            case 'toggle_visibility':
              break
          }

          ;(opt[event] = opt[event] || []).push(action)

          ;(opt.event = opt.event || {})[action] = act
        })
      }

      return opt
    }

    function _parseSeriesOption(type, _setup) {
      var opt = {}

      var _series

      switch (type) {
        case 'pie':
          _series = _setup
            .find('> SeriesDefinitions > SeriesDefinitions > Series')
            .first()
          break
        case 'line':
        case 'bar':
        case 'area':
        case 'scatter':
          _series = _setup.find(
            '> Axes > AssociatedAxes > SeriesDefinitions:first > Series'
          )
          break
        default:
          throw new Error('unsupported chart type:' + type)
      }
      // parse label visible
      if (_toBoolean(_elementText(_series.find('> Label > Visible')))) {
        opt.label = true
      }
      // parse events
      opt = $.extend(true, opt, _parseEvent(_series))

      return opt
    }

    function _parseChartXTicks(cols, rows, _setup) {
      var category = _rowToColumn(
        _elementText(
          _setup.find(
            '> Axes > SeriesDefinitions > Series > DataDefinition > Definition'
          )
        )
      )
      var cIdx = _.indexOf(cols, category)
      return _.map(rows, function (vs, i) {
        return [i, vs[cIdx]]
      })
    }

    function _parseChartOption(type, cols, rows, _setup) {
      debug('\t' + type)

      var opt,
        tooltipOpt = true

      var xaxisOpt = _parseAxisOption(type, _setup.find('> Axes'), _setup)

      var yaxisOpt = _parseAxisOption(
        type,
        _setup.find('> Axes > AssociatedAxes'),
        _setup
      )

      var legendOpt = _parseLegendOption(type, _setup)

      var seriesOpt = _parseSeriesOption(type, _setup)

      debug('\t\txaxis opt')
      debug(xaxisOpt)
      debug('\t\tyaxis opt')
      debug(yaxisOpt)
      debug('\t\tlegend opt')
      debug(legendOpt)
      debug('\t\tseries opt')
      debug(seriesOpt)

      opt = {
        colors: conf.chart.colors,
        xaxis: {
          show: xaxisOpt.show,
          tickLength: xaxisOpt.grid ? null : 0,
          color: conf.chart.text.xaxis || conf.chart.text.color,
          font: {
            color: conf.chart.text.xaxis || conf.chart.text.color,
          },
        },
        yaxis: {
          show: yaxisOpt.show,
          tickLength: yaxisOpt.grid ? null : 0,
          color: conf.chart.text.yaxis || conf.chart.text.color,
          font: {
            color: conf.chart.text.xaxis || conf.chart.text.color,
          },
        },
        legend: {
          show: legendOpt.show,
          position: legendOpt.position,
          margin:
            ((conf.chart[type] || {}).legend || {}).margin ||
            conf.chart.legend.margin,
        },
        grid: {
          hoverable: true,
          clickable: true,
          markings: [],
        },
        bhr: {
          // for custom
        },
      }

      // interaction
      _.each(seriesOpt.hover || [], function (act, i) {
        switch (act) {
          case 'show_tooltip':
            opt = $.extend(true, opt, {
              grid: {
                hoverable: true,
                clickable: true,
              },
              tooltip: true,
              tooltipOpts: {
                content: seriesOpt.event[act].content,
                defaultTheme: false,
              },
            })
            break
          default:
            warn('Unknow series action ' + act)
        }
      })

      switch (type) {
        case 'pie':
          var label
          if (seriesOpt.label) {
            label = {
              series: {
                pie: {
                  label: {
                    show: true,
                    radius: 0.5,
                    formatter: function (label, series) {
                      return (
                        '<div class="bhr-chart-series-label">' +
                        conf.chart.pie.label.formatter(
                          series.data[0][1],
                          series.percent
                        ) +
                        '</div>'
                      )
                    },
                    background: {
                      opacity: 0,
                    },
                  },
                },
              },
            }
          }
          opt = $.extend(
            true,
            opt,
            {
              series: {
                pie: {
                  show: true,
                  radius: 0.8,
                },
              },
              legend: {
                noColumns: 1,
              },
            },
            label || {}
          )
          break
        case 'bar':
        case 'line':
        case 'area':
        case 'scatter':
          // parse series label
          var label
          if (seriesOpt.label) {
            label = {
              series: {
                valueLabels: {
                  show: true,
                  showAsHtml: true,
                  valign: 'top',
                  align: 'center',
                  labelFormatter: conf.chart[type].label.formatter,
                },
              },
            }
          }
          // parse markers
          var axis = {}
          // axis title
          if (xaxisOpt.title) {
            axis.xaxis = {
              axisLabel: xaxisOpt.title,
            }
          }
          if (yaxisOpt.title) {
            axis.yaxis = {
              axisLabel: yaxisOpt.title,
            }
          }
          // axis marker line
          axis.bhr = {
            markers: {
              xaxis: xaxisOpt.markers.lines,
              yaxis: yaxisOpt.markers.lines,
            },
          }
          // axis marker range
          _.each(xaxisOpt.markers.ranges, function (r, i) {
            axis.grid || (axis.grid = {})
            axis.grid.markings || (axis.grid.markings = [])
            axis.grid.markings.push({
              xaxis: { from: r.start, to: r.end },
              color: r.color || conf.chart.markers.range.color,
            })
          })
          _.each(yaxisOpt.markers.ranges, function (r, i) {
            axis.grid || (axis.grid = {})
            axis.grid.markings || (axis.grid.markings = [])
            axis.grid.markings.push({
              yaxis: { from: r.start, to: r.end },
              color: r.color || conf.chart.markers.range.color,
            })
          })
          // merge
          opt = $.extend(
            true,
            opt,
            {
              xaxis: {
                ticks: _parseChartXTicks(cols, rows, _setup),
              },
            },
            label || {},
            axis
          )
          break
        default:
          throw new Error('Unsupported Chart Type:' + type)
      }

      return opt
    }

    function _parseChartData(type, cols, rows, _setup) {
      var ds, category, series
      switch (type) {
        case 'pie':
          category = _rowToColumn(
            _elementText(
              _setup.find(
                '> SeriesDefinitions > Series > DataDefinition > Definition'
              )
            )
          )
          series = _rowToColumn(
            _elementText(
              _setup.find(
                '> SeriesDefinitions > SeriesDefinitions > Series > DataDefinition > Definition'
              )
            )
          )
          ds = _parsePieData(cols, rows, category, series)
          break
        case 'bar':
        case 'line':
        case 'area':
        case 'scatter':
          category = _rowToColumn(
            _elementText(
              _setup.find(
                '> Axes > SeriesDefinitions > Series > DataDefinition > Definition'
              )
            )
          )
          series = _.map(
            _setup.find(
              '> Axes > AssociatedAxes > SeriesDefinitions > Series > DataDefinition > Definition'
            ),
            function (_def) {
              return _rowToColumn(_elementText($(_def)))
            }
          )
          ds = _parseXYAxisData(cols, rows, category, series, type)
          break
        default:
          throw 'Unsupported Chart Type:' + type
      }
      return ds
    }

    function _drawPlot(el, _setup, _chart) {
      var plot

      var type, data

      var ds, opt

      var cols, rows

      // plot init
      type = _childElementText(_setup, 'type').toLowerCase().split(' ')[0]
      data = _getDataSource(_chart)

      ;(cols = _.first(data)), (rows = _.rest(data))

      ds = _parseChartData(type, cols, rows, _setup)
      opt = _parseChartOption(type, cols, rows, _setup)

      debug('=== chart:' + type + ' ===')
      debug(ds)
      debug(opt)

      // markers (line)
      var markers
      if ((markers = ((opt.bhr || {}).markers || {}).yaxis || []).length) {
        var len = ds[0].data.length
        _.each(markers, function (m, i) {
          ds.push({
            label: conf.chart.markers.label || 'Target',
            data: _.range(len).map(function (num) {
              return [num, m.value]
            }),
            lines: { show: true },
            points: { show: false },
            color: m.color || conf.chart.markers.line.color,
            clickable: false,
            hoverable: false,
            valueLabels: { show: false },
          })
        })
      }

      // draw plot
      el.empty()
      plot = $.plot(el, ds, opt)

      // keep plot obj
      el.data('bhrPlot', plot)
      el.data('bhrData', {
        type: type,
        opt: opt,
        ds: ds,
      })

      // bind toggle visibility
      if (
        _.contains(['line', 'bar', 'area', 'scatter'], type) &&
        !_.isUndefined(opt.toggleVisibility)
      ) {
        _bindLegendToggleEvent(el)
      }
    }

    function _bindLegendToggleEvent(el) {
      var $legend = el.find('.bhr-chart-plot .legend').addClass('toggleable')
      el.on('click', '.bhr-chart-plot .legend tbody tr', function (ev) {
        debug('click toggle')
        var $target = $(this)
        var data = el.data('bhrData')
        var show = []
        // toggle
        if ($target.hasClass('toggle-disabled')) {
          $target.removeClass('toggle-disabled')
        } else {
          $target.addClass('toggle-disabled')
        }
        // redraw
        $legend.find('tbody tr').each(function (tr, i) {
          show.push(!$(this).hasClass('toggle-disabled'))
        })
        // filter data
        switch (type) {
          case 'bar':
            ds = _.map(ds, function (d, i, l) {
              return $.extend(true, d, {
                bars: {
                  show: show[i],
                },
              })
            })
            break
          case 'line':
            ds = _.map(ds, function (d, i, l) {
              return $.extend(true, d, {
                lines: {
                  show: show[i],
                },
                points: {
                  show: show[i],
                },
              })
            })
            break
          case 'area':
            ds = _.map(ds, function (d, i, l) {
              return $.extend(true, d, {
                lines: {
                  show: show[i],
                },
              })
            })
            break
          case 'scatter':
            ds = _.map(ds, function (d, i, l) {
              return $.extend(true, d, {
                points: {
                  show: show[i],
                },
              })
            })
            break
          default:
            warn('undefined x-y axis chart type:' + type)
            break
        }
        // draw plot
        el.empty()
        plot = $.plot(el, ds, opt)
        // keep plot obj
        el.data('bhrPlot', plot)
      })
    }

    function _drawChart() {
      var $charts = $container.find('.bhr-chart')

      $charts.each(function (i) {
        var $chart = $(this),
          $title = $chart.find('.bhr-chart-title'),
          $plot = $chart.find('.bhr-chart-plot')

        var _chart = $chart.data('bhrXML'),
          // xmlDoc = $.parseXML(_chart.children('xml-property[name="xmlRepresentation"]').text()),
          xmlDoc = $.parseXML(
            _childElementText(
              _chart,
              'xml-property',
              'name',
              'xmlRepresentation'
            )
          ),
          _setup = $(xmlDoc).children()

        // var width = _childPropertyNameText(_chart, 'width') || $chart.width(),
        //   height = _childPropertyNameText(_chart, 'height') || width * 0.75;
        var width =
            (conf.static
              ? _childPropertyNameText(_chart, 'width')
              : undefined) || $chart.width() * conf.chart.width,
          height =
            (conf.static
              ? _childPropertyNameText(_chart, 'height')
              : undefined) || width * conf.chart.height

        // set width & height
        $title.css({
          width: width + 'px',
        })
        $plot.css({
          width: width + 'px',
          height: height + 'px',
        })

        // keep setting in chart
        $chart.data('bhrSetup', _setup)

        _drawTitle($title, _setup)

        _drawPlot($plot, _setup, _chart)
      })
    }

    function _drawTable() {
      var $tables = $container.find('.bhr-table')

      var responsiveHelper_dt_basic = undefined
      var responsiveHelper_datatable_fixed_column = undefined
      var responsiveHelper_datatable_col_reorder = undefined
      var responsiveHelper_datatable_tabletools = undefined

      var breakpointDefinition = {
        tablet: 1024,
        phone: 480,
      }

      $tables.each(function (i) {
        var $table = $(this)
        var _table = $table.data('bhrSetup')
        var table = $table.data('bhrTable')

        var ds = _getDataSource(_table)

        var opt = _.extend(
          {
            preDrawCallback: function () {
              // Initialize the responsive datatables helper once.
              if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper(
                  $table,
                  breakpointDefinition
                )
              }
            },
            rowCallback: function (nRow) {
              responsiveHelper_dt_basic.createExpandIcon(nRow)
            },
            drawCallback: function (oSettings) {
              responsiveHelper_dt_basic.respond()
            },
          },
          conf.table
        )

        debug('=== draw table ===')
        debug(ds)
        debug(_table)

        // process data
        var cols = _.first(ds),
          cells = _.map($table.find('tbody > tr:first > td'), function (td, i) {
            return $(td).text().trim()
          })
        ;(cIdxs = _.map(cells, function (cell) {
          return _isDynamicColumn(cell)
            ? _.indexOf(cols, _rowToColumn(cell))
            : -1
        })),
          (rows = _.rest(ds)),
          (ts = _.map(rows, function (row, i) {
            return _.map(cIdxs, function (idx, j) {
              return idx > -1 ? row[idx] : cells[j]
            })
          }))

        // empty tbody
        $table.find('tbody').empty()

        // debug('\t<table>');
        // debug(cells);
        // debug(cIdxs);
        // debug(rows);
        // debug(ts);

        if (_.isUndefined(table)) {
          debug('\tinit table')
          table = $table.DataTable(opt)
          // keep
          $table.data('bhrTable', table)
        }
        // empty
        table.clear()
        // set data
        table.rows.add(ts).draw()
      })
    }

    function _delay(fn, time) {
      if (_ready) {
        servkit
          .politeCheck()
          .until(function () {
            return _.chain(conf.dataSet)
              .keys()
              .map(function (k) {
                return _dataSet[k]
              })
              .every()
              .value()
          })
          .thenDo(function () {
            fn.apply(self, [])
          })
          .tryDuration(0)
          .start()
        // fn.apply(self, []);
      } else {
        _setTimeout(_delay, time || 100)
      }
    }

    function _drawComponent() {
      // draw chart
      _drawChart()
      // draw table
      _drawTable()
    }

    function _draw(params) {
      // debug('draw');
      // get data
      _loadData(params)
      // draw
      _delay(_drawComponent)

      return self
    }

    function init() {
      conf = $.extend(true, _conf, conf)

      $container = $(conf.el)
      $container.data('BHReport', self)
      // 讀取模板
      _getTemplate()
      // 取得色碼
      conf.chart.text.font = $container.css('font')
      conf.chart.text.color = $container.css('color')
      // 建立widget樣版
      tpl.widget = _.template(conf.tpl.widget)

      // 開始建立
      _build()
    }

    // init
    init()
  }

  global.servkit.BHReport = function (conf) {
    return new BlackHole(conf)
  }

  function setup() {
    _ready = true
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
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
    setup
  )
})(this, $, _, servkit)
