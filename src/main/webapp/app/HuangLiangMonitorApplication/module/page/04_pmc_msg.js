import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  pageSetUp()
  ;(function () {
    var monitor = function () {
      var monitorCmd = {
        //box監控命令
        name: 'pmc_rdpmcrng',
        cycleType: 'count',
        cycleValue: 1,
        timeout: 0,
        items: [
          {
            signal: {
              id: 'G_PMCY',
              inputs: { P_PARAM: 'X', P_NUMBER: 1, P_COUNT: 100 },
            },
            collect: { waitMs: 0, count: 1 },
          },
        ],
      }
      //console.log(monitorCmd.items[0].signal.inputs.P_PARAM);
      var tableHeadColumns = [
        { id: 'address', name: `${i18n('Address')}` },
        { id: 'bit7', name: '7 bit' },
        { id: 'bit6', name: '6 bit' },
        { id: 'bit5', name: '5 bit' },
        { id: 'bit4', name: '4 bit' },
        { id: 'bit3', name: '3 bit' },
        { id: 'bit2', name: '2 bit' },
        { id: 'bit1', name: '1 bit' },
        { id: 'bit0', name: '0 bit' },
        { id: 'dec', name: `${i18n('DEC')}` },
      ]

      var tableOptions = {
        sDom:
          "<'dt-toolbar'<'col-xs-12 col-sm-6 table-search'f>r>" +
          't' +
          "<'dt-toolbar-footer'<'col-xs-12 col-sm-4 hidden-xs'l><'col-xs-12 col-sm-4 hidden-xs'i><'col-xs-12 col-sm-4'p>>",
        columns: [
          { className: 'text-right' },
          { className: 'text-center' },
          { className: 'text-center' },
          { className: 'text-center' },
          { className: 'text-center' },
          { className: 'text-center' },
          { className: 'text-center' },
          { className: 'text-center' },
          { className: 'text-center' },
          { className: 'text-right' },
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

      //"G_PMCY(" + signal + "," + startNumber + "," + (parseInt(endNumber) + parseInt(startNumber) - 1)
      var startNumber = $('#startNumber').val()
      var endNumber = $('#endNumber').val()

      var signal = $('#signal option:selected').val()
      var byteMode = $('#byteMode option:selected').attr('value')

      //console.log(startNumber);
      //console.log(endNumber);
      //console.log(signal);
      //console.log(byteMode);

      //長header
      servkit.monitor({
        type: 'HEAD',
        monitorHeadId: 'monitorHeader',
        boxId: boxId,
        machineId: machineId,
      })
      sendAndGetGCodeValue(monitorCmd, signal, startNumber, endNumber, byteMode)

      //按下查詢後執行
      $('#submitForm').on('click', function () {
        var startNumber = $('#startNumber').val()
        var endNumber = $('#endNumber').val()

        var signal = $('#signal option:selected').val()
        var byteMode = $('#byteMode option:selected').attr('value')

        console.log(startNumber)
        console.log(endNumber)
        console.log(signal)
        console.log(byteMode)
        //console.log(monitorCmd.items[0].signal.inputs.P_PARAM);
        monitorCmd.items[0].signal.inputs.P_PARAM = signal
        monitorCmd.items[0].signal.inputs.P_NUMBER = parseInt(startNumber)
        monitorCmd.items[0].signal.inputs.P_COUNT =
          parseInt(endNumber) + parseInt(startNumber) - 1

        sendAndGetGCodeValue(
          monitorCmd,
          signal,
          startNumber,
          endNumber,
          byteMode
        )
        return false
      })

      function sendAndGetGCodeValue(
        monitorCmd,
        signal,
        startNumber,
        endNumber,
        byteMode
      ) {
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
            //"G_PMCY(" + signal + "," + startNumber + "," + (parseInt(endNumber) + parseInt(startNumber) - 1)
            var gCodeKey =
              'G_PMCY(' +
              signal +
              ',' +
              startNumber +
              ',' +
              (parseInt(endNumber) + parseInt(startNumber) - 1) +
              ')'
            console.log(gCodeKey)
            if (data[gCodeKey]) {
              var pmcyArray = data[gCodeKey].values[0]
              var matrix = []
              _.each(pmcyArray, function (ele, index) {
                var array = ele.split('|')
                var bits = setBitValue(array[1])
                if (0 == (index + 1) % byteMode) {
                  //根據byte顯示模式顯示
                  //key, value(8bit), value(十進位)
                  matrix.push([
                    array[0],
                    bits['bit7'],
                    bits['bit6'],
                    bits['bit5'],
                    bits['bit4'],
                    bits['bit3'],
                    bits['bit2'],
                    bits['bit1'],
                    bits['bit0'],
                    array[1],
                  ])
                }
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

              console.log('***get data so stop***')
              return true
            } else {
              console.log('not get data...')
              return false
            }
            //var modaArray = data[0]['G_MODA()'].values[0];
          },
        })
      }

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

      function setBitValue(value) {
        var bits = {}
        //console.log(value + ":" + (parseInt(value, 10) >>> 0).toString(2));
        var bit = (parseInt(value, 10) >>> 0)
          .toString(2)
          .replace(/0/g, '─')
          .replace(/1/g, '|')
        var bitLength = bit.length
        for (var bitIndex = 0; bitIndex < 8; bitIndex++) {
          if (bit[bitIndex] != null) {
            switch (bitIndex) {
              case 0:
                bits['bit0'] = bit[bitLength - bitIndex - 1]
                break
              case 1:
                bits['bit1'] = bit[bitLength - bitIndex - 1]
                break
              case 2:
                bits['bit2'] = bit[bitLength - bitIndex - 1]
                break
              case 3:
                bits['bit3'] = bit[bitLength - bitIndex - 1]
                break
              case 4:
                bits['bit4'] = bit[bitLength - bitIndex - 1]
                break
              case 5:
                bits['bit5'] = bit[bitLength - bitIndex - 1]
                break
              case 6:
                bits['bit6'] = bit[bitLength - bitIndex - 1]
                break
              case 7:
                bits['bit7'] = bit[bitLength - bitIndex - 1]
                break
            }
          } else {
            switch (bitIndex) {
              case 0:
                bits['bit0'] = '─'
                break
              case 1:
                bits['bit1'] = '─'
                break
              case 2:
                bits['bit2'] = '─'
                break
              case 3:
                bits['bit3'] = '─'
                break
              case 4:
                bits['bit4'] = '─'
                break
              case 5:
                bits['bit5'] = '─'
                break
              case 6:
                bits['bit6'] = '─'
                break
              case 7:
                bits['bit7'] = '─'
                break
            }
          }
        }
        return bits
      }
    }
    monitor()
  })()

  // load all flot plugins
}
