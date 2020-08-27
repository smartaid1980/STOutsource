import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        machineTimeDiffContentTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),

          excel: {
            fileName: `${i18n('Machine_Time_Diff_Query')}`,
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ],
          },
        })
      $('#detail-table tbody').css('cursor', 'pointer')
      context.initMachineSelect()
      context.$selDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var seldate = context.$selDate.val()
        var machines = context.$machine.val() || []
        context.selMachineTimeDiffContent(
          seldate,
          machines,
          machineTimeDiffContentTable,
          context.drawMachineDiffTable
        )
      })

      $('#detail-table tbody').on('click', 'tr', function (evt) {
        evt.preventDefault()
        var clickDate = $(this).find('td').eq(0).text()
        var clickMachine = $(this).find('td').eq(1).text()
        var clickWorkShift = $(this).find('td').eq(2).text()
        context.selDataDetail(
          clickDate,
          clickMachine,
          clickWorkShift,
          context.machineTimediffDetail
        )
      })
    },
    util: {
      $selDate: $('#select-date'),
      $machine: $('#machine'),
      $submitBtn: $('#submit-btn'),
      $eoeeMin: $('#eoee_Min'), //稼動時間下限
      $eoeeMax: $('#eoee_Max'), //稼動時間上限
      $idleMin: $('#idle_Min'), //閒置時間下限
      $idleMax: $('#idle_Max'), //閒置時間上限
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      //初始化機台選單
      initMachineSelect: function () {
        var deviceHtml = ''
        servkit.eachMachine(function (id, name) {
          deviceHtml +=
            '<option style="padding:3px 0 3px 3px;" value="' +
            id +
            '" selected>' +
            name +
            '</option>'
        })
        this.$machine.append(deviceHtml)
        servkit.multiselectHeightOptimization(this.$machine[0])
        this.$machine
          .on('mousedown', servkit.multiselectWithoutCtrlMouseDown)
          .on('mousemove', servkit.multiselectWithoutCtrlMouseMove)
      },
      //查詢標工差異結果
      selMachineTimeDiffContent: function (
        date,
        machines,
        machineTimeDiffContentTable,
        callback
      ) {
        var that = this
        var d = new Date(date)
        var startDate = moment(d).subtract(1, 'days').format('YYYY/MM/DD') //使用hippo 查詢時的起日為查詢日期的前一天
        var endDate = date //使用hippo 查詢時的迄日
        var getScheduleHippo //最終結果為 hippo 查出來的各班次&時數
        var getScheduleDB // 查詢DB 所得到的 所有班次
        var utilizationResult // 稼動率的資料
        var dispatchResult //  派工單的資料
        var resultData = [] // utilizationResult 與 dispatchResult 組出來的資料
        var loadingBtn = this.loadingBtn
        loadingBtn.doing()
        //查詢 派工單 的 報工時數
        hippo
          .newSimpleExhaler()
          .space('super_alloy_file_dispatchtotalminute')
          .index('dispatchminute', ['dispatchminute'])
          .columns('total_minute')
          .exhale(function (exhalable) {
            try {
              var result = exhalable.map(function (data) {
                return data.total_minute
              })
              // 因為 資料結構會是 A480,B240,C210 這樣 所以要切割開來
              getScheduleHippo = result[0].split(',')

              $.ajax({
                url: servkit.rootPath + '/api/getdata/db',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  table: 'm_work_shift_time',
                  columns: ['name', 'name'],
                }),
              }).done(function (data) {
                if (data.type === 0) {
                  var scheduleDB = data.data
                  var scheduleArray = []
                  _.each(scheduleDB, function (schedule) {
                    scheduleArray.push(schedule.name)
                  })
                  getScheduleDB = scheduleArray
                }
              })

              // 稼動率 與 partCount 組資料
              hippo
                .newMashupExhaler()
                .space('utilization_time_detail:utd')
                .index('machine_id', machines)
                .indexRange('date', startDate, endDate)

                .space('part_count_merged:pcm')
                .index('machine_id', machines)
                .indexRange('date', startDate, endDate)

                .mashupKey('group_id', 'machine_id', 'date', 'work_shift')
                .column('utd', 'machine_id')
                .column('utd', 'date')
                .column('utd', 'work_shift')
                .column('utd', 'product_id')
                .column('utd', 'program_name')
                .column('utd', 'power_millisecond')
                .column('utd', 'operate_millisecond')
                .column('utd', 'cutting_millisecond')
                .column('utd', 'idle_millisecond')
                .column('utd', 'alarm_millisecond')
                .column('utd', 'work_shift_millisecond')
                .column('pcm', 'part_count')
                .column('pcm', 'operate_millisecond')
                .exhale(function (exhalable) {
                  try {
                    var result = exhalable.map(function (data, groupKeys) {
                      var utd = data.utd[0]
                      //partcount 取得資料筆數後 轉成有小數第一位 如 1 ==> 1.0;
                      var partCount = parseFloat(data.pcm.length).toFixed(1)

                      return [
                        utd.date,
                        servkit.getMachineName(utd.machine_id),
                        utd.work_shift,
                        utd.product_id,
                        partCount,
                        utd.work_shift_millisecond,
                        utd.cutting_millisecond,
                        utd.idle_millisecond,
                      ]
                    })
                    utilizationResult = result
                  } catch (e) {
                    console.warn(e)
                  }
                })
              // hippo  取得 派工單 資料
              hippo
                .newSimpleExhaler()
                .space('super_alloy_file_dispatch')
                .index('work_shift', getScheduleHippo)
                .indexRange('date', startDate, endDate)
                .columns(
                  'machine_id',
                  'date',
                  'work_shift',
                  'man_hour',
                  'op',
                  'device_minute',
                  'dispatch_target'
                )
                .exhale(function (exhalable) {
                  try {
                    var dispatchData = []
                    exhalable.each(function (data, groupKeys) {
                      _.each(machines, function (machine) {
                        if (data.machine_id == machine) {
                          dispatchData.push([
                            data.date,
                            servkit.getMachineName(data.machine_id),
                            data.work_shift,
                            data.op,
                            data.device_minute,
                            data.man_hour,
                            data.dispatch_target,
                            data.result_output,
                          ])
                        }
                      })
                    })
                    dispatchResult = dispatchData
                  } catch (e) {
                    console.warn(e)
                  }
                })

              servkit
                .politeCheck()
                .until(function () {
                  return getScheduleDB && utilizationResult && dispatchResult
                })
                .thenDo(function () {
                  try {
                    //如果 派工單 沒有上傳的話 就將 有關 的欄位 塞成 ---
                    if (dispatchResult.length == 0) {
                      _.each(utilizationResult, function (uData) {
                        resultData.push([
                          uData[0],
                          uData[1],
                          uData[2],
                          '---',
                          uData[3],
                          '---',
                          '---',
                          '---',
                          uData[4],
                          (uData[7] / 60000).toFixed(2),
                          (uData[6] / uData[5]).floatToPercentage(),
                        ])
                      })
                      resultData = _.uniq(resultData, false, function (data) {
                        var compara = data[0] + data[1] + data[2] + data[3]
                        return compara
                      })
                    } else {
                      _.each(dispatchResult, function (dData) {
                        _.each(utilizationResult, function (uData) {
                          // 如果 日期、機台、班次 皆相符的話 塞入
                          if (
                            uData[0] == dData[0] &&
                            uData[1] == dData[1] &&
                            uData[2] == dData[2]
                          ) {
                            resultData.push([
                              uData[0],
                              uData[1],
                              uData[2],
                              dData[3],
                              uData[3],
                              dData[4],
                              dData[5],
                              dData[6],
                              uData[4],
                              (uData[7] / 60000).toFixed(2),
                              (uData[6] / uData[5]).floatToPercentage(),
                            ])
                          }
                        })
                      })
                      //由於派工單可能會有兩筆相同的資料 所以陣列會導致有兩筆一樣的資料 所以使用uniq 方法 使它變成唯一
                      resultData = _.uniq(resultData, false, function (data) {
                        var compara = data[0] + data[1] + data[2] + data[3]
                        return compara
                      })
                    }
                    //最後呼叫 callback 函式  drawMachineDiffTable;
                    callback.apply(that, [
                      getScheduleDB,
                      machineTimeDiffContentTable,
                      resultData,
                    ])
                  } catch (e) {
                    console.warn('selMachineTimeDiffContent exception :' + e)
                  }
                })
                .tryDuration(0)
                .start()
            } catch (e) {
              console.warn(e)
            }
          })
      },
      //將資料組好之後 塞入表格 的 函式
      drawMachineDiffTable: function (
        getScheduleDB,
        machineTimeDiffContentTable,
        dataResult
      ) {
        var lastWorkShift = getScheduleDB[getScheduleDB.length - 1] // getScheduleDB 的最後一筆 即為最後一班
        var d = new Date(this.$selDate.val())
        var startDate = moment(d).subtract(1, 'days').format('YYYYMMDD') //使用hippo 查詢時的起日為查詢日期的前一天
        var endDate = this.$selDate.val().replace(/\//g, '') //將日期去 斜線   如 2016/03/01 ==> 20160301
        var result = []
        var idle_Min = parseFloat(this.$idleMin.val() || 0.0).toFixed(2) //閒置時間最小值沒有輸入的話 給 0 ;
        var idle_Max = parseFloat(this.$idleMax.val() || 1440.0).toFixed(2) //閒置時間最小值沒有輸入的話 給 1440 ;
        var eoee_Min = parseFloat(this.$eoeeMin.val() || 0.0).toFixed(2) //稼動率下限沒有輸入的話 給 0 ;
        var eoee_Max = parseFloat(this.$eoeeMax.val() || 100.0).toFixed(2) //稼動率下限沒有輸入的話 給 100 ;
        idle_Min = parseFloat(idle_Min)
        idle_Max = parseFloat(idle_Max)
        eoee_Min = parseFloat(eoee_Min)
        eoee_Max = parseFloat(eoee_Max)
        try {
          _.each(dataResult, function (data) {
            var dataIdleTime = parseFloat(data[9])
            var dataEoeeTime = data[10]
            if (dataEoeeTime == '---' || dataEoeeTime == '+++') {
              dataEoeeTime = eoee_Min
            } else {
              dataEoeeTime = parseFloat(data[10].replace('%', '')).toFixed(2)
              dataEoeeTime = parseFloat(dataEoeeTime)
            }
            //當符合所有區間條件，才塞入資料
            if (
              dataIdleTime >= idle_Min &&
              dataIdleTime <= idle_Max &&
              dataEoeeTime >= eoee_Min &&
              dataEoeeTime <= eoee_Max
            ) {
              if (startDate == data[0] && lastWorkShift == data[2]) {
                result.push([
                  data[0].date8BitsToSlashed(),
                  data[1],
                  data[2],
                  data[3],
                  data[4],
                  data[5],
                  data[6],
                  data[7],
                  data[8],
                  data[9],
                  data[10],
                ])
              } else if (endDate == data[0]) {
                result.push([
                  data[0].date8BitsToSlashed(),
                  data[1],
                  data[2],
                  data[3],
                  data[4],
                  data[5],
                  data[6],
                  data[7],
                  data[8],
                  data[9],
                  data[10],
                ])
              }
            }
          })
          //塞入表格 後 並 顯示
          machineTimeDiffContentTable.drawTable(result)
          machineTimeDiffContentTable.showWidget()
        } catch (e) {
          console.warn(e)
        } finally {
          this.loadingBtn.done()
        }
      },
      //表格出現後，點選欄位 顯示Detail 的 函式
      selDataDetail: function (date, machine, workShift, callback) {
        var that = this
        //由於是點表格來作 觸發 所以 要 偵測點的位置是否有資料 如果沒有的話就不執行了
        if (date && machine && workShift) {
          var d = new Date(date.date8BitsToSlashed())
          var startDate //hippo 起日 參數
          var endDate //hippo 迄日 參數
          var machines = [machine] // 點選欄位的機台 用於hippo 的參數
          var startTag //因為 會 查詢 上一筆的資料 , 如果點到 A 上一筆 就是前一天的 C 了 就是為此而存在的
          var endTag //因為 會 查詢 下一筆的資料 , 如果點到 C 下一筆 就是下一天的 A 了 就是為此而存在的
          var nowTag // 點選該筆資料的當天
          var getScheduleHippo //派工單的 報工時數
          var getScheduleDB // DB 內的 班次

          $.ajax({
            url: servkit.rootPath + '/api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'm_work_shift_time',
              columns: ['name', 'name'],
            }),
          }).done(function (data) {
            if (data.type === 0) {
              var scheduleDB = data.data
              var scheduleArray = []
              _.each(scheduleDB, function (schedule) {
                scheduleArray.push(schedule.name)
              })
              getScheduleDB = scheduleArray
            }
          })

          hippo
            .newSimpleExhaler()
            .space('super_alloy_file_dispatchtotalminute')
            .index('dispatchminute', ['dispatchminute'])
            .columns('total_minute')
            .exhale(function (exhalable) {
              try {
                var result = exhalable.map(function (data) {
                  return data.total_minute
                })
                getScheduleHippo = result[0].split(',')

                servkit
                  .politeCheck()
                  .until(function () {
                    return getScheduleDB
                  })
                  .thenDo(function () {
                    //如果所點選的班次為第一班
                    if (workShift == getScheduleDB[0]) {
                      startDate = moment(d)
                        .subtract(1, 'days')
                        .format('YYYYMMDD') //hippo 的起日就是前一天
                      endDate = date.replace(/\//g, '')
                      startTag =
                        startDate +
                        machines +
                        getScheduleDB[getScheduleDB.length - 1] //此Tag 就是取得 前一天的最後一班
                      endTag = endDate + machines + getScheduleDB[1] //此Tag 就是取得  當天該班次的下一班
                      nowTag =
                        moment(d).format('YYYYMMDD') + machines + workShift //此Tag 就是 所點選的資料的那一班

                      // 回呼 machineTimediffDetail 函式
                      callback.apply(that, [
                        startDate,
                        endDate,
                        startTag,
                        endTag,
                        nowTag,
                        getScheduleHippo,
                        machines,
                        that.drawDetailModal,
                      ])

                      //如果選的最後一班
                    } else if (
                      workShift == getScheduleDB[getScheduleDB.length - 1]
                    ) {
                      var scheduleIndex = _.indexOf(getScheduleDB, workShift) //取得班次所在的索引位置
                      startDate = date.replace(/\//g, '') //hippo 起日
                      endDate = moment(d).add(1, 'days').format('YYYYMMDD') //hippo 迄日
                      startTag =
                        startDate + machines + getScheduleDB[scheduleIndex - 1] //取得前一班的最後一筆資料
                      endTag = endDate + machines + getScheduleDB[0] //此Tag 就是取得 下一天的第一班
                      nowTag =
                        moment(d).format('YYYYMMDD') + machines + workShift //此Tag 就是 所點選的資料的那一班

                      // 回呼 machineTimediffDetail 函式
                      callback.apply(that, [
                        startDate,
                        endDate,
                        startTag,
                        endTag,
                        nowTag,
                        getScheduleHippo,
                        machines,
                        that.drawDetailModal,
                      ])
                    } else {
                      var scheduleIndex2 = _.indexOf(getScheduleDB, workShift) //取得班次的索引位置
                      startDate = date.replace(/\//g, '')
                      startTag =
                        startDate + machines + getScheduleDB[scheduleIndex2 - 1] //該索引的前一班
                      endTag =
                        startDate + machines + getScheduleDB[scheduleIndex2 + 1] //該索引的下一班
                      nowTag =
                        moment(d).format('YYYYMMDD') + machines + workShift //此Tag 就是 所點選的資料的那一班

                      // 回呼 machineTimediffDetail 函式
                      callback.apply(that, [
                        startDate,
                        startDate,
                        startTag,
                        endTag,
                        nowTag,
                        getScheduleHippo,
                        machines,
                        that.drawDetailModal,
                      ])
                    }
                  })
                  .tryDuration(0)
                  .start()
              } catch (e) {
                console.warn(e)
              }
            })
        }
      },
      machineTimediffDetail: function (
        startDate,
        endDate,
        startTag,
        endTag,
        nowTag,
        getScheduleHippo,
        machines,
        callback
      ) {
        var that = this
        var partCountMergedData //partCount 的資料
        var dispatchData //派工單的資料
        var resultUpDown //實際的上下料次數

        hippo
          .newSimpleExhaler()
          .space('part_count_by_work_shift')
          .index('machine_id', machines)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'first_timestamp',
            'last_timestamp',
            'first_on_timestamp',
            'last_on_timestamp',
            'operate_millisecond',
            'power_millisecond',
            'cutting_millisecond',
            'idle_millisecond',
            'alarm_millisecond'
          )
          .exhale(function (exhalable) {
            try {
              var result = exhalable.map(function (data, groupKeys) {
                return [
                  data.date,
                  data.machine_id,
                  data.work_shift,
                  data.first_timestamp,
                  data.last_timestamp,
                  data.first_on_timestamp,
                  data.last_on_timestamp,
                  data.operate_millisecond,
                  data.power_millisecond,
                  data.cutting_millisecond,
                  data.idle_millisecond,
                  data.alarm_millisecond,
                ]
              })

              //將同一天同一班的資料 group 起來
              result = _.groupBy(result, function (data) {
                var comparaGroup = data[0] + data[1] + data[2]
                return comparaGroup
              })
              var comparaResult = []
              var startResult = []
              var endResult = []
              _.each(_.keys(result).sort(), function (key) {
                if (key == startTag) {
                  if (result[startTag] != undefined) {
                    var firstCount =
                      result[startTag][result[startTag].length - 1]
                    var nextFirstCountTime = result[nowTag][0][5]
                    firstCount[12] = nextFirstCountTime
                    comparaResult.push(firstCount)
                  }
                } else if (key == nowTag) {
                  var nowData = result[nowTag]
                  resultUpDown =
                    nowData.length - 1 == -1 ? 0 : nowData.length - 1

                  for (var i = 0; i < nowData.length; i++) {
                    if (i == nowData.length - 1) {
                      var nowLast = nowData[i]
                      var nextFirstCountTime2 = result[endTag][0][5]
                      nowLast[12] = nextFirstCountTime2
                      comparaResult.push(nowLast)
                    } else {
                      var now = _.flatten([nowData[i], nowData[i + 1][5]])
                      comparaResult.push(now)
                    }
                  }
                } else if (key == endTag) {
                  var endData = result[endTag]
                  var lastPrevFirstOnTime
                  if (endData.length > 1) {
                    lastPrevFirstOnTime = result[endTag][1][5]
                    var last = endData[0]
                    last[12] = lastPrevFirstOnTime
                    comparaResult.push(last)
                  } else {
                    lastPrevFirstOnTime = '---'
                    var last2 = endData[0]
                    last2[12] = lastPrevFirstOnTime
                    comparaResult.push(last2)
                  }
                  // if(result[endTag][1][5]==undefined){
                  //             lastPrevFirstOnTime= 0;
                  //         }else{
                  //             lastPrevFirstOnTime = result[endTag][1][5];
                  //         }
                  // for (var j = 0; j < endData.length; j++) {
                  //     if (j == 0) {
                  //         var last = endData[j];
                  //         last[12] = lastPrevFirstOnTime;
                  //         comparaResult.push(last);
                  //     }
                  // }
                }
              })

              partCountMergedData = comparaResult
            } catch (e) {
              console.warn(e)
            }
          })

        hippo
          .newSimpleExhaler()
          .space('super_alloy_file_dispatch')
          .index('work_shift', getScheduleHippo)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'man_hour',
            'op',
            'employee_name',
            'device_minute',
            'dispatch_target',
            'total_minute'
          )
          .exhale(function (exhalable) {
            try {
              var result = []
              exhalable.each(function (data, groupKeys) {
                _.each(machines, function (machine) {
                  if (data.machine_id == machine) {
                    result.push([
                      data.date,
                      servkit.getMachineName(data.machine_id),
                      data.work_shift,
                      data.op,
                      data.employee_name,
                      data.device_minute,
                      data.man_hour,
                      data.total_minute,
                    ])
                  }
                })
              })

              result = _.groupBy(result, function (data) {
                var comparaGroup = data[0] + data[1] + data[2]
                return comparaGroup
              })

              var comparaResult = []
              _.each(_.keys(result), function (key) {
                if (key == nowTag) {
                  var data = result[key]
                  var dataIndex = data.length
                  if (dataIndex == 1) {
                    comparaResult.push(data[0])
                  } else {
                    var empName = ''
                    var empData = _.each(data, function (data) {
                      empName += data[4]
                      empName += ','
                    })
                    empName = empName.substring(0, empName.length - 1)
                    comparaResult.push([
                      data[0][0],
                      data[0][1],
                      data[0][2],
                      data[0][3],
                      empName,
                      data[0][5],
                      data[0][6],
                      data[0][7],
                    ])
                  }
                }
              })
              dispatchData = comparaResult
            } catch (e) {
              console.warn(e)
            }
          })

        servkit
          .politeCheck()
          .until(function () {
            return partCountMergedData && dispatchData
          })
          .thenDo(function () {
            var pcmData = partCountMergedData
            var disData = dispatchData[0]
            var stdMachineMinute
            var stdPersonMinute
            if (disData === undefined) {
              stdMachineMinute = '---'
              stdPersonMinute = '---'
            } else {
              stdMachineMinute = disData[5]
              stdPersonMinute = disData[6]
            }
            var dataHeadHtml = that.detailHeadHtml(disData, resultUpDown)

            var dataTitleHtml =
              '<thead>' +
              '<tr>' +
              `<th data-class="expand">${i18n('day')}</th>` +
              `<th data-class="expand">${i18n('Work_Shift')}</th>` +
              `<th data-class="expand">${i18n('Start_On_Full_Time')}</th>` +
              `<th data-class="expand">${i18n('End_On_Full_Time')}</th>` +
              `<th data-class="expand">${i18n('Reault_Machine_Time')}</th>` +
              `<th data-class="expand">${i18n('Idle_Processing')}${i18n(
                'minute'
              )}</th>` +
              `<th data-class="expand">${i18n('Idle_Material')}${i18n(
                'minute'
              )}</th>` +
              `<th data-class="expand">${i18n('Machine_Time_Diff')}${i18n(
                'minute'
              )}</th>` +
              `<th data-class="expand">${i18n('Person_Time_Diff')}${i18n(
                'minute'
              )}</th>` +
              '</tr>' +
              '</thead>'
            var databodyHtml = '<thead>'

            _.each(pcmData, function (data) {
              databodyHtml += that.detailBodyHtml(
                data,
                stdMachineMinute,
                stdPersonMinute
              )
            })
            databodyHtml += '</thead>'
            callback.apply(that, [dataHeadHtml, dataTitleHtml + databodyHtml])
          })
          .tryDuration(0)
          .start()
      },
      //Modal 最上面的 派工單資訊
      detailHeadHtml: function (disData, resultUpDown) {
        var date = '---'
        var machine = '---'
        var employeeName = '---'
        var stdMachineMinute = '---'
        var stdPersonMinute = '---'
        var stdTotalMinute = '---'
        var totalUpDown = '---'
        var resultUpDown2 = resultUpDown
        if (disData == undefined) {
          date = '---'
          machine = '---'
          employeeName = '---'
          stdMachineMinute = '---'
          stdPersonMinute = '---'
          stdTotalMinute = '---'
          totalUpDown = '---'
          resultUpDown2 = resultUpDown
        } else {
          date = disData[0].date8BitsToSlashed()
          machine = disData[1]
          employeeName = disData[4]
          stdMachineMinute = parseFloat(disData[5])
          stdPersonMinute = parseFloat(disData[6])
          stdTotalMinute = parseFloat(disData[7])
          totalUpDown = Math.ceil(
            stdTotalMinute / (stdMachineMinute + stdPersonMinute)
          )
          resultUpDown2 = resultUpDown
        }
        var dataHeadHtml =
          `<span stryle="cursor:pointer" class="label label-success">${i18n(
            'day'
          )} :` +
          date +
          '</span>&nbsp;' +
          `<span stryle="cursor:pointer" class="label label-success">${i18n(
            'machine'
          )} :` +
          machine +
          '</span>&nbsp;' +
          `<span stryle="cursor:pointer" class="label label-success">${i18n(
            'Employee_Name'
          )} :` +
          employeeName +
          '</span>&nbsp;' +
          `<span stryle="cursor:pointer" class="label label-success">${i18n(
            'Material_Std_Count'
          )}:` +
          totalUpDown +
          `${i18n('up')}` +
          totalUpDown +
          `${i18n('down')}` +
          '</span>&nbsp;' +
          `<span stryle="cursor:pointer" class="label label-danger">${i18n(
            'Reault_Count'
          )}:` +
          resultUpDown2 +
          `${i18n('up')}` +
          resultUpDown2 +
          `${i18n('down')}` +
          '</span>&nbsp;' +
          `<span stryle="cursor:pointer" class="label label-success">${i18n(
            'Person_Time_Std'
          )}${i18n('minute')}:` +
          stdPersonMinute +
          '</span>&nbsp;' +
          `<span stryle="cursor:pointer" class="label label-success">${i18n(
            'Machine_Time_Std'
          )}${i18n('minute')}:` +
          stdMachineMinute +
          '</span>&nbsp;'

        return dataHeadHtml
      },
      //Modal 的 表格內容
      detailBodyHtml: function (pcmData, disData5, disData6) {
        var that = this
        var date = pcmData[0].date8BitsToSlashed()
        var workShift = pcmData[2]
        var startFullTime = that.dateParse(pcmData[3])
        var endFullTime = that.dateParse(pcmData[4])
        var startOnFullTime = that.dateParse(pcmData[5])
        var endOnFullTime = that.dateParse(pcmData[6])
        var prevFullTime = that.dateParse(pcmData[12])
        var startOnTime = moment(startOnFullTime).format('HH:mm:ss')
        var endOnTime = moment(endOnFullTime).format('HH:mm:ss')
        var idleTime1 =
          pcmData[10] -
          (startOnFullTime - startFullTime + (endOnFullTime - endFullTime))
        var upDownTime = prevFullTime - endFullTime
        var machineTime = endFullTime - startFullTime - idleTime1
        var machineTimeDiff = '---'
        var personTimeDiff = '---'
        if (disData5 == '---' || disData6 == '---') {
          machineTimeDiff = '---'
          personTimeDiff = '---'
        } else {
          machineTimeDiff = (machineTime / 60000 - disData5).toFixed(2)
          personTimeDiff = (
            (idleTime1 + upDownTime) / 60000 -
            disData6
          ).toFixed(2)
        }

        if (startOnFullTime == '---') {
          startOnTime = ''
        }
        if (endOnFullTime == '---') {
          endOnTime = ''
        }

        if (isNaN(idleTime1)) {
          idleTime1 = ''
        } else {
          idleTime1 = (idleTime1 / 60000).toFixed(2)
        }
        if (isNaN(upDownTime)) {
          upDownTime = ''
        } else {
          upDownTime = (upDownTime / 60000).toFixed(2)
        }
        if (isNaN(machineTime)) {
          machineTime = ''
        } else {
          machineTime = (machineTime / 60000).toFixed(2)
        }
        if (isNaN(machineTimeDiff)) {
          machineTimeDiff = ''
        }
        if (isNaN(personTimeDiff)) {
          personTimeDiff = ''
        }

        var databodyHtml =
          '<tr>' +
          '<td>' +
          date +
          '</td>' +
          '<td>' +
          workShift +
          '</td>' +
          '<td>' +
          startOnTime +
          '</td>' +
          '<td>' +
          endOnTime +
          '</td>' +
          '<td>' +
          machineTime +
          '</td>' +
          '<td>' +
          idleTime1 +
          '</td>' +
          '<td>' +
          upDownTime +
          '</td>' +
          '<td>' +
          machineTimeDiff +
          '</td>' +
          '<td>' +
          personTimeDiff +
          '</td>' +
          '</tr>'

        return databodyHtml
      },
      drawDetailModal: function (htmlHead, htmlTitle) {
        $('#detail-result-table-header')[0].innerHTML = htmlHead
        $('#detail-result-table')[0].innerHTML = htmlTitle
        var clickDate = $('#detail-result-table')
          .find('thead')
          .find('tr')
          .eq(1)
          .find('td')
          .eq(0)
        var bodys = $('#detail-result-table').find('thead').find('tr')
        var bodyLength = $('#detail-result-table').find('thead').find('tr')
          .length
        for (var i = 1; i < bodyLength; i++) {
          if (i == 1) {
            bodys.eq(i).find('td').eq(0)[0].innerHTML = ''
            bodys.eq(i).find('td').eq(3)[0].innerHTML = '---'
          } else if (i == 2) {
            bodys.eq(i).find('td').eq(0)[0].innerHTML = '' + (i - 1) + ''
            bodys.eq(i).find('td').eq(2)[0].innerHTML = '---'
          } else if (i == bodyLength - 2) {
            bodys.eq(i).find('td').eq(0)[0].innerHTML = '' + (i - 1) + ''
            bodys.eq(i).find('td').eq(3)[0].innerHTML = '---'
          } else if (i == bodyLength - 1) {
            bodys.eq(i).find('td').eq(0)[0].innerHTML = ''
            bodys.eq(i).find('td').eq(2)[0].innerHTML = '---'
          } else {
            bodys.eq(i).find('td').eq(0)[0].innerHTML = '' + (i - 1) + ''
          }
        }

        $('#detail-result').modal()
      },
      dateParse: function (date) {
        if (date == '---' || date == undefined) {
          return date
        } else {
          var year = date.substring(0, 4)
          var month = date.substring(4, 6)
          var day = date.substring(6, 8)
          var hour = date.substring(8, 10)
          var minute = date.substring(10, 12)
          var milliseconds = date.substring(12, 14)

          var fullTime = Date.parse(
            year +
              '-' +
              month +
              '-' +
              day +
              ' ' +
              hour +
              ':' +
              minute +
              ':' +
              milliseconds
          )

          return fullTime
        }
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
