import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  renderPlantAndMachineSelect,
  getPlantMachineOptionMap,
} from '../../../../js/servtech/module/servkit/form.js'

export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo(context) {
      if (servtechConfig.ST_UI_UTILIZATION_LARGEFONT) {
        $('#widget-grid').addClass('big-widget-grid')
      }
      context.isShowDowntimeColumns = !!servtechConfig.ST_UI_UTILIZATION_DOWNTIME
      context.initQueryForm()
      context.initReportTable()
      context.initDemoConfig()
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $plantSelect: $('#plantAreaForm'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      demoStartDate: '2019/05/04',
      demoEndDate: '2019/05/07',
      result: [],
      dataCheck: false,
      filterLine: 0,
      isShowDowntimeColumns: false,
      initReportTable() {
        const context = this
        const { isShowDowntimeColumns } = context
        const $detailFilter = context.utiFilterCustBtn('detail-filter')
        const $workShiftFilter = context.utiFilterCustBtn('workshift-filter')
        const $dayFilter = context.utiFilterCustBtn('day-filter')
        const getTimeData = (rowData, columnIndexMap) => {
          let value
          return _.mapObject(columnIndexMap, (columnIndex, columnName) => {
            value = rowData[columnIndex]
            if (columnName === 'cutting_millisecond') {
              return value === 'N.A.' || value === '---'
                ? 0
                : value.HHmmssToMillisecond()
            } else {
              return value.HHmmssToMillisecond()
            }
          })
        }
        const getSummaryInfoText = (data, columnIndexMap) => {
          let timeData
          const sumData = data.reduce(
            (a, d) => {
              timeData = getTimeData(d, _.omit(columnIndexMap, 'part_count'))
              a.denominator += context.commons.getDenominator(timeData)
              a.operationTime += timeData.operate_millisecond
              a.cuttingTime += timeData.cutting_millisecond
              a.part_count += d[columnIndexMap.part_count]
              a.down_time_m2 += timeData.down_time_m2
              a.down_time_m3 += timeData.down_time_m2
              return a
            },
            {
              denominator: 0,
              operationTime: 0,
              cuttingTime: 0,
              part_count: 0,
              down_time_m2: 0,
              down_time_m3: 0,
            }
          )
          const utilization = (
            sumData.operationTime / sumData.denominator
          ).floatToPercentage()
          const effectiveUtilization = (
            sumData.cuttingTime / sumData.denominator
          ).floatToPercentage()
          const capacityUtilization = (
            (sumData.operationTime +
              sumData.down_time_m2 +
              sumData.down_time_m3) /
            sumData.denominator
          ).floatToPercentage()
          // 總覽： 平均稼動率：${}, 平均有效稼動率：${}, 平均產能稼動率：${}, 總產量：${}
          // return `${i18n('10_Average')} ${OEE} : ${utilization} /        ${EOEE} : ${effectiveUtilization}`;
          return `${i18n('Overview')}： ${i18n(
            '10_Average'
          )}：${utilization}, ${i18n(
            'Average_Effective_Utilization_Rate'
          )}：${effectiveUtilization}${
            isShowDowntimeColumns
              ? `, ${i18n('Avg_Capacity_Utilization')}：` + capacityUtilization
              : ''
          }, ${i18n('Total_Output')}：${sumData.part_count}`
        }
        const excelHeader = $('#detail-table')
          .find('thead>tr:nth-child(2)>th')
          .toArray()
          .map((el) => el.textContent)
          .slice(0, isShowDowntimeColumns ? 14 : 11)
        const excelFormat = [
          'text',
          'text',
          'text',
          'text',
          'text',
          'text',
          'text',
          'text',
          '0',
          '0.00%',
          '0.00%',
        ].concat(isShowDowntimeColumns ? ['text', 'text', '0.00%'] : [])
        // 將百分比換成數字，才能讓excel顯示出圖表，有可能是 +++ / --- 就回傳原字串
        const toNumber = (str) => {
          const number = Number(str.slice(0, str.length - 1)) / 100
          return isNaN(number) ? str : number
        }
        const detailTableConfig = {
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          autoWidth: false,
          rightColumn: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // 從0開始
          hideCols: isShowDowntimeColumns ? [14] : [11, 12, 13, 14], // 從0開始
          columnDefs: [
            {
              type: 'percent',
              targets: [9, 10, 13],
            },
          ],
          summaryInfo: {
            text(data, tableApi) {
              return getSummaryInfoText(data, {
                power_millisecond: 4,
                operate_millisecond: 5,
                cutting_millisecond: 6,
                work_shift_millisecond: 14,
                down_time_m2: 11,
                down_time_m3: 12,
                part_count: 8,
              })
            },
          },
          customBtns: [$detailFilter[0]],
          onDraw(tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [9, 10],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#detail-oee1').text(),
            }
            if (servtechConfig.ST_UI_UTILIZATION_LARGEFONT) {
              var option = {
                xaxis: {
                  font: {
                    size: 20,
                    color: '#333',
                  },
                  ticks() {
                    return _.map(pageData, function (ele, i) {
                      var tick = _.map([0, 1, 2], function (index) {
                        return ele[index]
                      }).join('</br>')
                      return [i, tick]
                    })
                  },
                },
                yaxis: {
                  min: 0,
                  max: 100,
                  axisLabel: $('#detail-oee1').text(),
                  axisLabelFontSizePixels: 20,
                  axisLabelFontFamily:
                    'Microsoft JhengHei", Helvetica, Arial, sans-serif',
                },
              }
              context.commons.drawChart(
                context.$barChartEle,
                chartConfig,
                option
              )
            } else {
              context.commons.drawChart(context.$barChartEle, chartConfig)
            }
            $('.dataTables_length').addClass('hide')
          },
          onRow(row, data) {
            if (
              context.filterLine != '' &&
              parseFloat(data[9].replace('%', '')) < context.filterLine
            ) {
              $(row).css('color', 'red')
            }
          },
          excel: {
            template(tableHeader, tableApi) {
              return () => {
                const tableData = tableApi
                  .rows()
                  .data()
                  .toArray()
                  .map((rowData) => {
                    const result = [
                      ...rowData.slice(0, 9),
                      ...rowData.slice(9, 11).map(toNumber),
                    ]
                    if (isShowDowntimeColumns) {
                      result.push(
                        ...rowData.slice(11, 13),
                        toNumber(rowData[13])
                      )
                    }
                    return result
                  })
                return {
                  templateName: 'ServCore3.0_Utilization',
                  fileName:
                    'UtilizationDetail' + moment().format('YYYYMMDDHHmmssSSSS'),
                  matrices: [
                    {
                      x: 0,
                      y: 0,
                      data: [excelHeader],
                      format: new Array(excelHeader.length).fill('text'),
                    },
                    {
                      x: 0,
                      y: 1,
                      data: tableData,
                      format: excelFormat,
                    },
                  ],
                }
              }
            },
          },
        }
        const workShiftTableConfig = {
          $tableElement: $('#work-shift-table'),
          $tableWidget: $('#work-shift-table-widget'),
          rightColumn: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          hideCols: isShowDowntimeColumns ? [13] : [10, 11, 12, 13],
          columnDefs: [
            {
              type: 'percent',
              targets: [8, 9, 12],
            },
          ],
          summaryInfo: {
            text(data, tableApi) {
              return getSummaryInfoText(data, {
                power_millisecond: 3,
                operate_millisecond: 4,
                cutting_millisecond: 5,
                work_shift_millisecond: 13,
                down_time_m2: 10,
                down_time_m3: 11,
                part_count: 7,
              })
            },
          },
          customBtns: [$workShiftFilter[0]],
          onDraw(tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [8, 9],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#workshift-oee1').text(),
            }
            if (servtechConfig.ST_UI_UTILIZATION_LARGEFONT) {
              var option = {
                xaxis: {
                  font: {
                    size: 20,
                    color: '#333',
                  },
                  ticks() {
                    return _.map(pageData, function (ele, i) {
                      var tick = _.map([0, 1, 2], function (index) {
                        return ele[index]
                      }).join('</br>')
                      return [i, tick]
                    })
                  },
                },
                yaxis: {
                  min: 0,
                  max: 100,
                  axisLabel: $('#workshift-oee1').text(),
                  axisLabelFontSizePixels: 20,
                  axisLabelFontFamily:
                    'Microsoft JhengHei", Helvetica, Arial, sans-serif',
                },
              }
              context.commons.drawChart(
                context.$barChartEle,
                chartConfig,
                option
              )
            } else {
              context.commons.drawChart(context.$barChartEle, chartConfig)
            }
            $('.dataTables_length').addClass('hide')
          },
          onRow(row, data) {
            if (
              context.filterLine != '' &&
              parseFloat(data[8].replace('%', '')) < context.filterLine
            ) {
              $(row).css('color', 'red')
            }
          },
          excel: {
            template(tableHeader, tableApi) {
              return () => {
                const tableData = tableApi
                  .rows()
                  .data()
                  .toArray()
                  .map((rowData) => {
                    const result = [
                      ...rowData.slice(0, 3),
                      '---',
                      ...rowData.slice(3, 8),
                      ...rowData.slice(8, 10).map(toNumber),
                    ]
                    if (isShowDowntimeColumns) {
                      result.push(
                        ...rowData.slice(10, 12),
                        toNumber(rowData[12])
                      )
                    }
                    return result
                  })
                return {
                  templateName: 'ServCore3.0_Utilization',
                  fileName:
                    'UtilizationWorkShift' +
                    moment().format('YYYYMMDDHHmmssSSSS'),
                  matrices: [
                    {
                      x: 0,
                      y: 0,
                      data: [excelHeader],
                      format: new Array(excelHeader.length).fill('text'),
                    },
                    {
                      x: 0,
                      y: 1,
                      data: tableData,
                      format: excelFormat,
                    },
                  ],
                }
              }
            },
          },
        }
        const dayTableConfig = {
          $tableElement: $('#day-table'),
          $tableWidget: $('#day-table-widget'),
          rightColumn: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          hideCols: isShowDowntimeColumns ? [12] : [9, 10, 11, 12],
          columnDefs: [
            {
              type: 'percent',
              targets: [7, 8, 11],
            },
          ],
          summaryInfo: {
            text(data, tableApi) {
              return getSummaryInfoText(data, {
                power_millisecond: 2,
                operate_millisecond: 3,
                cutting_millisecond: 4,
                work_shift_millisecond: 12,
                down_time_m2: 9,
                down_time_m3: 10,
                part_count: 6,
              })
            },
          },
          customBtns: [$dayFilter[0]],
          onDraw(tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [7, 8],
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: $('#day-oee1').text(),
            }
            if (servtechConfig.ST_UI_UTILIZATION_LARGEFONT) {
              var option = {
                xaxis: {
                  font: {
                    size: 20,
                    color: '#333',
                  },
                  ticks() {
                    return _.map(pageData, function (ele, i) {
                      var tick = _.map([0, 1], function (index) {
                        return ele[index]
                      }).join('</br>')
                      return [i, tick]
                    })
                  },
                },
                yaxis: {
                  min: 0,
                  max: 100,
                  axisLabel: $('#day-oee1').text(),
                  axisLabelFontSizePixels: 20,
                  axisLabelFontFamily:
                    'Microsoft JhengHei", Helvetica, Arial, sans-serif',
                },
              }
              context.commons.drawChart(
                context.$barChartEle,
                chartConfig,
                option
              )
            } else {
              context.commons.drawChart(context.$barChartEle, chartConfig)
            }
            $('.dataTables_length').addClass('hide')
          },
          onRow(row, data) {
            if (
              context.filterLine != '' &&
              parseFloat(data[7].replace('%', '')) < context.filterLine
            ) {
              $(row).css('color', 'red')
            }
          },
          excel: {
            template(tableHeader, tableApi) {
              return () => {
                const tableData = tableApi
                  .rows()
                  .data()
                  .toArray()
                  .map((rowData) => {
                    const result = [
                      ...rowData.slice(0, 2),
                      '---',
                      '---',
                      ...rowData.slice(2, 7),
                      ...rowData.slice(7, 9).map(toNumber),
                    ]
                    if (isShowDowntimeColumns) {
                      result.push(
                        ...rowData.slice(9, 11),
                        toNumber(rowData[11])
                      )
                    }
                    return result
                  })
                return {
                  templateName: 'ServCore3.0_Utilization',
                  fileName:
                    'UtilizationDay' + moment().format('YYYYMMDDHHmmssSSSS'),
                  matrices: [
                    {
                      x: 0,
                      y: 0,
                      data: [excelHeader],
                      format: new Array(excelHeader.length).fill('text'),
                    },
                    {
                      x: 0,
                      y: 1,
                      data: tableData,
                      format: excelFormat,
                    },
                  ],
                }
              }
            },
          },
        }
        let detailTable
        let workShiftTable
        let dayTable

        Array.from(
          document.getElementsByClassName('title-utilization')
        ).forEach(
          (el) =>
            (el.dataset.originalTitle = `${i18n('Operation_Time')} / ${i18n(
              'Denominator'
            )}`)
        )
        Array.from(
          document.getElementsByClassName('title-effective-utilization')
        ).forEach(
          (el) =>
            (el.dataset.originalTitle = `${i18n('Cutting_Time')} / ${i18n(
              'Denominator'
            )}`)
        )
        Array.from(
          document.getElementsByClassName('title-capacity-utilization')
        ).forEach(
          (el) =>
            (el.dataset.originalTitle = `(${i18n('Operation_Time')} + ${i18n(
              'No_Work_Time'
            )}M2 + ${i18n('No_Work_Time')}M3) / ${i18n('Denominator')}`)
        )
        if (
          !servtechConfig.ST_UI_UTILIZATION_PARTCOUNT &&
          servtechConfig.ST_UI_UTILIZATION_PARTCOUNT !== undefined
        ) {
          detailTableConfig.hideCols.push(8)
          workShiftTableConfig.hideCols.push(7)
          dayTableConfig.hideCols.push(6)
        }
        context.detailTable = detailTable = createReportTable(detailTableConfig)
        context.workShiftTable = workShiftTable = createReportTable(
          workShiftTableConfig
        )
        context.dayTable = dayTable = createReportTable(dayTableConfig)

        $detailFilter.on('keyup', function (event) {
          var curFilter = $(event.target).val()
          context.filterFunc(detailTable, curFilter)
        })
        $workShiftFilter.on('keyup', function (event) {
          var curFilter = $(event.target).val()
          context.filterFunc(workShiftTable, curFilter)
        })
        $dayFilter.on('keyup', function (event) {
          var curFilter = $(event.target).val()
          context.filterFunc(dayTable, curFilter)
        })
      },
      initDemoConfig() {
        const context = this
        var showdemoConfig
        try {
          showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
        } catch (e) {
          console.warn(e)
        } finally {
          showdemoConfig = showdemoConfig || {
            startDate: '2018/06/01',
            endDate: '2018/07/08',
            plant: '__ALL',
            machines: [
              '_FOXCONNP01D01M005',
              '_FOXCONNP01D01M006',
              '_FOXCONNP01D01M007',
            ],
          }
        }
        $('#showdemo').on('click', function (e) {
          e.preventDefault()

          context.$startDate.val(showdemoConfig.startDate)
          context.$endDate.val(showdemoConfig.endDate)
          $('[name=dataName]').eq(0).click()
          context.$plantSelect.val(showdemoConfig.plant)
          context.$plantSelect.change()
          context.$machineSelect.val(showdemoConfig.machines)
          context.$submitBtn.click()
        })
      },
      initQueryForm() {
        const context = this
        const datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        }
        const today = moment().format('YYYY/MM/DD')
        context.$startDate.datepicker(datepickerConfig).val(today)
        context.$endDate.datepicker(datepickerConfig).val(today)
        renderPlantAndMachineSelect(
          plantMachineOptionMap,
          context.$plantSelect,
          context.$machineSelect,
          context.appId,
          context.funId
        )

        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()

          if (context.$machineSelect.val() === null) {
            context.$machineSelect.find('option').prop('selected', 'selected')
          }

          var reportType = $('input[name="dataName"]:checked').val()
          context.drawTable(reportType)
        })
      },
      setChartTitle(context) {
        var funcName = $('#funcName').text().replace('>', ' ')
        var denominator = $('input[name="denominator"]:checked')
          .next()
          .next()
          .text()
        var datamode = $('input[name="dataName"]:checked').next().next().text()
        var title =
          context.$startDate.val() +
          ' - ' +
          context.$endDate.val() +
          ' ' +
          funcName +
          ' ( ' +
          datamode +
          ' / ' +
          denominator +
          ' )'
        $('#bar-chart-title').text(title)
      },
      utiFilterCustBtn(clazz) {
        return $(`<div class="smart-form col-sx-12 col-sm-8 col-md-6 col-lg-3 no-padding">
                    <label class="input">
                      <i class="icon-append fa fa-filter"></i>
                      <input type="text" class=${clazz} placeholder="${i18n(
          'utilization_filter'
        )}">
                    </label>
                  </div>`)
      },
      cutDays(start, end) {
        const diffDays = moment.duration(moment(end).diff(start)).asDays()
        const format = 'YYYY/MM/DD'
        const tempStart = moment(start),
          tempEnd = moment(end)
        const cutdays = []
        while (diffDays > 3) {
          if (moment.duration(moment(tempEnd).diff(tempStart)).asDays() > 3) {
            cutdays.push({
              start: tempStart.format(format).toString(),
              end: tempStart.add(2, 'days').format(format).toString(),
            })
            tempStart.add(1, 'days')
          } else {
            cutdays.push({
              start: tempStart.format(format).toString(),
              end: tempEnd.format(format).toString(),
            })
            break
          }
        }
        if (diffDays < 4)
          cutdays.push({
            start: start,
            end: end,
          })
        return cutdays
      },
      showTable(type) {
        const context = this
        const { detailTable, workShiftTable, dayTable } = context
        const tableArray = [detailTable, workShiftTable, dayTable]
        const denominator = $('input[name="denominator"]:checked')
          .next()
          .next()
          .text()

        let targetTableIndex
        switch (type) {
          case 'detail':
            targetTableIndex = 0
            break
          case 'workShift':
            targetTableIndex = 1
            break
          case 'day':
            targetTableIndex = 2
            break
        }
        tableArray.forEach((reportTable, i) => {
          reportTable.table.clear()
          if (i === targetTableIndex) {
            reportTable.showWidget()
            reportTable.$tableElement[0].querySelector(
              '.title-utilization'
            ).dataset.originalTitle = `${i18n(
              'Operation_Time'
            )} / ${denominator}`
            reportTable.$tableElement[0].querySelector(
              '.title-effective-utilization'
            ).dataset.originalTitle = `${i18n('Cutting_Time')} / ${denominator}`
            if (context.isShowDowntimeColumns) {
              reportTable.$tableElement[0].querySelector(
                '.title-capacity-utilization'
              ).dataset.originalTitle = `(${i18n('Operation_Time')} + ${i18n(
                'No_Work_Time'
              )}M2 + ${i18n('No_Work_Time')}M3) / ${denominator}`
            }
          } else {
            reportTable.hideWidget()
          }
        })
      },
      drawTable(type) {
        const context = this
        const machineList = context.$machineSelect.val() || []
        const cutdays = context.cutDays(
          context.$startDate.val(),
          context.$endDate.val()
        )

        context.result = []
        context.loadingBtn.doing()
        context.dataCheck = false
        context.showTable(type)
        switch (type) {
          case 'detail':
            context.renderDetailTable(cutdays, machineList)
            break
          case 'workShift':
            context.renderWorkShiftTable(cutdays, machineList)
            break
          case 'day':
            context.renderDayTable(cutdays, machineList)
            break
        }
      },
      renderDetailTable(dateSpanArray, machineList) {
        const context = this
        const promiseArray = dateSpanArray.map(
          ({ start: startDate, end: endDate }) => {
            return new Promise((res) => {
              const hippoTemp = hippo
                .newMashupExhaler()
                .space('utilization_time_detail:utd')
                .index('machine_id', machineList)
                .indexRange('date', startDate, endDate)

                .space('part_count_merged:pcm')
                .index('machine_id', machineList)
                .indexRange('date', startDate, endDate)

                .column('utd', 'machine_id')
                .column('utd', 'date')
                .column('utd', 'work_shift')
                .column('utd', 'program_name')
                .column('utd', 'power_millisecond')
                .column('utd', 'operate_millisecond')
                .column('utd', 'cutting_millisecond')
                .column('utd', 'idle_millisecond')
                .column('utd', 'alarm_millisecond')
                .column('utd', 'work_shift_millisecond')

                .column('pcm', 'part_count')
                .column('pcm', 'operate_millisecond')

              if (context.isShowDowntimeColumns) {
                hippoTemp
                  .space('product_work_utilization:pwu')
                  .index('machine_id', machineList)
                  .indexRange('date', startDate, endDate)
                  .column('pwu', 'macro_idle_minute_array')
              }

              hippoTemp
                .mashupKey('group_id', 'machine_id', 'date', 'work_shift')
                .exhale(function (exhalable) {
                  res(exhalable)
                })
            }).then((exhalable) => {
              var result = []

              exhalable.map(function (data, groupKeys) {
                context.dataCheck = true
                if (data.utd.length === 0) {
                  return null
                }
                const downtime = {
                  down_time_m2: 0,
                  down_time_m3: 0,
                }
                if (data.pwu && data.pwu.length) {
                  const macroIdle = JSON.parse(
                    data.pwu[0].macro_idle_minute_array
                  )
                  downtime.down_time_m2 =
                    macroIdle[2] == null ? 0 : macroIdle[2]
                  downtime.down_time_m3 =
                    macroIdle[3] == null ? 0 : macroIdle[3]
                }
                const timeData = context.commons.millisecondparseInt(
                  Object.assign({}, data.utd[0], downtime)
                )
                // because indicator have no program and cutting time ,partcount
                // use default 0 or other value will caue customer confuse
                // so change it to N.A.
                // 2017/01/25 by jaco

                var brand = servkit.getMachineBrand(timeData.machine_id)
                var funcbrand = _.find(
                  servkit.getAppFuncBindingBrandMachineMap(),
                  (obj) => {
                    return (
                      obj.app_id === 'UtilizationStd' &&
                      obj.func_id == '10_daily' &&
                      obj.device_id === timeData.machine_id
                    )
                  }
                )
                if (
                  funcbrand != undefined &&
                  ((funcbrand.not_default_key != undefined &&
                    funcbrand.not_default_key.includes(
                      'cutting_millisecond'
                    )) ||
                    (funcbrand.not_default_key != undefined &&
                      funcbrand.not_default_key.includes('part_count')))
                ) {
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : timeData.program_name,
                    timeData.power_millisecond.millisecondToHHmmss(),
                    timeData.operate_millisecond.millisecondToHHmmss(),
                    funcbrand.not_default_key.includes('cutting_millisecond')
                      ? '---'
                      : timeData.cutting_millisecond.millisecondToHHmmss(),
                    (
                      timeData.idle_millisecond + timeData.alarm_millisecond
                    ).millisecondToHHmmss(),
                    funcbrand.not_default_key.includes('part_count')
                      ? '---'
                      : data.pcm.length,
                    (
                      timeData.operate_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                    funcbrand.not_default_key.includes('cutting_millisecond')
                      ? '---'
                      : (
                          timeData.cutting_millisecond /
                          context.commons.getDenominator(timeData)
                        ).floatToPercentage(),
                    timeData.down_time_m2.millisecondToHHmmss(),
                    timeData.down_time_m3.millisecondToHHmmss(),
                    (
                      (timeData.operate_millisecond +
                        timeData.down_time_m2 +
                        timeData.down_time_m3) /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                    timeData.work_shift_millisecond.millisecondToHHmmss(),
                  ])
                } else {
                  result.push([
                    servkit.getMachineName(timeData.machine_id),
                    timeData.date.date8BitsToSlashed(),
                    timeData.work_shift,
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : timeData.program_name,
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
                      : data.pcm.length,
                    (
                      timeData.operate_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                    brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                      ? 'N.A.'
                      : (
                          timeData.cutting_millisecond /
                          context.commons.getDenominator(timeData)
                        ).floatToPercentage(),
                    timeData.down_time_m2.millisecondToHHmmss(),
                    timeData.down_time_m3.millisecondToHHmmss(),
                    (
                      (timeData.operate_millisecond +
                        timeData.down_time_m2 +
                        timeData.down_time_m3) /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                    timeData.work_shift_millisecond.millisecondToHHmmss(),
                  ])
                }
              })
              context.result = context.result.concat(result)
              context.detailTable.appendTable(context.result, result)
              return Promise.resolve()
            })
          }
        )
        Promise.all(promiseArray).then(() => {
          if (
            servtechConfig.ST_CUSTOMER === 'IOWM' &&
            context.dayTable.table.data().length === 0 &&
            context.$startDate.val() !== context.demoStartDate &&
            context.$endDate.val() !== context.demoEndDate
          ) {
            context.$startDate.val(context.demoStartDate)
            context.$endDate.val(context.demoEndDate)
            context.drawTable('detail')
          } else {
            if (!context.dataCheck) {
              $('#dialog-no-data').dialog('open')
              context.detailTable.table.clear().draw()
            }
            context.setChartTitle(context)
            context.loadingBtn.done()
          }
        })
      },
      renderWorkShiftTable(dateSpanArray, machineList) {
        const context = this
        context.result = []
        const promiseArray = dateSpanArray.map(
          ({ start: startDate, end: endDate }) => {
            return context
              .composeDayReport(startDate, endDate, machineList)
              .then((exhalable) => {
                var result = []
                exhalable.map(function (data, groupKeys) {
                  context.dataCheck = true
                  const downtime = {
                    down_time_m2: 0,
                    down_time_m3: 0,
                  }
                  if (data.pwu && data.pwu.length) {
                    const macroIdle = JSON.parse(
                      data.pwu[0].macro_idle_minute_array
                    )
                    downtime.down_time_m2 =
                      macroIdle[2] == null ? 0 : macroIdle[2]
                    downtime.down_time_m3 =
                      macroIdle[3] == null ? 0 : macroIdle[3]
                  }
                  var timeData = context.commons.millisecondExcludMillisecond(
                    Object.assign({}, data.utws[0], downtime)
                  )
                  var brand = servkit.getMachineBrand(timeData.machine_id)
                  var funcbrand = _.find(
                    servkit.getAppFuncBindingBrandMachineMap(),
                    (obj) => {
                      return (
                        obj.app_id === 'UtilizationStd' &&
                        obj.func_id == '10_daily' &&
                        obj.device_id === timeData.machine_id
                      )
                    }
                  )
                  if (
                    funcbrand != undefined &&
                    ((funcbrand.not_default_key != undefined &&
                      funcbrand.not_default_key.includes(
                        'cutting_millisecond'
                      )) ||
                      (funcbrand.not_default_key != undefined &&
                        funcbrand.not_default_key.includes('part_count')))
                  ) {
                    result.push([
                      servkit.getMachineName(timeData.machine_id),
                      timeData.date.date8BitsToSlashed(),
                      timeData.work_shift,
                      timeData.power_millisecond.millisecondToHHmmss(),
                      timeData.operate_millisecond.millisecondToHHmmss(),
                      funcbrand.not_default_key.includes('cutting_millisecond')
                        ? '---'
                        : timeData.cutting_millisecond.millisecondToHHmmss(),
                      (
                        timeData.idle_millisecond + timeData.alarm_millisecond
                      ).millisecondToHHmmss(),
                      funcbrand.not_default_key.includes('part_count')
                        ? '---'
                        : data.pcm.length,
                      (
                        timeData.operate_millisecond /
                        context.commons.getDenominator(timeData)
                      ).floatToPercentage(),
                      funcbrand.not_default_key.includes('cutting_millisecond')
                        ? '---'
                        : (
                            timeData.cutting_millisecond /
                            context.commons.getDenominator(timeData)
                          ).floatToPercentage(),
                      timeData.down_time_m2.millisecondToHHmmss(),
                      timeData.down_time_m3.millisecondToHHmmss(),
                      (
                        (timeData.operate_millisecond +
                          timeData.down_time_m2 +
                          timeData.down_time_m3) /
                        context.commons.getDenominator(timeData)
                      ).floatToPercentage(),
                      timeData.work_shift_millisecond.millisecondToHHmmss(),
                    ])
                  } else {
                    result.push([
                      servkit.getMachineName(timeData.machine_id),
                      timeData.date.date8BitsToSlashed(),
                      timeData.work_shift,
                      timeData.power_millisecond.millisecondToHHmmss(),
                      timeData.operate_millisecond.millisecondToHHmmss(),
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : timeData.cutting_millisecond.millisecondToHHmmss(),
                      (
                        timeData.idle_millisecond + timeData.alarm_millisecond
                      ).millisecondToHHmmss(),
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : data.pcm.length,
                      (
                        timeData.operate_millisecond /
                        context.commons.getDenominator(timeData)
                      ).floatToPercentage(),
                      brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') !=
                      -1
                        ? 'N.A.'
                        : (
                            timeData.cutting_millisecond /
                            context.commons.getDenominator(timeData)
                          ).floatToPercentage(),
                      timeData.down_time_m2.millisecondToHHmmss(),
                      timeData.down_time_m3.millisecondToHHmmss(),
                      (
                        (timeData.operate_millisecond +
                          timeData.down_time_m2 +
                          timeData.down_time_m3) /
                        context.commons.getDenominator(timeData)
                      ).floatToPercentage(),
                      timeData.work_shift_millisecond.millisecondToHHmmss(),
                    ])
                  }
                })
                context.result = context.result.concat(result)
                context.workShiftTable.appendTable(context.result, result)
                return Promise.resolve()
              })
          }
        )
        Promise.all(promiseArray).then(() => {
          if (
            servtechConfig.ST_CUSTOMER === 'IOWM' &&
            context.dayTable.table.data().length === 0 &&
            context.$startDate.val() !== context.demoStartDate &&
            context.$endDate.val() !== context.demoEndDate
          ) {
            context.$startDate.val(context.demoStartDate)
            context.$endDate.val(context.demoEndDate)
            context.drawTable('workShift')
          } else {
            if (!context.dataCheck) {
              $('#dialog-no-data').dialog('open')
              context.detailTable.table.clear().draw()
            }
            context.setChartTitle(context)
            context.loadingBtn.done()
          }
        })
      },
      composeDayReport(startDate, endDate, machineList) {
        const context = this
        return new Promise((res) => {
          let hippoTemp = hippo
            .newMashupExhaler()
            .space('utilization_time_work_shift:utws')
            .index('machine_id', machineList)
            .indexRange('date', startDate, endDate)

            .space('part_count_merged:pcm')
            .index('machine_id', machineList)
            .indexRange('date', startDate, endDate)

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

          if (context.isShowDowntimeColumns) {
            hippoTemp = hippoTemp
              .space('product_work_utilization:pwu')
              .index('machine_id', machineList)
              .indexRange('date', startDate, endDate)
              .column('pwu', 'macro_idle_minute_array')
          }

          hippoTemp
            .mashupKey('machine_id', 'date', 'work_shift')
            .exhale(function (exhalable) {
              res(exhalable)
            })
        })
      },
      // commons裡的composeDayReportCallBack不太好直接更動，所以複製一份在這裡，更改為加上班次時間欄位的版本
      composeDayReportCallBack(exhalable) {
        const context = this
        var resultGroups = {}
        exhalable.each(function (data, groupKeys) {
          const downtime = {
            down_time_m2: 0,
            down_time_m3: 0,
          }
          if (data.pwu && data.pwu.length) {
            const macroIdle = JSON.parse(data.pwu[0].macro_idle_minute_array)
            downtime.down_time_m2 = macroIdle[2] == null ? 0 : macroIdle[2]
            downtime.down_time_m3 = macroIdle[3] == null ? 0 : macroIdle[3]
          }
          context.dataCheck = true
          var timeData = Object.assign({}, data.utws[0], downtime)
          if (timeData === undefined) return // not utw
          var groupKey = timeData.machine_id + timeData.date
          var resultGroup = resultGroups[groupKey]

          if (resultGroup) {
            resultGroup.power_millisecond += timeData.power_millisecond
            resultGroup.operate_millisecond += timeData.operate_millisecond
            resultGroup.cutting_millisecond += timeData.cutting_millisecond
            resultGroup.idle_millisecond += timeData.idle_millisecond
            resultGroup.alarm_millisecond += timeData.alarm_millisecond
            resultGroup.work_shift_millisecond +=
              timeData.work_shift_millisecond
            resultGroup.down_time_m2 += timeData.down_time_m2
            resultGroup.down_time_m3 += timeData.down_time_m3
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
              'work_shift_millisecond',
              'down_time_m2',
              'down_time_m3'
            )
            resultGroup.part_count = data.pcm.length
            resultGroups[groupKey] = resultGroup
          }
        })
        var result = _.chain(resultGroups)
          .values()
          .map(function (timeData) {
            timeData = context.commons.millisecondparseInt(timeData)
            console.log(timeData)
            var brand = servkit.getMachineBrand(timeData.machine_id)
            var funcbrand = _.find(
              servkit.getAppFuncBindingBrandMachineMap(),
              (obj) => {
                return (
                  obj.app_id === 'UtilizationStd' &&
                  obj.func_id == '10_daily' &&
                  obj.device_id === timeData.machine_id
                )
              }
            )
            if (
              funcbrand != undefined &&
              ((funcbrand.not_default_key != undefined &&
                funcbrand.not_default_key.includes('cutting_millisecond')) ||
                (funcbrand.not_default_key != undefined &&
                  funcbrand.not_default_key.includes('part_count')))
            ) {
              return [
                servkit.getMachineName(timeData.machine_id),
                timeData.date.date8BitsToSlashed(),
                timeData.power_millisecond.millisecondToHHmmss(),
                timeData.operate_millisecond.millisecondToHHmmss(),
                funcbrand.not_default_key.includes('cutting_millisecond')
                  ? '---'
                  : timeData.cutting_millisecond.millisecondToHHmmss(),
                (
                  timeData.idle_millisecond + timeData.alarm_millisecond
                ).millisecondToHHmmss(),
                funcbrand.not_default_key.includes('part_count')
                  ? '---'
                  : timeData.part_count,
                (
                  timeData.operate_millisecond /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
                funcbrand.not_default_key.includes('cutting_millisecond')
                  ? '---'
                  : (
                      timeData.cutting_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                timeData.down_time_m2.millisecondToHHmmss(),
                timeData.down_time_m3.millisecondToHHmmss(),
                (
                  (timeData.operate_millisecond +
                    timeData.down_time_m2 +
                    timeData.down_time_m3) /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
                timeData.work_shift_millisecond.millisecondToHHmmss(),
              ]
            } else {
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
                  timeData.operate_millisecond /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : (
                      timeData.cutting_millisecond /
                      context.commons.getDenominator(timeData)
                    ).floatToPercentage(),
                timeData.down_time_m2.millisecondToHHmmss(),
                timeData.down_time_m3.millisecondToHHmmss(),
                (
                  (timeData.operate_millisecond +
                    timeData.down_time_m2 +
                    timeData.down_time_m3) /
                  context.commons.getDenominator(timeData)
                ).floatToPercentage(),
                timeData.work_shift_millisecond.millisecondToHHmmss(),
              ]
            }
          })
          .value()

        return Promise.resolve(result)
      },
      renderDayTable(dateSpanArray, machineList) {
        const context = this
        context.result = []
        const promiseArray = dateSpanArray.map(
          ({ start: startDate, end: endDate }) => {
            return context
              .composeDayReport(startDate, endDate, machineList)
              .then((exhalable) =>
                context.composeDayReportCallBack.call(context, exhalable)
              )
              .then((result) => {
                context.result = context.result.concat(result)
                context.dayTable.appendTable(context.result, result)
                return Promise.resolve()
              })
          }
        )
        Promise.all(promiseArray).then(() => {
          if (
            servtechConfig.ST_CUSTOMER === 'IOWM' &&
            context.dayTable.table.data().length === 0 &&
            context.$startDate.val() !== context.demoStartDate &&
            context.$endDate.val() !== context.demoEndDate
          ) {
            context.$startDate.val(context.demoStartDate)
            context.$endDate.val(context.demoEndDate)
            context.drawTable('day')
          } else {
            if (!context.dataCheck) {
              $('#dialog-no-data').dialog('open')
              context.detailTable.table.clear().draw()
            }
            context.setChartTitle(context)
            context.loadingBtn.done()
          }
        })
      },
      filterFunc(table, val) {
        var context = this
        var float = 0.0
        if (val !== '') {
          float = parseFloat(val)
        }
        if (isNaN(float)) {
          $('#dialog-no-data').text('輸入內容無法判斷')
          $('#dialog-no-data').dialog('open')
        }
        context.filterLine = float
        table.table.clear()
        table.drawTable(context.result)
      },
    },
    preCondition: {
    },
    delayCondition: ['machineList'],
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
        '/js/plugin/datatables/plugin/sort.percent.cust.js',
      ],
    ],
  })
}
