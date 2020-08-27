function render(widget, done, machineMap) {
  var signalData = JSON.parse(JSON.stringify(machineMap))
  var $timeFrequency = $('#exposure-time span:last')
  $timeFrequency.html(
    $timeFrequency
      .html()
      .replace('30', servtechConfig.ST_DEVICESTATUS_FREQUNECY / 1000)
  )
  widget.commons.DIExposureMachine({
    source: signalData,
  })

  if (typeof done === 'function') {
    done()
  }
}
