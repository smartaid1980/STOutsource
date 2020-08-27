import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  renderPlantAndMachineSelect,
  getPlantMachineOptionMap,
} from '../../../../js/servtech/module/servkit/form.js'
export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap(false)

  GoGoAppFun({
    gogo: function (context) {
      servkit.addChartExport('#charthead', '#bar-chart')
      pageSetUp()
      context.init()
      context.alarmCodeMap = context.preCon.alarmCodeMap

      var alarmCodeDetailTable = createReportTable({
          $tableElement: $('#table'),
          rightColumn: [5],
          onDraw: function (tableData, pageData) {
            context.drawChart(pageData)
            $('.dataTables_length').addClass('hide')
          },
          excel: {
            fileName: 'Alarm_History_ByMachine',
            format: ['text', 'text', 'text', 'text', 'text', '0'],
            customHeaderFunc(tableHeader) {
              return tableHeader.slice(0, tableHeader.length - 1) // remove last
            },
            customDataFunc(tableData) {
              return tableData
                .toArray()
                .map((rowData) =>
                  rowData
                    .slice(0, rowData.length - 1)
                    .map((data) => data.toString().replace(/<\/br>/g, ''))
                )
              // var cloneTableData = $.extend(true, {}, tableData);
              // return _.map(cloneTableData, function (data) {
              //   var elem = _.map(data, function (str) {
              //     if ((typeof str) === 'string')
              //       return str.replace(/<\/br>/g, '')
              //     return str
              //   })
              //   return [servkit.getMachineName(elem[0]), elem[1], elem[2], elem[3], elem[4], elem[5]];
              // });
            },
          },
        }),
        detailTable = createReportTable({
          $tableElement: $('#detail-table'),
          rightColumn: [1, 2, 3],
        })

      context.$submitBtn.on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()
        context.detailTableData = {}
        context.getAlarmCodeDetail(
          context.$startDate.val(),
          context.$endDate.val(),
          context.$machineSelect.val(),
          alarmCodeDetailTable
        )
      })

      context.$table.on('click', '.details', function (e) {
        e.preventDefault()
        context.$modal.modal('show')

        var data = alarmCodeDetailTable.table.row($(this).parents('tr')).data()
        var cncData = _.find(servkit.getBrandMap(), (val) => {
          return data[1] === val.name
        })
        var cncBrand = cncData.cnc_id
        var alarmCode = data[2]
        context.$modal.find('.modal-subtitle').html(
          `<dl class="dl-horizontal">
                <dt>${i18n('Cnc_Brand')}</dt>
                <dd> ${data[1]} </dd>
                <dt>${i18n('Alarm_Name')}</dt>
                <dd>${data[3]}</dd> 
                <dt>${i18n('AlarmDescription')}</dt>
                <dd>${data[4]}</dd>
              </dl>`
        )

        detailTable.drawTable(
          _.map(context.detailTableData[cncBrand + '__' + alarmCode], function (
            elem
          ) {
            var startTime = elem.start_time.dateTimeBitsToFormatted()
            var endTime = elem.end_time.dateTimeBitsToFormatted()
            return [
              servkit.getMachineName(elem.machine_id),
              startTime,
              endTime,
              (
                new Date(endTime).getTime() - new Date(startTime).getTime()
              ).millisecondToHHmmss(),
            ]
          })
        )
      })

      var showdemoConfig
      try {
        showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
      } catch (e) {
        console.warn(e)
      } finally {
        showdemoConfig = showdemoConfig || {
          startDate: '2018/06/01',
          endDate: '2018/07/09',
          machine: '_FOXCONNP01D01M005',
        }
      }
      $('#showdemo').on('click', function (e) {
        e.preventDefault()

        context.$startDate.val(showdemoConfig.startDate)
        context.$endDate.val(showdemoConfig.endDate)
        context.$plant.val(showdemoConfig.plant)
        context.$plant.trigger('change')
        context.$machineSelect.val(showdemoConfig.machine)
        context.$submitBtn.click()
      })

      if (servtechConfig.ST_CUSTOMER === 'IOWM') {
        context.$startDate.val(
          moment().subtract(1, 'months').format('YYYY/MM/DD')
        )
        context.$endDate.val(moment().format('YYYY/MM/DD'))
      }
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $plant: $('#plant'),
      $submitBtn: $('#submit-btn'),
      $barChart: $('#bar-chart'),
      $table: $('#table'),
      $modal: $('#modal'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      alarmCodeMap: {},
      detailTableData: {},
      plantData: {},
      init: function () {
        var context = this
        servkit.initDatePicker(this.$startDate, this.$endDate, true)
        renderPlantAndMachineSelect(
          plantMachineOptionMap,
          this.$plant,
          this.$machineSelect,
          this.appId,
          this.funId
        )
        context.$barChart.on('plotclick', function (event, pos, item) {
          if (item) {
            context.$table
              .find('tbody tr')
              .eq(item.seriesIndex)
              .find('button')
              .click()
          }
        })

        //避免每次modal出現的時候會被捲到最下面的窘況 (似乎是 data-toggle="modal" data-target="#modal" 造成的 )
        this.$modal.modal({
          show: false,
        })
      },
      getAlarmStatus(alarmCodeMap, cncBrand, alarmCode) {
        return alarmCodeMap[cncBrand] && alarmCodeMap[cncBrand][alarmCode]
          ? alarmCodeMap[cncBrand][alarmCode].status
          : `${i18n('Alarm_Code_Undefined')}`
      },
      getAlarmDesc(alarmCodeMap, cncBrand, alarmCode) {
        return alarmCodeMap[cncBrand] && alarmCodeMap[cncBrand][alarmCode]
          ? alarmCodeMap[cncBrand][alarmCode].desc || ''
          : `${i18n('Alarm_Code_Undefined')}`
      },
      getAlarmCodeDetail: function (startDate, endDate, machineId, table) {
        var context = this
        hippo
          .newSimpleExhaler()
          .space('alarm_code_detail')
          .index('machine_id', [machineId])
          .indexRange('date', startDate, endDate)
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
            context.detailTableData = {}
            _.each(_.sortBy(data.exhalable, 'start_time'), (elem) => {
              _.each(elem.alarm_code.split(','), (code) => {
                const key = `${elem.cnc_id}__${code}`
                if (!context.detailTableData[key]) {
                  context.detailTableData[key] = []
                }
                context.detailTableData[key].push(elem)
              })
            })
            context.detailTableData = _.groupBy(
              _.sortBy(data.exhalable, 'start_time'),
              function (elem) {
                return elem.cnc_id + '__' + elem.alarm_code
              }
            )

            //machine_id, cnc_id, alarm_code, alarm_status, count
            var tableData = []
            _.each(context.detailTableData, function (alarmInfo, brandCode) {
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
                    alamStatus += `${acode} : ${context.getAlarmStatus(
                      context.alarmCodeMap,
                      cncBrand,
                      acode
                    )} </br>`
                  }
                }
                if (alamStatus === '') {
                  alamStatus = 'N/A'
                  alarmCode = 'N/A'
                }

                tableData.push([
                  servkit.getMachineName(machineId),
                  servkit.getBrandName(cncBrand),
                  alarmCode,
                  alamStatus,
                  context.getAlarmDesc(context.alarmCodeMap, cncBrand, acode),
                  alarmInfo.length,
                  '<button class="btn btn-primary details" id="' +
                    brandCode +
                    `"> ${i18n('Alarm_Details')}` +
                    '</button>',
                ])
              }
            })

            //machine_id, cnc_id, alarm_code, count, date
            table.drawTable(tableData)
            context.loadingBtn.done()
          })
      },
      drawChart: function (pageData) {
        var context = this
        var ticks = []
        //machine_id, cnc_id, alarm_code, alarm_status, count
        var plotData = _.map(pageData, function (elem, index) {
          var alarmCode = elem[2]
          if (elem[2].length > 10)
            alarmCode = '...' + alarmCode.substr(alarmCode.length - 7)
          ticks.push([index, elem[1] + '<br>' + alarmCode])

          return {
            data: [[index, elem[5]]],
            label: elem[3],
            color: servkit.colors.red,
          }
        })

        $.plot(context.$barChart, plotData, {
          series: {
            bars: {
              show: true,
              barWidth: 0.5,
              align: 'center',
            },
          },
          xaxis: {
            axisLabel: `${i18n('AlarmCode')}`,
            ticks: ticks,
            axisLabelFontFamily: servkit.fonts,
            axisLabelUseHtml: true,
            axisLabelPadding: 5,
            labelWidth: $('#bar-chart').width() / 15,
          },
          yaxis: {
            min: 0,
            axisLabel: `${i18n('AlarmNumber')}`,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: servkit.fonts,
            axisLabelUseHtml: true,
            axisLabelPadding: 5,
            tickDecimals: 0,
            minTickSize: 1,
          },
          legend: {
            show: false,
          },
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
            content: '%s<span>%y</span>',
            defaultTheme: false,
          },
        })
      },
    },
    delayCondition: ['machineList'],
    preCondition: {
      alarmCodeMap: function (done) {
        this.commons.alarmCodeMap(done)
      },
    },
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
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
