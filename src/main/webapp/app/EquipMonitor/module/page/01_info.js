export default function () {
  pageSetUp()
  ;(function () {
    $('#main').removeClass('margin-right')
    servkit.ajax(
      {
        url: 'api/ipCam/query',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          device_id: getURLParameter('machineId', location.href),
        }),
      },
      {
        success: function (data) {
          if (!_.isEmpty(data)) {
            servkit.ipCamDrawer().attach(data)
          }
        },
      }
    )

    var monitor = function () {
      //中興電工Demo用假座標
      var chemDemo = false
      var chemDemoMonitorCount = 0

      //單位為次數，執行幾次後做更新
      var workshiftUpdateFreq = 600
      var monitorCount = 0

      var currentWorkShiftPowerTime //班次的通電累計
      var currentWorkShiftOperTime //班次的運轉累計
      var currentWorkShiftCutTime //班次的切削累計

      var currentWorkShiftName //班次名稱
      var currentWorkShiftPartCount //班次的partcount

      var theHref = location.href
      var boxId = getURLParameter('boxId', theHref)
      var machineId = getURLParameter('machineId', theHref)
      var cncBrand = getURLParameter('cncBrand', theHref)

      var isMutiSystem = cncBrand == 'FANUC_CNC_FOCAS' // = true;//是否是多系統
      //      if(cncBrand == "FANUC_CNC_FOCAS"){
      //        isMutiSystem = true;
      //      }else{
      //        isMutiSystem = false;
      //      }

      //預設為單系統，所以要隱藏系統2 tab
      $('[href="#system2"]').closest('li').hide()

      var singleMonitorCmd = {
        //box監控命令(單系統)
        name: 'cnc_Information',
        cycleType: 'count',
        cycleValue: -1,
        timeout: 1800000,
        items: [
          { signal: { id: 'G_SYSC' }, collect: { waitMs: 1000, count: 1 } }, //系統個數 (***重要，用來辨識有幾個系統)
          { signal: { id: 'G_POSM' }, collect: { waitMs: 1000, count: 1 } }, //機械座標
          { signal: { id: 'G_POSR' }, collect: { waitMs: 1000, count: 1 } }, //相對座標
          { signal: { id: 'G_POSA' }, collect: { waitMs: 1000, count: 1 } }, //絕對座標
          { signal: { id: 'G_POSD' }, collect: { waitMs: 1000, count: 1 } }, //剩餘距離
          { signal: { id: 'G_ELCT' }, collect: { waitMs: 1000, count: 1 } }, //通電時間
          { signal: { id: 'G_CUTT' }, collect: { waitMs: 1000, count: 1 } }, //切削時間
          { signal: { id: 'G_OPRT' }, collect: { waitMs: 1000, count: 1 } }, //運轉時間
          { signal: { id: 'G_CYCT' }, collect: { waitMs: 1000, count: 1 } }, //循環時間
          { signal: { id: 'G_PSCP' }, collect: { waitMs: 1000, count: 1 } }, //加工零件數
          { signal: { id: 'G_TOCP' }, collect: { waitMs: 1000, count: 1 } }, //加工零件總數
          { signal: { id: 'G_USCP' }, collect: { waitMs: 1000, count: 1 } }, //所需零件數
          { signal: { id: 'G_MODA' }, collect: { waitMs: 1000, count: 1 } }, //G code; Modal code
          { signal: { id: 'G_EXEP' }, collect: { waitMs: 1000, count: 1 } }, //目前執行單節
          { signal: { id: 'G_ACTS' }, collect: { waitMs: 1000, count: 1 } }, //主軸實際轉速
          { signal: { id: 'G_SPMS' }, collect: { waitMs: 1000, count: 1 } }, //主軸命令轉速
          { signal: { id: 'G_SPSO' }, collect: { waitMs: 1000, count: 1 } }, //主軸轉速百分比
          { signal: { id: 'G_STAT' }, collect: { waitMs: 1000, count: 1 } }, //控制器端狀態
          { signal: { id: 'G_PRGR' }, collect: { waitMs: 1000, count: 1 } }, //執行中程式號碼
          { signal: { id: 'G_PRGM' }, collect: { waitMs: 1000, count: 1 } }, //主程式號碼
          { signal: { id: 'G_SEQN' }, collect: { waitMs: 1000, count: 1 } }, //目前執行序列號
          { signal: { id: 'G_SRNE' }, collect: { waitMs: 1000, count: 1 } }, //伺服軸名稱
          { signal: { id: 'G_PSUT' }, collect: { waitMs: 1000, count: 1 } }, //座標單位
          { signal: { id: 'G_FRUT' }, collect: { waitMs: 1000, count: 1 } }, //進給率單位
          { signal: { id: 'G_ACTF' }, collect: { waitMs: 1000, count: 1 } }, //實際進給率
          { signal: { id: 'G_FERP' }, collect: { waitMs: 1000, count: 1 } }, //進給率百分比
          { signal: { id: 'G_SRMC' }, collect: { waitMs: 1000, count: 1 } }, //伺服軸負載
          { signal: { id: 'G_SPMC' }, collect: { waitMs: 1000, count: 1 } }, //主軸負載
        ],
      }

      var multiMonitorCmd = {
        //box監控命令(多系統)
        name: 'cnc_Information_multiSystem',
        cycleType: 'count',
        cycleValue: -1,
        timeout: 1800000,
        items: [
          { signal: { id: 'G_SYSC' }, collect: { waitMs: 1000, count: 1 } }, //系統個數 (***重要，用來辨識有幾個系統)
          { signal: { id: 'G_MPOSM' }, collect: { waitMs: 1000, count: 1 } }, //機械座標 (多系統)
          { signal: { id: 'G_MPOSR' }, collect: { waitMs: 1000, count: 1 } }, //相對座標 (多系統)
          { signal: { id: 'G_MPOSA' }, collect: { waitMs: 1000, count: 1 } }, //絕對座標 (多系統)
          { signal: { id: 'G_MPOSD' }, collect: { waitMs: 1000, count: 1 } }, //剩餘距離 (多系統)
          { signal: { id: 'G_ELCT' }, collect: { waitMs: 1000, count: 1 } }, //通電時間
          { signal: { id: 'G_CUTT' }, collect: { waitMs: 1000, count: 1 } }, //切削時間
          { signal: { id: 'G_OPRT' }, collect: { waitMs: 1000, count: 1 } }, //運轉時間
          { signal: { id: 'G_CYCT' }, collect: { waitMs: 1000, count: 1 } }, //循環時間
          { signal: { id: 'G_PSCP' }, collect: { waitMs: 1000, count: 1 } }, //加工零件數
          { signal: { id: 'G_TOCP' }, collect: { waitMs: 1000, count: 1 } }, //加工零件總數
          { signal: { id: 'G_USCP' }, collect: { waitMs: 1000, count: 1 } }, //所需零件數
          { signal: { id: 'G_MODA' }, collect: { waitMs: 1000, count: 1 } }, //G code; Modal code
          { signal: { id: 'G_MEXEP' }, collect: { waitMs: 1000, count: 1 } }, //目前執行單節 (多系統)
          { signal: { id: 'G_ACTS' }, collect: { waitMs: 1000, count: 1 } }, //主軸實際轉速
          { signal: { id: 'G_SPMS' }, collect: { waitMs: 1000, count: 1 } }, //主軸命令轉速
          { signal: { id: 'G_SPSO' }, collect: { waitMs: 1000, count: 1 } }, //主軸轉速百分比
          { signal: { id: 'G_STAT' }, collect: { waitMs: 1000, count: 1 } }, //控制器端狀態
          { signal: { id: 'G_PRGR' }, collect: { waitMs: 1000, count: 1 } }, //執行中程式號碼
          { signal: { id: 'G_PRGM' }, collect: { waitMs: 1000, count: 1 } }, //主程式號碼
          { signal: { id: 'G_SEQN' }, collect: { waitMs: 1000, count: 1 } }, //目前執行序列號
          { signal: { id: 'G_MSRNE' }, collect: { waitMs: 1000, count: 1 } }, //伺服軸名稱 (多系統)
          { signal: { id: 'G_PSUT' }, collect: { waitMs: 1000, count: 1 } }, //座標單位
          { signal: { id: 'G_FRUT' }, collect: { waitMs: 1000, count: 1 } }, //進給率單位
          { signal: { id: 'G_ACTF' }, collect: { waitMs: 1000, count: 1 } }, //實際進給率
          { signal: { id: 'G_FERP' }, collect: { waitMs: 1000, count: 1 } }, //進給率百分比
          { signal: { id: 'G_SRMC' }, collect: { waitMs: 1000, count: 1 } }, //伺服軸負載
          { signal: { id: 'G_SPMC' }, collect: { waitMs: 1000, count: 1 } }, //主軸負載
        ],
      }

      /*
     scalar:{id:"xxx", gCode:"xxx()", callback:xxx()}
     matrix: {id:"xxx", gCode:"xxx()", callback:xxx()} //未實作
     array: {id:"xxx", gCode:"xxx()", callback:xxx(), tr:true, rowLimit:4} //未實作
     map:   {id:"xxx", gCode:"xxx()", callback:xxx(), tr:true, rowLimit:4, gCodeKey:xxx, gCodeValue:xxx}
     */

      var singleMonitorParams = [
        //html長資料方式(單系統)
        { type: 'map', ids: ['G_STAT'], gCode: 'G_STAT()', tr: true }, //控制器端狀態列

        {
          type: 'map',
          ids: ['G_POSA'],
          gCodeKey: 'G_SRNE()',
          gCodeValue: 'G_POSA()',
          tr: false,
        }, //絕對座標
        {
          type: 'map',
          ids: ['G_POSM'],
          gCodeKey: 'G_SRNE()',
          gCodeValue: 'G_POSM()',
          tr: false,
        }, //機械座標
        {
          type: 'map',
          ids: ['G_POSR'],
          gCodeKey: 'G_SRNE()',
          gCodeValue: 'G_POSR()',
          tr: false,
        }, //相對座標
        {
          type: 'map',
          ids: ['G_POSD'],
          gCodeKey: 'G_SRNE()',
          gCodeValue: 'G_POSD()',
          tr: false,
        }, //剩餘距離

        { type: 'scalar', ids: ['G_POSA_G_PSUT'], gCode: 'G_PSUT()' }, //絕對座標單位
        { type: 'scalar', ids: ['G_POSM_G_PSUT'], gCode: 'G_PSUT()' }, //機械座標單位
        { type: 'scalar', ids: ['G_POSR_G_PSUT'], gCode: 'G_PSUT()' }, //相對座標單位
        { type: 'scalar', ids: ['G_POSD_G_PSUT'], gCode: 'G_PSUT()' }, //剩餘距離單位

        {
          type: 'scalar',
          ids: ['G_TOCP'],
          gCode: 'G_TOCP()',
          callback: convertPartCount,
        }, //加工元件總數
        { type: 'scalar', ids: ['G_USCP'], gCode: 'G_USCP()' }, //加工元件請求
        { type: 'scalar', ids: ['G_PSCP'], gCode: 'G_PSCP()' }, //加工元件數量

        { type: 'scalar', ids: ['G_ACTF'], gCode: 'G_ACTF()' }, //伺服軸實際進給率
        { type: 'scalar', ids: ['G_FERP'], gCode: 'G_FERP()' }, //伺服軸進給率百分比
        { type: 'scalar', ids: ['G_SRMC'], gCode: 'G_SRMC()' }, //伺服軸負載
        { type: 'scalar', ids: ['G_ACTS'], gCode: 'G_ACTS()' }, //主軸實際轉速
        { type: 'scalar', ids: ['G_SPMS'], gCode: 'G_SPMS()' }, //主軸命令轉速
        { type: 'scalar', ids: ['G_SPSO'], gCode: 'G_SPSO()' }, //主軸轉速百分比
        { type: 'scalar', ids: ['G_SPMC'], gCode: 'G_SPMC()' }, //主軸負載

        { type: 'scalar', ids: ['G_PRGM'], gCode: 'G_PRGM()' }, //程式名稱
        { type: 'scalar', ids: ['G_SEQN'], gCode: 'G_SEQN()' }, //行號
        { type: 'scalar', ids: ['G_EXEP'], gCode: 'G_EXEP()' }, //執行單節

        {
          type: 'scalar',
          ids: ['G_ELCT'],
          gCode: 'G_ELCT()',
          callback: convertTime,
          callbackParam: { showUnit: 'hour', code: 'G_ELCT' },
        }, //通電時間
        {
          type: 'scalar',
          ids: ['G_CUTT'],
          gCode: 'G_CUTT()',
          callback: convertTime,
          callbackParam: { showUnit: 'hour', code: 'G_CUTT' },
        }, //切削時間
        {
          type: 'scalar',
          ids: ['G_CYCT'],
          gCode: 'G_CYCT()',
          callback: convertTime,
          callbackParam: { showUnit: 'hour', code: 'G_CYCT' },
        }, //循環時間
        {
          type: 'scalar',
          ids: ['G_OPRT'],
          gCode: 'G_OPRT()',
          callback: convertTime,
          callbackParam: { showUnit: 'hour', code: 'G_OPRT' },
        }, //運轉時間
      ]

      var multiMonitorParams = [
        //html長資料方式(多系統)
        {
          type: 'map',
          ids: ['G_STAT', 'G_STAT2'],
          gCode: 'G_STAT()',
          tr: true,
        }, //控制器端狀態列

        {
          type: 'map',
          ids: ['G_POSA', 'G_POSA2'],
          gCodeKey: 'G_MSRNE()',
          gCodeValue: 'G_MPOSA()',
          tr: false,
        }, //絕對座標 (多系統)
        {
          type: 'map',
          ids: ['G_POSM', 'G_POSM2'],
          gCodeKey: 'G_MSRNE()',
          gCodeValue: 'G_MPOSM()',
          tr: false,
        }, //機械座標 (多系統)
        {
          type: 'map',
          ids: ['G_POSR', 'G_POSR2'],
          gCodeKey: 'G_MSRNE()',
          gCodeValue: 'G_MPOSR()',
          tr: false,
        }, //相對座標 (多系統)
        {
          type: 'map',
          ids: ['G_POSD', 'G_POSD2'],
          gCodeKey: 'G_MSRNE()',
          gCodeValue: 'G_MPOSD()',
          tr: false,
        }, //剩餘距離 (多系統)

        {
          type: 'scalar',
          ids: ['G_POSA_G_PSUT', 'G_POSA_G_PSUT2'],
          gCode: 'G_PSUT()',
        }, //絕對座標單位
        {
          type: 'scalar',
          ids: ['G_POSM_G_PSUT', 'G_POSM_G_PSUT2'],
          gCode: 'G_PSUT()',
        }, //機械座標單位
        {
          type: 'scalar',
          ids: ['G_POSR_G_PSUT', 'G_POSR_G_PSUT2'],
          gCode: 'G_PSUT()',
        }, //相對座標單位
        {
          type: 'scalar',
          ids: ['G_POSD_G_PSUT', 'G_POSD_G_PSUT2'],
          gCode: 'G_PSUT()',
        }, //剩餘距離單位

        {
          type: 'scalar',
          ids: ['G_TOCP', 'G_TOCP2'],
          gCode: 'G_TOCP()',
          callback: convertPartCount,
        }, //加工元件總數
        { type: 'scalar', ids: ['G_USCP', 'G_USCP2'], gCode: 'G_USCP()' }, //加工元件請求
        { type: 'scalar', ids: ['G_PSCP', 'G_PSCP2'], gCode: 'G_PSCP()' }, //加工元件數量

        { type: 'scalar', ids: ['G_ACTF', 'G_ACTF2'], gCode: 'G_ACTF()' }, //伺服軸實際進給率
        { type: 'scalar', ids: ['G_FERP', 'G_FERP2'], gCode: 'G_FERP()' }, //伺服軸進給率百分比
        { type: 'scalar', ids: ['G_SRMC', 'G_SRMC2'], gCode: 'G_SRMC()' }, //伺服軸負載
        { type: 'scalar', ids: ['G_ACTS', 'G_ACTS2'], gCode: 'G_ACTS()' }, //主軸實際轉速
        { type: 'scalar', ids: ['G_SPMS', 'G_SPMS2'], gCode: 'G_SPMS()' }, //主軸命令轉速
        { type: 'scalar', ids: ['G_SPSO', 'G_SPSO2'], gCode: 'G_SPSO()' }, //主軸轉速百分比
        { type: 'scalar', ids: ['G_SPMC', 'G_SPMC2'], gCode: 'G_SPMC()' }, //主軸負載

        { type: 'scalar', ids: ['G_PRGM', 'G_PRGM2'], gCode: 'G_PRGM()' }, //程式名稱
        { type: 'scalar', ids: ['G_SEQN', 'G_SEQN2'], gCode: 'G_SEQN()' }, //行號
        { type: 'scalar', ids: ['G_EXEP', 'G_EXEP2'], gCode: 'G_MEXEP()' }, //執行單節 (多系統)

        {
          type: 'scalar',
          ids: ['G_ELCT', 'G_ELCT2'],
          gCode: 'G_ELCT()',
          callback: convertTime,
          callbackParam: { showUnit: 'hour', code: 'G_ELCT' },
        }, //通電時間
        {
          type: 'scalar',
          ids: ['G_CUTT', 'G_CUTT2'],
          gCode: 'G_CUTT()',
          callback: convertTime,
          callbackParam: { showUnit: 'hour', code: 'G_CUTT' },
        }, //切削時間
        {
          type: 'scalar',
          ids: ['G_CYCT', 'G_CYCT2'],
          gCode: 'G_CYCT()',
          callback: convertTime,
          callbackParam: { showUnit: 'hour', code: 'G_CYCT' },
        }, //循環時間
        {
          type: 'scalar',
          ids: ['G_OPRT', 'G_OPRT2'],
          gCode: 'G_OPRT()',
          callback: convertTime,
          callbackParam: { showUnit: 'hour', code: 'G_OPRT' },
        }, //運轉時間
      ]

      //box監控命令   html長資料方式
      var monitorCmd, monitorParams //
      if (isMutiSystem) {
        monitorCmd = multiMonitorCmd
        monitorParams = multiMonitorParams
      } else {
        monitorCmd = singleMonitorCmd
        monitorParams = singleMonitorParams
      }

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
        type: 'MONITOR',
        boxId: boxId,
        machineId: machineId,
        monitorCmd: monitorCmd,
        monitorCmdVersion: 'v1.0',
        monitorParams: monitorParams,
        customCallback: function (data) {
          //客製化
          //console.log("---------------------");
          //console.log(JSON.stringify(data));
          //console.log("---------------------");

          if (chemDemo) {
            chemDemoMonitorCount++
            chemDemoFakeCoordinate(data, chemDemoMonitorCount)
          }

          if (servkit.configUseShiftdata()) {
            //是否使用班次時間去減資料
            monitorCount++
            if (monitorCount % workshiftUpdateFreq == 1) {
              updateCurShift(updateShiftData, machineId)
            }
          }

          //判斷是不是多系統，若兩個系統以上就顯示系統2的tab
          var hasSecondSystem = false
          var SYSTEM_COUNT_G_CODE = 'G_SYSC()' //看有幾個系統
          //console.log(data[SYSTEM_COUNT_G_CODE]);
          if (data[SYSTEM_COUNT_G_CODE]) {
            if (!isNaN(data[SYSTEM_COUNT_G_CODE].values[0][0])) {
              if (data[SYSTEM_COUNT_G_CODE].values[0][0] >= 2) {
                hasSecondSystem = true
              }
            }
          }
          if (hasSecondSystem) {
            $('[href="#system2"]').closest('li').show()
          } else {
            $('[href="#system2"]').closest('li').hide()
          }

          //將G_MODA拆成兩個table
          if (data['G_MODA()']) {
            var modaArray = data['G_MODA()'].values[0]

            var modalOtherCodeMatrix = [] //放Modal other code
            var modalGCodeArray = [] //放Modal G-code
            _.each(modaArray, function (ele) {
              var keyValue = ele.split('|')
              if (keyValue[0] !== 'G') {
                //不是G表示Modal other code
                modalOtherCodeMatrix.push([keyValue[0], keyValue[1]])
              } else {
                //G表示Modal G-code
                modalGCodeArray = keyValue[1]
                  .replace(/"/g, '')
                  .replace('[', '')
                  .replace(']', '')
                  .split(',')
              }
            })
            //console.log(modalOtherCodeMatrix);
            //console.log(modalGCodeArray);
            //系統1
            buildTableTrTd($('#G_MODA'), modalOtherCodeMatrix)
            buildTableTrTd($('#G_MODA-G'), array2Matrix(modalGCodeArray, 7))
            //系統2
            buildTableTrTd($('#G_MODA2'), modalOtherCodeMatrix)
            buildTableTrTd($('#G_MODA-G2'), array2Matrix(modalGCodeArray, 7))
          }

          function array2Matrix(array, colLimit) {
            var matrix = []
            var tempArray = []
            _.each(array, function (ele, index) {
              if (index % colLimit == colLimit - 1) {
                tempArray.push(ele)
                matrix.push(tempArray.slice())
                tempArray = []
              } else {
                tempArray.push(ele)
              }
            })
            if (tempArray.length > 0) {
              //還有值
              for (var index = tempArray.length; index < colLimit; index++) {
                //補空白
                tempArray.push('')
              }
              matrix.push(tempArray.slice())
            }
            return matrix
          }

          function buildTableTrTd($table, matrix) {
            var tdClass = $table.attr('tdClass')
            //判斷是否有套用css
            if (typeof tdClass === 'undefined') {
              tdClass = ''
            }
            $table.html('') //清空前一筆
            for (var i = 0; i < matrix.length; i++) {
              var $tr = $('<tr></tr>')
              for (var j = 0; j < matrix[i].length; j++) {
                //undefined欄位就填空字串
                if (typeof matrix[i][j] === 'undefined') {
                  matrix[i][j] = ''
                }
                if (tdClass.length > 0) {
                  tdClass = "class='" + tdClass + "'"
                }
                var $td = $(
                  '<td id=row' +
                    i +
                    '_col' +
                    j +
                    ' ' +
                    tdClass +
                    '>' +
                    matrix[i][j] +
                    '</td>'
                )
                $tr.append($td)
              }
              $table.append($tr)
            }
          }
        },
      })

      //value是milliSecond
      function convertTime(value, params) {
        //不是數值就使用 --
        if (isNaN(value)) {
          switch (params.showUnit) {
            case 'day':
              t = '-- D -- H -- M -- S '
              break
            case 'hour':
              t = '-- H -- M -- S '
              break
            case 'min':
              t = '-- M -- S '
              break
            case 'second':
              t = '-- S '
              break
            default:
              console.warn('目前尚未定義此種 showUnit = ' + params.showUnit)
          }
          return t
        }
        //根據code去減 (*** 但是需要configUseShiftdata開關有開啟)
        if (servkit.configUseShiftdata() && params['code']) {
          switch (params['code']) {
            case 'G_ELCT': //班次的通電累計
              if (currentWorkShiftPowerTime) {
                var diff = Number(value) - currentWorkShiftPowerTime
                if (diff > 0) {
                  value = diff
                } else {
                  value = 0
                }
                //console.log("currentWorkShiftPowerTime: ", currentWorkShiftPowerTime, value);
              } else {
                //沒班次時間就預設0
                value = 0
              }
              break
            case 'G_OPRT': //班次的運轉累計
              if (currentWorkShiftOperTime) {
                var diff2 = Number(value) - currentWorkShiftOperTime
                if (diff2 > 0) {
                  value = diff2
                } else {
                  value = 0
                }
                //console.log("currentWorkShiftOperTime: ", currentWorkShiftOperTime, value);
              } else {
                //沒班次時間就預設0
                value = 0
              }
              break
            case 'G_CUTT': //班次的切削累計
              if (currentWorkShiftCutTime) {
                var diff3 = Number(value) - currentWorkShiftCutTime
                if (diff3 > 0) {
                  value = diff3
                } else {
                  value = 0
                }
                //console.log("currentWorkShiftCutTime: ", currentWorkShiftCutTime, value);
              } else {
                //沒班次時間就預設0
                value = 0
              }
              break
            default:
            //不處理
          }
        }

        //因為月不準..所以只算到日
        var second = Number(value) / 1000
        var min = second / 60
        var hour = min / 60
        var day = hour / 24

        //整數處理
        second = Math.floor(second)
        min = Math.floor(min)
        hour = Math.floor(hour)
        day = Math.floor(day)

        var hourTemp = hour % 24
        var minTemp = min % 60
        var secondTemp = second % 60

        if (hourTemp.toString().length <= 1) {
          hourTemp = '0' + hourTemp
        }
        if (minTemp.toString().length <= 1) {
          minTemp = '0' + minTemp
        }
        if (secondTemp.toString().length <= 1) {
          secondTemp = '0' + secondTemp
        }

        if (params.showUnit) {
          var t = ''
          switch (params.showUnit) {
            case 'day':
              t =
                day +
                ' D ' +
                hourTemp +
                ' H ' +
                minTemp +
                ' M ' +
                secondTemp +
                ' S '
              break
            case 'hour':
              t = hour + ' H ' + minTemp + ' M ' + secondTemp + ' S '
              break
            case 'min':
              t = min + ' M ' + secondTemp + ' S '
              break
            case 'second':
              t = second + ' S '
              break
            default:
              console.warn('目前尚未定義此種 showUnit = ' + params.showUnit)
          }
        } else {
          t = day + 'D' + hourTemp + 'H' + minTemp + 'M' + secondTemp + 'S'
        }
        return t
      }

      function convertPartCount(value) {
        //不是數值就使用 --
        if (isNaN(value)) {
          return '--'
        }
        //console.log("*****: ", value);
        if (currentWorkShiftPartCount) {
          var diff = Number(value) - currentWorkShiftPartCount
          if (diff > 0) {
            value = diff
          } else {
            value = 0
          }
        }
        return value
      }

      function updateCurShift(callback, machineId) {
        servkit.ajax(
          {
            url: 'api/workshift/now',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (data) {
              //console.log(data);
              if (data && data['start'] && data['name']) {
                var startTime = data['start']
                currentWorkShiftName = data['name']
                callback(machineId, startTime)
              }
            },
          }
        )
      }

      function updateShiftData(machineId, startTime) {
        //console.log(machineId);
        var todayStr = moment().format('YYYYMMDD')
        //****test start****
        //machineId = "_SBD01M01"
        //todayStr = "20160715"
        //****test end****
        if (currentWorkShiftName) {
          hippo
            .newSimpleExhaler()
            .space('shiftdata_for_monitor')
            .index('machine_id', [machineId])
            .indexRange('date', todayStr, todayStr)
            .columns(
              'machine_id',
              'date',
              'work_shift',
              'power_millisecond',
              'oper_millisecond',
              'cut_millisecond',
              'partcount'
            )
            .exhale(function (exhalable) {
              var find = false
              var list = exhalable.exhalable
              _.each(list, function (ele) {
                var workShift = ele['work_shift']
                if (workShift == currentWorkShiftName) {
                  currentWorkShiftPowerTime = parseInt(ele['power_millisecond'])
                  currentWorkShiftOperTime = parseInt(ele['oper_millisecond'])
                  currentWorkShiftCutTime = parseInt(ele['cut_millisecond'])

                  currentWorkShiftPartCount = parseInt(ele['partcount'])

                  find = true //有找到
                  return false
                }
              })
              if (find) {
                //有找到hippo班次的值
                $('.workshift-name').html(
                  ' ( Workshift: ' + currentWorkShiftName + ')'
                )
                $('.workshift-part-count').html(
                  ' ( Start: ' + currentWorkShiftPartCount + ')'
                )
              } else {
                $('.workshift-name').html('')
                $('.workshift-part-count').html('')
              }
            })
        }
      }
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

    function chemDemoFakeCoordinate(data, count) {
      //var data = {"G_SYSC()":{"type":"LONG","values":[[1]]},"G_ELCT()":{"type":"LONG","values":[[85100280000]]},"G_CUTT()":{"type":"LONG","values":[[3976000408]]},"G_OPRT()":{"type":"LONG","values":[[6484398496]]},"G_CYCT()":{"type":"LONG","values":[[140783440]]},"G_PSCP()":{"type":"LONG","values":[[430811]]},"G_TOCP()":{"type":"LONG","values":[[440632]]},"G_USCP()":{"type":"LONG","values":[[0]]},"G_SPMS()":{"type":"LONG","values":[[0]]},"G_SPSO()":{"type":"LONG","values":[[0]]},"G_ACTF()":{"type":"LONG","values":[[9000]]},"G_FERP()":{"type":"LONG","values":[[100]]},"G_SRMC()":{"type":"LONG","values":[[0,0,0]]},"G_MPOSM()":{"type":"DOUBLE","values":[[24.419,16.279,32.558]]},"G_MPOSR()":{"type":"DOUBLE","values":[[24.419,16.279,32.558]]},"G_MPOSA()":{"type":"DOUBLE","values":[[24.419,16.279,32.558]]},"G_MPOSD()":{"type":"DOUBLE","values":[[-24.419,-16.279,-32.558]]},"G_ACTS()":{"type":"DOUBLE","values":[[0]]},"G_SPMC()":{"type":"DOUBLE","values":[[0]]},"G_MODA()":{"type":"STRING","values":[["H|0","D|0","T|2","M|70","F|9000","S|0","G|\"[G01,G17,G91,G22,G94,G21,G40,G49,G80,G98,G50,G67,G97,G54,G64,G69,G15,G40.1,G25,G160,G13.1,G50.1,G54.2,G80.5,G49.9,G54.3,G50.2,G5.5,G54.4,G80.4,G13,G8.9,G5.7]\""]]},"G_MEXEP()":{"type":"STRING","values":[["N04G1X-300.Y-200.Z-400.F9000"]]},"G_STAT()":{"type":"STRING","values":[["MODE|MEM","STATUS|START","EMG|****","ALM|****","MOTION|MTN"]]},"G_PRGR()":{"type":"STRING","values":[["O6013"]]},"G_PRGM()":{"type":"STRING","values":[["O6013"]]},"G_SEQN()":{"type":"STRING","values":[["N0004"]]},"G_MSRNE()":{"type":"STRING","values":[["B"]]},"G_PSUT()":{"type":"STRING","values":[["mm"]]},"G_FRUT()":{"type":"STRING","values":[["mm/min"]]}};
      //G_POSM: 機械座標
      //G_POSR: 相對座標 (x)
      //G_POSA: 絕對座標
      //G_POSD: 剩餘距離
      var srneFakeHead = [
        'X1',
        'Y1',
        'Z1',
        'B1',
        'C1',
        'SP1',
        'U1',
        'X2',
        'Y2',
        'U2',
      ]

      var posaFakeMatrix = [
        [
          -6412.21915,
          -33809475,
          0,
          0,
          0,
          0,
          -6185.38675,
          -28148.00286,
          28474.65225,
          22678.53022,
        ],
        [
          -7578.71915,
          -3380.9475,
          0,
          0,
          0,
          0,
          -6185.38675,
          -29312.44418,
          28474.65186,
          21508.1462,
        ],
        [
          -7982.4984,
          -3380.9475,
          -835.70827,
          0,
          0,
          0,
          -6185.38675,
          -29687.58159,
          28474.65171,
          21149.95759,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1112.83327,
          0,
          0,
          0,
          -6185.38675,
          -29687.58162,
          28474.65152,
          21149.95758,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1425.58457,
          0,
          0,
          0,
          -6185.38675,
          -29687.58162,
          28474.65143,
          21149.95755,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1481.90957,
          0,
          0,
          0,
          -6185.38675,
          -29687.58147,
          28474.65145,
          21149.95755,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1502.08457,
          0,
          0,
          0,
          -6185.38675,
          -29687.58146,
          28474.65144,
          21149.95753,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1513.1602,
          0,
          0,
          0,
          -6185.38675,
          -29687.58146,
          28474.65144,
          21149.95753,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1459.67563,
          0,
          0,
          0,
          -6185.38675,
          -29687.58146,
          28474.65144,
          21149.95753,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1441.00063,
          0,
          0,
          0,
          -6185.38675,
          -29687.58146,
          28474.65144,
          21149.95753,
        ],
      ]
      var posmFakeMatrix = [
        [
          -6358.71915,
          -3380.9475,
          0,
          0,
          0,
          0,
          -6185.38675,
          -28086.50977,
          28474.65241,
          22741.52261,
        ],
        [
          -7525.21915,
          -3380.9475,
          0,
          0,
          0,
          0,
          -6185.38675,
          -29255.95006,
          28474.65184,
          21570.13651,
        ],
        [
          -7982.4984,
          -3380.9475,
          -795.20827,
          0,
          0,
          0,
          -6185.38675,
          -29687.58167,
          28474.65168,
          21149.95757,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1045.70827,
          0,
          0,
          0,
          -6185.38675,
          -29687.58167,
          28474.65147,
          21149.95757,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1422.10957,
          0,
          0,
          0,
          -6185.38675,
          -29687.58158,
          28474.65144,
          21149.95755,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1479.15957,
          0,
          0,
          0,
          -6185.38675,
          -29687.58143,
          28474.65144,
          21149.95755,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1479.00957,
          0,
          0,
          0,
          -6185.38675,
          -29687.58145,
          28474.65142,
          21149.95754,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1513.1602,
          0,
          0,
          0,
          -6185.38675,
          -29687.58102,
          28474.65142,
          21149.95754,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1463.62563,
          0,
          0,
          0,
          -6185.38675,
          -29687.58145,
          28474.65174,
          21149.95753,
        ],
        [
          -7982.4984,
          -3380.9475,
          -1443.07563,
          0,
          0,
          0,
          -6185.38675,
          -29687.58145,
          28474.65174,
          21149.95753,
        ],
      ]
      var posdFakeMatrix = [
        [-1512.77925, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [-343.27925, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, -423.79173, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, -150.04173, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, -86.17563, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, -28.17563, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, -8.32563, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 157.25063, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 137.52563, 0, 0, 0, 0, 0, 0, 0],
      ]

      var $gPosm = $('#G_POSM')
      var $gPosa = $('#G_POSA')
      var $gPosd = $('#G_POSD')

      if (data['G_SRNE()'] && data['G_SRNE()'].values[0][0] === 'B') {
        //console.log("***** G_SRNE *****");
        $gPosm.html(
          buildTableHtml(
            srneFakeHead,
            posmFakeMatrix,
            count % posmFakeMatrix.length
          )
        )
        $gPosa.html(
          buildTableHtml(
            srneFakeHead,
            posaFakeMatrix,
            count % posaFakeMatrix.length
          )
        )
        $gPosd.html(
          buildTableHtml(
            srneFakeHead,
            posdFakeMatrix,
            count % posdFakeMatrix.length
          )
        )
      } else if (data['G_SRNE()'] && data['G_SRNE()'].values[0][0] !== 'B') {
        //console.log("----- G_SRNE -----");
        if (
          data['G_SRNE()'].values[0].length != data['G_POSM()'].values[0].length
        ) {
          $gPosm.html(
            buildTableHtml(
              srneFakeHead,
              posmFakeMatrix,
              count % posmFakeMatrix.length
            )
          )
        }
        if (
          data['G_SRNE()'].values[0].length != data['G_POSA()'].values[0].length
        ) {
          $gPosa.html(
            buildTableHtml(
              srneFakeHead,
              posaFakeMatrix,
              count % posaFakeMatrix.length
            )
          )
        }
        if (
          data['G_SRNE()'].values[0].length != data['G_POSD()'].values[0].length
        ) {
          $gPosd.html(
            buildTableHtml(
              srneFakeHead,
              posdFakeMatrix,
              count % posdFakeMatrix.length
            )
          )
        }
      }

      function buildTableHtml(fakeHead, fakeMatrix, rowIndex) {
        var tableHtml = '' //'<tr>';
        for (var colIndex = 0; colIndex < fakeHead.length; colIndex++) {
          tableHtml =
            tableHtml +
            '<tr><td>' +
            fakeHead[colIndex] +
            '</td><td>' +
            fakeMatrix[rowIndex][colIndex] +
            '</td></tr>'
        }
        //tableHtml = tableHtml + '</tr>';
        //console.log(tableHtml);
        return tableHtml
      }
    }

    monitor()
  })()
}
