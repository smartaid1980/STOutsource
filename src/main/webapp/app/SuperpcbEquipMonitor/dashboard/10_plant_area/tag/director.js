function render(widget, done, machineMap) {
  var $timeFrequency = $('#plant-area-time span:last')
  $timeFrequency.html(
    $timeFrequency
      .html()
      .replace('30', servtechConfig.ST_DEVICESTATUS_FREQUNECY / 1000)
  )
  if (!$('#plant-area-space').find('#' + servkit.getMachineList()[0]).length) {
    $('[data-page-name=outer_layer_treatment]').attr(
      'id',
      servkit.getMachineList()[0]
    )
    $('[data-page-name=DI_exposure_machine]').attr(
      'id',
      servkit.getMachineList()[1]
    )
  }

  widget.commons.superpcbPlantArea({
    source: machineMap,
  })
  if (typeof done === 'function') {
    done()
  }
}
