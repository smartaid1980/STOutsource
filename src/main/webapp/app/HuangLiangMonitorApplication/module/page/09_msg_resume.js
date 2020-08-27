import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  pageSetUp()
  ;(function () {
    var monitor = function () {
      var monitorCmd = {
        //box監控命令
        name: 'cnc_MsgHistory',
        cycleType: 'count',
        cycleValue: 1,
        timeout: 0,
        items: [
          { signal: { id: 'G_MSGH' }, collect: { waitMs: 0, count: 1 } }, //機械座標
        ],
      }

      var tableHeadColumns = [
        { id: 'time', name: `${i18n('Time')}` },
        { id: 'time', name: `${i18n('Message_Code')}` },
        { id: 'alarmCode', name: `${i18n('Message_Description')}` },
      ]

      var tableOptions = {
        sDom:
          "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r>" +
          't' +
          "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
        columns: [
          { className: 'text-left' },
          { className: 'text-left' },
          { className: 'text-left' },
        ],
        autoWidth: true,
        ordering: false,
        //"paging": false,
        //"lengthChange": false
      }

      var theHref = location.href
      var boxId = getURLParameter('boxId', theHref)
      var machineId = getURLParameter('machineId', theHref)

      $('#boxId').text(boxId)
      $('#machineIdHead').text(servkit.getMachineName(machineId))
      $('#machineId').text(machineId)
      $('#machineName').text(servkit.getMachineName(machineId))
      console.log('boxId:' + boxId + ', machineId:' + machineId)

      //長header
      servkit.monitor({
        type: 'HEAD',
        monitorHeadId: 'monitorHeader',
        boxId: boxId,
        machineId: machineId,
      })

      //送監控命令
      servkit.monitor({
        type: 'SEND',
        boxId: boxId,
        machineId: machineId,
        monitorCmd: monitorCmd,
        monitorCmdVersion: 'v1.0',
        timeoutLimit: 9000,
        customCallback: function (data) {
          //客製化
          console.log('---------------------')
          console.log(JSON.stringify(data))
          console.log('---------------------')

          if (data['G_MSGH()']) {
            //data = {"G_MSGH()":{"type":"STRING","values":[["2015-10-08 10:51:07|-1"]]}};

            var msgHistory = data['G_MSGH()']
            var msgHistoryMatrix = [],
              alarmCodeArray = []
            _.each(msgHistory.values[0], function (ele) {
              var array = ele.split('|')
              msgHistoryMatrix.push(array)
              alarmCodeArray.push(array[1])
            })

            servkit.monitor.tool({
              //從db取alarm code說明
              type: 'ALARM_CODE',
              config: {
                ids: alarmCodeArray,
                machineId: machineId,
                callback: function (alarmCodeMap) {
                  var matrix = []
                  _.each(msgHistoryMatrix, function (ele) {
                    //[time, alarmCode, alarmCodeDesc]
                    matrix.push([ele[0], ele[1], alarmCodeMap[ele[1]]])
                  })
                  tableOptions['data'] = matrix
                  servkit.monitor.tool({
                    //從table長出結果
                    type: 'TABLE',
                    config: {
                      id: 'response-data-table',
                      headColumns: tableHeadColumns,
                      options: tableOptions,
                    },
                  })
                },
              },
            })
            $('#response-data-table')
              .closest('.jarviswidget')
              .find('.fa-plus')
              .click() //打開widget
            console.log('***get data so stop***')
            return true
          } else {
            console.log('not get data...')
            return false
          }
          //var modaArray = data[0]['G_MODA()'].values[0];
        },
      })

      function getURLParameter(name, url) {
        //location.href
        return (
          decodeURIComponent(
            (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
              url
            ) || [null, ''])[1].replace(/\+/g, '%20')
          ) || null
        )
      }
    }
    monitor()
  })()
  /*<th>i18n_ServCloud_Time</th>
<th>i18n_ServCloud_Message_Code</th>
<th>i18n_ServCloud_Message_Description</th>*/
  // load all flot plugins
}
