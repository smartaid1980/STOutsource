export default function () {
  pageSetUp()
  ;(function () {
    $('#G_ACTF')
      .closest('table')
      .find('td[data-original-title]')
      .append("<i class='fa fa-question-circle'></i>")
      .tooltip({
        container: 'body',
        html: 'true',
      })

    $('#main').removeClass('margin-right')
    servkit.ajax(
      {
        url: 'api/getdata/db',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          table: 'm_ip_cam',
          colunms: ['ip_cam_id', 'ip', 'port'],
          whereClause: 'device_id=?',
          whereParams: [getURLParameter('machineId', location.href)],
        }),
      },
      {
        success: function (data) {
          if (data.length) {
            var src = 'http://' + data[0].ip
            var $drawer = $(
              '<div class="video">' +
              '<span id="video-icon"><i class="fa fa-video-camera fa-times txt-color-blueDark"></i></span>' +
              '<img class="hide" height="100%" width="0" src="' +
              src +
              '" style="float:right;"/>' + // class="hide"
                '<video class="vjs-default-skin hide" style="float:right;" loop autoplay muted>' +
                '<source src="' +
                servkit.rootPath +
                '/app/EquipMonitor/video/demo.mp4' +
                '"type="video/mp4">' +
                '</video>' +
                '</div>'
            )
            var $img = $drawer.find('img')
            var $video = $drawer.find('video')

            $('#main').before($drawer)

            $img.load(function (e) {
              $(this).removeClass('hide')
              $video.remove()
            })

            $drawer.click(function () {
              if ($img.width() > 0) {
                $img.width(0)
                $video.width(0)
                $('body').removeClass('minified')
                $('#main').removeClass('margin-right')
              } else {
                var videoWidth = $('body').width() * 0.4
                $img.width(videoWidth)
                $video.width(videoWidth)
                $video.removeClass('hide')
                $('body').addClass('minified')
                $('#main').addClass('margin-right')
              }

              $(this).toggleClass('active')
              $(this).find('i').toggleClass('fa-video-camera') //icon
            })
          }
        },
      }
    )

    var monitor = function () {
      var theHref = location.href
      var boxId = getURLParameter('boxId', theHref)
      var machineId = getURLParameter('machineId', theHref)
      var cncBrand = getURLParameter('cncBrand', theHref)

      var isMutiSystem = cncBrand == 'FANUC_CNC_FOCAS' // = true;//是否是多系統
      //			if(cncBrand == "FANUC_CNC_FOCAS"){
      //				isMutiSystem = true;
      //			}else{
      //				isMutiSystem = false;
      //			}

      //預設為單系統，所以要隱藏系統2 tab
      $('[href="#system2"]').closest('li').hide()

      var singleMonitorCmd = {
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
          {
            signal: {
              id: 'G_ELCT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //通電時間
          {
            signal: {
              id: 'G_CUTT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //切削時間
          {
            signal: {
              id: 'G_OPRT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //運轉時間
          {
            signal: {
              id: 'G_CYCT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //循環時間
          {
            signal: {
              id: 'G_PSCP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //加工零件數
          {
            signal: {
              id: 'G_TOCP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //加工零件總數
          {
            signal: {
              id: 'G_USCP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //所需零件數
          {
            signal: {
              id: 'G_MODA',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //G code; Modal code
          {
            signal: {
              id: 'G_EXEP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //目前執行單節
          {
            signal: {
              id: 'G_ACTS',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主軸實際轉速
          {
            signal: {
              id: 'G_SPMS',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主軸命令轉速
          {
            signal: {
              id: 'G_SPSO',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主軸轉速百分比
          {
            signal: {
              id: 'G_STAT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //控制器端狀態
          {
            signal: {
              id: 'G_PRGR',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //執行中程式號碼
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
          {
            signal: {
              id: 'G_SRNE',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //伺服軸名稱
          {
            signal: {
              id: 'G_PSUT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //座標單位
          {
            signal: {
              id: 'G_FRUT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //進給率單位
          {
            signal: {
              id: 'G_ACTF',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //實際進給率
          {
            signal: {
              id: 'G_FERP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //進給率百分比
          {
            signal: {
              id: 'G_SRMC',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //伺服軸負載
          {
            signal: {
              id: 'G_SPMC',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主軸負載
        ],
      }

      var multiMonitorCmd = {
        //box監控命令(多系統)
        name: 'cnc_Information_multiSystem',
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
              id: 'G_MPOSM',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //機械座標 (多系統)
          {
            signal: {
              id: 'G_MPOSR',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //相對座標 (多系統)
          {
            signal: {
              id: 'G_MPOSA',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //絕對座標 (多系統)
          {
            signal: {
              id: 'G_MPOSD',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //剩餘距離 (多系統)
          {
            signal: {
              id: 'G_ELCT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //通電時間
          {
            signal: {
              id: 'G_CUTT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //切削時間
          {
            signal: {
              id: 'G_OPRT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //運轉時間
          {
            signal: {
              id: 'G_CYCT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //循環時間
          {
            signal: {
              id: 'G_PSCP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //加工零件數
          {
            signal: {
              id: 'G_TOCP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //加工零件總數
          {
            signal: {
              id: 'G_USCP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //所需零件數
          {
            signal: {
              id: 'G_MODA',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //G code; Modal code
          {
            signal: {
              id: 'G_MEXEP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //目前執行單節 (多系統)
          {
            signal: {
              id: 'G_ACTS',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主軸實際轉速
          {
            signal: {
              id: 'G_SPMS',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主軸命令轉速
          {
            signal: {
              id: 'G_SPSO',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主軸轉速百分比
          {
            signal: {
              id: 'G_STAT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //控制器端狀態
          {
            signal: {
              id: 'G_PRGR',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //執行中程式號碼
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
          {
            signal: {
              id: 'G_MSRNE',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //伺服軸名稱 (多系統)
          {
            signal: {
              id: 'G_PSUT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //座標單位
          {
            signal: {
              id: 'G_FRUT',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //進給率單位
          {
            signal: {
              id: 'G_ACTF',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //實際進給率
          {
            signal: {
              id: 'G_FERP',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //進給率百分比
          {
            signal: {
              id: 'G_SRMC',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //伺服軸負載
          {
            signal: {
              id: 'G_SPMC',
            },
            collect: {
              waitMs: 1000,
              count: 1,
            },
          }, //主軸負載
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
        {
          type: 'map',
          ids: ['G_STAT'],
          gCode: 'G_STAT()',
          tr: true,
        }, //控制器端狀態列

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

        {
          type: 'scalar',
          ids: ['G_TOCP'],
          gCode: 'G_TOCP()',
        }, //加工元件總數
        {
          type: 'scalar',
          ids: ['G_USCP'],
          gCode: 'G_USCP()',
        }, //加工元件請求
        {
          type: 'scalar',
          ids: ['G_PSCP'],
          gCode: 'G_PSCP()',
        }, //加工元件數量

        {
          type: 'scalar',
          ids: ['G_ACTF'],
          gCode: 'G_ACTF()',
        }, //伺服軸實際進給率
        {
          type: 'scalar',
          ids: ['G_FERP'],
          gCode: 'G_FERP()',
        }, //伺服軸進給率百分比
        {
          type: 'scalar',
          ids: ['G_SRMC'],
          gCode: 'G_SRMC()',
        }, //伺服軸負載
        {
          type: 'scalar',
          ids: ['G_ACTS'],
          gCode: 'G_ACTS()',
        }, //主軸實際轉速
        {
          type: 'scalar',
          ids: ['G_SPMS'],
          gCode: 'G_SPMS()',
        }, //主軸命令轉速
        {
          type: 'scalar',
          ids: ['G_SPSO'],
          gCode: 'G_SPSO()',
        }, //主軸轉速百分比
        {
          type: 'scalar',
          ids: ['G_SPMC'],
          gCode: 'G_SPMC()',
        }, //主軸負載

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

        {
          type: 'scalar',
          ids: ['G_ELCT'],
          gCode: 'G_ELCT()',
          callback: convertTime,
          callbackParam: {
            showUnit: 'hour',
          },
        }, //通電時間
        {
          type: 'scalar',
          ids: ['G_CUTT'],
          gCode: 'G_CUTT()',
          callback: convertTime,
          callbackParam: {
            showUnit: 'hour',
          },
        }, //切削時間
        {
          type: 'scalar',
          ids: ['G_CYCT'],
          gCode: 'G_CYCT()',
          callback: convertTime,
          callbackParam: {
            showUnit: 'hour',
          },
        }, //循環時間
        {
          type: 'scalar',
          ids: ['G_OPRT'],
          gCode: 'G_OPRT()',
          callback: convertTime,
          callbackParam: {
            showUnit: 'hour',
          },
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
        }, //加工元件總數
        {
          type: 'scalar',
          ids: ['G_USCP', 'G_USCP2'],
          gCode: 'G_USCP()',
        }, //加工元件請求
        {
          type: 'scalar',
          ids: ['G_PSCP', 'G_PSCP2'],
          gCode: 'G_PSCP()',
        }, //加工元件數量

        {
          type: 'scalar',
          ids: ['G_ACTF', 'G_ACTF2'],
          gCode: 'G_ACTF()',
        }, //伺服軸實際進給率
        {
          type: 'scalar',
          ids: ['G_FERP', 'G_FERP2'],
          gCode: 'G_FERP()',
        }, //伺服軸進給率百分比
        {
          type: 'scalar',
          ids: ['G_SRMC', 'G_SRMC2'],
          gCode: 'G_SRMC()',
        }, //伺服軸負載
        {
          type: 'scalar',
          ids: ['G_ACTS', 'G_ACTS2'],
          gCode: 'G_ACTS()',
        }, //主軸實際轉速
        {
          type: 'scalar',
          ids: ['G_SPMS', 'G_SPMS2'],
          gCode: 'G_SPMS()',
        }, //主軸命令轉速
        {
          type: 'scalar',
          ids: ['G_SPSO', 'G_SPSO2'],
          gCode: 'G_SPSO()',
        }, //主軸轉速百分比
        {
          type: 'scalar',
          ids: ['G_SPMC', 'G_SPMC2'],
          gCode: 'G_SPMC()',
        }, //主軸負載

        {
          type: 'scalar',
          ids: ['G_PRGM', 'G_PRGM2'],
          gCode: 'G_PRGM()',
        }, //程式名稱
        {
          type: 'scalar',
          ids: ['G_SEQN', 'G_SEQN2'],
          gCode: 'G_SEQN()',
        }, //行號
        {
          type: 'scalar',
          ids: ['G_EXEP', 'G_EXEP2'],
          gCode: 'G_MEXEP()',
        }, //執行單節 (多系統)

        {
          type: 'scalar',
          ids: ['G_ELCT', 'G_ELCT2'],
          gCode: 'G_ELCT()',
          callback: convertTime,
          callbackParam: {
            showUnit: 'hour',
          },
        }, //通電時間
        {
          type: 'scalar',
          ids: ['G_CUTT', 'G_CUTT2'],
          gCode: 'G_CUTT()',
          callback: convertTime,
          callbackParam: {
            showUnit: 'hour',
          },
        }, //切削時間
        {
          type: 'scalar',
          ids: ['G_CYCT', 'G_CYCT2'],
          gCode: 'G_CYCT()',
          callback: convertTime,
          callbackParam: {
            showUnit: 'hour',
          },
        }, //循環時間
        {
          type: 'scalar',
          ids: ['G_OPRT', 'G_OPRT2'],
          gCode: 'G_OPRT()',
          callback: convertTime,
          callbackParam: {
            showUnit: 'hour',
          },
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

    monitor()
  })()
}
