function render(widget, done, deviceStatusData) {
  function msToTime(milliseconds) {
    if (this < 0) {
      return '---'
    } else {
      var hour = Math.floor(milliseconds / 3600000),
        minute = Math.floor((milliseconds % 3600000) / 60000),
        second = Math.floor((milliseconds % 60000) / 1000)
      return (
        (hour < 10 ? '0' : '') +
        hour +
        ':' +
        (minute < 10 ? '0' : '') +
        minute +
        ':' +
        (second < 10 ? '0' : '') +
        second
      )
    }
  }

  var tableData = {}

  deviceStatusData[0].eachMachine('CTL_TCNT(G_CONS_)', function (
    multisystem,
    machineId
  ) {
    tableData[machineId] = {
      machineName: servkit.getMachineName(machineId),
      status: multisystem[0][0],
      accumulateTime: msToTime(parseInt(multisystem[0][1]) * 1000),
      alarmCode: '---',
    }

    if (multisystem[0][0] === '13') {
      tableData[machineId].alarmCode = deviceStatusData[0].getValue(
        'G_ALAM()',
        machineId
      )[0]
    }
  })

  var tableHtml = _.chain(tableData)
    .mapObject(function (data) {
      return (
        '<tr>' +
        '<td class="text-align-center">' +
        data.machineName +
        '</td>' +
        '<td class="text-align-center">' +
        data.status +
        '</td>' +
        '<td class="text-align-center">' +
        data.accumulateTime +
        '</td>' +
        '<td class="text-align-center">' +
        data.alarmCode +
        '</td>' +
        '</tr>'
      )
    })
    .values()
    .value()
    .join('')

  widget.asJquery().find('#device-status-table-body').html(tableHtml)

  if (widget.isRotating()) {
    widget.asJquery().find('tr').css('font-size', '3em')
  } else {
    widget.asJquery().find('tr').css('font-size', '1em')
  }

  done()
}
