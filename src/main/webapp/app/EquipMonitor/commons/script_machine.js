exports.machineMonitor = (function (global, $, _, servkit) {
  var colors = {
    green: 'greenLight',
    blue: 'blue',
    black: 'blueDark',
    brown: 'orangeDark',
    red: 'red',
  }
  var lang = servkit.getCookie('lang')
  var templateMap = [
    'T1-A',
    'T1-B',
    'T1-C',
    'T2-A',
    'T2-B',
    'T2-C',
    'T2-D',
    'P',
  ]

  function getWidget(mode) {
    var html = []
    html.push(
      '<article class="other-widget col-xs-12 col-sm-12 col-md-<%= groupGrid %> col-lg-<%= groupGrid %>">'
    )
    html.push(
      '  <div class="jarviswidget  data-widget-collapsed jarviswidget-color-darken" data-widget-fullscreenbutton="false" data-widget-togglebutton="false">'
    )
    html.push('    <header class="head">')
    html.push(
      '      <span class="widget-icon change-title"> <%= groupIcon %> </span>'
    )
    if (mode === 'edit') {
      html.push('      <div class="change-title-input smart-form hide">')
      html.push(
        '        <label class="input"> <input type="text" placeholder="Icon"> </label>'
      )
      html.push('      </div>')
      html.push('      <h2 class="change-title"><%= groupName %></h2>')
      html.push('      <div class="change-title-input smart-form hide">')
      html.push(
        '        <label class="input"> <input type="text" placeholder="Title"> </label>'
      )
      html.push('      </div>')
      html.push('      <div class="jarviswidget-ctrls">')
      html.push(
        '        <a href="javascript:void(0);" class="stk-widget-delete button-icon" title="Delete">'
      )
      html.push('          <i class="fa fa-times"></i>')
      html.push('        </a>')
      html.push('      </div>')
      html.push(
        '      <div class="widget-toolbar" role="menu" style="float: right;">'
      )
      html.push('        <div class="btn-group">')
      html.push(
        '          <button class="btn dropdown-toggle btn-xs btn-warning groupGrid" data-toggle="dropdown" aria-expanded="false" style="padding: 0 7px;" value="<%= groupGrid %>">'
      )
      html.push(
        '            <span style="padding-right: 5px;"><%= groupGrid %></span> <i class="fa fa-caret-down"></i>'
      )
      html.push('          </button>')
      html.push('          <ul class="dropdown-menu pull-right">')
      html.push(
        '            <li> <a href="javascript:void(0);" value="1">1</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="2">2</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="3">3</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="4">4</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="5">5</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="6">6</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="7">7</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="8">8</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="9">9</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="10">10</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="11">11</a> </li>'
      )
      html.push(
        '            <li> <a href="javascript:void(0);" value="12">12</a> </li>'
      )
      html.push('          </ul>')
      html.push('        </div>')
      html.push('      </div>')
      html.push('      <div class="jarviswidget-ctrls">')
      html.push(
        '        <a href="javascript:void(0);" class="stk-source-show button-icon" title="show source editor">'
      )
      html.push('          <i class="fa fa-chevron-down"></i>')
      html.push('        </a>')
      html.push(
        '        <a href="javascript:void(0);" class="stk-source-hide button-icon hide" title="hide source editor">'
      )
      html.push('          <i class="fa fa-chevron-up"></i>')
      html.push('        </a>')
      html.push('      </div>')
      html.push('    </header>')
      html.push('    <div>')
      html.push('      <div class="widget-body-toolbar hide">')
      html.push('        <div class="row">')
      html.push(
        '          <div class="source-group col-xs-12 col-sm-12 col-md-4 col-lg-4">'
      )
      html.push('            <div class="input-group">')
      html.push(
        '              <span class="input-group-addon">source type</span>'
      )
      html.push('              <select class="form-control sourceType">')
      html.push(
        '                <option value="DeviceStatus">DeviceStatus</option>'
      )
      html.push('                <option value="API">API</option>')
      html.push('              </select>')
      html.push('            </div>')
      html.push('          </div>')
      html.push(
        '          <div class="source-group col-xs-12 col-sm-12 col-md-4 col-lg-4">'
      )
      html.push('            <div class="input-group">')
      html.push('              <span class="input-group-addon">source</span>')
      html.push(
        '              <input class="form-control source" placeholder="source(api/superpcb/history)" type="text">'
      )
      html.push('            </div>')
      html.push('          </div>')
      html.push('        </div>')
      html.push('      </div>')
    } else {
      html.push('      <h2 class="change-title"><%= groupName %></h2>')
      html.push('    </header>')
      html.push('    <div>')
    }
    html.push(
      '      <div class="widget-body no-padding monitor group-frame" data-id="<%= groupId %>"></div>'
    )
    html.push('    </div>')
    html.push('  </div>')
    html.push('</article>')
    return html.join('')
  }

  function changeWidget($widget, widgetParam, mode) {
    var param = widgetParam
    if (_.isArray(widgetParam)) {
      param = widgetParam[0]
    }
    if (param.groupIcon) {
      $widget.closest('article').find('.widget-icon').html(param.groupIcon)
    }
    if (param['groupName-' + lang]) {
      $widget
        .closest('article')
        .find('h2')
        .html(param['groupName-' + lang])
    }
    if (param.groupGrid) {
      if (mode === 'edit') {
        $widget
          .closest('article')
          .find('header .dropdown-menu li [value=' + param.groupGrid + ']')
          .trigger('click')
      } else {
        $widget.closest('article').removeClass()
        $widget
          .closest('article')
          .addClass(
            'sortable-grid col-xs-12 col-sm-12 col-md-' +
              param.groupGrid +
              ' col-lg-' +
              param.groupGrid
          )
      }
    }
  }

  function drawCoordinates($param, param, mode, datas, signal) {
    var currentVal = datas
    var title = param[lang]
    if (_.isArray(param)) {
      title = param[0][lang]
    }
    if (!title) {
      title = '---'
    }
    if (currentVal === 'B') {
      currentVal = '---'
    }
    var $editor = $param.next()
    if (!$param.children().length) {
      $param.append(
        '<span class="title">' +
          title +
          '</span><span class="unit"></span>' +
          '<ul><li class="param-label">---</li><li class="param-text">---</li></ul>'
      )
      if (Object.keys(param).length && mode === 'edit') {
        $param.closest('article').removeClass('auto-hide')
        $param.parent().addClass('param-editor')
        $param.before(
          '<a href="javascript:void(0);" class="close stk-delete edit" title="Delete"><i class="fa fa-times"></i></a>' +
            '<a href="javascript:void(0);" class="close stk-edit edit" title="Edit"><i class="fa fa-chevron-down"></i></a>'
        )
        $param.after(getEditor())
        $editor = $param.next()
        $editor.find('.index').closest('tr').addClass('hide-editor')
        $editor.find('.type').closest('tr').addClass('hide-editor')
        $editor.find('.color').closest('tr').addClass('hide-editor')
        $editor.find('.min').closest('tr').addClass('hide-editor')
        $editor.find('.max').closest('tr').addClass('hide-editor')
        $editor.find('.unit').closest('tr').addClass('hide-editor')
        $editor.find('.foramt').closest('tr').addClass('hide-editor')
      }
    }
    if (_.isArray(param)) {
      _.each(param, (p) => {
        if (mode === 'edit') {
          if (p.type === 'text') {
            $editor.find('.signal').val(p.signal)
          }
          if (p.type === 'label') {
            $editor.find('.labelSignal').val(p.signal)
          }
          if (p.type === 'unit') {
            $editor.find('.unitSignal').val(p.signal)
            $param.find('.unit').text('(---)')
          }
          $editor.find('.cardGrid').val(p.cardGrid)
          $editor.find('.lang').val(p[lang])
        } else {
          if (_.isArray(currentVal)) {
            _.each(currentVal, (val, key) => {
              if (p.type === 'label' && signal === p.signal) {
                if ($param.find('.param-label')[key] === undefined) {
                  if (!$param.find('.param-label').length) {
                    if (!$param.find('.param-text').length) {
                      $param
                        .find('ul')
                        .append(
                          '<li class="param-label">---</li><li class="param-text">---</li>'
                        )
                    } else {
                      $($param.find('.param-text')[key]).before(
                        '<li class="param-label">---</li><li class="param-text">---</li>'
                      )
                    }
                  } else {
                    $($param.find('.param-label')[key - 1])
                      .next()
                      .after(
                        '<li class="param-label">---</li><li class="param-text">---</li>'
                      )
                  }
                }
                $($param.find('.param-label')[key]).text(val)
              } else if (p.type === 'text' && signal === p.signal) {
                $($param.find('.param-text')[key]).text(val)
              }
            })
          }
          if (p.type === 'unit') {
            $param.find('.unit').text('(' + currentVal + ')')
          }
        }
      })
    } else {
      if (mode === 'edit') {
        if (param.type === 'text') {
          $editor.find('.signal').val(param.signal)
        }
        if (param.type === 'label') {
          $editor.find('.labelSignal').val(param.signal)
        }
        if (param.type === 'unit') {
          $editor.find('.unitSignal').val(param.signal)
          $param.find('.unit').text('(---)')
        }
        $editor.find('.cardGrid').val(param.cardGrid)
      } else {
        if (_.isArray(currentVal)) {
          _.each(currentVal, (val, key) => {
            if (param.type === 'label') {
              $($param.find('.param-label')[key]).text(val)
            } else if (param.type === 'text') {
              $($param.find('.param-text')[key]).text(val)
            }
          })
        }
        if (param.type === 'unit') {
          $param.find('.unit').text('(' + currentVal + ')')
        }
      }
    }
  }

  function drawParamEditor($ele, param) {
    $ele.before(
      '<a href="javascript:void(0);" class="close stk-delete edit" title="Delete"><i class="fa fa-times"></i></a>' +
        '<a href="javascript:void(0);" class="close stk-edit edit" title="Edit"><i class="fa fa-chevron-down"></i></a>'
    )
    $ele.after(getEditor())
    $ele.parent().addClass('param-editor')
    var $editor = $ele.next()
    var p = param
    if (_.isArray(param)) {
      p = param[0]
    }
    $editor.find('.signal').val(p.signal)
    $editor.find('.index').val(p.index)
    $editor.find('.lang').val(p[lang])
    $editor.find('.cardGrid').val(p.cardGrid)
    $editor.find('.type').val(p.type)
    $editor.find('.color').val(p.color)
    $editor.find('.min').val(p.min)
    $editor.find('.max').val(p.max)
    $editor.find('.unit').val(p.unit)
    $editor.find('.labelSignal').closest('tr').addClass('hide-editor')
    $editor.find('.unitSignal').closest('tr').addClass('hide-editor')
    $editor.find('.type').trigger('change')
    if ($ele.data('id') === undefined) {
      $editor.find('.signal').closest('tr').addClass('hide-editor')
      $editor.find('.index').closest('tr').addClass('hide-editor')
      $editor.find('.cardGrid').closest('tr').addClass('hide-editor')
      $editor.find('.type').closest('tr').addClass('hide-editor')
    }
    if (
      p.type === 'mulitiple_line_chart' ||
      p.type === 'mulitiple_yaxis_line_chart'
    ) {
      $editor.find('.signal:eq(1)').val(param[1].signal)
      $editor.find('.index:eq(1)').val(param[1].index)
      $editor.find('.lang:eq(1)').val(param[1][lang])
    }
  }

  function drawParam($ele, param, machineMonitor, datas, currentWorkShift) {
    // 更新顯示
    if (machineMonitor.mode === 'edit') {
      drawParamEditor($ele, param)
    }
    switch (param.type) {
      case 'line_chart':
        machineMonitor.drawLineChart($ele, param, datas)
        break
      case 'mulitiple_line_chart':
        machineMonitor.drawMulitipleLineChart($ele, param, datas)
        break
      case 'mulitiple_yaxes_line_chart':
        machineMonitor.drawMulitipleYaxesLineChart($ele, param, datas)
        break
      case 'progress':
        machineMonitor.drawProgress($ele, param, datas)
        break
      case 'pie_chart':
        machineMonitor.drawPieChart($ele, param, datas)
        break
      case 'time_format':
        machineMonitor.drawTimeFormat($ele, param, datas, currentWorkShift)
        break
      case 'time':
        machineMonitor.drawTime($ele, param, datas, currentWorkShift)
        break
      case 'switch':
        machineMonitor.drawSwitch($ele, param, datas)
        break
      case 'img':
        machineMonitor.drawImg($ele, param, datas)
        break
      case 'gragus':
        machineMonitor.drawGragus($ele, param, datas)
        break
      default:
        machineMonitor.drawText($ele, param, datas, currentWorkShift)
        break
    }
  }

  function MachineMonitor(param, sourceName, mode) {
    this.param = param
    this.sourceName = sourceName
    this.mode = mode
    this.alarmMap = {}
    this.chartDatas = []
    this.gauge = {}
    this.currentWorkShift = {}
  }

  function resetWidget() {
    $('[data-id=T1-A]').empty()
    $('[data-id=T1-B]').empty()
    $('[data-id=T1-C]').empty()
    $('[data-id=T2-A]').empty()
    $('[data-id=T2-B]').empty()
    $('[data-id=T2-C]>div').empty()
    $('[data-id=T2-D]').empty()
    $('[data-id=P]').empty()
    $('.other-widget').remove()
    $('.table-div').remove()
    $('.edit').remove()
    $('[data-id=P]').closest('article').addClass('auto-hide')
    $('[data-id=P]')
      .closest('article')
      .find('header .dropdown-menu li [value=12]')
      .trigger('click')
  }

  function getEditor() {
    var html = []
    html.push('<div class="table-div hide">')
    html.push('  <span class="table-div-int"></span>')
    html.push('  <span class="table-div-out"></span>')
    html.push(
      '  <a href="javascript:void(0);" class="close stk-hide-edit" title="Hide edit"><i class="fa fa-chevron-up"></i></a>'
    )
    html.push('  <table><tbody>')
    html.push(
      '    <tr><th>signal</th><td><input type="text" placeholder="signal" class="signal"></td></tr>'
    )
    html.push(
      '    <tr><th>signal index</th><td><input type="text" placeholder="signal index" class="index"></td></tr>'
    )
    html.push(
      '    <tr><th>value signal</th><td><input type="text" placeholder="value signal" class="labelSignal"></td></tr>'
    )
    html.push(
      '    <tr><th>unit signal</th><td><input type="text" placeholder="unit signal" class="unitSignal"></td></tr>'
    )
    html.push(
      '    <tr><th>text</th><td><input type="text" placeholder="text" class="lang"></td></tr>'
    )
    html.push('    <tr><th>card grid</th><td>')
    html.push('      <select class="cardGrid">')
    html.push('        <option value="1">1</option>')
    html.push('        <option value="2">2</option>')
    html.push('        <option value="3">3</option>')
    html.push('        <option value="4">4</option>')
    html.push('        <option value="5">5</option>')
    html.push('        <option value="6">6</option>')
    html.push('        <option value="7">7</option>')
    html.push('        <option value="8">8</option>')
    html.push('        <option value="9">9</option>')
    html.push('        <option value="10">10</option>')
    html.push('        <option value="11">11</option>')
    html.push('        <option value="12">12</option>')
    html.push('      </select>')
    html.push('    </td></tr>')
    html.push('    <tr><th>type</th><td>')
    html.push('      <select class="type">')
    html.push('        <option value="text">text</option>')
    html.push(
      '        <option value="line_chart" class="hide">含範圍折線圖</option>'
    )
    html.push(
      '        <option value="mulitiple_line_chart" class="hide">折線圖</option>'
    )
    html.push(
      '        <option value="mulitiple_yaxes_line_chart" class="hide">雙軸折線圖</option>'
    )
    html.push('        <option value="progress">progress</option>')
    html.push('        <option value="pie_chart">pie_chart</option>')
    html.push('        <option value="time_format">time_format</option>')
    html.push('        <option value="time">time</option>')
    html.push('        <option value="switch">switch</option>')
    html.push('        <option value="img">img</option>')
    html.push('        <option value="gragus">gragus</option>')
    html.push('      </select>')
    html.push('    </td></tr>')
    html.push('    <tr><th>color</th><td>')
    html.push('      <select class="color">')
    html.push('        <option value="green">green</option>')
    html.push('        <option value="blue">blue</option>')
    html.push('        <option value="black">black</option>')
    html.push('        <option value="brown">brown</option>')
    html.push('        <option value="red">red</option>')
    html.push('      </select>')
    html.push('    </td></tr>')
    html.push(
      '    <tr><th>min</th><td><input type="text" placeholder="min" class="min"></td></tr>'
    )
    html.push(
      '    <tr><th>max</th><td><input type="text" placeholder="max" class="max"></td></tr>'
    )
    html.push(
      '    <tr><th>unit</th><td><input type="text" placeholder="unit" class="unit"></td></tr>'
    )
    html.push(
      '    <tr><th>format</th><td><input type="text" placeholder="format" class="format"></td></tr>'
    )
    html.push('  </tbody></table>')
    html.push('  <div class="mul-param">改為多參數</div>')
    html.push('</div>')
    return html.join('')
  }

  MachineMonitor.prototype.draw = function () {
    resetWidget()
    var machineMonitor = this
    _.each(machineMonitor.param, (group, groupKey) => {
      // 第一層
      // 補上widget
      if (!$('[data-id=' + groupKey + ']').length) {
        if (groupKey.indexOf('O') >= 0) {
          if (!$('[data-id=' + groupKey + ']').length) {
            var groupIcon = group.groupIcon
            var groupName = group['groupName-' + lang]
            var groupGrid = group.groupGrid
            var groupSourceType = group.sourceType
            var groupSource = group.source
            if (_.isArray(group) && group[0]) {
              groupIcon = group[0].groupIcon
              groupName = group[0]['groupName-' + lang]
              groupGrid = group[0].groupGrid
              groupSourceType = group[0].sourceType
              groupSource = group[0].source
              if (_.isArray(group[0]) && group[0][0]) {
                groupIcon = group[0][0].groupIcon
                groupName = group[0][0]['groupName-' + lang]
                groupGrid = group[0][0].groupGrid
                groupSourceType = group[0][0].sourceType
                groupSource = group[0][0].source
              }
            }
            $('#widget-grid>.row>article:last').after(
              _.template(getWidget(machineMonitor.mode))({
                groupId: groupKey,
                groupIcon: groupIcon,
                groupName: groupName,
                groupGrid: groupGrid,
              })
            )
            if (groupSourceType) {
              // 如果有指定sourceType再換
              $('#widget-grid>.row>article:last')
                .find('.sourceType')
                .val(groupSourceType)
            }
            $('#widget-grid>.row>article:last').find('.source').val(groupSource)
          }
        }
      }
      var $group = $('[data-id=' + groupKey + ']')
      if (_.isArray(group)) {
        // 第一層不只一個參數
        if (groupKey === 'T1-A') {
          if (machineMonitor.mode === 'edit') {
            drawParamEditor($group, group)
          }
          if (group[0].type === 'mulitiple_line_chart') {
            machineMonitor.drawMulitipleLineChart(
              $group,
              group,
              null,
              group.length
            )
          } else {
            machineMonitor.drawMulitipleYaxesLineChart(
              $group,
              group,
              null,
              group.length
            )
          }
        } else {
          _.each(group, (index, indexKey) => {
            // 第二層
            var $index = $group.find('[data-id=' + indexKey + '].index')
            if (_.isArray(index)) {
              // 第二層不只一個參數
              if (!$index.length) {
                $group.append(
                  '<div class="col-xs-12 col-sm-12 col-md-' +
                    index[0].cardGrid +
                    ' col-lg-' +
                    index[0].cardGrid +
                    (machineMonitor.mode === 'edit' ||
                    index.signal ||
                    index.type === 'img' ||
                    groupKey === 'P'
                      ? ''
                      : ' hide') +
                    '">' +
                    '<div data-id="' +
                    indexKey +
                    '" class="index"></div></div>'
                )
              }
              $index = $group.find('[data-id=' + indexKey + '].index')
              if (groupKey === 'P') {
                changeWidget($group, index, machineMonitor.mode)
                drawCoordinates($index, index, machineMonitor.mode)
                $group.closest('article').removeClass('hide')
              } else {
                _.each(index, (param, paramKey) => {
                  // 第三層
                  $index.parent().removeClass('hide')
                  if (!$index.find('[data-id=' + paramKey + ']').length) {
                    if (!$index.find('.group-label').length) {
                      $index.addClass('param-group')
                      var labelHtml =
                        '<div class="group-label auto-hide-group-label">---</div>'
                      if (param['label-' + lang]) {
                        labelHtml =
                          '<div class="group-label">' +
                          param['label-' + lang] +
                          '</div>'
                      }
                      $index.append(
                        labelHtml +
                          '<div class="change-group-label-input smart-form hide">' +
                          '<label class="input"><input type="text" placeholder="label"></label></div>'
                      )
                    }
                    $index.append(
                      '<div data-id="' + paramKey + '" class="param"></div>'
                    )
                  }
                  var $param = $index.find('[data-id=' + paramKey + ']')
                  drawParam($param, param, machineMonitor)
                })
              }
            } else {
              // 第二層參數
              if (groupKey === 'T2-A' || groupKey === 'T2-B') {
                if (!$index.length) {
                  $group.append(
                    '<div><div data-id="' +
                      indexKey +
                      '" class="index"></div></div>'
                  )
                }
                $index = $group.find('[data-id=' + indexKey + ']')
                $index.append(
                  '<span><span class="text">' +
                    (index[lang] || '---') +
                    '</span>：<span class="value">---</span></span>'
                )
                if (machineMonitor.mode === 'edit') {
                  $index.prepend(
                    '<a href="javascript:void(0);" class="close stk-delete edit" title="Delete"><i class="fa fa-times"></i></a>' +
                      '<a href="javascript:void(0);" class="close stk-edit edit" title="Edit"><i class="fa fa-chevron-down"></i></a>'
                  )
                  $index.append(getEditor())
                  $index.parent().addClass('param-editor')
                  var $editor = $index.find('.table-div')
                  $editor.find('.signal').val(index.signal)
                  $editor.find('.index').val(index.index)
                  $editor.find('.lang').val(index[lang])
                  $editor.find('.type').val(index.type)
                  $editor.find('.format').val(index.format)
                  $editor
                    .find('.labelSignal')
                    .closest('tr')
                    .addClass('hide-editor')
                  $editor
                    .find('.unitSignal')
                    .closest('tr')
                    .addClass('hide-editor')
                  $editor
                    .find('.cardGrid')
                    .closest('tr')
                    .addClass('hide-editor')
                  if (groupKey === 'T2-B') {
                    $editor.find('.type').closest('tr').addClass('hide-editor')
                  } else {
                    $editor.find('.type option').addClass('hide')
                    $editor.find('.type option[value=text]').removeClass('hide')
                    $editor
                      .find('.type option[value=time_format]')
                      .removeClass('hide')
                  }
                  $editor.find('.color').closest('tr').addClass('hide-editor')
                  $editor.find('.min').closest('tr').addClass('hide-editor')
                  $editor.find('.max').closest('tr').addClass('hide-editor')
                  $editor.find('.unit').closest('tr').addClass('hide-editor')
                  $editor.find('.type').trigger('change')
                }
                if (groupKey === 'T2-A') {
                  if (index.type === 'text') {
                    machineMonitor.drawText($index, index)
                  } else if (index.type === 'time_format') {
                    machineMonitor.drawTimeFormat($index, index)
                  }
                }
              } else {
                if (!$index.length) {
                  $group.append(
                    '<div class="col-xs-12 col-sm-12 col-md-' +
                      index.cardGrid +
                      ' col-lg-' +
                      index.cardGrid +
                      (machineMonitor.mode === 'edit' ||
                      index.signal ||
                      index.type === 'img' ||
                      groupKey === 'P'
                        ? ''
                        : ' hide') +
                      '">' +
                      '<div data-id="' +
                      indexKey +
                      '" class="index"></div></div>'
                  )
                }
                $index = $group.find('[data-id=' + indexKey + '].index')
                drawParam($index, index, machineMonitor)
              }
            }
            if (
              indexKey === 0 &&
              !_.isArray(index) &&
              groupKey.indexOf('T2-A') < 0 &&
              groupKey.indexOf('T2-B') < 0
            ) {
              $index.closest('.param-editor').addClass('onlyone-index')
            } else if ($group.find('.onlyone-index').length) {
              $group.find('.onlyone-index').removeClass('onlyone-index')
            }
          })
        }
      } else {
        // 第一層參數
        if (groupKey === 'T2-C') {
          drawParam($group.children(), group, machineMonitor)
        } else {
          drawParam($group, group, machineMonitor)
        }
      }
      if (machineMonitor.mode === 'edit') {
        if (groupKey.indexOf('O') >= 0 || groupKey === 'T1-C') {
          $group.append(
            '<div class="demo-index col-xs-12 col-sm-12 col-md-3 col-lg-3">' +
              '<i class="fa fa-plus"></i>' +
              '<div class="index"></div></div>'
          )
          machineMonitor.drawText($group.find('.demo-index .index'), {})
        } else if (groupKey === 'T1-B' || groupKey === 'T2-D') {
          $group.append(
            '<div class="demo-index col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
              '<i class="fa fa-plus"></i>' +
              '<div class="index"></div></div>'
          )
          machineMonitor.drawText($group.find('.demo-index .index'), {})
        } else if (groupKey === 'T2-A' || groupKey === 'T2-B') {
          $group.append(
            '<div class="demo-index"><i class="fa fa-plus"></i><span>---：<span class="value">---</span></span></div>'
          )
        } else if (groupKey.indexOf('P') >= 0) {
          $group.append(
            '<div class="demo-index col-xs-12 col-sm-12 col-md-3 col-lg-3">' +
              '<i class="fa fa-plus"></i>' +
              '<div class="index"></div></div>'
          )
          drawCoordinates($group.find('.demo-index .index'), {})
        }
      }
    })
    if (machineMonitor.mode === 'edit') {
      _.each(templateMap, (groupKey) => {
        var $group = $('[data-id=' + groupKey + ']')
        if (!$group.find('.demo-index').length) {
          if (groupKey.indexOf('O') >= 0 || groupKey === 'T1-C') {
            $group.append(
              '<div class="demo-index col-xs-12 col-sm-12 col-md-3 col-lg-3">' +
                '<i class="fa fa-plus"></i>' +
                '<div class="index"></div></div>'
            )
            machineMonitor.drawText($group.find('.demo-index .index'), {})
          } else if (groupKey === 'T1-B' || groupKey === 'T2-D') {
            $group.append(
              '<div class="demo-index col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
                '<i class="fa fa-plus"></i>' +
                '<div class="index"></div></div>'
            )
            machineMonitor.drawText($group.find('.demo-index .index'), {})
          } else if (groupKey === 'T2-A' || groupKey === 'T2-B') {
            $group.append(
              '<div class="demo-index"><i class="fa fa-plus"></i><span>---：<span class="value">---</span></span></div>'
            )
          } else if (groupKey.indexOf('P') >= 0) {
            $group.append(
              '<div class="demo-index col-xs-12 col-sm-12 col-md-3 col-lg-3">' +
                '<i class="fa fa-plus"></i>' +
                '<div class="index"></div></div>'
            )
            drawCoordinates($group.find('.demo-index .index'), {})
          }
        }
      })
    }
  }

  MachineMonitor.prototype.changeTemplate = function (template) {
    if (template === 2) {
      $('#template2').removeClass('hide')
      $('#template1').addClass('hide')
    } else {
      $('#template1').removeClass('hide')
      $('#template2').addClass('hide')
    }
    $('[data-id=status] span').html(this.sourceName)
  }

  MachineMonitor.prototype.drawLineChart = function ($ele, param, datas) {
    var currentVal = datas
    var title = param[lang]
    var chartDatas = []
    // setup plot
    if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
      currentVal = datas[param.index]
    }
    if (param.signal || this.mode === 'edit') {
      if (!title && currentVal) {
        if (currentVal.toString().search(/\||:/) >= 0) {
          title = currentVal.split(/\||:/)[0]
          currentVal = currentVal.split(/\||:/)[1]
        }
      }
      if (currentVal === '****') {
        currentVal = 'N/A'
      } else if (currentVal === 'B') {
        currentVal = '---'
      }
      var options = {
        yaxis: {
          //min: param.min,
          //max: param.max
        },
        xaxis: {
          mode: 'time',
          timezone: 'browser',
          timeformat: '%H:%M:%S',
        },
        colors: ['#57889C'],
        series: {
          lines: {
            lineWidth: 1,
            fill: true,
            fillColor: {
              colors: [
                {
                  opacity: 0.4,
                },
                {
                  opacity: 0,
                },
              ],
            },
            steps: false,
          },
        },
      }

      if (!title) {
        title = '---'
      }
      if (this.mode === 'edit') {
        for (var index = 0; index < 100; index++) {
          chartDatas.push([new Date().getTime() + 1000 * index, 50])
        }
        $.plot($ele, [chartDatas], options)
      } else {
        if (this.chartDatas.length >= 100) {
          this.chartDatas.shift()
        }
        this.chartDatas.push([new Date().getTime(), currentVal])
        $.plot($ele, [this.chartDatas], options)
      }

      $ele.siblings('[data-id=T1-A-legend]').html('')
      $ele.siblings('[data-id=T1-A-title]').text(title)
    }
  }

  MachineMonitor.prototype.drawMulitipleLineChart = function (
    $ele,
    param,
    datas,
    length
  ) {
    var currentVal = datas
    var title = param['label-' + lang]
    var allData = []
    var chartDatas = []
    // setup plot
    if (_.isArray(param)) {
      title = param[0]['label-' + lang]
    }
    var haveSignal = _.find(param, (p) => {
      return p.signal
    })
    if (haveSignal || !_.isArray(param) || this.mode === 'edit') {
      var options = {
        yaxis: {
          //min: param.min,
          //max: param.max
        },
        xaxis: {
          mode: 'time',
          timezone: 'browser',
          timeformat: '%H:%M:%S',
        },
        colors: ['#57889C'],
        series: {
          lines: {
            lineWidth: 1,
            // fill: true,
            fillColor: {
              colors: [
                {
                  opacity: 0.4,
                },
                {
                  opacity: 0,
                },
              ],
            },
            steps: false,
          },
        },
      }

      if (!title) {
        title = '---'
      }
      var chartColorList = [
        '#D62728',
        '#2361FF',
        '#2FA12F',
        '#FF7F0E',
        '#9467BD',
      ]
      var now = new Date().getTime()
      if (this.mode === 'edit') {
        for (var times = 0; times < (length || 1); times++) {
          for (var index = 0; index < 100; index++) {
            if (!chartDatas[times]) {
              chartDatas.push([])
            }
            chartDatas[times].push([now + 1000 * index, 50 + times * 10])
          }
          allData.push({
            data: chartDatas[times],
            color: chartColorList[times],
            label: param[times][lang],
            // yaxis: times + 1,
            lines: {
              show: true,
            },
          })
        }
      } else {
        if (_.isArray(datas)) {
          _.each(datas, (data, key) => {
            currentVal = data
            if (
              (_.isArray(data) || _.isObject(datas)) &&
              data[param[key].index]
            ) {
              currentVal = data[param[key].index]
            }
            if (!title && currentVal) {
              if (currentVal.toString().search(/\||:/) >= 0) {
                title = currentVal.split(/\||:/)[0]
                currentVal = currentVal.split(/\||:/)[1]
              }
            }
            if (currentVal === '****') {
              currentVal = 'N/A'
            } else if (currentVal === 'B') {
              currentVal = '---'
            }
            if (!this.chartDatas[key]) {
              this.chartDatas.push([])
            }
            if (this.chartDatas.length >= 100) {
              this.chartDatas[key].shift()
            }
            this.chartDatas[key].push([now, currentVal])
            allData.push({
              data: this.chartDatas[key],
              color: chartColorList[key],
              label: param[key][lang],
              // yaxis: times + 1,
              lines: {
                show: true,
              },
            })
          })
        } else {
          currentVal = datas
          if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
            currentVal = datas[param.index]
          }
          if (!title && currentVal) {
            if (currentVal.toString().search(/\||:/) >= 0) {
              title = currentVal.split(/\||:/)[0]
              currentVal = currentVal.split(/\||:/)[1]
            }
          }
          if (currentVal === '****') {
            currentVal = 'N/A'
          } else if (currentVal === 'B') {
            currentVal = '---'
          }
          if (!this.chartDatas[0]) {
            this.chartDatas.push([])
          }
          if (this.chartDatas.length >= 100) {
            this.chartDatas[0].shift()
          }
          this.chartDatas[0].push([now, currentVal])
          allData.push({
            data: this.chartDatas[0],
            color: chartColorList[0],
            label: param[lang],
            // yaxis: times + 1,
            lines: {
              show: true,
            },
          })
        }
      }
      $.plot(
        $ele,
        allData,
        _.extend(options, {
          legend: {
            show: true,
            container: $('[data-id=T1-A-legend]'),
          },
        })
      )
      $ele.siblings('[data-id=T1-A-title]').text(title)
    }
  }

  MachineMonitor.prototype.drawMulitipleYaxesLineChart = function (
    $ele,
    param,
    datas,
    length
  ) {
    var currentVal = datas
    var title = param['label-' + lang]
    var allData = []
    var chartDatas = []
    // setup plot
    if (_.isArray(param)) {
      title = param[0]['label-' + lang]
    }
    var haveSignal = _.find(param, (p) => {
      return p.signal
    })
    if (haveSignal || !_.isArray(param) || this.mode === 'edit') {
      var options = {
        // yaxis: {
        //   min: param.min,
        //   max: param.max
        // },
        xaxis: {
          mode: 'time',
          timezone: 'browser',
          timeformat: '%H:%M:%S',
        },
        colors: ['#57889C'],
        series: {
          lines: {
            lineWidth: 1,
            // fill: true,
            fillColor: {
              colors: [
                {
                  opacity: 0.4,
                },
                {
                  opacity: 0,
                },
              ],
            },
            steps: false,
          },
        },
      }

      if (!title) {
        title = '---'
      }
      var chartColorList = [
        '#D62728',
        '#2361FF',
        '#2FA12F',
        '#FF7F0E',
        '#9467BD',
      ]
      var now = new Date().getTime()
      if (this.mode === 'edit') {
        for (var times = 0; times < (length || 1); times++) {
          for (var index = 0; index < 100; index++) {
            if (!chartDatas[times]) {
              chartDatas.push([])
            }
            chartDatas[times].push([now + 1000 * index, 50 + times * 10])
          }
          allData.push({
            data: chartDatas[times],
            color: chartColorList[times],
            label: param[times][lang],
            yaxis: times + 1,
            lines: {
              show: true,
            },
          })
        }
      } else {
        if (_.isArray(datas)) {
          _.each(datas, (data, key) => {
            currentVal = data
            if (
              (_.isArray(data) || _.isObject(datas)) &&
              data[param[key].index]
            ) {
              currentVal = data[param[key].index]
            }
            if (!title && currentVal) {
              if (currentVal.toString().search(/\||:/) >= 0) {
                title = currentVal.split(/\||:/)[0]
                currentVal = currentVal.split(/\||:/)[1]
              }
            }
            if (currentVal === '****') {
              currentVal = 'N/A'
            } else if (currentVal === 'B') {
              currentVal = '---'
            }
            if (!this.chartDatas[key]) {
              this.chartDatas.push([])
            }
            if (this.chartDatas.length >= 100) {
              this.chartDatas[key].shift()
            }
            this.chartDatas[key].push([now, currentVal])
            allData.push({
              data: this.chartDatas[key],
              color: chartColorList[key],
              label: param[key][lang],
              yaxis: key + 1,
              lines: {
                show: true,
              },
            })
          })
        } else {
          currentVal = datas
          if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
            currentVal = datas[param.index]
          }
          if (!title && currentVal) {
            if (currentVal.toString().search(/\||:/) >= 0) {
              title = currentVal.split(/\||:/)[0]
              currentVal = currentVal.split(/\||:/)[1]
            }
          }
          if (currentVal === '****') {
            currentVal = 'N/A'
          } else if (currentVal === 'B') {
            currentVal = '---'
          }
          if (!this.chartDatas[0]) {
            this.chartDatas.push([])
          }
          if (this.chartDatas.length >= 100) {
            this.chartDatas[0].shift()
          }
          this.chartDatas[0].push([now, currentVal])
          allData.push({
            data: this.chartDatas[0],
            color: chartColorList[0],
            label: param[lang],
            yaxis: 1,
            lines: {
              show: true,
            },
          })
        }
      }
      $.plot(
        $ele,
        allData,
        _.extend(options, {
          legend: {
            show: true,
            container: $('[data-id=T1-A-legend]'),
          },
          yaxes: [
            {
              position: 'left',
              tickDecimals: 2,
              font: {
                color: chartColorList[0],
              },
            },
            {
              position: 'right',
              tickDecimals: 2,
              font: {
                color: chartColorList[1],
              },
            },
          ],
        })
      )
      $ele.siblings('[data-id=T1-A-title]').text(title)
    }
  }

  MachineMonitor.prototype.drawProgress = function ($ele, param, datas) {
    var currentVal =
      this.mode === 'edit' ? Math.floor(parseInt(param.max) / 2) : datas
    var title = param[lang]
    var color = colors[param.color]

    if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
      currentVal = datas[param.index]
      if (!title || title === undefined) {
        title = param.index
      }
    }
    if (param.signal || this.mode === 'edit') {
      if (!title && currentVal) {
        if (currentVal.toString().search(/\||:/) >= 0) {
          title = currentVal.split(/\||:/)[0]
          currentVal = currentVal.split(/\||:/)[1]
        }
      }
      var percent = parseFloat((currentVal / param.max) * 100).toFixed(1)
      if (percent === 'NaN') {
        percent = 0
      }
      if (_.isUndefined(currentVal)) {
        currentVal = '---'
      } else if (currentVal === '****') {
        currentVal = 'N/A'
      } else if (currentVal === 'B') {
        currentVal = '---'
      }

      var regNum = /^[0-9.+-]+$/
      if (regNum.test(currentVal) && currentVal !== '---') {
        currentVal = Math.round(Number(currentVal) * 10) / 10
      }

      if ($ele.children().length === 0) {
        var html =
          '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 progress-group">' +
          '<span class="title"> ' +
          title +
          ' <span class="pull-right">' +
          currentVal +
          '/' +
          param.max +
          (param.unit || '') +
          '</span> </span>' +
          '<div class="progress">' +
          '<div class="progress-bar bg-color-' +
          color +
          '" style="width: ' +
          percent +
          '%;"></div>' +
          '</div>' +
          '</div>'
        $ele.html(html)
        $ele.parent().addClass('progress-param')
      } else {
        $ele
          .find('span.title')
          .html(
            title +
              ' <span class="pull-right">' +
              currentVal +
              '<span style="font-size: 14px;">/' +
              param.max +
              (param.unit || '') +
              '</span></span>'
          )
        if (
          regNum.test(currentVal) &&
          ((regNum.test(param.max) &&
            parseInt(currentVal) > parseInt(param.max)) ||
            (regNum.test(param.min) &&
              parseFloat(currentVal) < parseFloat(param.min)))
        ) {
          $ele.find('div.progress-bar').addClass('bg-color-red')
          $ele.find('div.progress-bar').removeClass('bg-color-' + color)
        } else {
          $ele.find('div.progress-bar').removeClass('bg-color-red')
          $ele.find('div.progress-bar').addClass('bg-color-' + color)
        }
        $ele.find('div.progress-bar').attr('style', 'width: ' + percent + '%;')
      }
    }
  }

  MachineMonitor.prototype.drawPieChart = function ($ele, param, datas) {
    var currentVal =
      this.mode === 'edit' ? Math.floor(parseInt(param.max) / 2) : datas
    var title = param[lang]
    var color = colors[param.color]
    if (!title) {
      title = '---'
    }
    if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
      currentVal = datas[param.index]
      if (!title || title === undefined) {
        title = param.index
      }
    }

    if (param.signal || this.mode === 'edit') {
      if (!title && currentVal) {
        if (currentVal.toString().search(/\||:/) >= 0) {
          title = currentVal.split(/\||:/)[0]
          currentVal = currentVal.split(/\||:/)[1]
        }
      }
      var percent = parseFloat(
        (parseInt(currentVal) / parseInt(param.max)) * 100
      ).toFixed(1)
      if (percent === 'NaN') {
        percent = 0
      }

      if ($ele.children().length === 0) {
        var html =
          '<div class="easy-pie-chart txt-color-' +
          color +
          '" data-percent="' +
          percent +
          '" data-pie-size="50" data-rotate="0">' +
          '<span class="percent percent-sign">' +
          percent +
          '</span>' +
          '</div>' +
          '<span class="easy-pie-title title"> ' +
          title +
          ' </span>'
        $ele.html(html)
        pageSetUp()
      } else {
        if (_.isUndefined(currentVal)) {
          $($ele.children()[0]).data('easyPieChart').update(0)
        } else {
          $($ele.children()[0]).data('easyPieChart').update(percent)
        }
      }
      $($ele.children()[1]).text(title)
    }
  }

  MachineMonitor.prototype.drawText = function (
    $ele,
    param,
    datas,
    currentWorkShift
  ) {
    var currentVal = this.mode === 'edit' ? '---' : datas
    var title = param[lang]
    if (!title) {
      title = '---'
    }
    if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
      currentVal = datas[param.index]
      if (!title || title === undefined) {
        title = param.index
      }
    }

    if (param.signal || this.mode === 'edit') {
      if (param.signal && param.signal.search(/\(\)/) >= 0) {
        if (!title && currentVal) {
          if (currentVal.toString().search(/\||:/) >= 0) {
            title = currentVal.split(/\||:/)[0]
            currentVal = currentVal.split(/\||:/)[1]
          }
        }

        if (param.signal === 'G_TOCP()') {
          if (currentWorkShift && currentWorkShift.currentWorkShiftPartCount) {
            currentVal =
              parseInt(currentVal) - currentWorkShift.currentWorkShiftPartCount
            if (currentVal < 0) {
              currentVal = 0
            }
          }
        } else if (param.signal === 'G_ALAM()') {
          if (_.isArray(currentVal)) {
            var alarmHtml = []
            _.each(currentVal, (val) => {
              if (val == '-1' || val == 'B' || !this.alarmMap[val]) {
                alarmHtml.push(val + ' : Alarm Code Undefined<br>')
              } else {
                alarmHtml.push(val + ' : ' + this.alarmMap[val] + '<br>')
              }
            })
            currentVal = alarmHtml.join('')
            if (currentVal === '') {
              currentVal = '---'
            }
          } else {
            if (currentVal === '-1' || currentVal === 'B') {
              currentVal = '---'
            } else {
              currentVal =
                currentVal + ' : ' + (this.alarmMap[currentVal] || '---')
            }
          }
        }

        if (_.isUndefined(currentVal)) {
          currentVal = '---'
        } else if (currentVal === '****') {
          currentVal = 'N/A'
        } else if (currentVal === 'B') {
          currentVal = '---'
        }
      }

      if ($ele.children().length === 0) {
        $ele.html(
          '<span class="title">' +
            title +
            '</span><br/>' +
            '<span class="value">' +
            currentVal +
            '</span>'
        )
      } else {
        $ele.find('.value').html(currentVal)
      }
    }
  }

  MachineMonitor.prototype.drawTimeFormat = function (
    $ele,
    param,
    datas,
    currentWorkShift
  ) {
    var currentVal = this.mode === 'edit' ? new Date().getTime() : datas
    var title = param[lang]
    var inputFormat = 'YYYYMMDDHHmmss'
    var outputFormat = 'HH:mm:ss'
    if (!title) {
      title = '---'
    }

    if (param.format) {
      inputFormat = param.format.split('|')[0]
      outputFormat = param.format.split('|')[1]
    }

    if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
      currentVal = datas[param.index]
      if (!title || title === undefined) {
        title = param.index
      }
    }
    if (param.signal || this.mode === 'edit') {
      if (!title && currentVal) {
        if (currentVal.toString().search(/\||:/) >= 0) {
          title = currentVal.split(/\||:/)[0]
          currentVal = currentVal.split(/\||:/)[1]
        }
      }
      if (param.signal === 'G_ELCT()') {
        if (currentWorkShift && currentWorkShift.currentWorkShiftPowerTime) {
          currentVal =
            parseInt(currentVal) - currentWorkShift.currentWorkShiftPowerTime
          if (currentVal < 0) {
            currentVal = 0
          }
        }
      }
      if (param.signal === 'G_CUTT()') {
        if (currentWorkShift && currentWorkShift.currentWorkShiftCutTime) {
          currentVal =
            parseInt(currentVal) - currentWorkShift.currentWorkShiftCutTime
          if (currentVal < 0) {
            currentVal = 0
          }
        }
      }
      if (param.signal === 'G_OPRT()') {
        if (currentWorkShift && currentWorkShift.currentWorkShiftOperTime) {
          currentVal =
            parseInt(currentVal) - currentWorkShift.currentWorkShiftOperTime
          if (currentVal < 0) {
            currentVal = 0
          }
        }
      }
      if (_.isUndefined(currentVal)) {
        currentVal = '---'
      } else if (currentVal === 'B') {
        currentVal = '---'
      } else {
        var reg = RegExp(/[0-9]/)
        if (reg.test(currentVal)) {
          if (this.mode === 'edit') {
            currentVal = moment(currentVal).format(inputFormat)
          }
          currentVal = moment(parseInt(currentVal), inputFormat).format(
            outputFormat
          )
        }
      }
      if ($ele.children().length === 0) {
        $ele.html(
          '<span class="title">' +
            title +
            '</span><br/>' +
            '<span class="value">' +
            currentVal +
            '</span>'
        )
      } else {
        $ele.find('.value').text(currentVal)
      }
    }
  }

  MachineMonitor.prototype.drawTime = function (
    $ele,
    param,
    datas,
    currentWorkShift
  ) {
    var currentVal = this.mode === 'edit' ? new Date().getTime() : datas
    var title = param[lang]
    if (!title) {
      title = '---'
    }

    if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
      currentVal = datas[param.index]
      if (!title || title === undefined) {
        title = param.index
      }
    }
    if (param.signal || this.mode === 'edit') {
      if (!title && currentVal) {
        if (currentVal.toString().search(/\||:/) >= 0) {
          title = currentVal.split(/\||:/)[0]
          currentVal = currentVal.split(/\||:/)[1]
        }
      }
      if (param.signal === 'G_ELCT()') {
        if (currentWorkShift && currentWorkShift.currentWorkShiftPowerTime) {
          currentVal =
            parseInt(currentVal) - currentWorkShift.currentWorkShiftPowerTime
          if (currentVal < 0) {
            currentVal = 0
          }
        }
      }
      if (param.signal === 'G_CUTT()') {
        if (currentWorkShift && currentWorkShift.currentWorkShiftCutTime) {
          currentVal =
            parseInt(currentVal) - currentWorkShift.currentWorkShiftCutTime
          if (currentVal < 0) {
            currentVal = 0
          }
        }
      }
      if (param.signal === 'G_OPRT()') {
        if (currentWorkShift && currentWorkShift.currentWorkShiftOperTime) {
          currentVal =
            parseInt(currentVal) - currentWorkShift.currentWorkShiftOperTime
          if (currentVal < 0) {
            currentVal = 0
          }
        }
      }
      if (_.isUndefined(currentVal)) {
        currentVal = '---'
      } else if (currentVal === 'B') {
        currentVal = '---'
      } else {
        var reg = RegExp(/[0-9]/)
        if (reg.test(currentVal)) {
          currentVal = moment(parseInt(currentVal))
            .utc()
            .format('HH[H] mm[M] ss[S]')
        }
      }
      if ($ele.children().length === 0) {
        $ele.html(
          '<span class="title">' +
            title +
            '</span><br/>' +
            '<span class="value">' +
            currentVal +
            '</span>'
        )
      } else {
        $ele.find('.value').text(currentVal)
      }
    }
  }

  MachineMonitor.prototype.drawSwitch = function ($ele, param, datas) {
    var currentVal = this.mode === 'edit' ? 1 : datas
    var title = param[lang]
    var css = ''
    var color = colors[param.color]
    if (!title) {
      title = '---'
    }
    if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
      currentVal = datas[param.index]
      if (!title || title === undefined) {
        title = param.index
      }
    }

    if (param.signal || this.mode === 'edit') {
      if (!title && currentVal) {
        if (currentVal.toString().search(/\||:/) >= 0) {
          title = currentVal.split(/\||:/)[0]
          currentVal = currentVal.split(/\||:/)[1]
        }
      }
      $ele.css('padding-left', '5px')
      if (parseInt(currentVal) !== 0) {
        css = 'bg-color-' + color
      }
      if ($ele.children().length === 0) {
        var html =
          title +
          '<br/>' +
          '<span class="badge ' +
          css +
          '" style="width: 200px; height: 18px;"><span></span></span>'
        $ele.html(html)
      } else {
        $($ele.children()[1]).attr('class', 'badge ' + css)
      }
    }
  }

  MachineMonitor.prototype.drawImg = function ($ele, param) {
    if (!$ele.find('img').length) {
      $ele.html('<img src="./app/' + param[servkit.getCookie('lang')] + '">')
      $('#main_info')
        .find('img')
        .css('max-height', 217 - 50 * 1 + 'px')
    }
  }

  MachineMonitor.prototype.drawGragus = function ($ele, param, datas) {
    var max = parseInt(param.max.indexOf('()') < 0 ? param.max : param.realMax)
    var min = parseInt(param.min.indexOf('()') < 0 ? param.min : param.realMin)
    var currentVal = this.mode === 'edit' ? (max + min) / 2 : datas
    var title = param[lang]
    var index = $ele.data('id')
    if (isNaN(max)) {
      if (String(param.max).indexOf('()') >= 0) {
        max = Number(param.max.split('()')[1])
      } else {
        max = 1
      }
    }
    if (isNaN(min)) {
      if (String(param.min).indexOf('()') >= 0) {
        min = Number(param.min.split('()')[1])
      } else {
        min = -1
      }
    }
    if ($ele.hasClass('param')) {
      index = $ele.closest('.index').data('id') + '-' + index
    }
    if (!title && this.mode === 'edit') {
      title = '---'
    }
    if ((_.isArray(datas) || _.isObject(datas)) && datas[param.index]) {
      currentVal = datas[param.index]
      if (!title || title === undefined) {
        title = param.index
      }
    }
    if (param.signal || this.mode === 'edit') {
      if (!title && currentVal) {
        if (currentVal.toString().search(/\||:/) >= 0) {
          title = currentVal.split(/\||:/)[0]
          currentVal = currentVal.split(/\||:/)[1]
        }
      }
      if (isNaN(currentVal)) {
        currentVal = 0
      }
      if (
        !$ele.children().length ||
        this.gauge['group' + index + '-gragus'].min !== min ||
        this.gauge['group' + index + '-gragus'].max !== max
      ) {
        $ele.html(
          '<span class="title"></span><div class="chart-gauge" id="group' +
            index +
            '-gragus"></div>'
        )
        this.gauge['group' + index + '-gragus'] = {
          gragus: drawGragus('#group' + index + '-gragus', min, max),
          min: min,
          max: max,
        }
      }
      if ($ele.children('.title').html() === '') {
        $ele.children('.title').text(title)
      }
      if (this.gauge['group' + index + '-gragus']) {
        this.gauge['group' + index + '-gragus'].gragus.moveTo(currentVal)
      }
    }
  }

  MachineMonitor.prototype.update = function (
    dataEle,
    machineId,
    apiData,
    currentWorkShift
  ) {
    var machineMonitor = this
    _.each(machineMonitor.param, (group, groupKey) => {
      var dataMap
      var pmcDatas = '---'
      var $group = $('[data-id=' + groupKey + ']')
      if (groupKey === 'T1-C' && group.signal) {
        $('[data-id=T1-C]').removeClass('hide')
      }
      if (_.isArray(group)) {
        if (groupKey === 'T1-A') {
          dataMap = getRealData(
            dataEle,
            group,
            machineId,
            machineMonitor.mode,
            apiData
          )
          pmcDatas = dataMap.realData
          if (group[0].type === 'mulitiple_line_chart') {
            machineMonitor.drawMulitipleLineChart($group, group, pmcDatas)
          } else {
            machineMonitor.drawMulitipleYaxesLineChart($group, group, pmcDatas)
          }
        } else {
          _.each(group, (index, indexKey) => {
            var $index = $group.find('[data-id=' + indexKey + '].index')
            if (groupKey === 'T1-C' && index.signal) {
              $('[data-id=T1-C]').removeClass('hide')
            }
            if (_.isArray(index)) {
              $index = $group.find('[data-id=' + indexKey + '].index')
              _.each(index, (param, paramKey) => {
                if (groupKey === 'T1-C' && param.signal) {
                  $('[data-id=T1-C]').removeClass('hide')
                }
                var dataMap = getRealData(
                  dataEle,
                  param,
                  machineId,
                  machineMonitor.mode,
                  apiData
                )
                pmcDatas = dataMap.realData
                if (groupKey === 'P') {
                  drawCoordinates(
                    $index,
                    index,
                    machineMonitor.mode,
                    pmcDatas,
                    dataMap.param.signal
                  )
                } else {
                  var $param = $index.find('[data-id=' + paramKey + ']')
                  drawParam(
                    $param,
                    dataMap.param,
                    machineMonitor,
                    pmcDatas,
                    currentWorkShift
                  )
                }
              })
            } else {
              var dataMap = getRealData(
                dataEle,
                index,
                machineId,
                machineMonitor.mode,
                apiData
              )
              pmcDatas = dataMap.realData
              if (groupKey === 'T2-B') {
                if (index.signal === 'G_ALAM()') {
                  $index = $group.find('[data-id=' + indexKey + ']')
                  $index.find('.text').html(pmcDatas || '---')
                  $index
                    .find('.value')
                    .html(machineMonitor.alarmMap[pmcDatas] || '---')
                  $index.removeClass('hide')
                } else {
                  if (pmcDatas === '1') {
                    console.log(pmcDatas)
                    $index = $group.find('[data-id=' + indexKey + ']')
                    $index
                      .find('.value')
                      .html(
                        machineMonitor.alarmMap[dataMap.param[lang]] || '---'
                      )
                    $index.removeClass('hide')
                  } else {
                    $index.addClass('hide')
                  }
                }
              } else {
                $index = $group.find('[data-id=' + indexKey + '].index')
                drawParam(
                  $index,
                  index,
                  machineMonitor,
                  pmcDatas,
                  currentWorkShift
                )
              }
            }
          })
        }
      } else {
        dataMap = getRealData(
          dataEle,
          group,
          machineId,
          machineMonitor.mode,
          apiData
        )
        pmcDatas = dataMap.realData
        if (groupKey === 'T2-C') {
          drawParam(
            $group.children(),
            dataMap.param,
            machineMonitor,
            pmcDatas,
            currentWorkShift
          )
        } else {
          drawParam(
            $group,
            dataMap.param,
            machineMonitor,
            pmcDatas,
            currentWorkShift
          )
        }
      }
    })
  }

  function getRealData(dataEle, paramData, machineId, mode, apiData) {
    var pmcDatas = '---'

    function getData(signal) {
      try {
        if (signal && machineId) {
          return dataEle.getMachineValue(signal, machineId)[0][0]
        }
      } catch (e) {
        try {
          if (signal && machineId) {
            return apiData[signal][machineId]
          }
        } catch (e) {
          return '---'
        }
      }
    }
    if (mode === 'show') {
      if (_.isArray(paramData)) {
        pmcDatas = []
        _.each(paramData, (param) => {
          pmcDatas.push(getData(param.signal))
        })
      } else {
        pmcDatas = getData(paramData.signal)
      }
    }
    if (paramData.type === 'gragus') {
      var gragusSiganl
      var gragusValue
      var isAdd
      var min = 0
      var max = 0

      if (String(paramData.min).indexOf('()') >= 0 && machineId) {
        gragusSiganl = paramData.min.split('()')[0] + '()'
        gragusValue = parseFloat(paramData.min.split('()')[1].substr(1))
        isAdd = false
        if (paramData.min.indexOf('+') >= 0) {
          isAdd = true
        }
        try {
          min = parseFloat(
            dataEle.getMachineValue(gragusSiganl, machineId)[0][0]
          )
        } catch (e) {
          console.warn(e.message)
        }
        if (isAdd) {
          paramData.realMin = min + gragusValue
        } else {
          paramData.realMin = min - gragusValue
        }
      }
      if (String(paramData.max).indexOf('()') >= 0 && machineId) {
        gragusSiganl = paramData.max.split('()')[0] + '()'
        gragusValue = parseFloat(paramData.max.split('()')[1].substr(1))
        isAdd = false
        if (paramData.max.indexOf('+') >= 0) {
          isAdd = true
        }
        try {
          max = parseFloat(
            dataEle.getMachineValue(gragusSiganl, machineId)[0][0]
          )
        } catch (e) {
          console.warn(e.message)
        }
        if (isAdd) {
          paramData.realMax = max + gragusValue
        } else {
          paramData.realMax = max - gragusValue
        }
      }
    }
    return {
      realData: pmcDatas,
      param: paramData,
    }
  }

  function drawGragus(element, min, max) {
    var value = 0
    var prevValue = 0

    var maxValue = (9 * max - min) / 8
    var minValue = (9 * min - max) / 8

    var barWidth,
      chart,
      chartInset,
      degToRad,
      repaintGauge,
      height,
      margin,
      padRad,
      percToDeg,
      percToRad,
      radius,
      svg,
      totalPercent,
      width,
      valueText,
      formatValue,
      el,
      arc3,
      arc2,
      arc1,
      needle

    padRad = 0.025
    chartInset = 10

    // Orientation of gauge:
    totalPercent = 0.75

    el = d3.select(element)
    margin = {
      top: 30,
      right: 30,
      bottom: 30,
      left: 30,
    }

    width = el[0][0].offsetWidth - margin.left - margin.right
    height = width
    radius = Math.min(width, height) / 2
    barWidth = (40 * width) / 300

    if (width < 0) {
      width = 0
    }

    //Utility methods

    percToDeg = function (perc) {
      return perc * 360
    }

    percToRad = function (perc) {
      return degToRad(percToDeg(perc))
    }

    degToRad = function (deg) {
      return (deg * Math.PI) / 180
    }

    // Create SVG element
    if (!el.select('svg')[0][0]) {
      svg = el
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height * 0.5 + margin.top + margin.bottom)
    }

    svg = el.select('svg')

    // Add layer for the panel
    if (!svg.select('g')[0][0]) {
      chart = svg
        .append('g')
        .attr(
          'transform',
          'translate(' +
            (width / 2 + margin.left) +
            ', ' +
            (height + margin.top) / 2 +
            ')'
        )
    }
    chart = svg.select('g')

    if (!chart.select('path')[0][0]) {
      chart.append('path').attr('class', 'arc chart-first')
      chart.append('path').attr('class', 'arc chart-second')
      chart.append('path').attr('class', 'arc chart-third')
    }

    if (!chart.select('text')[0][0]) {
      chart
        .append('text')
        .text(min)
        .attr('class', 'min')
        .attr('dy', '.4em')
        .style('fill', '#666')
      chart
        .append('text')
        .text(max)
        .attr('class', 'max')
        .attr('dy', '.4em')
        .style('fill', '#666')

      valueText = chart
        .append('text')
        .attr('class', 'Value')
        .attr('font-size', 16)
        .attr('font-weight', 700)
        .attr('text-anchor', 'middle')
        .attr('dy', '.5em')
        .style('fill', '#000000')
    }

    valueText = chart.select('.Value')
    formatValue = d3.format('1')

    arc3 = d3.svg
      .arc()
      .outerRadius(radius - chartInset)
      .innerRadius(radius - chartInset - barWidth)
    arc2 = d3.svg
      .arc()
      .outerRadius(radius - chartInset)
      .innerRadius(radius - chartInset - barWidth)
    arc1 = d3.svg
      .arc()
      .outerRadius(radius - chartInset)
      .innerRadius(radius - chartInset - barWidth)

    repaintGauge = function () {
      var perc = 0.5
      var next_start = totalPercent
      var arcStartRad = percToRad(next_start)
      var arcEndRad = arcStartRad + percToRad(perc / 10)
      next_start += perc / 10

      arc1.startAngle(arcStartRad).endAngle(arcEndRad)

      arcStartRad = percToRad(next_start)
      arcEndRad = arcStartRad + percToRad(perc / 10) * 8
      next_start += (perc / 10) * 8

      arc2.startAngle(arcStartRad + padRad).endAngle(arcEndRad)

      arcStartRad = percToRad(next_start)
      arcEndRad = arcStartRad + percToRad(perc / 10)

      arc3.startAngle(arcStartRad + padRad).endAngle(arcEndRad)

      chart.select('.chart-first').attr('d', arc1)
      chart.select('.chart-second').attr('d', arc2)
      chart.select('.chart-third').attr('d', arc3)
    }

    var Needle = (function () {
      //Helper function that returns the `d` value for moving the needle
      var recalcPointerPos = function (perc) {
        var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY
        thetaRad = percToRad(perc / 2)
        centerX = 0
        centerY = 0
        topX = centerX - this.len * Math.cos(thetaRad)
        topY = centerY - this.len * Math.sin(thetaRad)
        leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2)
        leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2)
        rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2)
        rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2)

        return (
          'M ' +
          leftX +
          ' ' +
          leftY +
          ' L ' +
          topX +
          ' ' +
          topY +
          ' L ' +
          rightX +
          ' ' +
          rightY
        )
      }

      function Needle(el) {
        this.el = el
        this.len = width / 2.5
        this.radius = this.len / 8
      }

      Needle.prototype.render = function () {
        var el = this.el

        if (!el.select('circle')[0][0]) {
          el.append('circle')
          el.append('path').attr('class', 'needle')
        }
        this.el
          .select('circle')
          .attr('class', 'needle-center')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', this.radius)

        return this.el.select('.needle').attr('id', 'client-needle')
        // .attr('d', recalcPointerPos.call(this, 0))
      }

      Needle.prototype.moveTo = function (value) {
        var perc = (value - minValue) / (maxValue - minValue)
        var self = this

        this.perc = perc
        this.el
          .transition()
          .delay(300)
          .ease('linear')
          .duration(1500)
          .select('.needle')
          .tween('progress', function () {
            return function (percentOfPercent) {
              var progress =
                perc +
                ((prevValue - value) / (maxValue - minValue)) * percentOfPercent
              if (value < minValue) {
                progress = -0.05
              } else if (value > maxValue) {
                progress = 1.05
              }

              repaintGauge(progress)

              var thetaRad = percToRad(progress / 2)
              var textX = -(self.len + 30) * Math.cos(thetaRad)
              var textY = -(self.len + 30) * Math.sin(thetaRad)

              valueText
                .text(formatValue(value))
                .attr('transform', 'translate(' + textX + ',' + textY + ')')

              return d3
                .select(this)
                .attr('d', recalcPointerPos.call(self, progress))
            }
          })

        prevValue = value
      }

      return Needle
    })()

    needle = new Needle(chart)
    needle.render()
    needle.moveTo(value)

    return needle
  }

  return function (param, sourceName, mode) {
    var machineMonitor = new MachineMonitor(param, sourceName, mode)
    if (param[0] && param[0].template === '2') {
      machineMonitor.changeTemplate(2)
    } else {
      machineMonitor.changeTemplate(1)
    }
    return machineMonitor
  }
})(this, $, _, servkit)
