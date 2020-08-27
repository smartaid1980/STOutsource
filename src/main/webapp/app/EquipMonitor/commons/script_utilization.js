exports.getUtilizationRate = (function () {
  return function (done) {
    updateCurShift(function (currentWorkShiftName, date) {
      hippo
        .newSimpleExhaler()
        .space('utilization_time_work_shift')
        .index('machine_id', servkit.getMachineList())
        .indexRange('date', date, date)
        .columns(
          'machine_id',
          'date',
          'work_shift',
          'operate_millisecond',
          'power_millisecond'
        )
        .exhale(function (data) {
          var machineMap = {}
          _.each(data.exhalable, (val) => {
            if (val.work_shift === currentWorkShiftName) {
              if (machineMap[val.machine_id] === undefined) {
                machineMap[val.machine_id] = {
                  operate: val.operate_millisecond,
                  power: val.power_millisecond,
                }
              } else {
                machineMap[val.machine_id].operate += val.operate_millisecond
                machineMap[val.machine_id].power += val.power_millisecond
              }
            }
          })
          done(machineMap)
        })
    })
  }
})()

function updateCurShift(callback) {
  servkit.ajax(
    {
      url: 'api/workshift/nowLogicallyDate',
      type: 'GET',
      contentType: 'application/json',
    },
    {
      success: function (date) {
        servkit.ajax(
          {
            url: 'api/workshift/now',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              callback(data['name'], date)
            },
          }
        )
      },
    }
  )
}
