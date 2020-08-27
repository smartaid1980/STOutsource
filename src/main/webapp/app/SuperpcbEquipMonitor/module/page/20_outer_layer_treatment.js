export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.commons.outerLayerTreatment({
        alarmMap: context.preCon.alarmCodeMap,
      })
    },
    preCondition: {
      alarmCodeMap: function (done) {
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
              done(alarmCodeMap)
            },
          }
        )
      },
    },
    dependencies: [['/js/plugin/d3/d3.min.js']],
  })
}
