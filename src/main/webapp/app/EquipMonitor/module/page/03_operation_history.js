import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  pageSetUp()
  ;(function () {
    var monitor = function () {
      var monitorCmd = {
        //box監控命令
        name: 'cnc_OPHistory',
        cycleType: 'count',
        cycleValue: 1,
        timeout: 0,
        items: [
          {
            signal: {
              id: 'G_OPMG',
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
          id: 'number',
          name: `${i18n('Number')}`,
        },
        {
          id: 'opDesc',
          name: `${i18n('Operation_Description')}`,
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
        ],
        autoWidth: true,
        ordering: false,
        //"paging": false,
        //"lengthChange": false
      }

      var theHref = location.href
      var boxId = getURLParameter('boxId', theHref)
      var machineId = getURLParameter('machineId', theHref)
      //用來暫存從box取得的結果(在前端查詢參數時會需要使用)
      var resultMap

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
        //monitorGCodes: ["G_AAMH()"],
        timeoutLimit: 9000,
        customCallback: function (data) {
          //客製化
          console.log('---------------------')
          console.log(JSON.stringify(data))
          console.log('---------------------')

          if (data['G_OPMG()']) {
            //data = {"G_OPMG()":{"type":"STRING","values":[["89|2015/09/24   12:10:08    Event Type:Power off","90|2015/09/24   12:10:17    Event Type:Power on","91|2015/09/24   14:22:39    Event Type:Power off","92|2015/09/24   14:26:33    Event Type:Power on","93|2015/09/25   00:00:00    Event Type:Change date","94|2015/09/26   00:00:00    Event Type:Change date","95|2015/09/27   00:00:00    Event Type:Change date","96|2015/09/28   00:00:00    Event Type:Change date","97|2015/09/29   00:00:00    Event Type:Change date","98|2015/09/30   00:00:00    Event Type:Change date","99|2015/09/30   14:44:08    Event Type:Power off","100|2015/09/30   14:45:23    Event Type:Power on","101|2015/10/01   00:00:00    Event Type:Change date","102|2015/10/02   00:00:00    Event Type:Change date","103|2015/10/03   00:00:00    Event Type:Change date","104|2015/10/04   00:00:00    Event Type:Change date","105|2015/10/05   00:00:00    Event Type:Change date","106|2015/10/06   00:00:00    Event Type:Change date","107|2015/10/07   00:00:00    Event Type:Change date","108|2015/10/08   00:00:00    Event Type:Change date"]]}};
            resultMap = {} //清空上一次的結果

            var opHistory = data['G_OPMG()']
            var mapArray = []
            _.each(opHistory.values[0], function (ele) {
              var array = ele.split('|')
              mapArray.push(array)
              resultMap[array[0]] = array //將結果存成 {號碼:[號碼, 操作說明]}
            })
            //console.log("////////////////////////////////////");
            //mapArray = [["B"]];
            //是[["B"]]就幫補一欄，避免datatable發生錯誤
            if (mapArray.length > 0 && mapArray[0].length <= 1) {
              for (var index = 0; index < mapArray.length; index++) {
                mapArray[0].push(' ')
              }
            }
            console.log(JSON.stringify(mapArray))

            tableOptions['data'] = mapArray

            servkit.monitor.tool({
              type: 'TABLE',
              config: {
                id: 'response-data-table',
                headColumns: tableHeadColumns,
                options: tableOptions,
              },
            })
            //查詢區間預設值
            $('#startNumber').val(mapArray[0][0]) //第1碼
            $('#endNumber').val(mapArray[mapArray.length - 1][0]) //第2碼

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
        if (!isNaN(startNumber) && !isNaN(endNumber)) {
          var range = []
          for (
            var number = parseInt(startNumber);
            number <= parseInt(endNumber);
            number++
          ) {
            range.push(number)
          }
          var searchResultMatrix = [] //重新組資料
          _.each(range, function (ele) {
            if (resultMap[ele.toString()]) {
              //將有存在的資料放入matrix
              searchResultMatrix.push(resultMap[ele.toString()])
            }
          })
          $('#response-data-table').DataTable().clear().draw() //清除datatable資料
          $('#response-data-table')
            .DataTable()
            .rows.add(searchResultMatrix)
            .draw() //重新放入資料到datatable
          //使用regex取區間數值 (舊方法，現在不使用)
          //$("#response-data-table").DataTable().columns(0).search(range.join("|"), true, false, true).draw();
        } else {
          console.warn('startNumber or endNumber is not number!')
        }

        return false //不跳轉頁面
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
}
