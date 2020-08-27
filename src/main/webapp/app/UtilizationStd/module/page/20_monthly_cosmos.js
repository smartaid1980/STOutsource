import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'

export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo(context) {
      // servkit.addChartExport('#charthead', '#bar-chart');
      context.isShowDowntimeColumns = !!servtechConfig.ST_UI_UTILIZATION_DOWNTIME
      context.initQueryForm()
      context.initReportTable()
    },
    util: {
      $startDate: $('#start-date'),
      $plantSelect: $('#plantAreaForm'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      oeeTitle: $('#month-oee1').text(),
      effectiveOeeTitle: $('#month-oee2').text(),
      $summaryInfo: $('#month-info'),
      isShowDowntimeColumns: false,
      reportTable: undefined,
      initReportTable() {
        const context = this
        const { isShowDowntimeColumns } = context
        // const excelColumnFormat = ['text', 'text', 'text', 'text', 'text', 'text', 'text', '0', '0.00%', '0.00%', 'text', 'text', '0.00%'];
        const excelColumnFormat = [
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
          'text',
          'text',
          '0.00%',
        ]
        const excelHeader = $('#report-table')
          .find('thead>tr:nth-child(2)>th')
          .toArray()
          .map((el) => el.textContent)
          .slice(0, isShowDowntimeColumns ? 13 : 10)
        excelHeader.splice(2, 0, `${i18n('Class')}`)
        const toNumber = (str) => {
          const number = Number(str.slice(0, str.length - 1)) / 100
          return isNaN(number) ? 0 : number
        }
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
              timeData = getTimeData(d, _.omit(columnIndexMap, ['part_count']))
              a.denominator += context.commons.getDenominator(timeData)
              a.operationTime += timeData.operate_millisecond
              a.cuttingTime += timeData.cutting_millisecond
              a.part_count += d[columnIndexMap.part_count]
              a.down_time_m2 += timeData.down_time_m2
              a.down_time_m3 += timeData.down_time_m3
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
        context.reportTable = createReportTable({
          $tableElement: $('#report-table'),
          $tableWidget: $('#report-table-widget'),
          rightColumn: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          hideCols: isShowDowntimeColumns ? [13] : [10, 11, 12, 13],
          columnDefs: [
            {
              type: 'natural',
              targets: [2, 3, 4, 5, 6, 10, 11],
            },
            {
              type: 'percent',
              targets: [8, 9, 12],
            },
          ],
          onDraw(tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [8, 9],
              tickColor: 'black',
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: $('#month-oee1').text(),
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)
            $('.dataTables_length').addClass('hide')
          },
          summaryInfo: {
            text(tableData, tableApi) {
              return getSummaryInfoText(tableData, {
                power_millisecond: 2,
                operate_millisecond: 3,
                cutting_millisecond: 4,
                down_time_m2: 10,
                down_time_m3: 11,
                work_shift_millisecond: 13,
                part_count: 7,
              })
            },
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
                      ...rowData.slice(2, 8),
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
                    'UtilizationMonthly' +
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
                      format: excelColumnFormat,
                    },
                  ],
                }
              }
            },
          },
          // excel: {
          //   // 根據無效時間顯示與否決定format / title / value的陣列
          //   fileName: 'UtilizationMonthly',
          //   format: isShowDowntimeColumns ? excelColumnFormat : excelColumnFormat.slice(0, 10),
          //   customDataFunc (tableData) {
          //     // tableData為dataTable的物件，需轉為陣列
          //     return Array.from(tableData).map(data => isShowDowntimeColumns ? data : data.slice(0, 10));
          //   },
          //   customHeaderFunc  (header){
          //     return isShowDowntimeColumns ? header : header.slice(0,10);
          //   }
          // }
        })
      },
      initQueryForm() {
        const context = this
        const localeMap = {
          en: 'en',
          zh: 'zh-tw',
          zh_tw: 'zh-tw',
        }
        const lang = localeMap[servkit.getCookie('lang')]
        const datetimepickerConfig = {
          defaultDate: moment().format('YYYY/MM'),
          viewMode: 'months',
          format: 'YYYY/MM',
          locale: lang,
        }
        context.$startDate.datetimepicker(datetimepickerConfig)
        renderPlantAndMachineSelect(
          plantMachineOptionMap,
          context.$plantSelect,
          context.$machineSelect
        )

        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()

          var funcName = $('#funcName').text().replace('>', ' ')
          var denominator = $('input[name="denominator"]:checked')
            .next()
            .next()
            .text()
          var datamode = $('input[name="dataName"]:checked')
            .next()
            .next()
            .text()
          var title =
            context.$startDate.val() +
            ' ' +
            funcName +
            ' ( ' +
            denominator +
            ' )'
          $('#bar-chart-title').text(title)

          context.renderTable()
        })

        var showdemoConfig
        try {
          showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
        } catch (e) {
          console.warn(e)
        } finally {
          showdemoConfig = showdemoConfig || {
            month: '2016/04',
            plant: '__ALL',
            machines: ['Machine01', 'Machine02', 'Machine03'],
          }
        }
        $('#showdemo').on('click', function (e) {
          e.preventDefault()

          context.$startDate.val(showdemoConfig.month)
          context.$plantSelect.val(showdemoConfig.plant)
          context.$plantSelect.change()
          context.$machineSelect.val(showdemoConfig.machines)
          context.$submitBtn.click()
        })
      },
      renderTable() {
        const context = this
        const {
          reportTable,
          $summaryInfo,
          oeeTitle,
          effectiveOeeTitle,
          loadingBtn,
          $machineSelect,
          $startDate,
        } = context
        var machineList = $machineSelect.val() || [],
          selectedMonth = $startDate.val(),
          startDate = moment(selectedMonth)
            .startOf('month')
            .format('YYYY/MM/DD'),
          endDate = moment(selectedMonth).endOf('month').format('YYYY/MM/DD')
        const checkedDenominator = $('[name=denominator]:checked')
        const denominator = checkedDenominator.val()
        const denominatorName = checkedDenominator.next().next().text()

        loadingBtn.doing()
        reportTable.$tableElement[0].querySelector(
          '.title-utilization'
        ).dataset.originalTitle = `${i18n(
          'Operation_Time'
        )} / ${denominatorName}`
        reportTable.$tableElement[0].querySelector(
          '.title-effective-utilization'
        ).dataset.originalTitle = `${i18n('Cutting_Time')} / ${denominatorName}`
        if (context.isShowDowntimeColumns) {
          reportTable.$tableElement[0].querySelector(
            '.title-capacity-utilization'
          ).dataset.originalTitle = `(${i18n('Operation_Time')} + ${i18n(
            'No_Work_Time'
          )}M2 + ${i18n('No_Work_Time')}M3) / ${denominatorName}`
        }
        // 參考10_daily_cosmos.html
        hippo
          .newSimpleExhaler()
          .space('product_work_utilization')
          .index('machine_id', machineList)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'macro_idle_minute_array'
          )
          .exhale(function (exhalable) {
            var groupData = _.groupBy(exhalable.exhalable, function (obj) {
              return obj.machine_id + obj.date
            })
            var downTimeDays = {}
            _.map(groupData, function (arrObj, key) {
              var sumDownTimeM2 = 0
              var sumDownTimeM3 = 0
              _.each(arrObj, function (obj) {
                var downTime = JSON.parse(obj.macro_idle_minute_array)
                sumDownTimeM2 += downTime[2] == null ? 0 : downTime[2]
                sumDownTimeM3 += downTime[3] == null ? 0 : downTime[3]
              })
              downTimeDays[key] = {
                down_time_m2: sumDownTimeM2,
                down_time_m3: sumDownTimeM3,
              }
            })
            context.commons.composeDayReportForCosmos(
              startDate,
              endDate,
              machineList,
              context.commons.composeDayReportCallBackForCosmos,
              function (
                dataMatrix,
                operSum,
                cutSum,
                denominatorSum,
                avgCapacityUtilization
              ) {
                reportTable.drawTable(dataMatrix)
                // return `${i18n('Overview')}： ${i18n('10_Average')}：${utilization}, ${i18n('Average_Effective_Utilization_Rate')}：${effectiveUtilization}${isShowDowntimeColumns ? `, ${i18n('Avg_Capacity_Utilization')}：` + capacityUtilization : ''}, ${i18n('Total_Output')}：${sumData.part_count}`;
                // $summaryInfo.text(`Avg. ${oeeTitle} : ${(operSum / denominatorSum).floatToPercentage()} /       ${effectiveOeeTitle} : ${(cutSum / denominatorSum).floatToPercentage()}`);
                loadingBtn.done()
              },
              downTimeDays
            )
          })
      },
    },
    preCondition: {},
    delayCondition: ['machineList'],
    dependencies: [
      ['/js/plugin/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'],
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
        '/js/plugin/datatables/sorting.natural.js',
        '/js/plugin/datatables/plugin/sort.percent.cust.js',
      ],
    ],
  })
}
