/* global Chart */
exports.bigLineChart = function (name, id, dom, data) {
  if (!name || !id || !dom) {
    console.warn('Can not find name or id or dom')
    return false
  }
  //bigLineChart canvas id = 'bigLineChart_' + id
  var articleDOM =
    '<article class="col-xs-12 col-sm-12 col-md-12 col-lg-12 sortable-grid">' +
    '<div class="jarviswidget jarviswidget-color-darken" data-widget-editbutton="false" role="widget">' +
    '<header role="heading">' +
    '<div class="jarviswidget-ctrls" role="menu"> <a href="javascript:void(0);" class="button-icon jarviswidget-toggle-btn" rel="tooltip" title="" data-placement="bottom" data-original-title="Collapse"><i class="fa fa-minus "></i></a> <a href="javascript:void(0);" class="button-icon jarviswidget-fullscreen-btn" rel="tooltip" title="" data-placement="bottom" data-original-title="Fullscreen"><i class="fa fa-expand "></i></a> </div>' +
    '<span class="widget-icon">' +
    '<i class="fa fa-th-list"></i>' +
    '</span>' +
    '<h2>' +
    name +
    '</h2>' +
    '<span class="jarviswidget-loader"><i class="fa fa-refresh fa-spin"></i></span>' +
    '</header>' +
    '<div class="widget-body" role="content">' +
    '<canvas id="bigLineChart_' +
    id +
    '"height="300"></canvas>' +
    '</div>' +
    '</div>' +
    '</article>'

  function growPanel($dom, element) {
    $($('#' + $dom)[0]).append(element)
    var canvas = document.getElementById('bigLineChart_' + id)
    var ctx = document.getElementById('bigLineChart_' + id).getContext('2d')
    var startingData = {
      labels: ['N/A'],
      datasets: [
        {
          fillColor: 'rgba(151,187,205,0.2)',
          strokeColor: 'rgba(151,187,205,1)',
          pointColor: 'rgba(151,187,205,1)',
          pointStrokeColor: '#fff',
          data: [0],
        },
      ],
    }

    $(canvas).attr('width', $(canvas).parent().width() - 40)
    $(canvas).attr('style', 'margin-left:20px;margin-right:20px;')
    var LiveChart = new Chart(ctx).Line(startingData)
    return LiveChart
  }
  var chart = growPanel(dom, articleDOM)
  if (data) {
    for (var i = 0; i < data[0].length; i++) {
      chart.addData([data[0][i]], data[1][i])
    }
  }
  return chart
}

exports.smallLineChart = function (name, id, dom, data) {
  if (!name || !id || !dom) {
    console.warn('Can not find name or id or dom')
    return false
  }
  //bigLineChart canvas id = 'bigLineChart_' + id
  var articleDOM =
    '<canvas id="bigLineChart_' + id + '" width="300" height="300"></canvas>'

  function growPanel($dom, element) {
    $($('#' + $dom)[0]).append(element)
    var canvas = document.getElementById('bigLineChart_' + id)
    var ctx = document.getElementById('bigLineChart_' + id).getContext('2d')
    var startingData = {
      labels: ['N/A', 'N/A'],
      datasets: [
        {
          fillColor: 'rgba(151,187,205,0.2)',
          strokeColor: 'rgba(151,187,205,1)',
          pointColor: 'rgba(151,187,205,1)',
          pointStrokeColor: '#fff',
          data: [0, 0],
        },
      ],
    }
    $(canvas).attr('width', $(canvas).parent().width() - 20 + 'px')
    $(canvas).attr('height', '295')
    $(canvas).attr('style', 'margin-left: 10px; margin-right: 10px;')
    var LiveChart = new Chart(ctx).Line(startingData)
    return LiveChart
  }
  var chart = growPanel(dom, articleDOM)
  if (data) {
    for (var i = 0; i < data[0].length; i++) {
      chart.addData([data[0][i]], data[1][i])
    }
  }
  return chart
}

