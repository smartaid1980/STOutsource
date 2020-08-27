export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var $win = $(window)
      var $main = $('#monitor')
      var $img = $main.find('.machine-image img')

      var isOver

      function resize(i) {
        context.debug &&
          console.debug('resize w:' + $win.width() + ' h:' + $win.height())
        // remove compute style
        $main
          .removeAttr('style')
          .find('.pane, .info-title, .info-block, .pane-bottom, table tr')
          .removeAttr('style')

        var ww = $win.width(),
          wh = $win.height()

        var isSizeSm = ww < context.rwd.md,
          isSizeMd = ww >= context.rwd.md && ww < context.rwd.lg,
          isSizeLg = ww >= context.rwd.lg

        // 最小的size就不處理
        if (isSizeSm) {
          context.debug && console.debug('size sm')
          return
        }

        var mw = $main.width(),
          mh = $main.height()
        var ph = wh - $main.offset().top - $('.page-footer').outerHeight() - 20

        var ibmt = 10 // info-block margin-top

        var temp, $temp

        var $pl = $main.find('.pane-left'),
          $pc = $main.find('.pane-center'),
          $pr = $main.find('.pane-right')

        // compute pane
        $main
          .height(ph)
          .find('.pane')
          .height(ph)
          .find('.pane-bottom')
          .each(function () {
            var $pb = $(this)
            $pb.width($pb.parents('.pane:first').width())
          })

        // compute margin and height
        var $plt = $pl.find('.info-title'),
          $plii = $pl.find('.info-block.information'),
          $plioc = $pl.find('.info-block.modal-other-code'),
          $plip = $pl.find('.info-block.parts'),
          $plit = $pl.find('.info-block.times')

        var $pcis = $pc.find('.info-block.status'),
          $pcim = $pc.find('.info-block.machine'),
          $pcip = $pc.find('.info-block.program')

        var $prip = $pr.find('.info-block.position'),
          // $prioc = $pr.find('.info-block.modal-other-code'),
          $prigc = $pr.find('.info-block.modal-g-code')

        // check has margin space
        if (
          $pc.height() -
            $pcis.outerHeight() -
            $pcim.outerHeight() -
            $pcip.outerHeight() >
          0
        ) {
          ibmt = Math.floor(
            ($pc.height() - $pcis.height() - $pcim.height() - $pcip.height()) /
              4
          )
          if ((isOver = ibmt > context.maxMargin)) {
            ibmt = context.maxMargin
          }
        }

        // setting info-block margin-top
        $main.find('.info-title, .info-block').css('marginTop', ibmt)

        // info-title height
        $plt.height($pcis.height())

        // compute pane-left
        context.debug &&
          console.debug(
            'pl:' +
              $pl.height() +
              ' plt:' +
              $plt.height() +
              ' plip:' +
              $plip.height() +
              ' plit:' +
              $plit.height() +
              ' rs:' +
              ($pl.height() -
                $plt.height() -
                $plip.height() -
                $plit.height() -
                ibmt * 3)
          )
        // border-height
        temp =
          ($pl.find('.info-title, .info-block').length -
            $pc.find('.info-title, .info-block').length) *
          (isSizeLg ? 2 : 1)
        if ($plii.is(':visible')) {
          $plii.height(
            $pl.height() -
              $plt.height() -
              $plioc.height() -
              $plip.height() -
              $plit.height() -
              ibmt * 6 -
              temp
          )
        } else {
          $plit.height(
            $pl.height() -
              $plt.height() -
              $plioc.height() -
              $plip.height() -
              ibmt * 5 -
              temp
          )
          $plit
            .find('.content')
            .height($plit.height() - $plit.find('.title').outerHeight())
        }

        // compute pane-center
        $pcim.height($pc.height() - $pcis.height() - $pcip.height() - ibmt * 4)
        if (isOver) {
          $temp = $pcim.find('.machine-image')
          temp = Math.floor(($pcim.height() - $temp.height()) / 2)
          if (temp > 0) {
            $temp.css('marginTop', temp)
          }
        }

        // compute pane-right
        // border-height
        temp =
          ($pr.find('.info-title, .info-block').length -
            $pc.find('.info-title, .info-block').length) *
          (isSizeLg ? 2 : 1)
        $prip.height($pr.height() - $prigc.height() - ibmt * 3 - temp)

        // computer position table
        $temp = $prip.find('table:visible:first')
        $temp.height($prip.height() - $prip.find('> .title').height() - 20)
        temp = 0
        $temp.find('tr.header').each(function () {
          var $tr = $(this)
          var h = $tr.height() > 20 ? 20 : $tr.height()
          $tr.height(h)
          temp += h
        })

        temp = Math.floor(
          ($temp.height() - temp) / $temp.find('tr.value').length
        )
        $temp.find('tr.value').each(function () {
          var $tr = $(this)
          $tr.height(temp)
        })

        // compute chart size
        $pcim.find('.easyPieChart').each(function () {
          var $p = $(this)
          var w = Math.floor($p.parents('.col:first').width() * 0.8)
          $p.attr('data-pie-size', w)
            .data('easyPieChart', null)
            .data('pieSize', w)
          $p.find('canvas').remove()
        })
        // init chart
        pageSetUp()

        // compute bullet chart
        temp = $pcim.find('.easyPieChart:first').height()
        $temp = $pcim.find('.chart-container')
        temp = temp / $temp.length
        $temp
          .height(temp)
          .find('.chart-label')
          .css('lineHeight', temp + 'px')
        // init chart
        $('#feedChart').bullet({
          margin: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5,
          },
          ranges: [0, 8000, 12000],
          measures: [0],
          markers: [0],
          ticks: 0,
          min: 0,
          max: 12000,
        })
        $('#speedChart').bullet({
          margin: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5,
          },
          ranges: [0, 8000, 12000],
          measures: [0],
          markers: [0],
          ticks: 0,
          min: 0,
          max: 12000,
          reverse: true,
        })
      }
      // when image loaded
      $main.imagesLoaded(function () {
        context.debug && console.debug('image load done')
        $main.find('.machine').on('resize', resize).trigger('resize')
        start()
      })
      // bind update
      $main
        .find('.easyPieChart')
        .off('update')
        .on('update', function (ev) {
          var $chart = $(this)
          $chart
            .data('easyPieChart')
            .update(Number($chart.attr('data-percent')))
        })
      // bind update
      $main
        .find('.bulletChartContainer')
        .off('update')
        .on('update', function (ev) {
          var $chart = $(this)
          var measure = Number($chart.attr('data-value')),
            marker = Number($chart.attr('data-marker'))
          $chart
            .find('.bulletChart')
            .data('bulletChart')
            .update({
              measures: [measure],
              markers: [marker],
            })
          $chart.find('.chart-label').html(measure)
        })

      // setTimeout(function(){
      //   alert('update');
      //   $('#dFeedrateOverride').attr('data-percent', 50).trigger('update');
      //   $('#dSpeedOverride').attr('data-percent', 76).trigger('update');
      //   $('#dFeedrate').attr('data-value', 6000).attr('data-marker', 8000).trigger('update');
      //   $('#dSpeed').attr('data-value', 8000).attr('data-marker', 3000).trigger('update');
      // }, 3000);

      /*/////////////////////////////////////////////////////
        kevin 區 
      /////////////////////////////////////////////////////*/
      function start() {
        var showUnit = 'hour' //時間轉換最大單位
        var theHref = location.href
        var boxId = getURLParameter('boxId', theHref)
        var machineId = getURLParameter('machineId', theHref)
        var cncBrand = getURLParameter('cncBrand', theHref)

        $('#machineIdHead').text(servkit.getMachineName(machineId))
        $('#dMachineId').html(machineId) //機號
        $('#dMachineController').html(cncBrand) //控制器

        servkit.ajax(
          {
            //取機台型號
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_device',
              columns: ['device_id', 'device_type'],
              whereClause: 'device_id = ?',
              whereParams: [machineId],
            }),
          },
          {
            success: function (data) {
              if (data[0]) {
                //YA~有資料
                $('#dMachineType').html(data[0]['device_type']) //型號
              } else {
                $('#dMachineType').html('') //沒有值QQ
              }
            },
            fail: function (data) {
              console.warn('get MachineType fail:', data)
            },
          }
        )

        servkit.ajax(
          {
            //取廠區
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_plant_area',
              columns: ['device_id', 'plant_id'],
              whereClause: 'device_id = ?',
              whereParams: [machineId],
            }),
          },
          {
            success: function (data) {
              if (data[0]) {
                //YA~有資料
                $('#dMachineZone').html(
                  servkit.getPlantAreaName(data[0]['plant_id'])
                ) //廠區
              } else {
                $('#dMachineZone').html('') //沒有值QQ
              }
            },
            fail: function (data) {
              console.warn('get MachineType fail:', data)
            },
          }
        )

        //長header
        servkit.monitor({
          type: 'HEAD',
          monitorHeadId: 'monitorHeader',
          boxId: boxId,
          machineId: machineId,
        })

        context.commons.monitorCmd({
          boxId: boxId,
          machineId: machineId,
          callback: function (data) {
            //"G_SYSC"系統個數 (***重要，用來辨識有幾個系統)
            var feedrate, spindle //G_MODA的F是feedrate, S是spindle
            //"G_SRNE"伺服軸名稱
            if (data['G_SRNE()']) {
              var value = data['G_SRNE()'].values[0] //["X", "Z"]
              //console.log("G_SRNE: ", value);
              _.each(value, function (ele, index) {
                $('#dPos' + index).html(ele)
              })
            }

            //"G_POSM"機械座標
            if (data['G_POSM()']) {
              var value2 = data['G_POSM()'].values[0] //[0, 608.8]
              //console.log("G_POSM: ", value);
              _.each(value2, function (ele, index) {
                $('#dPos' + index + 'Mac').html(ele)
              })
            }
            //"G_POSR"相對座標
            if (data['G_POSR()']) {
              var value3 = data['G_POSR()'].values[0] //[0, 608.8]
              //console.log("G_POSR: ", value);
              _.each(value3, function (ele, index) {
                $('#dPos' + index + 'Rel').html(ele)
              })
            }
            //"G_POSA"絕對座標
            if (data['G_POSA()']) {
              var value4 = data['G_POSA()'].values[0] //[0, 608.8]
              //console.log("G_POSA: ", value);
              _.each(value4, function (ele, index) {
                $('#dPos' + index + 'Abs').html(ele)
              })
            }
            //"G_POSD"剩餘距離
            if (data['G_POSD()']) {
              var value5 = data['G_POSD()'].values[0] //[0, -604]
              //console.log("G_POSD: ", value);
              _.each(value5, function (ele, index) {
                $('#dPos' + index + 'Dis').html(ele)
              })
            }
            //"G_ELCT"通電時間
            if (data['G_ELCT()']) {
              var value6 = data['G_ELCT()'].values[0] //[29944860000]
              //console.log("G_ELCT: ", value);
              var dateValueObj = context.commons.timestamp2dateValue(
                value6[0],
                showUnit
              )
              $('#dTimesPower').find('.hours').html(dateValueObj['hour'])
              $('#dTimesPower').find('.minutes').html(dateValueObj['min'])
              $('#dTimesPower').find('.seconds').html(dateValueObj['second'])
            }
            //"G_CUTT"切削時間
            if (data['G_CUTT()']) {
              var value7 = data['G_CUTT()'].values[0] //[15474830928]
              //console.log("G_CUTT: ", value);
              var dateValueObj2 = context.commons.timestamp2dateValue(
                value7[0],
                showUnit
              )
              $('#dTimesCutting').find('.hours').html(dateValueObj2['hour'])
              $('#dTimesCutting').find('.minutes').html(dateValueObj2['min'])
              $('#dTimesCutting').find('.seconds').html(dateValueObj2['second'])
            }
            //"G_OPRT"運轉時間
            if (data['G_OPRT()']) {
              var value8 = data['G_OPRT()'].values[0] //[20504449664]
              //console.log("G_OPRT: ", value);
              var dateValueObj3 = context.commons.timestamp2dateValue(
                value8[0],
                showUnit
              )
              $('#dTimesRun').find('.hours').html(dateValueObj3['hour'])
              $('#dTimesRun').find('.minutes').html(dateValueObj3['min'])
              $('#dTimesRun').find('.seconds').html(dateValueObj3['second'])
            }
            //"G_CYCT"循環時間
            if (data['G_CYCT()']) {
              var value9 = data['G_CYCT()'].values[0] //[14432352]
              //console.log("G_CYCT: ", value);
              var dateValueObj4 = context.commons.timestamp2dateValue(
                value9[0],
                showUnit
              )
              $('#dCycleTime').find('.hours').html(dateValueObj4['hour'])
              $('#dCycleTime').find('.minutes').html(dateValueObj4['min'])
              $('#dCycleTime').find('.seconds').html(dateValueObj4['second'])
            }
            //"G_PSCP"加工零件數
            if (data['G_PSCP()']) {
              var value10 = data['G_PSCP()'].values[0] //[82]
              //console.log("G_PSCP: ", value);
              $('#dPartsCount').html(value10[0])
            }
            //"G_TOCP"加工零件總數
            if (data['G_TOCP()']) {
              var value11 = data['G_TOCP()'].values[0] //[932]
              //console.log("G_TOCP: ", value);
              $('#dPartsTotal').html(value11[0])
            }
            //"G_USCP"所需零件數
            if (data['G_USCP()']) {
              var value12 = data['G_USCP()'].values[0] //[0]
              //console.log("G_USCP: ", value);
              $('#dPartsRequired').html(value12[0])
            }
            //"G_MODA"G code; Modal code
            if (data['G_MODA()']) {
              var value13 = data['G_MODA()'].values[0] //["H|0", "D|0", "T|3", "M|70", "F|9000", "S|0", "G|"[G01,G97,G69,G98,G21,G40,G25,G22,G80,G67,G54,G6…,G49,G15,G5.5,G54.4,G80.5,G80.4,G8.9,G5.7,G10.3]""]
              //console.log("G_MODA: ", value);
              _.each(value13, function (ele) {
                var keyValue = ele.split('|')
                if (keyValue[0] !== 'G') {
                  //不是G表示Modal other code
                  switch (keyValue[0]) {
                    case 'H':
                      $('#dOtherCodeH').html(keyValue[1])
                      break
                    case 'D':
                      $('#dOtherCodeD').html(keyValue[1])
                      break
                    case 'T':
                      $('#dOtherCodeT').html(keyValue[1])
                      break
                    case 'M':
                      $('#dOtherCodeM').html(keyValue[1])
                      break
                    case 'F':
                      $('#dOtherCodeF').html(keyValue[1])
                      feedrate = keyValue[1] //***
                      break
                    case 'S':
                      $('#dOtherCodeS').html(keyValue[1])
                      spindle = keyValue[1] //***
                      break
                    default:
                      console.warn('other code not default: ', keyValue[0])
                  }
                } else {
                  //G表示Modal G-code
                  var gCodes = keyValue[1]
                    .replace(/"/g, '')
                    .replace('[', '')
                    .replace(']', '')
                    .split(',')
                  _.each(gCodes, function (gCode, index) {
                    $('#dGCode' + index).html(gCode)
                  })
                }
              })
            }
            //"G_EXEP"目前執行單節
            if (data['G_EXEP()']) {
              var value14 = data['G_EXEP()'].values[0] //["N11G1W-1010.F9000"]
              //console.log("G_EXEP: ", value);
              $('#dLineExeBlock').html(value14[0])
            }
            //"G_SPSO"主軸轉速百分比
            if (data['G_SPSO()']) {
              var value15 = data['G_SPSO()'].values[0] //[0]
              //console.log("G_SPSO: ", value);
              $('#dSpeedOverride')
                .attr('data-percent', value15[0])
                .trigger('update')
            }
            //"G_STAT"控制器端狀態
            if (data['G_STAT()']) {
              var value16 = data['G_STAT()'].values[0] //["MODE|HND", "STATUS|****", "EMG|****", "ALM|****", "MOTION|****"]
              //console.log("G_STAT: ", value);
              _.each(value16, function (ele) {
                var keyValue = ele.split('|')
                switch (keyValue[0]) {
                  case 'MODE':
                    $('#dMode').html(keyValue[1])
                    break
                  case 'STATUS':
                    $('#dStatus').html(keyValue[1])
                    break
                  case 'EMG':
                    $('#dEMG').html(keyValue[1])
                    break
                  case 'ALM':
                    $('#dALM').html(keyValue[1])
                    break
                  case 'MOTION':
                    $('#dMotion').html(keyValue[1])
                    break
                  default:
                    console.warn('not find G_STAT of sub-value: ', keyValue[0])
                }
              })
            }
            //"G_PRGM"主程式號碼
            if (data['G_PRGM()']) {
              var value17 = data['G_PRGM()'].values[0] //["O6012"]
              //console.log("G_PRGM: ", value);
              $('#dProgram').html(value17[0])
            }
            //"G_SEQN"目前執行序列號
            if (data['G_SEQN()']) {
              var value18 = data['G_SEQN()'].values[0] //["N0011"]
              //console.log("G_SEQN: ", value);
              $('#dLineNumber').html(value18[0])
            }
            //"G_FERP"進給率百分比
            if (data['G_FERP()']) {
              var value19 = data['G_FERP()'].values[0] //[100]
              //console.log("G_FERP: ", value);
              $('#dFeedrateOverride')
                .attr('data-percent', value19[0])
                .trigger('update')
            }

            //"G_SPMC"主軸負載
            if (data['G_SPMC()']) {
              var value20 = data['G_SPMC()'].values[0] //["0"]
              //console.log("G_SPMC: ", value);
              $('#dSpeed')
                .attr('data-value', value20[0])
                .attr('data-marker', spindle)
                .trigger('update')
            }
            //"G_ACTF"伺服軸實際進給率
            if (data['G_ACTF()']) {
              var value21 = data['G_ACTF()'].values[0] //[9000]
              //console.log("G_ACTF: ", value);
              $('#dFeedrate')
                .attr('data-value', value21[0])
                .attr('data-marker', feedrate)
                .trigger('update')
            }

            ////////////////////////////////////////
            //目前沒用到區
            ////////////////////////////////////////
            //"G_ACTS"主軸實際轉速
            if (data['G_ACTS()']) {
              var value22 = data['G_ACTS()'].values[0] //[0]
              //console.log("G_ACTS: ", value);
            }
            //"G_SPMS"主軸命令轉速
            if (data['G_SPMS()']) {
              var value23 = data['G_SPMS()'].values[0] //[0]
              //console.log("G_SPMS: ", value);
            }
            //"G_PRGR"執行中程式號碼
            if (data['G_PRGR()']) {
              var value24 = data['G_PRGR()'].values[0] //["O6012"]
              //console.log("G_PRGR: ", value);
            }
            //"G_PSUT"座標單位
            if (data['G_PSUT()']) {
              var value25 = data['G_PSUT()'].values[0] //["mm"]
              //console.log("G_PSUT: ", value);
            }
            //"G_FRUT"進給率單位
            if (data['G_FRUT()']) {
              var value26 = data['G_FRUT()'].values[0] //["RPM"]
              //console.log("G_FRUT: ", value);
            }
            //"G_SRMC"伺服軸負載
            if (data['G_SRMC()']) {
              var value27 = data['G_SRMC()'].values[0] //["0"]
              //console.log("G_SRMC: ", value);
            }
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
    },
    util: {
      debug: false,
      rwd: {
        sm: 768,
        md: 992,
        lg: 1200,
      },
      maxMargin: 20,
    },
    delayCondition: ['machineList'],
    dependencies: [
      ['/js/plugin/imagesLoaded/imagesloaded.pkgd.min.js'],
      ['/js/plugin/d3/d3.min.js', '/js/plugin/jqBullet/bullet.js'],
    ],
  })
}
