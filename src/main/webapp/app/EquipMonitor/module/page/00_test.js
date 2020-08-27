export default function () {
  pageSetUp()
  ;(function () {
    var monitor = function () {
      var cmd = {
        version: 'v1.0',
        from: 'platformId',
        to: 'boxId',
        type: 'Fetch',
        replies: [
          {
            type: 'Storage',
            reply: 'platformId',
          },
        ],
        machine: 'machineId',
        command: {
          name: 'cnc_Information',
          cycleType: 'count',
          cycleValue: 0,
          timeout: 0,
          items: [
            {
              signal: {
                id: 'G_POSM',
              },
              collect: {
                waitMs: 0,
                count: 1,
              },
            },
          ],
        },
      }
      $('#submit').on('click', function () {
        var ip = $('#ip').val()
        var port = $('#port').val()
        var boxId = $('#boxId').val()
        var machineId = $('#machineId').val()
        var command = $('#command').val()

        cmd.command = JSON.parse(command)

        var ajaxData = {
          ip: ip,
          port: parseInt(port),
          boxId: boxId,
          machineId: machineId,
          command: JSON.stringify(cmd),
        }

        //送監控命令
        servkit.ajax(
          {
            url: 'api/command/sendTest',
            type: 'POST',
            //contentType: 'application/json',
            data: ajaxData,
          },
          {
            success: function () {
              //收資料
              servkit.subscribe('Storage', {
                machines: [machineId],
                handler: function (data) {
                  var boxData = JSON.parse(data[machineId]) //選擇machine
                  $('#result').val(JSON.stringify(boxData))
                },
              })
            },
            fail: function () {
              alert('fail')
            },
          }
        )
      })
    }
    monitor()
    //servkit.requireJs(monitor);
  })()
}
