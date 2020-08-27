import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()
      context.setUpEnvironment()

      $('#style5').append(i18n('Style5')).trigger('click')

      function hashChange() {
        $('#style2').append(i18n('Style2')).trigger('click')
        $(window).off('hashchange', hashChange)
        $(window).unbind('beforeunload', hashChange)
      }
      $(window).on('hashchange', hashChange)
      $(window).bind('beforeunload', hashChange)

      // 建立站點物件
      context.createStationClass()
      // 建立倉庫物件
      context.createStorageClass()
      // 建立機台即時監控物件
      context.createMachineClass()
      // 取得機台即時狀態
      servkit.subscribe('DeviceStatus', {
        machines: [context.boxId],
        dataModeling: true,
        handler: function (response) {
          _.each(response, function (dataEle) {
            try {
              _.each(context.machines, (obj, machine) => {
                _.each(obj.params, (signal) => {
                  try {
                    obj.changeSignalHtml(
                      signal,
                      machine,
                      context.shiftDataList,
                      dataEle.getMachineValue(signal + '()', machine)[0][0]
                    )
                  } catch (e) {
                    console.warn(machine, signal, e.massage)
                  }
                })
              })
            } catch (e) {
              console.warn(e.massage)
            }
          })
        },
        allBrand: true,
      })

      servkit
        .schedule('updateTrackingData')
        .freqMillisecond(3 * 1000)
        .action(function () {
          // 取得倉庫架構
          context.getStorageStructureData()
          // 更新進出站資料
          context.getTrackingData()
        })
        .start()
      servkit
        .schedule('updateMachineStatusHistoryData')
        .freqMillisecond(5 * 60 * 1000)
        .action(function () {
          // 取得機台狀態歷史資訊
          context.getMachineStatusHistoryData()
        })
        .start()
    },
    util: {
      boxId: servkit.getBoxList()[0],
      machine1: servkit.getMachineList()[0],
      machine2: servkit.getMachineList()[1],
      stations: {},
      storages: {},
      machines: {},
      shiftDataList: {}, // 班次歷史資料(hippo)
      setUpEnvironment: function () {
        // 全螢幕 及 解除全螢幕
        const widgetGrid = document.getElementById('widget-grid')
        $('.jarviswidget-fullscreen-btn').on('click', function () {
          if ($(this).find('i').hasClass('fa-expand')) {
            if (widgetGrid.requestFullscreen) widgetGrid.requestFullscreen()
            else if (widgetGrid.msRequestFullscreen)
              widgetGrid.msRequestFullscreen()
            else if (widgetGrid.mozRequestFullScreen)
              widgetGrid.mozRequestFullScreen()
            else if (widgetGrid.webkitRequestFullscreen)
              widgetGrid.webkitRequestFullscreen()
          } else {
            if (document.exitFullscreen) document.exitFullscreen()
            else if (document.msExitFullscreen) document.msExitFullscreen()
            else if (document.mozCancelFullScreen)
              document.mozCancelFullScreen()
            else if (document.webkitExitFullscreen)
              document.webkitExitFullscreen()
          }
        })
      },
      createStationClass: function () {
        var ctx = this
        class Station {
          constructor(id, name) {
            this.id = id
            this.name = name
            this.createContainer()
          }
          createContainer() {
            var html = []
            html.push(`<div data-id="${this.id}" class="station">`)
            html.push(`  <div class="station-block"></div>`)
            html.push(`  <p>${this.name}</p>`)
            html.push(`</div>`)
            $('#station-status').prepend(html.join(''))
          }
        }
        ctx.stations['pick-up'] = new Station('pick-up', `${i18n('Reclaimer')}`)
        _.times(3, (num) => {
          var data = ctx.preCon.getLineData[num]
          ctx.stations[data.line_id] = new Station(
            data.line_id + '-in',
            `${i18n('Pit_Stop')}<br>(${data.line_name})`
          )
          ctx.stations[data.line_id] = new Station(
            data.line_id + '-out',
            `${i18n('Outbound')}`
          )
        })
        ctx.stations['store'] = new Station('store', `${i18n('Storage')}`)
      },
      getTrackingData: function () {
        var dataList = []
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table:
                'a_servtrack_view_work_tracking_rj_no_move_out_group_line_work_op',
              columns: ['line_id', 'move_in', 'move_out'],
              whereClause: `move_in is not null order by move_in desc, move_out desc limit 0,1`,
              // 加上 move_in is not null 只是因為getdata/db一定會加where
            }),
          },
          {
            success: function (response) {
              var moveIn = {}
              var moveOut = {}
              if (response[0]) {
                moveIn.name = response[0].line_id + '-in'
                moveIn.time = response[0].move_in
                moveOut.name = response[0].line_id + '-out'
                moveOut.time = response[0].move_out
              }
              dataList.push(moveIn)
              dataList.push(moveOut)
            },
          }
        )
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_log',
              whereClause: `log_time=(SELECT MAX(log_time) FROM a_storage_log)`,
            }),
          },
          {
            success: function (response) {
              var store = {}
              if (response[0]) {
                store.name = response[0].log_type === 2 ? 'pick-up' : 'store'
                store.time = response[0].log_time
              }
              dataList.push(store)
            },
          }
        )
        // servkit.ajax({
        //   url: 'api/getdata/db',
        //   type: 'POST',
        //   contentType: 'application/json',
        //   data: JSON.stringify({
        //     table: 'a_storage_pickup_log',
        //     whereClause: `create_time=(SELECT MAX(create_time) FROM a_storage_pickup_log)`
        //   })
        // }, {
        //   success: function (response) {
        //     var pickUp = {}
        //     if (response[0]) {
        //       pickUp.name = 'pick-up'
        //       pickUp.time = response[0].create_time
        //     }
        //     dataList.push(pickUp)
        //   }
        // })
        servkit
          .politeCheck()
          .until(function () {
            return dataList.length === 3
          })
          .thenDo(function () {
            console.log(dataList)
            var result = dataList.sort(function (a, b) {
              return new Date(b.time).getTime() - new Date(a.time).getTime()
            })
            $('.station.working').removeClass('working')
            $(`.station[data-id=${result[0].name}]`).addClass('working')
          })
          .tryDuration(0)
          .start()
      },
      getStorageStructureData: function () {
        var ctx = this
        _.each(ctx.preCon.getStorageData, (data, storage) => {
          servkit.ajax(
            {
              url: 'api/storage/store/' + storage + '/thing',
              type: 'GET',
            },
            {
              success: function (response) {
                if (
                  ctx.storages[storage].grid !== response.store_grid_count ||
                  ctx.storages[storage].cell !== response.store_type_cell
                ) {
                  ctx.storages[storage].createContainer(
                    response.store_grid_count,
                    response.store_type_cell
                  )
                }

                $(`#storage-status>[data-id=${storage}] .cell[style]`).attr(
                  'style',
                  ''
                )
                $(
                  `#storage-status>[data-id=${storage}] .cell-light .station-block[style]`
                ).attr('style', '')
                _.each(response.things, (val) => {
                  var $cell = $(
                    `#storage-status>[data-id=${storage}] .grid[data-index=${val.grid_index}] .cell[data-index=${val.cell_start_index}]`
                  )
                  // var html = []
                  // html.push('<span class="thing-name">' + val.thing.thing_name + '</span>')
                  // html.push(`<span>${i18n('Quantity')}：` + val.thing_pcs + '</span>')
                  // $cell.html(html.join(''))
                  $cell
                    .prev()
                    .find('.station-block')
                    .css('border', '2px solid #0b8b4373')
                    .css(
                      'background',
                      'radial-gradient(circle, rgba(51, 255, 0, 0.98) 0%, rgba(8, 118, 21, 0.7) 60%, rgba(51, 255, 0, 0.07) 100%)'
                    )
                  $cell.css('background-color', servkit.statusColors.online)
                  // $cell.attr('title', context.getTitle(val.thing, val.thing_pcs))
                  // $cell.css('flex-basis', 5 * val.thing.thing_cell + '%')
                  for (var index = 1; index < val.thing.thing_cell; index++) {
                    var $otherCell = $(
                      '.grid[data-index=' +
                        val.grid_index +
                        '] .cell[data-index=' +
                        (val.cell_start_index + index) +
                        ']'
                    )
                    $cell.css('border-right-color', 'rgb(46, 139, 87)')
                    $otherCell.css('border-left-color', 'rgb(46, 139, 87)')
                    if (index < val.thing.thing_cell - 1) {
                      $otherCell.css('border-right-color', 'rgb(46, 139, 87)')
                    }
                    $otherCell.css(
                      'background-color',
                      servkit.statusColors.online
                    )
                    // $otherCell.attr('title', context.getTitle(val.thing, val.thing_pcs))
                  }
                })
              },
            }
          )
        })
      },
      createStorageClass: function () {
        var ctx = this
        _.each(ctx.preCon.getStorageData, (data, storage) => {
          class Storage {
            constructor(id, stdData) {
              this.id = id
              this.name = stdData.name
              this.rule = stdData.rule
              this.createContainer()
            }
            createContainer(grid, cell) {
              if (this.cell !== cell) {
                this.cell = cell
                this.getCellHtml()
              }
              this.grid = grid

              var html = []
              html.push(`  <div class="store-name">${this.name}</div>`)
              for (var gridIndex = 0; gridIndex < this.grid; gridIndex++) {
                var gridHtml = []
                gridHtml.push(
                  '<div class="grid" data-index="' + gridIndex + '">'
                )
                var index = gridIndex + 1
                if (servkit.getCookie('lang') === 'en') {
                  if (index === 1) {
                    index = index + 'st'
                  } else if (index === 2) {
                    index = index + 'nd'
                  } else if (index === 3) {
                    index = index + 'rd'
                  } else {
                    index = index + 'th'
                  }
                }
                // gridHtml.push('  <span class="grid-name">' + `${i18n('Grid_Name')}`.replace('{index}', index) + '</span>')
                gridHtml.push('<div class="grid-body">')
                gridHtml = gridHtml.concat(this.cellHtml)
                gridHtml.push('  </div>')
                gridHtml.push('</div>')
                html.unshift(gridHtml.join(''))
              }

              if ($(`#storage-status [data-id=${this.id}]`).length)
                $(`#storage-status [data-id=${this.id}]`).html(html.join(''))
              else {
                html.unshift(`<div data-id="${this.id}">`)
                html.push(`</div>`)
                $('#storage-status').prepend(html.join(''))
              }
            }

            getCellHtml() {
              this.cellHtml = []
              for (var cellIndex = 0; cellIndex < this.cell; cellIndex++) {
                this.cellHtml.push('<div class="cell-container">')
                this.cellHtml.push(
                  '<div class="cell-light"><div class="station-block"></div></div>'
                )
                this.cellHtml.push(
                  '<div class="cell" data-index="' + cellIndex + '">'
                )
                this.cellHtml.push(
                  '  <span class="cell-name">' + (cellIndex + 1) + '</span>'
                )
                this.cellHtml.push('</div>')
                this.cellHtml.push('</div>')
              }
              if (this.cell > 20 && this.cell % 20) {
                var empty = 20 - (this.cell % 20)
                for (var emptyIndex = 0; emptyIndex < empty; emptyIndex++) {
                  this.cellHtml.push('<div class="cell empty"></div>')
                }
              }
            }
          }
          ctx.storages[storage] = new Storage(storage, data)
        })
      },
      createMachineClass: function () {
        class Machine {
          constructor(id, imgPath) {
            this.id = id
            this.imgPath = './app/EquipMonitor/img/machine/' + imgPath
            this.createContainer()
          }
          createContainer() {
            var html = []
            html.push(`<div data-id="${this.id}" class="machine-container">`)
            html.push(
              `  <div class="machine-title">${servkit.getMachineName(
                this.id
              )}</div>`
            )
            html.push(`  <div class="machine-body">`)
            html.push(`    <div class="machine-chart">`)
            html.push(`      <img src="${this.imgPath}"" />`)
            html.push(`      <div class="machine-pie-chart-container">`)
            html.push(`        <div class="machine-pie-chart-info"></div>`)
            html.push(`        <div class="machine-pie-chart"></div>`)
            html.push(`      </div>`)
            html.push(`    </div>`)
            html.push(`    <div class="machine-info">`)
            html.push(
              `      <div class="machine-info-title">${i18n(
                'Instant_Monitoring_Parameters'
              )}</div>`
            )
            html.push(`      <div class="machine-info-body"></div>`)
            html.push(`    </div>`)
            html.push(`  </div>`)
            html.push(`</div>`)
            $('#machine-status').append(html.join(''))
            this.$ele = $(`#machine-status [data-id=${this.id}]`)
          }
          createParamContainer(params) {
            this.params = _.chain(params)
              .map((name, key) => (key.startsWith('G_') ? key : ''))
              .filter((val) => val)
              .value()
            var html = []
            _.each(params, (name, signal) => {
              var signalID = signal.split('-')[0]
              var signalText = signal.split('-')[1]
              html.push(`<div>`)
              html.push(`  <span>${name} ： </span>`)
              if (signal.includes('G_CONS')) {
                html.push(
                  `  <div data-signal="${signalID}" class="machine-status ${signalText}"></div>`
                )
              } else
                html.push(
                  `  <span data-signal="${signalID}">${signalText || ''}</span>`
                )
              html.push(`</div>`)
            })
            this.$ele.find('.machine-info-body').html(html.join(''))
          }
          changeSignalHtml(signal, machine, shiftDataList, value) {
            const statusMap = {
              11: 'online',
              12: 'idle',
              13: 'alarm',
            }
            const $dom = this.$ele.find(
              `.machine-info-body [data-signal=${signal}]`
            )
            var text = value
            if (signal === 'G_CONS') {
              $dom
                .removeClass()
                .addClass(`machine-status ${statusMap[Number(text)]}`)
            } else {
              if (
                signal === 'G_ELCT' ||
                signal === 'G_OPRT' ||
                signal === 'G_CYCT' ||
                signal === 'G_CUTT'
              ) {
                if (shiftDataList[machine]) {
                  switch (signal) {
                    case 'G_ELCT': //通電時間
                      text =
                        parseInt(text) -
                        shiftDataList[machine].power_millisecond
                      break
                    case 'G_OPRT': // 運轉時間
                      text =
                        parseInt(text) - shiftDataList[machine].oper_millisecond
                      break
                    case 'G_CUTT': // 切削時間
                      text =
                        parseInt(text) - shiftDataList[machine].cut_millisecond
                      break
                  }
                }
                text = moment(parseInt(text)).utc().format('HH[H] mm[M] ss[S]')
              }
              $dom.html(text)
            }
          }
          drawChart(statusData) {
            var dataSet = []
            _.each(statusData, (millisecond, status) => {
              if (millisecond)
                dataSet.push({
                  data: millisecond,
                  color: servkit.statusColors[status],
                })
            })
            if (!dataSet.length)
              dataSet.push({
                data: 1,
                color: servkit.statusColors.offline,
              })

            var percentList = []
            var sum = 0
            _.each(dataSet, (d) => {
              sum += d.data
            })

            var percents = 0
            _.each(dataSet, (d, index) => {
              var percent = Math.round((d.data / sum) * 100)
              if (index === dataSet.length - 1) percent = 100 - percents
              percentList.push(percent)
              percents += percent
            })

            var option = {
              series: {
                pie: {
                  show: true,
                  innerRadius: 0.45,
                  label: {
                    show: true,
                    radius: 0.8,
                    formatter: function (label, series) {
                      var index = _.findIndex(dataSet, (val) => {
                        return series.data[0][1] === val.data
                      })
                      return `<div class="chart-label">${percentList[index]}%</div>`
                    },
                    background: {
                      opacity: 0.8,
                      color: '#000',
                    },
                  },
                  stroke: {
                    width: 0.1,
                    color: '#524e4e',
                  },
                },
              },
              legend: {
                show: false,
              },
            }

            $.plot(this.$ele.find('.machine-pie-chart'), dataSet, option)
          }
        }
        this.machines[this.machine2] = new Machine(this.machine2, 'FANUC.png')
        this.machines[this.machine1] = new Machine(
          this.machine1,
          'injection.png'
        )
        this.machines[this.machine2].createParamContainer({
          G_CONS: `${i18n('Machine_Status')}`,
          G_ELCT: `${i18n('Power_On_Time')}`,
          G_OPRT: `${i18n('Running_Time')}`,
          G_CUTT: `${i18n('Cutting_Time')}`,
          G_CYCT: `${i18n('Circulation_Time')}`,
          G_TOCP: `${i18n('Total_Processing_Components')}`,
          G_PRGM: `${i18n('Processing_Program_Name')}`,
          G_ACTF: `${i18n('Actual_Feed_Rate')}`,
          G_EXEP: `${i18n('Execute_Single_Section')}`,
          // 'G_SPMS': `${i18n('Spindle_Command_Speed')}`
        })
        this.machines[this.machine1].createParamContainer({
          'G_CONS-idle': `${i18n('Machine_Status')}`,
          '6-05H 37M 33S': `${i18n('Power_On_Time')}`,
          '7-04H 22M 01S': `${i18n('Running_Time')}`,
          '8-155': `${i18n('Total_Processing_Components')}`,
          '1-150℃': `${i18n('Mold_Temperature')}`,
          '2-80 mm/S': `${i18n('Injection_Speed')}`,
          '3-800kg/cm²': `${i18n('Injection_Pressure')}`,
          '4-50℃': `${i18n('Water_Cooled_Outlet_Temp')}`,
          '5-30℃': `${i18n('Water_Cooled_Inlet_Temp')}`,
        })
        this.machines[this.machine1].drawChart({
          online: 40,
          idle: 40,
          alarm: 20,
          offline: 0,
        })
      },
      getMachineStatusHistoryData: function () {
        var ctx = this
        ctx.getLocalTime(function (date) {
          const dateFormated = moment(date, 'YYYYMMDD').format('YYYY/MM/DD')
          ctx.machines[ctx.machine1].$ele
            .find('.machine-pie-chart-info')
            .text(dateFormated)
          ctx.machines[ctx.machine2].$ele
            .find('.machine-pie-chart-info')
            .text(dateFormated)
          hippo
            .newSimpleExhaler()
            .space('utilization_time_work_shift')
            .index('machine_id', [ctx.machine2])
            .indexRange('date', date, date)
            .columns(
              'machine_id',
              'operate_millisecond',
              'idle_millisecond',
              'alarm_millisecond',
              'offline_millisecond'
            )
            .exhale(function (exhalable) {
              if (exhalable.exhalable.length) {
                var groupData = _.groupBy(exhalable.exhalable, (val) => {
                  return val.machine_id
                })
                _.each(groupData, (data, machine) => {
                  var status = {
                    online: 0,
                    idle: 0,
                    alarm: 0,
                    offline: 0,
                  }
                  _.each(data, (val) => {
                    status.online += ctx.getMillisecondTime(
                      val.operate_millisecond
                    )
                    status.idle += ctx.getMillisecondTime(val.idle_millisecond)
                    status.alarm += ctx.getMillisecondTime(
                      val.alarm_millisecond
                    )
                    status.offline += ctx.getMillisecondTime(
                      val.offline_millisecond
                    )
                  })

                  // 先拿到當下班次結束時間，為了要扣掉未來被視為離線的時間
                  servkit.ajax(
                    {
                      url: 'api/workshift/now',
                      type: 'GET',
                      contentType: 'application/json',
                    },
                    {
                      success: function (data) {
                        status.offline -=
                          new Date(data.end).getTime() - new Date().getTime()
                        ctx.machines[machine].drawChart(status)
                      },
                    }
                  )
                })
              } else {
                // ctx.machines[ctx.machine1].drawChart({})
                ctx.machines[ctx.machine2].drawChart({})
              }
            })

          hippo
            .newSimpleExhaler()
            .space('shiftdata_for_monitor')
            .index('machine_id', [ctx.machine1, ctx.machine2])
            .indexRange('date', date, date)
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
              if (exhalable.exhalable.length) {
                _.each(
                  exhalable.exhalable,
                  (val) => (ctx.shiftDataList[val.machine_id] = val)
                )
              }
            })
        })
      },
      getLocalTime: function (callback) {
        servkit.ajax(
          {
            url: 'api/workshift/nowLogicallyDate',
            type: 'GET',
            contentType: 'application/json',
          },
          {
            success: function (date) {
              callback(date)
            },
          }
        )
      },
      getMillisecondTime: function (millisecond) {
        var time = Number(millisecond)
        if (isNaN(time)) time = 0
        return time
      },
    },
    preCondition: {
      getStorageData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
              columns: ['store_id', 'store_name', 'store_rule'],
            }),
          },
          {
            success: function (data) {
              var storageData = {}
              _.each(data, function (elem) {
                storageData[elem.store_id] = {
                  name: elem.store_name,
                  rule: JSON.parse(elem.store_rule),
                }
              })
              done(storageData)
            },
          }
        )
      },
      getLineData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_servtrack_line',
              columns: ['line_id', 'line_name'],
            }),
          },
          {
            success: function (data) {
              done(data)
            },
          }
        )
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.time.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
      ],
    ],
  })
}
