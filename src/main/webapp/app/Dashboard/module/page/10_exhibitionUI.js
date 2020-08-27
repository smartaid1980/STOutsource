export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.alarmCodeMap = context.preCon.alarmCodeMap
      context.drawAllDeviceStatus()

      servkit.ajax(
        {
          url: 'api/getdata/db',
          type: 'POST',
          contentType: 'application/json',
          async: false,
          data: JSON.stringify({
            table: 'm_device_box',
            columns: ['box_id'],
            whereClause: `device_id = '${context.machineId1}'`,
          }),
        },
        {
          success: function (data) {
            context.boxId = data.box_id
          },
        }
      )
      $('.card').first().attr('id', context.machineId1)
      $('.card')
        .first()
        .find('.header .title')
        .text(context.preCon.getDeviceMap[context.machineId1])
      $('.card').last().attr('id', context.machineId2)
      $('.card')
        .last()
        .find('.header .title')
        .text(context.preCon.getDeviceMap[context.machineId2])

      // $('.monitor-overall').append(context.cardTemplate()({
      //   id: context.machineId1,
      //   name: context.preCon.getDeviceMap[context.machineId1]
      // }))
      // $('.monitor-overall').append(context.cardTemplate()({
      //   id: context.machineId2,
      //   name: context.preCon.getDeviceMap[context.machineId2]
      // }))

      servkit.subscribe('DeviceStatus', {
        machines: ['BEATATSENGD01'],
        handler: function (data) {},
        noDataHandler: function () {
          var speed = _.random(0, 100)
          var feed = _.random(8000, 9000)
          var quantity =
            parseInt(new Date().getTime() / (30 * 60 * 1000)) % 1000
          context.updateDeviceCard($('#' + context.machineId1), {
            status: 'online',
            speed: speed,
            speed_rate: _.random(0, 100),
            feed: feed,
            feed_rate: _.random(0, 100),
            program: $('#G_PRGM').text(),
            quantity: quantity,
          })
          context.updateDeviceCard($('#' + context.machineId2), {
            status: 'idle',
            speed: 0,
            speed_rate: 0,
            feed: 0,
            feed_rate: 0,
            program: 'O6012',
            quantity: 289,
          })
          $('#G_speed').text(speed)
          $('#G_feed').text(feed)
          $('#G_quantity').text(quantity)
          // $('.card').first().find('.txt-program .value').text($('#G_PRGM').text())
        },
        dataModeling: true,
      })

      context.drawFeed()
      context.getStatusData(
        context.startDate,
        context.endDate,
        context.machineId1,
        $('#status-bar-chart1')
      )
      context.getStatusData(
        context.startDate,
        context.endDate,
        context.machineId2,
        $('#status-bar-chart2')
      )
      context.getAlarmData()
      context.getUtilizationData()

      var monitorCmd = {
        //box監控命令(單系統)
        name: 'cnc_Information',
        cycleType: 'count',
        cycleValue: -1,
        timeout: 1800000,
        items: [
          {
            signal: {
              id: 'G_SYSC',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //系統個數 (***重要，用來辨識有幾個系統)
          {
            signal: {
              id: 'G_POSM',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //機械座標
          {
            signal: {
              id: 'G_POSR',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //相對座標
          {
            signal: {
              id: 'G_POSA',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //絕對座標
          {
            signal: {
              id: 'G_POSD',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //剩餘距離
          // {"signal": {"id": "G_ELCT"}, "collect": {"waitMs": 1000, "count": 1}}, //通電時間
          // {"signal": {"id": "G_CUTT"}, "collect": {"waitMs": 1000, "count": 1}}, //切削時間
          // {"signal": {"id": "G_OPRT"}, "collect": {"waitMs": 1000, "count": 1}}, //運轉時間
          // {"signal": {"id": "G_CYCT"}, "collect": {"waitMs": 1000, "count": 1}}, //循環時間
          // {"signal": {"id": "G_PSCP"}, "collect": {"waitMs": 1000, "count": 1}},//加工零件數
          // {"signal": {"id": "G_TOCP"}, "collect": {"waitMs": 1000, "count": 1}},//加工零件總數
          // {"signal": {"id": "G_USCP"}, "collect": {"waitMs": 1000, "count": 1}},//所需零件數
          // {"signal": {"id": "G_MODA"}, "collect": {"waitMs": 1000, "count": 1}},//G code; Modal code
          {
            signal: {
              id: 'G_EXEP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //目前執行單節
          // {"signal": {"id": "G_ACTS"}, "collect": {"waitMs": 1000, "count": 1}},//主軸實際轉速
          // {"signal": {"id": "G_SPMS"}, "collect": {"waitMs": 1000, "count": 1}},//主軸命令轉速
          // {"signal": {"id": "G_SPSO"}, "collect": {"waitMs": 1000, "count": 1}},//主軸轉速百分比
          // {"signal": {"id": "G_STAT"}, "collect": {"waitMs": 1000, "count": 1}},//控制器端狀態
          // {"signal": {"id": "G_PRGR"}, "collect": {"waitMs": 1000, "count": 1}},//執行中程式號碼
          {
            signal: {
              id: 'G_PRGM',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主程式號碼
          {
            signal: {
              id: 'G_SEQN',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //目前執行序列號
          // {"signal": {"id": "G_SRNE"}, "collect": {"waitMs": 1000, "count": 1}},//伺服軸名稱
          // {"signal": {"id": "G_PSUT"}, "collect": {"waitMs": 1000, "count": 1}},//座標單位
          // {"signal": {"id": "G_FRUT"}, "collect": {"waitMs": 1000, "count": 1}},//進給率單位
          // {"signal": {"id": "G_ACTF"}, "collect": {"waitMs": 1000, "count": 1}},//實際進給率
          // {"signal": {"id": "G_FERP"}, "collect": {"waitMs": 1000, "count": 1}},//進給率百分比
          // {"signal": {"id": "G_SRMC"}, "collect": {"waitMs": 1000, "count": 1}},//伺服軸負載
          // {"signal": {"id": "G_SPMC"}, "collect": {"waitMs": 1000, "count": 1}} //主軸負載
        ],
      }

      var monitorParams = [
        //html長資料方式(單系統)
        // {"type": "map", "ids": ["G_STAT"], "gCode": "G_STAT()", "tr": true}, //控制器端狀態列
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
        {
          type: 'scalar',
          ids: ['G_POSA_G_PSUT'],
          gCode: 'G_PSUT()',
        }, //絕對座標單位
        {
          type: 'scalar',
          ids: ['G_POSM_G_PSUT'],
          gCode: 'G_PSUT()',
        }, //機械座標單位
        {
          type: 'scalar',
          ids: ['G_POSR_G_PSUT'],
          gCode: 'G_PSUT()',
        }, //相對座標單位
        {
          type: 'scalar',
          ids: ['G_POSD_G_PSUT'],
          gCode: 'G_PSUT()',
        }, //剩餘距離單位
        // {"type": "scalar", "ids": ["G_TOCP"], "gCode": "G_TOCP()", "callback": convertPartCount}, //加工元件總數
        // {"type": "scalar", "ids": ["G_USCP"], "gCode": "G_USCP()"}, //加工元件請求
        // {"type": "scalar", "ids": ["G_PSCP"], "gCode": "G_PSCP()"}, //加工元件數量
        // {"type": "scalar", "ids": ["G_ACTF"], "gCode": "G_ACTF()"}, //伺服軸實際進給率
        // {"type": "scalar", "ids": ["G_FERP"], "gCode": "G_FERP()"}, //伺服軸進給率百分比
        // {"type": "scalar", "ids": ["G_SRMC"], "gCode": "G_SRMC()"}, //伺服軸負載
        // {"type": "scalar", "ids": ["G_ACTS"], "gCode": "G_ACTS()"}, //主軸實際轉速
        // {"type": "scalar", "ids": ["G_SPMS"], "gCode": "G_SPMS()"}, //主軸命令轉速
        // {"type": "scalar", "ids": ["G_SPSO"], "gCode": "G_SPSO()"}, //主軸轉速百分比
        // {"type": "scalar", "ids": ["G_SPMC"], "gCode": "G_SPMC()"}, //主軸負載
        {
          type: 'scalar',
          ids: ['G_PRGM'],
          gCode: 'G_PRGM()',
        }, //程式名稱
        {
          type: 'scalar',
          ids: ['G_SEQN'],
          gCode: 'G_SEQN()',
        }, //行號
        {
          type: 'scalar',
          ids: ['G_EXEP'],
          gCode: 'G_EXEP()',
        }, //執行單節
        // {"type": "scalar", "ids": ["G_ELCT"], "gCode": "G_ELCT()", "callback": convertTime, "callbackParam": {"showUnit": "hour", "code": "G_ELCT"}}, //通電時間
        // {"type": "scalar", "ids": ["G_CUTT"], "gCode": "G_CUTT()", "callback": convertTime, "callbackParam": {"showUnit": "hour", "code": "G_CUTT"}}, //切削時間
        // {"type": "scalar", "ids": ["G_CYCT"], "gCode": "G_CYCT()", "callback": convertTime, "callbackParam": {"showUnit": "hour", "code": "G_CYCT"}}, //循環時間
        // {"type": "scalar", "ids": ["G_OPRT"], "gCode": "G_OPRT()", "callback": convertTime, "callbackParam": {"showUnit": "hour", "code": "G_OPRT"}}, //運轉時間
      ]

      var currentWorkShiftName //班次名稱
      var currentWorkShiftPartCount
      var currentWorkShiftPowerTime //班次的通電累計
      var currentWorkShiftOperTime //班次的運轉累計
      var currentWorkShiftCutTime //班次的切削累計
      var chemDemo = false
      //單位為次數，執行幾次後做更新
      var workshiftUpdateFreq = 600
      var monitorCount = 0
      var chemDemoMonitorCount = 0

      //送監控命令
      servkit.monitor({
        type: 'MONITOR',
        boxId: context.boxId,
        machineId: context.machineId1,
        monitorCmd: monitorCmd,
        monitorCmdVersion: 'v1.0',
        monitorParams: monitorParams,
        customCallback: function (data) {
          //客製化
          var time = new Date().getTime()
          $('#G_ELCT').text(
            moment(time - 756849)
              .format('HH:mm:ss')
              .replace(':', ' H ')
              .replace(':', ' M ') + ' S'
          )
          $('#G_CUTT').text(
            moment(time - 39741443)
              .format('HH:mm:ss')
              .replace(':', ' H ')
              .replace(':', ' M ') + ' S'
          )
          $('#G_CYCT').text(
            moment(time - 45675252)
              .format('HH:mm:ss')
              .replace(':', ' H ')
              .replace(':', ' M ') + ' S'
          )
          $('#G_OPRT').text(
            moment(time - 9452714)
              .format('HH:mm:ss')
              .replace(':', ' H ')
              .replace(':', ' M ') + ' S'
          )

          if (chemDemo) {
            chemDemoMonitorCount++
            chemDemoFakeCoordinate(data, chemDemoMonitorCount)
          }

          if (servkit.configUseShiftdata()) {
            //是否使用班次時間去減資料
            monitorCount++
            if (monitorCount % workshiftUpdateFreq == 1) {
              updateCurShift(updateShiftData, context.machineId)
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
        },
      })

      function updateShiftData(machineId) {
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

      function convertPartCount(value) {
        //不是數值就使用 --
        if (!_.isNumber(value)) {
          return '--'
        }
        //console.log("*****: ", value);
        if (currentWorkShiftPartCount) {
          var diff = value - currentWorkShiftPartCount
          if (diff > 0) {
            value = diff
          } else {
            value = 0
          }
        }
        return value
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
            data['G_SRNE()'].values[0].length !=
            data['G_POSM()'].values[0].length
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
            data['G_SRNE()'].values[0].length !=
            data['G_POSA()'].values[0].length
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
            data['G_SRNE()'].values[0].length !=
            data['G_POSD()'].values[0].length
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
      //value是milliSecond
      function convertTime(value, params) {
        //不是數值就使用 --
        if (!_.isNumber(value)) {
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
                var diff = value - currentWorkShiftPowerTime
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
                var diff2 = value - currentWorkShiftOperTime
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
                var diff3 = value - currentWorkShiftCutTime
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

      $('#fullScreen').on('click', function () {
        if ($(this).find('i').hasClass('fa-expand')) {
          $('#changeStyle').addClass('hide')
          if (document.getElementById('widget-grid').webkitRequestFullscreen) {
            document.getElementById('widget-grid').webkitRequestFullscreen()
          } else if (
            document.getElementById('widget-grid').mozRequestFullScreen
          ) {
            document.getElementById('widget-grid').mozRequestFullScreen()
          }
          $(this).find('span').html('<i class="fa fa-compress"></i>')
        } else {
          $('#changeStyle').removeClass('hide')
          if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen()
          }
          $(this).find('span').html('<i class="fa fa-expand"></i>')
        }
      })

      $('#changeStyle').on('click', function () {
        if ($('body').hasClass('smart-style-2')) {
          $('body').removeClass('smart-style-2').addClass('smart-style-5')
          $('#widget-grid').addClass('blueStyle')
          $('#frame')
            .find('img')
            .attr('src', 'img/logo/Servtech-horizontal-white.png')
          $('#frame').attr('style', 'background-color: #2a58d2 !important;')
          $('#plantAreaTable')
            .find('th')
            .attr('style', 'background-color: rgba(0,0,0,.23)!important')
          $('#plantAreaTable')
            .find('td')
            .attr('style', 'background-color: rgba(0,0,0,.18)!important;')
          $('#plantAreaTable')
            .closest('#tableFrame')
            .attr('style', 'background-color: #2a58d2 !important;')
          $('.flot-text').css('color', '#FFFFFF')
        } else {
          $('body').removeClass('smart-style-5').addClass('smart-style-2')
          $('#widget-grid').removeClass('blueStyle')
          $('#frame')
            .find('img')
            .attr('src', 'img/logo/Servtech-horizontal-new.png')
          $('#frame').removeAttr('style')
          $('#plantAreaTable').find('th').removeAttr('style')
          $('#plantAreaTable').find('td').removeAttr('style')
          $('#plantAreaTable').closest('#tableFrame').removeAttr('style')
          $('.flot-text').css('color', 'rgb(84, 84, 84)')
        }
      })
    },
    util: {
      machineId1: null,
      machineId2: null,
      startDate: '2018/01/01',
      endDate: '2018/01/07',
      AlarmStartDate: '2018/01/06',
      AlarmEndDate: '2018/01/07',
      drawAllDeviceStatus: function () {
        var deviceStatus = {}
        var count = 0
        var deviceMap = _.filter(servkit.getMachineMap(), (machine) => {
          count++
          return !machine.is_real_data && count <= 10
        })

        _.each(deviceMap, (machine, key) => {
          // 畫表格
          if (key % 5 === 0) {
            $('#plantAreaTable').find('tbody').append('<tr></tr>')
          }
          var status = ''
          if (machine.demo_status === '11') {
            status = '-online'
          } else if (machine.demo_status === '12') {
            status = '-idle'
          } else if (machine.demo_status === '13') {
            status = '-alarm'
          }
          $('#plantAreaTable')
            .find('tbody > tr:last-child')
            .append(
              '<td><span class="btn machine-light' +
                status +
                '"></span><br>' +
                machine.device_name +
                '</td>'
            )

          // 畫圓餅圖用
          if (machine.demo_status === '11') {
            deviceStatus.online = deviceStatus.online
              ? (deviceStatus.online += 1)
              : 1
          } else if (machine.demo_status === '12') {
            deviceStatus.idle = deviceStatus.idle ? (deviceStatus.idle += 1) : 1
          } else if (machine.demo_status === '13') {
            deviceStatus.alarm = deviceStatus.alarm
              ? (deviceStatus.alarm += 1)
              : 1
          } else if (machine.demo_status === '0') {
            deviceStatus.offline = deviceStatus.offline
              ? (deviceStatus.offline += 1)
              : 1
          }
        })

        var dataSet = [
          {
            label: '加工',
            data: deviceStatus.online,
            color: servkit.statusColors.online,
          },
          {
            label: '閒置',
            data: deviceStatus.idle,
            color: servkit.statusColors.idle,
          },
          {
            label: '警報',
            data: deviceStatus.alarm,
            color: servkit.statusColors.alarm,
          },
          {
            label: '關機',
            data: deviceStatus.offline,
            color: servkit.statusColors.offline,
          },
        ]
        var options = {
          series: {
            pie: {
              show: true,
              innerRadius: 0.5,
              radius: 1,
              label: {
                show: true,
                radius: 2 / 3,
                formatter: function (label, series) {
                  var count = series.data[0][1]
                  return (
                    '<div style="text-align:center;padding:4px;color:white;">' +
                    label +
                    '<br/>' +
                    Math.round(series.percent) +
                    '% (' +
                    count +
                    ')' +
                    '</div>'
                  )
                },
                background: {
                  opacity: 0.5,
                  color: '#000',
                },
              },
            },
            legend: {
              show: false,
              noColumns: 1, // number of colums in legend table
              labelFormatter: null, // fn: string -> string
              labelBoxBorderColor: '#000', // border color for the little label boxes
              container: null, // container (as jQuery object) to put legend in, null means default on top of graph
              position: 'ne', // position of default legend container within plot
              margin: [5, 10], // distance from grid edge to default legend container within plot
              backgroundColor: '#efefef', // null means auto-detect
              backgroundOpacity: 1, // set to 0 to avoid background
            },
            grid: {
              hoverable: true,
              clickable: true,
            },
          },
        }
        $.plot($('#device-status-pie-chart'), dataSet, options)
      },
      cardTemplate: function () {
        var template = []
        template.push(
          '<div id="<%- id %>" class="item card" style="margin-left: 10px;">'
        )
        template.push(
          '<div class="header"><div class="title"><%- name %></div><div class="status"></div></div>'
        )
        template.push('<div class="content"><div class="tab-chart row">')
        template.push(
          '<div class="col col-xs-6 tab-panel txt-speed"><div class="title">轉速</div>'
        )
        template.push(
          '<div class="easy-pie-chart txt-color-blue easyPieChart" data-pie-size="60" style="height: 60px; width: 60px; padding: 0px;">'
        )
        // template.push('<canvas class="flot-base" style="direction: ltr; position: absolute; left: 0px; top: 0px; width: 60px; height: 60px;" width="60" height="60"></canvas>')
        // template.push('<canvas class="flot-overlay" style="direction: ltr; position: absolute; left: 0px; top: 0px; width: 60px; height: 60px;" width="60" height="60"></canvas>')
        template.push(
          '<span class="txt-color-blue txt-percent">0</span></div></div>'
        )
        template.push(
          '<div class="col col-xs-6 tab-panel txt-feed"><div class="title">進給率</div>'
        )
        template.push(
          '<div class="easy-pie-chart txt-color-orange easyPieChart" data-pie-size="60" style="height: 60px; width: 60px; padding: 0px;">'
        )
        // template.push('<canvas class="flot-base" style="direction: ltr; position: absolute; left: 0px; top: 0px; width: 60px; height: 60px;" width="60" height="60"></canvas>')
        // template.push('<canvas class="flot-overlay" style="direction: ltr; position: absolute; left: 0px; top: 0px; width: 60px; height: 60px;" width="60" height="60"></canvas>')
        template.push(
          '<span class="txt-color-orange txt-percent">0</span></div></div></div>'
        )
        template.push(
          '<div class="tab-text"><div class="tab-panel txt-program"><div class="title">加工程式</div><div class="value">B</div></div>'
        )
        template.push(
          '<div class="tab-panel txt-quantity"><div class="title">產量</div><div class="value">0</div></div></div></div></div>'
        )
        return _.template(template.join(''))
      },
      updateDeviceCard: function ($ele, data) {
        var status = data.status || ''
        var speed = data.speed || 0
        var speed_rate = data.speed_rate || 0
        var feed = data.feed || 0
        var feed_rate = data.feed_rate || 0
        var program = data.program || ''
        var quantity = data.quantity || '0'

        $ele
          .removeClass('online idle alarm')
          .addClass(status)
          .find('.txt-program .value')
          .html(program || '')
          .end()
          .find('.txt-quantity .value')
          .html(quantity || '')
        this.updateEasyPieChart(
          $ele.find('.txt-speed .easyPieChart'),
          parseInt(speed) || 0,
          parseInt(speed_rate) || 0,
          150
        )
        this.updateEasyPieChart(
          $ele.find('.txt-feed .easyPieChart'),
          parseInt(feed) || 0,
          parseInt(feed_rate) || 0,
          250
        )
      },
      updateEasyPieChart: function ($chart, oldValue, rate, max) {
        var speedRateMax = 150
        var feedRateMax = 250
        var value = Math.round(parseFloat(oldValue))
        value = _.isNaN(value) ? 0 : value
        var oneHundredPercent = 100
        var percentValue3 =
          oneHundredPercent - rate < 0 ? max - rate : max - 100
        var percentValue2 = Math.abs(100 - rate)
        var percentValue1 =
          oneHundredPercent - rate < 0 ? rate - percentValue2 : rate

        var dataSet = [
          {
            data: percentValue1,
            color: max == speedRateMax ? '#57889c' : '#b19a6b',
          },
          {
            data: percentValue2,
            color:
              100 - percentValue1 > 0
                ? '#DDDDDD'
                : max == speedRateMax
                ? '#a2daf2'
                : '#efd8a7',
          },
          {
            data: percentValue3,
            color: '#FFFFFF',
          },
        ]

        var options = {
          series: {
            pie: {
              show: true,
              innerRadius: 0.7,
            },
          },
        }
        // $.plot($chart, dataSet, options);
        $chart.data('easyPieChart').update(percentValue1 * 0.7)
        $chart.find('span').remove()
        if (max == speedRateMax) {
          $chart.append('<span class="txt-color-blue txt-percent">0</span>')
        } else {
          $chart.append('<span class="txt-color-orange txt-percent">0</span>')
        }
        $chart.find('.txt-percent').text(value)
      },
      drawFeed: function () {
        var ctx = this
        $.get('./app/Dashboard/demoData/machine1.json', (rep) => {
          ctx.drawChart(
            rep.data,
            $('#feed-bar-chart1'),
            ctx.machineId1,
            'start_timestamp',
            'end_timestamp'
          )
        })
        $.get('./app/Dashboard/demoData/machine2.json', (rep) => {
          ctx.drawChart(
            rep.data,
            $('#feed-bar-chart2'),
            ctx.machineId2,
            'start_timestamp',
            'end_timestamp'
          )
        })
      },
      drawChart: function (datas, $ele, deviceId, startTime, endTime) {
        var that = this
        var axisSetList = [],
          feedSetList = [],
          axisSet = [],
          feedSet = []

        var lastDevice = datas[0].machine_id
        var dateTag =
          datas[0][startTime].substring(0, 4) +
          '/' +
          datas[0][startTime].substring(4, 6) +
          '/' +
          datas[0][startTime].substring(6, 8)
        _.each(datas, function (elem) {
          var machindId = elem.machine_id
          if (machindId != lastDevice) {
            axisSetList.push(axisSet)
            feedSetList.push(feedSet)
            axisSet = []
            feedSet = []
          }
          var axisStatus = elem.axis_status
          var feedStatus = elem.feed_status
          var start = servkit.switchDataFormat(
            {
              type: 'time',
            },
            elem[startTime]
          )
          var end = servkit.switchDataFormat(
            {
              type: 'time',
            },
            elem[endTime]
          )
          var offset = new Date(end).getTime() - new Date(start).getTime(start)
          var offSetPeriod = servkit.switchDataFormat(
            {
              type: 'hourMin',
            },
            offset
          )
          var axisObj = {}
          var feedObj = {}
          if (elem.axis_status === undefined) {
            axisStatus = elem.status
            axisObj = {
              label:
                '&nbsp' +
                that.deviceStatusParse(axisStatus)[0] +
                '<br>' +
                start +
                ' ~ ' +
                end +
                '<br>' +
                offSetPeriod,
              data: [[offset, 0]],
              color: that.deviceStatusParse(axisStatus)[1],
            }
          } else {
            axisObj = {
              label:
                '&nbsp' +
                that.statusParse(axisStatus)[0] +
                '<br>' +
                start +
                ' ~ ' +
                end +
                '<br>' +
                offSetPeriod,
              data: [[offset, 0]],
              color: that.statusParse(axisStatus)[1],
            }
          }
          if (elem.feed_status === undefined) {
            feedStatus = elem.status
            feedObj = {
              label:
                '&nbsp' +
                that.deviceStatusParse(feedStatus)[0] +
                '<br>' +
                start +
                ' ~ ' +
                end +
                '<br>' +
                offSetPeriod,
              data: [[offset, 0]],
              color: that.deviceStatusParse(feedStatus)[1],
            }
          } else {
            feedObj = {
              label:
                '&nbsp' +
                that.statusParse(feedStatus)[0] +
                '<br>' +
                start +
                ' ~ ' +
                end +
                '<br>' +
                offSetPeriod,
              data: [[offset, 0]],
              color: that.statusParse(feedStatus)[1],
            }
          }
          axisSet.push(axisObj)
          feedSet.push(feedObj)
        })
        axisSetList.push(axisSet)
        feedSetList.push(feedSet)

        // _.each(axisSetList, function (elem) {
        //   var $ele = $('#axis-bar-chart');
        //   that.growStackBar(elem, $ele, '主軸狀態');
        // });
        _.each(feedSetList, function (elem) {
          that.growStackBar(elem, $ele, deviceId, startTime)
        })

        setTimeout(function () {
          // $("#axis-bar-chart .tickLabel:first").css({
          //   "left": "-10px"
          // });
          $('#feed-bar-chart .tickLabel:first').css({
            left: '-10px',
          })
        }, 100)
      },
      growStackBar: function (dataSet, $ele, deviceId, tag) {
        var xMin = new Date(
          dataSet[0].label.split('<br>')[1].split(' ~')[0]
        ).getTime() //第一筆開始時間的毫秒
        var option = {
          series: {
            stack: true,
            bars: {
              show: true,
              // fill: 1,
              align: 'center',
              // barWidth: 0.5
            },
          },
          bars: {
            lineWidth: 0.5,
            // barWidth: 10,
            barWidth: 8 * 24 * 60 * 1000,
            horizontal: true,
          },
          xaxis: {
            mode: 'time',
            // tickSize: tag === 'start_timestamp' ? [1, 'hour'] : [1, 'day'], //沒有的話會變兩個小時一格
            tickFormatter: function (v, axis) {
              //沒有的話會從格林威治時間開始
              var info
              var tick = xMin + v
              var date = new Date(tick)
              if (tag === 'start_timestamp') {
                var hours =
                  date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
                var minutes =
                  date.getMinutes() < 10
                    ? '0' + date.getMinutes()
                    : date.getMinutes()
                info = hours + ':' + minutes
              } else {
                info = moment(date).format('MM/DD')
              }

              return info
            },
          },
          yaxis: {
            // show: false,
            // axisLabel: tag,
            ticks: function () {
              let machineName = servkit.getMachineName(deviceId)
              machineName =
                machineName.length > 10
                  ? '...' + machineName.substring(machineName.length - 8)
                  : machineName
              return [[0.5, machineName]]
            },
          },
          grid: {
            // hoverable: true,
            borderColor: '#bababa',
          },
          legend: {
            show: true,
            position: 'ne',
            container: 'machineName',
          },
          tooltip: true,
          tooltipOpts: {
            content: '%s',
            defaultTheme: false,
          },
        }

        if (document.body.clientWidth < 800) option.xaxis.tickSize = [2, 'hour']

        $.plot($ele, dataSet, option)
      },
      statusParse: function (ele) {
        var status = []
        if (ele == 0) {
          status = ['正常', '#2e8b57']
        } else if (ele == 1) {
          status = ['超出門檻值', '#037ca9']
        } else if (ele == 2) {
          status = ['閒置', '#ffa500']
        } else {
          status = ['未知', '#d3d3d3']
        }
        return status
      },
      deviceStatusParse: function (ele) {
        var status = []
        if (ele == 11) {
          status = ['正常', '#2e8b57']
        } else if (ele == 13) {
          status = ['警報', '#a90329']
        } else if (ele == 12) {
          status = ['閒置', '#ffa500']
        } else {
          status = ['離線', '#d3d3d3']
        }
        return status
      },
      getStatusData: function (startDate, endDate, machineList, $ele) {
        var ctx = this
        ctx.statusHistory = null
        ctx.min = null
        ctx.max = null
        let isNaturalDay = $('#natural-day').prop('checked')
        hippo
          .newSimpleExhaler()
          .space('machine_status_history')
          .index('machine_id', [machineList])
          // 如果查詢有細到時間就往前找一天，解決加上時間之後的跨班議題，ex: 9/21 01:00 可能屬於9/20的C班
          .indexRange(
            'date',
            isNaturalDay
              ? moment(startDate).add(-1, 'day').format('YYYY/MM/DD')
              : startDate,
            endDate
          )
          .columns(
            'machine_id',
            'status',
            'start_time',
            'end_time',
            'alarm_code',
            'duration',
            'cnc_brand'
          )
          .exhale(function (exhalable) {
            ctx.drawChart(
              exhalable.exhalable,
              $ele,
              machineList,
              'start_time',
              'end_time'
            )
          })
      },
      getAlarmData: function () {
        var ctx = this
        hippo
          .newSimpleExhaler()
          .space('alarm_code_detail')
          .index('machine_id', [ctx.machineId1])
          .indexRange('date', ctx.AlarmStartDate, ctx.AlarmEndDate)
          .columns(
            'machine_id',
            'alarm_code',
            'start_time',
            'end_time',
            'duration',
            'cnc_id'
          )
          .exhale(function (data) {
            //{"FANUC__1006":[[machine_id, alarm_code, start_time, end_time, duration, cnc_id], ...]}
            ctx.detailTableData = _.groupBy(
              _.sortBy(data.exhalable, 'start_time'),
              function (elem) {
                return elem.cnc_id + '__' + elem.alarm_code
              }
            )

            //machine_id, cnc_id, alarm_code, alarm_status, count
            var tableData = []
            _.each(ctx.detailTableData, function (alarmInfo, brandCode) {
              var cncBrand = brandCode.split('__')[0]
              var alarmCode = brandCode.split('__')[1]

              //              if (!_.isNaN(parseInt(alarmCode)) && alarmCode != '-1') {
              if (alarmCode != '-1') {
                var alarmItems = alarmCode.split(',')

                var alarmCodes = {}
                for (var i = 0; i < alarmItems.length; ++i) {
                  // avoid dupl alarm code
                  if (
                    !Object.prototype.hasOwnProperty.call(
                      alarmCodes,
                      alarmItems[i]
                    )
                  ) {
                    alarmCodes[alarmItems[i]] = 'true'
                  }
                }

                var alamStatus = ''

                for (var acode in alarmCodes) {
                  if (acode !== '') {
                    var curalarmStatus =
                      acode +
                      ' : ' +
                      (ctx.alarmCodeMap[cncBrand] &&
                      ctx.alarmCodeMap[cncBrand][acode]
                        ? ctx.alarmCodeMap[cncBrand][acode]
                        : '未定義警報說明')
                    alamStatus += curalarmStatus + '</br>'
                  }
                }
                if (alamStatus === '') {
                  alamStatus = 'N/A'
                  alarmCode = 'N/A'
                }

                tableData.push([
                  ctx.machineId1,
                  cncBrand,
                  alarmCode,
                  alamStatus,
                  alarmInfo.length,
                  '<button class="btn btn-primary details" id="' +
                    brandCode +
                    '"> 詳細資料' +
                    '</button>',
                ])
              }
            })

            //machine_id, cnc_id, alarm_code, count, date
            ctx.drawAlarmChart(tableData)
          })
      },
      drawAlarmChart: function (pageData) {
        //machine_id, cnc_id, alarm_code, alarm_status, count
        var alarmObj = _.map(pageData, function (elem, index) {
          return [index, elem[4]]
        })
        var ticks = _.map(pageData, function (elem, index) {
          var content = elem[2]
          var cutString = function (head) {
            var temp = head.split('_')
            head = ''
            for (var i = 0; i < temp.length; i++) {
              if (i == temp.length - 1) head += temp[i]
              else if (temp[i] + temp[i + 1] > 9) {
                head += temp[i] + '-<br>'
              } else {
                head += temp[i] + '-' + temp[i + 1] + '<br>'
                i++
              }
            }
            return head
          }
          var head = cutString(elem[1])
          if (elem[2].length > 10)
            content = '...' + elem[2].substr(elem[2].length - 7)
          return [index, head + '<br>' + content]
        })

        $.plot(
          $('#alarm-bar-chart'),
          [
            {
              data: alarmObj,
              color: servkit.colors.red,
            },
          ],
          {
            series: {
              bars: {
                show: true,
                barWidth: 0.5,
                align: 'center',
              },
            },
            xaxis: {
              // axisLabel: "機台警報代碼",
              ticks: ticks,
              tickColor: 'rgba(186,186,186,0.2)',
              axisLabelFontFamily: servkit.fonts,
              axisLabelUseCanvas: true,
              axisLabelPadding: 5,
            },
            yaxis: {
              min: 0,
              // axisLabel: "次數",
              tickColor: 'rgba(186,186,186,0.2)',
              axisLabelFontSizePixels: 12,
              axisLabelFontFamily: servkit.fonts,
              axisLabelUseCanvas: true,
              axisLabelPadding: 5,
              tickDecimals: 0,
              minTickSize: 1,
            },
            legend: true,
            grid: {
              show: true,
              hoverable: true,
              clickable: true,
              tickColor: '#EFEFEF',
              borderWidth: 0,
              borderColor: '#EFEFEF',
            },
            tooltip: true,
            tooltipOpts: {
              content: "<b style='display:none;'>%x</b><span>%y</span>",
              defaultTheme: false,
            },
          }
        )
      },
      getUtilizationData: function () {
        var ctx = this
        hippo
          .newMashupExhaler()
          .space('utilization_time_work_shift:utws')
          .index('machine_id', [ctx.machineId1])
          .indexRange('date', ctx.startDate, ctx.endDate)

          .space('part_count_merged:pcm')
          .index('machine_id', [ctx.machineId1])
          .indexRange('date', ctx.startDate, ctx.endDate)

          .column('utws', 'machine_id')
          .column('utws', 'date')
          .column('utws', 'work_shift')
          .column('utws', 'power_millisecond')
          .column('utws', 'operate_millisecond')
          .column('utws', 'cutting_millisecond')
          .column('utws', 'idle_millisecond')
          .column('utws', 'alarm_millisecond')
          .column('utws', 'work_shift_millisecond')

          .column('pcm', 'part_count')
          .column('pcm', 'operate_millisecond')

          .mashupKey('machine_id', 'date', 'work_shift')
          .exhale(function (exhalable) {
            var resultGroups = {}
            exhalable.each(function (data) {
              var timeData = data.utws[0],
                groupKey = timeData.machine_id + timeData.date,
                resultGroup = resultGroups[groupKey]

              if (resultGroup) {
                resultGroup.power_millisecond += timeData.power_millisecond
                resultGroup.operate_millisecond += timeData.operate_millisecond
                resultGroup.cutting_millisecond += timeData.cutting_millisecond
                resultGroup.idle_millisecond += timeData.idle_millisecond
                resultGroup.alarm_millisecond += timeData.alarm_millisecond
                resultGroup.work_shift_millisecond +=
                  timeData.work_shift_millisecond
                resultGroup.part_count += data.pcm.length
              } else {
                resultGroup = _.pick(
                  timeData,
                  'machine_id',
                  'date',
                  'power_millisecond',
                  'operate_millisecond',
                  'cutting_millisecond',
                  'idle_millisecond',
                  'alarm_millisecond',
                  'work_shift_millisecond'
                )
                resultGroup.part_count = data.pcm.length
                resultGroups[groupKey] = resultGroup
              }
            })

            var operSum = 0
            var cutSum = 0
            var denominatorSum = 0

            var result = _.chain(resultGroups)
              .values()
              .map(function (timeData) {
                timeData = ctx.millisecondExcludMillisecond(timeData)

                operSum += timeData.operate_millisecond
                cutSum += timeData.cutting_millisecond
                denominatorSum += ctx.getDenominator(timeData)
                var brand = servkit.getMachineBrand(timeData.machine_id)
                return [
                  servkit.getMachineName(timeData.machine_id),
                  timeData.date.date8BitsToSlashed(),
                  timeData.power_millisecond.millisecondToHHmmss(),
                  timeData.operate_millisecond.millisecondToHHmmss(),
                  brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                    ? 'N.A.'
                    : timeData.cutting_millisecond.millisecondToHHmmss(),
                  (
                    timeData.idle_millisecond + timeData.alarm_millisecond
                  ).millisecondToHHmmss(),
                  brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                    ? 'N.A.'
                    : timeData.part_count,
                  (
                    timeData.operate_millisecond / ctx.getDenominator(timeData)
                  ).floatToPercentage(),
                  brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                    ? 'N.A.'
                    : (
                        timeData.cutting_millisecond /
                        ctx.getDenominator(timeData)
                      ).floatToPercentage(),
                ]
              })
              .value()

            var chartConfig = {
              dataList: result,
              barValueIndex: [7, 8],
              tickColor: 'black',
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: $('#month-oee1').text(),
            }
            ctx.drawUtilizationChart($('#utilization-bar-chart'), chartConfig)
          })
      },
      drawUtilizationChart: function ($chartEle, config) {
        var ctx = this
        var dataList = config.dataList,
          barValueIndex = config.barValueIndex,
          xAxisLabelValueIndex = config.xAxisLabelValueIndex,
          yAxisLabel = config.yAxisLabel

        // modify by jaco @ 2016/8/20
        // to avoid pre query have data ,but this time have no data
        // orignal won't redraw,add empty to clear prev result
        if (!dataList || dataList.length === 0) {
          $chartEle.empty()
          return
        }

        var chartDatas = _.map(barValueIndex, function (barIndex, barI) {
          return {
            data: _.map(dataList, function (row, i) {
              return [i, row[barIndex].percentageToFloat()]
            }),
            bars: {
              show: true,
              barWidth: 0.2,
              order: barI + 1,
            },
          }
        })
        $.plot($chartEle, chartDatas, {
          colors: [
            servkit.colors.blue,
            servkit.colors.green,
            servkit.colors.orange,
            servkit.colors.purple,
          ],
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          xaxis: {
            tickColor: 'rgba(186,186,186,0.2)',
            ticks: function () {
              return _.map(dataList, function (ele, i) {
                var tick =
                  servkit.getMachineName(ctx.machineId1) + '</br>' + ele[1]
                // var tick = _.map(xAxisLabelValueIndex, function (index) {
                //   return ele[index]
                // }).join('</br>')
                return [i, tick]
              })
            },
          },
          yaxis: {
            min: 0,
            max: 100,
            tickColor: 'rgba(186,186,186,0.2)',
            axisLabel: yAxisLabel,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Open Sans',
          },
          legend: true,
          tooltip: true,
          tooltipOpts: {
            content: "<b style='display:none;'>%x</b><span>%y.2%</span>",
            defaultTheme: false,
          },
        })
      },
      millisecondExcludMillisecond: function (timeData) {
        timeData.power_millisecond = this.timeDataNormalize(
          timeData.power_millisecond
        )
        timeData.operate_millisecond = this.timeDataNormalize(
          timeData.operate_millisecond
        )
        timeData.cutting_millisecond = this.timeDataNormalize(
          timeData.cutting_millisecond
        )
        timeData.idle_millisecond = this.timeDataNormalize(
          timeData.idle_millisecond
        )
        timeData.alarm_millisecond = this.timeDataNormalize(
          timeData.alarm_millisecond
        )
        timeData.work_shift_millisecond = this.timeDataNormalize(
          timeData.work_shift_millisecond
        )
        return timeData
      },
      timeDataNormalize: function (millisecond) {
        return parseInt(millisecond / 1000) * 1000
      },
      getDenominator: function (timeData) {
        // var denominator = $('input[name="denominator"]:checked').val()
        var denominator = 'natural_day'
        switch (denominator) {
          case 'power_millisecond':
            return timeData.power_millisecond
          case 'natural_day':
            return 24 * 60 * 60 * 1000
          default:
            return timeData.work_shift_millisecond
        }
      },
    },
    preCondition: {
      getDeviceMap: function (done) {
        var ctx = this
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            async: false,
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_id', 'device_name'],
              whereClause: `is_real_data = '0'`,
            }),
          },
          {
            success: function (data) {
              var deviceData = {}
              ctx.machineId1 = data[0].device_id
              ctx.machineId2 = data[1].device_id
              _.each(data, function (elem) {
                deviceData[elem.device_id] = elem.device_name
              })
              done(deviceData)
            },
          }
        )
      },
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
    delayCondition: ['machineList', 'machineLightList'],
    dependencies: [
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/d3/d3.v4.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.valuelabels.js',
      ],
    ],
  })
}
