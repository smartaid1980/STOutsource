function render(widget, done, machineMap) {
  var signalData = JSON.parse(JSON.stringify(machineMap))
  if (widget.alarmCodeMap === undefined) {
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_alarm',
          columns: ['alarm_id', 'cnc_id', 'alarm_status'],
        }),
      },
      {
        success: function (data) {
          var cncList = _.pluck(data, 'cnc_id')
          var alarmCodeMap = {}
          _.each(cncList, function (cncId) {
            alarmCodeMap[cncId] = {}
            _.each(data, function (elem) {
              alarmCodeMap[cncId][elem.alarm_id] = elem.alarm_status
            })
          })
          update()
        },
      }
    )
  } else {
    update()
  }

  function update() {
    var $timeFrequency = $('#outer-layer-treatment-time span:last')
    $timeFrequency.html(
      $timeFrequency
        .html()
        .replace('30', servtechConfig.ST_DEVICESTATUS_FREQUNECY / 1000)
    )
    var config = {
      source: signalData,
      alarmMap: widget.alarmCodeMap,
      deviceSetting: [
        {
          top: '22%',
          left: '22%',
        },
        {
          top: '25%',
          left: '85%',
        },
      ],
    }
    if (widget.gauge) {
      config.gauge1 = widget.gauge.gauge1
      config.gauge2 = widget.gauge.gauge2
    }
    widget.gauge = widget.commons.outerLayerTreatment(config)
  }

  if (typeof done === 'function') {
    done()
  }
}
