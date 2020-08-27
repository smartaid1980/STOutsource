import {
  getPlantMachineOptionMap,
  renderPlantAndMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'

export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#charthead', '#bar-chart-all')

      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          rightColumn: [5, 7, 8, 9, 10, 11, 12, 13, 14],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [13, 14],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#detail-oee1').text(),
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)

            $('.dataTables_length').addClass('hide')
          },
          excel: {
            fileName: 'Machine Status History',
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
              '0',
              '0',
              'text',
              'text',
            ],
          },
        }),
        workShiftTable = createReportTable({
          $tableElement: $('#work-shift-table'),
          $tableWidget: $('#work-shift-table-widget'),
          rightColumn: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [14, 15],
              xAxisLabelValueIndex: [0, 1, 2],
              yAxisLabel: $('#workshift-oee1').text(),
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)

            $('.dataTables_length').addClass('hide')
          },

          excel: {
            fileName: 'UtilizationWorkShift',
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
              '0',
              '0',
              '0',
              'text',
              'text',
              'text',
            ],
          },
        }),
        dayTable = createReportTable({
          $tableElement: $('#day-table'),
          $tableWidget: $('#day-table-widget'),
          rightColumn: [5, 6, 7, 8, 9, 10, 11, 12, 13],
          onDraw: function (tableData, pageData) {
            var chartConfig = {
              dataList: pageData,
              tickColor: 'black',
              barValueIndex: [12, 13],
              xAxisLabelValueIndex: [0, 1],
              yAxisLabel: $('#day-oee1').text(),
            }
            context.commons.drawChart(context.$barChartEle, chartConfig)

            $('.dataTables_length').addClass('hide')
          },
          excel: {
            fileName: 'UtilizationDay',
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
              '0',
              '0',
              'text',
              'text',
            ],
          },
        })

      /*
     $("tbody").append('<tr style="font-weight:bolder;color:green;">' +
     '<td colspan="8"></td>' +
     '<td class="text-right"> ' + '平均'+ '</td>'+
     '<td id="avgEff" class="text-right"> ' + '---' + '%</td>'+
     '<td id="avgeff" class="text-right"> ' + '---' + '%</td></tr>');
     */

      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment(new Date()).format('YYYY/MM/DD'))
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

        var reportType = $('input[name="dataName"]:checked').val()
        context[reportType](detailTable, workShiftTable, dayTable)
      })

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2016/04/01',
          endDate: '2016/04/19',
          plant: '__ALL',
          machines: ['Machine01', 'Machine02', 'Machine03'],
        }
      }
      $('#showdemo').on('click', function (e) {
        e.preventDefault()

        context.$startDate.val(showdemoConfig.startDate)
        context.$endDate.val(showdemoConfig.endDate)
        $('[name=dataName]').eq(2).click()
        context.$plantSelect.val(showdemoConfig.plant)
        context.$plantSelect.change()
        context.$machineSelect.val(showdemoConfig.machines)
        context.$submitBtn.click()
      })
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $plantSelect: $('#plantAreaForm'),
      $barChartEle: $('#bar-chart'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      detail: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this
        loadingBtn.doing()

        hippo
          .newSimpleExhaler()
          .space('utilization_time_detail_by_cosmos')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'work_id',
            'op',
            'program_name',
            'operator_id',
            'power_millisecond',
            'operate_millisecond',
            'cutting_millisecond',
            'idle_millisecond',
            'alarm_millisecond',
            'std_time',
            'part_count',
            'ng_quantity'
          )
          .exhale(function (exhalable) {
            var operSum = 0
            var cutSum = 0
            var denominatorSum = 0

            var result = exhalable.map(function (data) {
              var timeData = context.commons.millisecondparseInt(data)

              operSum += timeData.operate_millisecond
              cutSum += timeData.cutting_millisecond
              denominatorSum += context.commons.getDenominator(timeData)
              // because indicator have no program and cutting time ,partcount
              // use default 0 or other value will caue customer confuse
              // so change it to N.A.
              // 2017/01/25 by jaco

              var brand = servkit.getMachineBrand(timeData.machine_id)

              return [
                servkit.getMachineName(timeData.machine_id),
                timeData.date.date8BitsToSlashed(),
                timeData.work_shift,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : timeData.program_name,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : timeData.op,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : timeData.std_time,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : timeData.operator_id,
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
                  : data.part_count,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : data.ng_quantity,
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
              ]
            })

            detailTable.drawTable(result)

            var oeetitle1 = $('#detail-oee1').text()
            var oeetitel2 = $('#detail-oee2').text()

            $('#detail-info').text(
              'Avg. ' +
                oeetitle1 +
                ' : ' +
                (operSum / denominatorSum).floatToPercentage() +
                ' / ' +
                '       ' +
                oeetitel2 +
                ' : ' +
                (cutSum / denominatorSum).floatToPercentage()
            )

            detailTable.showWidget()
            workShiftTable.hideWidget()
            dayTable.hideWidget()

            loadingBtn.done()
          })
      },
      workShift: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          loadingBtn = this.loadingBtn,
          context = this,
          productInfoMap = context.preCon.productInfo
        loadingBtn.doing()

        hippo
          .newSimpleExhaler()
          .space('utilization_time_work_shift_by_cosmos')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'machine_id',
            'date',
            'work_shift',
            'work_id',
            'op',
            'operator_id',
            'power_millisecond',
            'operate_millisecond',
            'cutting_millisecond',
            'idle_millisecond',
            'alarm_millisecond',
            'work_shift_millisecond',
            'part_count',
            'ng_quantity'
          )
          .exhale(function (exhalable) {
            var operSum = 0
            var cutSum = 0
            var denominatorSum = 0

            var result = exhalable.map(function (data) {
              var timeData = context.commons.millisecondparseInt(data)

              operSum += timeData.operate_millisecond
              cutSum += timeData.cutting_millisecond
              denominatorSum += context.commons.getDenominator(timeData)

              var brand = servkit.getMachineBrand(timeData.machine_id)

              return [
                servkit.getMachineName(timeData.machine_id),
                timeData.date.date8BitsToSlashed(),
                timeData.work_shift,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : _.uniq(timeData.work_id.split(',')).join('<br>'),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : _.uniq(timeData.op.split(',')).join('<br>'),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : _.uniq(timeData.operator_id.split(',')).join('<br>'),
                timeData.power_millisecond.millisecondToHHmmss(),
                timeData.operate_millisecond.millisecondToHHmmss(),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : timeData.cutting_millisecond.millisecondToHHmmss(),
                (
                  timeData.idle_millisecond + timeData.alarm_millisecond
                ).millisecondToHHmmss(),
                (
                  timeData.work_shift_millisecond - timeData.power_millisecond
                ).millisecondToHHmmss(),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : data.part_count,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : data.ng_quantity,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : parseInt(data.part_count) - parseInt(data.ng_quantity),
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
              ]
            })
            workShiftTable.drawTable(result)

            var oeetitle1 = $('#workshift-oee1').text()
            var oeetitel2 = $('#workshift-oee2').text()

            $('#workshift-info').text(
              'Avg. ' +
                oeetitle1 +
                ' : ' +
                (operSum / denominatorSum).floatToPercentage() +
                ' / ' +
                '       ' +
                oeetitel2 +
                ' : ' +
                (cutSum / denominatorSum).floatToPercentage()
            )

            detailTable.hideWidget()
            workShiftTable.showWidget()
            dayTable.hideWidget()

            loadingBtn.done()
          })
      },
      day: function (detailTable, workShiftTable, dayTable) {
        var machineList = this.$machineSelect.val() || [],
          startDate = this.$startDate.val(),
          endDate = this.$endDate.val(),
          context = this,
          loadingBtn = this.loadingBtn
        loadingBtn.doing()
        hippo
          .newSimpleExhaler()
          .space('utilization_time_day_by_cosmos')
          .index('machine_id', machineList)
          .indexRange('date', this.$startDate.val(), this.$endDate.val())
          .columns(
            'machine_id',
            'date',
            'work_id',
            'op',
            'operator_id',
            'power_millisecond',
            'operate_millisecond',
            'cutting_millisecond',
            'idle_millisecond',
            'alarm_millisecond',
            'work_shift_millisecond',
            'part_count',
            'ng_quantity'
          )
          .exhale(function (exhalable) {
            var operSum = 0
            var cutSum = 0
            var denominatorSum = 0

            var result = exhalable.map(function (data) {
              var timeData = context.commons.millisecondparseInt(data)

              operSum += timeData.operate_millisecond
              cutSum += timeData.cutting_millisecond
              denominatorSum += context.commons.getDenominator(timeData)

              var brand = servkit.getMachineBrand(timeData.machine_id)

              return [
                servkit.getMachineName(timeData.machine_id),
                timeData.date.date8BitsToSlashed(),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : _.uniq(timeData.work_id.split(',')).join('<br>'),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : _.uniq(timeData.op.split(',')).join('<br>'),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : _.uniq(timeData.operator_id.split(',')).join('<br>'),
                timeData.power_millisecond.millisecondToHHmmss(),
                timeData.operate_millisecond.millisecondToHHmmss(),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : timeData.cutting_millisecond.millisecondToHHmmss(),
                (
                  timeData.idle_millisecond + timeData.alarm_millisecond
                ).millisecondToHHmmss(),
                (
                  timeData.work_shift_millisecond - timeData.power_millisecond
                ).millisecondToHHmmss(),
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : data.part_count,
                brand.valueOf().toUpperCase().indexOf('INDICATORLAMP') != -1
                  ? 'N.A.'
                  : data.ng_quantity,
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
              ]
            })
            dayTable.drawTable(result)

            //this.commons.updateAvg('#day-oee1','#day-oee2','#day-info',operSum,cutSum,denominatorSum);

            var oeetitle1 = $('#day-oee1').text()
            var oeetitel2 = $('#day-oee2').text()

            $('#day-info').text(
              'Avg. ' +
                oeetitle1 +
                ' : ' +
                (operSum / denominatorSum).floatToPercentage() +
                ' / ' +
                '      ' +
                oeetitel2 +
                ' : ' +
                (cutSum / denominatorSum).floatToPercentage()
            )

            detailTable.hideWidget()
            workShiftTable.hideWidget()
            dayTable.showWidget()
            loadingBtn.done()
          })
      },
    },
    preCondition: {},
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
      ],
    ],
  })
}
