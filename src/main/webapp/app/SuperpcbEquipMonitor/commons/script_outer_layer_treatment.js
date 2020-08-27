exports.outerLayerTreatment = (function (global, $, _, servkit) {
  var _conf = {
    container: '#outer-layer-treatment-space', // root container
    labelSize: 5, // 設定
    statusCommand: 'G_CONS()', // 狀態資料
    statusMap: {
      // 狀態表
      '11': 'online',
      '12': 'idle',
      '13': 'alarm',
      '0': 'offline',
      'B': 'offline',
    },
    alarmSignalMap: {
      D407: 'G_PRE08()',
      D408: 'G_PRE09()',
      D409: 'G_PRE10()',
      D410: 'G_PRE11()',
      D411: 'G_PRE12()',
      D412: 'G_PRE13()',
      D413: 'G_PRE14()',
      D414: 'G_PRE15()',
      D415: 'G_PRE16()',
      D416: 'G_PRE17()',
      D417: 'G_PRE18()',
      D418: 'G_PRE19()',
      D419: 'G_PRE20()',
      D433: 'G_PRE22()',
      D434: 'G_PRE23()',
      D435: 'G_PRE24()',
      D436: 'G_PRE25()',
      D437: 'G_PRE26()',
    },
  }

  function dateTimezone(offset) {
    // 建立現在時間的物件
    var d = new Date()
    // 取得 UTC time
    var utc = d.getTime() + d.getTimezoneOffset() * 60000
    // 新增不同時區的日期資料
    return new Date(utc + 3600000 * offset)
  }

  function outerLayerTreatment(conf) {
    // init
    var outerLayerTreatmentConfig = $.extend(true, _conf, conf)
    var $container = $(outerLayerTreatmentConfig.container)
    var $bg = $container.find('.bg')
    var device = servkit.getMachineList()[0]

    var gauge1
    var gauge2

    var _loadEnv = function () {
      $bg.attr(
        'src',
        './app/SuperpcbEquipMonitor/img/outer_layer_treatment_background.png'
      )
      $container.find('#status').html(servkit.getMachineName(device))
    }

    var updateProgress = function (id, value) {
      var regNum = /^[0-9.+-]+$/
      var percent = 0
      $container.find('#' + id + ' .actual-value').html(value)
      if (regNum.test(value)) {
        percent = parseFloat((value / 2.5) * 100).toFixed(1)
        if (parseFloat(value) < 2.2 || parseFloat(value) > 2.5) {
          $container
            .find('#' + id)
            .find('div.progress-bar')
            .addClass('bg-color-red')
          $container
            .find('#' + id)
            .find('div.progress-bar')
            .removeClass('bg-color-blue')
        } else {
          $container
            .find('#' + id)
            .find('div.progress-bar')
            .removeClass('bg-color-red')
          $container
            .find('#' + id)
            .find('div.progress-bar')
            .addClass('bg-color-blue')
        }
      }
      $container
        .find('#' + id)
        .find('div.progress-bar')
        .attr('style', 'width: ' + percent + '%;')
    }

    var _changeSubscribeData = function (data) {
      // 取某命令某機資料
      //device-title update device status
      var statusValue = '0'
      var alarm = []
      var param1 = 0
      var param2 = 0
      var param3 = 0
      var param4 = 0
      var param5 = 0
      var param6 = 0
      var param7 = 0
      try {
        statusValue = data[device][outerLayerTreatmentConfig.statusCommand]
      } catch (e) {
        // console.warn(e)
      }
      _.each(outerLayerTreatmentConfig.alarmSignalMap, (signal, alarmCode) => {
        try {
          if (data[device][signal][0] === '1') {
            alarm.push(alarmCode)
          }
        } catch (e) {
          // console.warn(e)
        }
      })
      try {
        param1 = data[device]['G_PRE01()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param2 = data[device]['G_PRE02()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param3 = data[device]['G_PRE03()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param4 = data[device]['G_PRE04()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param5 = data[device]['G_PRE05()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param6 = data[device]['G_PRE06()'][0]
      } catch (e) {
        // console.warn(e)
      }
      try {
        param7 = data[device]['G_PRE07()'][0]
      } catch (e) {
        // console.warn(e)
      }
      var status = outerLayerTreatmentConfig.statusMap[statusValue] || ''
      $container.find('#status').attr('class', 'device ' + status)
      var alarmInfo = ''
      if (statusValue[0] === 'R' && alarm.length) {
        if (alarm.length) {
          _.each(alarm, (alramCode) => {
            alarmInfo +=
              alramCode +
              '：' +
              outerLayerTreatmentConfig.alarmMap[
                servkit.getMachineBrand(device)
              ][alramCode] +
              '<br>'
          })
        } else {
          alarmInfo = '---'
        }
      }
      $container.find('#alarm-info').html(alarmInfo)
      $container
        .find('#param1 .value')
        .html(!param1 || param1 === 'B' ? '---' : param1)
      updateProgress('param2', !param2 || param2 === 'B' ? 0 : Number(param2))
      updateProgress('param3', !param3 || param3 === 'B' ? 0 : Number(param3))
      if (!param4 || param4 === 'B') {
        param4 = 0
      } else {
        param4 = Number(param4)
      }
      if (
        param4 !== Number(window.sessionStorage.getItem('gauge-value1')) ||
        outerLayerTreatmentConfig.gauge1 === undefined ||
        !$('#gauge1').children().length
      ) {
        $('#gauge1').empty()
        delete outerLayerTreatmentConfig.gauge1
        outerLayerTreatmentConfig.gauge1 = drawGragus(
          '#gauge1',
          param4 - 2,
          param4 + 2
        )
        window.sessionStorage.setItem('gauge-value1', param4)
      }
      if (!param6 || param6 === 'B') {
        param6 = 0
      } else {
        param6 = Number(param6)
      }
      if (
        param6 !== Number(window.sessionStorage.getItem('gauge-value2')) ||
        outerLayerTreatmentConfig.gauge2 === undefined ||
        !$('#gauge2').children().length
      ) {
        $('#gauge2').empty()
        delete outerLayerTreatmentConfig.gauge2
        outerLayerTreatmentConfig.gauge2 = drawGragus(
          '#gauge2',
          param6 - 10,
          param6 + 10
        )
        window.sessionStorage.setItem('gauge-value2', param6)
      }
      try {
        outerLayerTreatmentConfig.gauge1.moveTo(
          !param5 || param5 === 'B' ? 0 : Number(param5)
        )
      } catch (e) {
        // console.warn(e)
      }
      try {
        outerLayerTreatmentConfig.gauge2.moveTo(
          !param7 || param7 === 'B' ? 0 : Number(param7)
        )
      } catch (e) {
        // console.warn(e)
      }
      $('#outer-layer-treatment-time span:first').html(
        moment(dateTimezone(8)).format('HH:mm:ss')
      )
    }

    var _subscribeData = function () {
      // 聽device status
      servkit.subscribe('DeviceStatus', {
        machines: servkit.getBoxList(),
        handler: function (data) {
          var machineMap = {}
          servkit.convertDeviceStatusPb2Map(data, machineMap)
          _changeSubscribeData(machineMap)
        },
        noDataHandler: function (data) {
          var machineMap = {}
          servkit.convertDeviceStatusPb2Map(data, machineMap)
          _changeSubscribeData(machineMap)
        },
      })
    }

    if (
      outerLayerTreatmentConfig.source &&
      Object.keys(outerLayerTreatmentConfig.source).length
    ) {
      _changeSubscribeData(outerLayerTreatmentConfig.source)
      $(window).on('hashchange', function hashChange() {
        outerLayerTreatmentConfig.source = undefined
        $(window).off('hashchange', hashChange)
      })
    } else {
      //to monitor page
      $('#outer-layer-treatment-leave-btn').on('click', function () {
        window.location.href =
          '#app/SuperpcbEquipMonitor/function/' +
          servkit.getCookie('lang') +
          '/10_plant_area.html'
      })
      _subscribeData()
    }

    _loadEnv()

    return {
      gauge1: outerLayerTreatmentConfig.gauge1,
      gauge2: outerLayerTreatmentConfig.gauge2,
    }
  }

  return function (conf) {
    return outerLayerTreatment(conf)
  }
})(this, $, _, servkit)

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
    // console.log(min)
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
