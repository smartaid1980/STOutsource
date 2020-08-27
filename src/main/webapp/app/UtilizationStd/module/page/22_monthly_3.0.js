import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'

export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo(context) {
      context.isShowDowntimeColumns = !!servtechConfig.ST_UI_UTILIZATION_DOWNTIME
      context.initQueryFrom()
      context.initReportTable()
    },
    util: {
      $startMonth: $('#start-month'),
      $endMonth: $('#end-month'),
      $plantSelect: $('#plantAreaForm'),
      $machineSelect: $('#machine'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      isShowDowntimeColumns: false,
      reportTable: undefined,
      renderTable() {
        const context = this
        const { reportTable } = context
        var machineList = this.$machineSelect.val() || []
        var startMonth = moment(this.$startMonth.val())
          .startOf('month')
          .format('YYYY/MM/DD')
        var endMonth = moment(this.$endMonth.val())
          .endOf('month')
          .format('YYYY/MM/DD')
        var loadingBtn = this.loadingBtn
        const checkedDenominator = $('[name=denominator]:checked')
        const denominator = checkedDenominator.val()
        const denominatorName = checkedDenominator.next().next().text()
        loadingBtn.doing()

        servkit.ajax(
          {
            url: 'api/v3/servcore/utilization/month',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify({
              startMonth,
              endMonth,
              denominator,
              machine: machineList,
              isShowDowntime: context.isShowDowntimeColumns ? 'T' : 'F',
            }),
          },
          {
            success(data) {
              reportTable.$tableElement[0].querySelector(
                '.title-utilization'
              ).dataset.originalTitle = `${i18n(
                'Operation_Time'
              )} / ${denominatorName}`
              reportTable.$tableElement[0].querySelector(
                '.title-effective-utilization'
              ).dataset.originalTitle = `${i18n(
                'Cutting_Time'
              )} / ${denominatorName}`
              if (context.isShowDowntimeColumns) {
                reportTable.$tableElement[0].querySelector(
                  '.title-capacity-utilization'
                ).dataset.originalTitle = `(${i18n('Operation_Time')} + ${i18n(
                  'No_Work_Time'
                )}M2 + ${i18n('No_Work_Time')}M3) / ${denominatorName}`
              }
              reportTable.drawTable(
                _.map(data, (elem) => [
                  servkit.getMachineName(elem.machine_id),
                  elem.month,
                  elem.power_millisecond,
                  elem.operate_millisecond,
                  elem.cutting_millisecond,
                  elem.idle_millisecond,
                  elem.part_count,
                  elem.oee,
                  elem.effective_oee,
                  elem.m2 || '00:00:00',
                  elem.m3 || '00:00:00',
                  elem.capacity_oee || '0.00%',
                  elem.denominator,
                ])
              )
            },
            fail(data) {
              reportTable.drawTable([])
              console.warn(data)
            },
            always() {
              loadingBtn.done()
            },
          }
        )
      },
      initReportTable() {
        const context = this
        const { isShowDowntimeColumns } = context
        // const $excelBtn = $(`<button class="btn btn-success download-excel"><span class="fa fa-file-excel-o fa-lg"></span> 匯出</button>`);
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
        const excelHeader = $('#report-table')
          .find('thead>tr:nth-child(2)>th')
          .toArray()
          .map((el) => el.textContent)
          .slice(0, isShowDowntimeColumns ? 12 : 9)
        excelHeader.splice(
          2,
          0,
          `${i18n('Class')}`,
          `${i18n('Process_Program')}`
        )
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
              timeData = getTimeData(
                d,
                _.omit(columnIndexMap, ['part_count', 'denominator'])
              )
              a.denominator += d[columnIndexMap.denominator]
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
        var reportTable = (context.reportTable = createReportTable({
          $tableElement: $('#report-table'),
          $tableWidget: $('#report-table-widget'),
          rightColumn: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          hideCols: isShowDowntimeColumns ? [12] : [9, 10, 11, 12],
          columnDefs: [
            {
              type: 'natural',
              targets: [2, 3, 4, 5, 9, 10],
            },
            {
              type: 'percent',
              targets: [7, 8, 11],
            },
          ],
          summaryInfo: {
            text(tableData, tableApi) {
              return getSummaryInfoText(tableData, {
                power_millisecond: 2,
                operate_millisecond: 3,
                cutting_millisecond: 4,
                denominator: 12,
                down_time_m2: 9,
                down_time_m3: 10,
                part_count: 6,
              })
            },
          },
          // customBtns: [$excelBtn[0]],
          onDraw(tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              barValueIndex: [7, 8],
              tickColor: 'black',
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: $('#month-oee1').text(),
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)
            $('.dataTables_length').addClass('hide')
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
                    'MonthlyUtilization' +
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
        }))
        const toNumber = (str) => {
          const number = Number(str.slice(0, str.length - 1)) / 100
          return isNaN(number) ? 0 : number
        }
        // const getExcelParams = () => {
        //   const fileName = 'MonthlyUtilization' + moment().format('YYYYMMDDHHmmssSSSS');
        //   const getRowData = (rowData) => [...rowData.slice(0, 2), '---', ...rowData.slice(2, 7), ...rowData.slice(7, 9).map(toNumber)];
        //   const selectedRowData = reportTable.table.rows({ order: 'applied', search: 'applied', page: 'all' }).data().toArray();
        //   if (!selectedRowData.length) {
        //     return;
        //   }
        //   const matrices = [{
        //     x: 0,
        //     y: 1,
        //     data: selectedRowData.map(data => getRowData(data)),
        //     format: ['text', 'text', 'text', 'text', 'text', 'text', 'text', '0', '0.00%', '0.00%']
        //   }];
        //   return {
        //     templateName: "ServCore3.0_Utilization",
        //     fileName,
        //     matrices,
        //   }
        // };
        // $excelBtn.on('click', function (e) {
        //   if (!getExcelParams()) {
        //     e.stopImmediatePropagation();
        //   }
        // });
        // servkit.downloadCustomizedExcel($excelBtn, getExcelParams);
      },
      initQueryFrom() {
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

        context.$startMonth.datetimepicker(datetimepickerConfig)
        context.$endMonth.datetimepicker(datetimepickerConfig)
        context.$startMonth.on('dp.change', function (e) {
          context.$endMonth.data('DateTimePicker').minDate(e.date)
        })
        context.$endMonth.on('dp.change', function (e) {
          context.$startMonth.data('DateTimePicker').maxDate(e.date)
        })

        renderPlantAndMachineSelect(
          plantMachineOptionMap,
          context.$plantSelect,
          context.$machineSelect
        )

        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          // clear limit
          context.$endMonth.data('DateTimePicker').minDate(false)
          context.$startMonth.data('DateTimePicker').maxDate(false)

          var funcName = servkit.appMap[context.appId][context.funId].func_name
          var denominator = $('input[name="denominator"]:checked')
            .next()
            .next()
            .text()
          var title = `${context.$startMonth.val()} ~ ${context.$endMonth.val()} ${funcName.replace(
            /^\d+ /g,
            ''
          )} ( ${denominator} )`
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
            startMonth: '2018/02',
            endMonth: '2018/02',
            plant: '__ALL',
            machines: ['Machine01', 'Machine02', 'Machine03'],
          }
        }
        $('#showdemo').on('click', function (e) {
          e.preventDefault()

          context.$startMonth.val(showdemoConfig.startMonth)
          context.$endMonth.val(showdemoConfig.endMonth)
          context.$plantSelect.val(showdemoConfig.plant)
          context.$plantSelect.change()
          context.$machineSelect.val(showdemoConfig.machines)
          context.$submitBtn.click()
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