exports.buildEasyPieChart = function (name, id, parentDom, classes) {
  var easyPieChartDom =
    '<div class="col-xs-12 col-sm-3 col-md-3 col-lg-3" id="easyPieChart' +
    id +
    '">' +
    '<div class="easy-pie-chart txt-color-blue" name="pieChart" data-percent="5" data-pie-size="5">' +
    '<span class="percent percent-sign" name="chartNum">23 </span></div>' +
    '<span class="easy-pie-title" name="title"> ' +
    name +
    '</span>' +
    '<ul class="smaller-stat hidden-sm pull-right"><li>' +
    '<span class="label bg-color-blueDark" name="value"></span></li><li>' +
    '<span class="label bg-color-blueDark" name="diff"><i class="fa fa-caret-up"></i> 10%</span>' +
    '</li></ul></div>'
  $($('#' + parentDom)[0]).append(easyPieChartDom)
  var $div = $('#easyPieChart' + id)
  $($div.find('span')[0]).attr('class', classes)
  $($div.find('[name="pieChart"]')[0]).easyPieChart({
    size: getSize($div),
    barColor: '	#46a3ff',
    lineWidth: 5,
  })

  function getSize($dom) {
    return $($dom.find('[name="pieChart"]')[0]).parent().height() + 10
  }
  return 'easyPieChart' + id
}

exports.updateEasyPieChart = function (id, num, transform, unit) {
  var $div = $('#' + id)
  var $chart = $($div.find('[name="pieChart"]'))
  var $diff = $($div.find('[name="diff"]')[0])
  var $value = $($div.find('[name="value"]')[0])
  var preVale =
    $value.text().replace(unit, '') === '' ? 0 : $value.text().replace(unit, '')
  var diff = (num - preVale).toFixed(1)
  var labelStyle = {
    red: 'label bg-color-red',
    blue: 'label bg-color-blue',
    green: 'label bg-color-green',
    darken: 'label bg-color-darken',
    blueDark: 'label bg-color-blueDark',
  }
  var icon = {
    up: '<i class="fa fa-caret-up"></i>',
    down: '<i class="fa fa-caret-down"></i>',
  }
  $($div.find('[name="pieChart"]')).data('easyPieChart').update(transform(num))
  $('span', $chart).text(transform(num))
  $value.text(num.toFixed(1) + unit)
  $diff.html('')
  if (diff && diff > 0) {
    $diff.attr('class', labelStyle.red)
    $diff.append(icon.up)
    $diff.append(' ' + Math.abs(diff) + unit)
  } else if (diff && diff < 0) {
    $diff.attr('class', labelStyle.green)
    $diff.append(icon.down)
    $diff.append(' ' + Math.abs(diff) + unit)
  } else {
    $diff.attr('class', labelStyle.blueDark)
    $diff.text(' 0' + unit)
  }
}

exports.buildStatusList = function (name, id, parentId, status, transform) {
  var dom =
    '<div class="col-xs-6 col-sm-6 col-md-12 col-lg-12" style="padding-top: 10px;">' +
    '<span class="text"> ' +
    id +
    '</span>' +
    '<button type="button" id="status_' +
    name +
    '" class="btn btn-labeled btn-danger pull-right">' +
    '<span class="btn-label"><i class="glyphicon glyphicon-remove"></i></>Close</button></div>'
  var $btn = $('#status_' + name)
  var btnClass = {
    on: 'btn btn-labeled btn-success pull-right',
    off: 'btn btn-labeled btn-danger pull-right',
  }
  var iconDom = {
    on:
      '<span class="btn-label"><i class="glyphicon glyphicon-ok"></i></>Close',
    off:
      '<span class="btn-label"><i class="glyphicon glyphicon-remove"></i></>Close',
  }
  $(parentId).append(dom)
  var update = function (status) {
    if (transform(status)) {
      $btn.attr('class', btnClass.on)
      $btn.html(iconDom.on)
      // }else{

      // }
    }
  }

  return update
}
