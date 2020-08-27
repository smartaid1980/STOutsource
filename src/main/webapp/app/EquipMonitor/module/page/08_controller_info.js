import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  pageSetUp()
  ;(function () {
    var monitor = function () {
      var monitorCmd = {
        //box監控命令
        name: 'cnc_Version',
        cycleType: 'count',
        cycleValue: 1,
        timeout: 0,
        items: [
          {
            signal: {
              id: 'G_SYSM',
            },
            collect: {
              waitMs: 0,
              count: 1,
            },
          }, //機械座標
        ],
      }

      var tableHeadColumns = [
        {
          id: 'system1',
          name: `${i18n('System')}`,
        },
        {
          id: 'name1',
          name: `${i18n('Name')}`,
        },
        {
          id: 'id11',
          name: 'Id-1',
        },
        {
          id: 'id12',
          name: 'Id-2',
        },
        {
          id: 'system2',
          name: `${i18n('System')}`,
        },
        {
          id: 'name2',
          name: `${i18n('Name')}`,
        },
        {
          id: 'id21',
          name: 'Id-1',
        },
        {
          id: 'id22',
          name: 'Id-2',
        },
      ]

      var tableOptions = {
        sDom:
          "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r>" +
          't' +
          "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
        columns: [
          {
            className: 'text-left',
          },
          {
            className: 'text-left',
          },
          {
            className: 'text-left',
          },
          {
            className: 'text-left',
          },
          {
            className: 'text-left',
          },
          {
            className: 'text-left',
          },
          {
            className: 'text-left',
          },
          {
            className: 'text-left',
          },
        ],
        autoWidth: true,
        paging: false,
        ordering: false,
        lengthChange: false,
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

          if (data['G_SYSM()']) {
            console.log(JSON.stringify(data['G_SYSM()']))
            var systemMsgArray = JSON.parse(data['G_SYSM()'].values[0][0]) //怎麼會變字串的陣列 = =|||
            //var systemMsgArray = data["G_SYSM()"].values[0];

            var systemObj = {
              'System Software': [],
              'System Hardware': [],
            }

            var firstSystemMsg, secondSystemMsg
            if (systemMsgArray[0].indexOf('System Software') > -1) {
              firstSystemMsg = 'System Software'
              secondSystemMsg = 'System Hardware'
            } else if (systemMsgArray[0].indexOf('System Hardware') > -1) {
              firstSystemMsg = 'System Hardware'
              secondSystemMsg = 'System Software'
            }
            var isFirstSystemMsg = true
            _.each(systemMsgArray, function (ele, index) {
              if (index > 0) {
                //略過第一個(因為是名稱)
                if (ele.indexOf(secondSystemMsg) > -1) {
                  isFirstSystemMsg = false
                  return true
                }
                if (isFirstSystemMsg) {
                  systemObj[firstSystemMsg].push(ele)
                } else {
                  systemObj[secondSystemMsg].push(ele)
                }
              }
            })
            console.log(systemObj['System Software'])
            console.log(systemObj['System Hardware'])
            var tableLength = 1
            if (systemObj['System Software'].length > tableLength) {
              tableLength = systemObj['System Software'].length
            }
            if (systemObj['System Hardware'].length > tableLength) {
              tableLength = systemObj['System Hardware'].length
            }
            //init matrix;
            var matrix = []
            for (var index = 0; index < tableLength; index++) {
              matrix.push(['', '', '', '', '', '', '', ''])
            }
            matrix[0][0] = 'System Software'
            matrix[0][4] = 'System Hardware'

            _.each(systemObj['System Software'], function (rowEle, rowIndex) {
              var array = rowEle.split('|')
              _.each(array, function (value, colIndex) {
                matrix[rowIndex][colIndex + 1] = value
              })
            })
            _.each(systemObj['System Hardware'], function (rowEle, rowIndex) {
              var array = rowEle.split('|')
              _.each(array, function (value, colIndex) {
                matrix[rowIndex][colIndex + 5] = value
              })
            })

            tableOptions['data'] = matrix

            servkit.monitor.tool({
              type: 'TABLE',
              config: {
                id: 'response-data-table',
                headColumns: tableHeadColumns,
                options: tableOptions,
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

      //按下查詢後執行
      $('#submitForm').on('click', function () {
        var startNumber = $('#startNumber').val()
        var endNumber = $('#endNumber').val()
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

  // var colNames = ["i18n_ServCloud_System","i18n_ServCloud_Name","Id-1","Id-2","i18n_ServCloud_System","i18n_ServCloud_Name","Id-1","Id-2"];
  // load all flot plugins
}
