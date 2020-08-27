export default function () {
  pageSetUp()

  servkit.generalreport({
    stkFormId: 'stk-report-form',
    stkTableId: 'stk-report-table',
    multiData: {
      classReport: {
        getdata: {
          source: 'file',
          dataName: 'utilization_class_report',
          dataPathPattern: '{device}/{YYYY}/{MM}/{YYYY}{MM}{DD}.csv',
          column: ['A:K'],
        },
      },
      amdReport: {
        getdata: {
          source: 'file',
          dataName: 'amd',
          dataPathPattern: '{device}/{YYYY}/{YYYY}{MM}.csv',
          column: ['A:G'],
        },
      },
      workShift: {
        ajax: function ($formElements) {
          return {
            type: 'POST',
            url:
              'module.manage_work_shift.WorkShiftTimeAction.do?method:byDateInterval',
            data: {
              startDate: $formElements
                .filter('input[name="startDate"]')
                .val()
                .replace(/\//g, ''),
              endDate: $formElements
                .filter('input[name="endDate"]')
                .val()
                .replace(/\//g, ''),
            },
            dataType: 'json',
          }
        },
      },
    },
    dataPreProcessing: function (data, $formElements) {
      // 把後端拿到的班次表的 date key 塞進每個班次 object 中再扁平化成陣列
      var workShiftArray = _.chain(JSON.parse(data.workShift))
          .pairs()
          .map(function (ele) {
            _.each(ele[1], function (inner) {
              inner.date = ele[0]
            })
            return ele[1]
          })
          .flatten()
          .sortBy(function (obj) {
            return new Date(obj.start)
          })
          .value(),
        // key 為 YYYYMMDD_班次，value 為 amd 資料陣列
        groupByDateWorkShift = {}

      for (var i = 0; i < data.amdReport.length; i++) {
        var curr = data.amdReport[i],
          next = data.amdReport[i + 1],
          currTime = curr[6],
          nextTime = next && next[6],
          currDate = new Date(
            currTime.substring(0, 4),
            parseInt(currTime.substring(4, 6)) - 1,
            currTime.substring(6, 8),
            currTime.substring(8, 10),
            currTime.substring(10, 12),
            currTime.substring(12, 14)
          ),
          nextDate = nextTime
            ? new Date(
                nextTime.substring(0, 4),
                parseInt(nextTime.substring(4, 6)) - 1,
                nextTime.substring(6, 8),
                nextTime.substring(8, 10),
                nextTime.substring(10, 12),
                nextTime.substring(12, 14)
              )
            : undefined

        _.chain(workShiftArray)
          .filter(function (workShift) {
            var workShiftStartTime = new Date(workShift.start).getTime()
            if (nextDate) {
              return (
                workShiftStartTime >= currDate.getTime() &&
                workShiftStartTime < nextDate.getTime()
              )
            } else {
              return workShiftStartTime >= currDate.getTime()
            }
          })
          .each(function (workShift) {
            if (!groupByDateWorkShift[workShift.date + '_' + workShift.name]) {
              groupByDateWorkShift[workShift.date + '_' + workShift.name] = []
            }
            groupByDateWorkShift[workShift.date + '_' + workShift.name].push(
              curr
            )
          })
      }

      return _.map(data.classReport, function (row) {
        var newColumn = _.reduce(
          groupByDateWorkShift[row[1] + '_' + row[2]],
          function (result, ele) {
            if (result.length != 0) {
              result += '<br /><br />'
            }
            result +=
              'i18n_ServCloud_Module: ' +
              ele[1] +
              '<br />i18n_ServCloud_Piece: ' +
              ele[2] +
              '<br />i18n_ServCloud_Work_Seq: ' +
              ele[5]
            return result
          },
          ''
        )

        return [
          servkit.getDeviceName(row[0]),
          row[1],
          row[2],
          newColumn,
          row[3],
          row[4],
          row[5],
          row[6],
          row[7],
          row[8],
          row[9],
        ]
      })
    },
  })
}
