import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  renderPlantAndMachineSelect,
  getPlantMachineOptionMap,
} from '../../../../js/servtech/module/servkit/form.js'
export default async function () {
  const plantMachineOptionMap = await getPlantMachineOptionMap()
  GoGoAppFun({
    gogo: function (context) {
      context.init()
      context.alarmCodeMap = context.preCon.alarmCodeMap
      context.alarmCodeDetailTable = createReportTable({
        $tableElement: $('#table'),
        rightColumn: [2, 5, 6, 7],
        onDraw: function (tableData, pageData) {
          $('.dataTables_length').addClass('hide')
        },
        excel: {
          template(tableHeader, tableApi) {
            return () => {
              const tableData = tableApi
                .rows()
                .data()
                .toArray()
                .map((data) => {
                  data[3] = data[3].replace(/<br>/g, '| ')
                  data[4] = data[4].replace(/<br>/g, '| ')
                  data[7] = (new Date(data[6]) - new Date(data[5])) / 86400000 // 毫秒換算成天讓 excle 用 hh:mm:ss 的格式轉換
                  return data
                })
              // tableData.unshift(tableHeader)
              return {
                templateName: 'ServCore3.0_AlarmHistory',
                fileName:
                  'AlarmHistoryDeatilByMachine' +
                  moment().format('YYYYMMDDHHmmssSSSS'),
                matrices: [
                  {
                    x: 0,
                    y: 0,
                    data: [tableHeader],
                    format: [
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
                  {
                    x: 0,
                    y: 1,
                    data: tableData,
                    format: [
                      'text',
                      'text',
                      'text',
                      'text',
                      'text',
                      'text',
                      'text',
                      'hh:mm:ss',
                    ],
                  },
                ],
              }
            }
          },
        },
      })

      context.$submitBtn.on('click', function (e) {
        e.preventDefault()
        context.loadingBtn.doing()
        context.getAlarmCodeDetail(
          context.$startDate.val(),
          context.$endDate.val(),
          context.$machineSelect.val()
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
    },
    util: {
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $machineSelect: $('#machine'),
      $plant: $('#plant'),
      $submitBtn: $('#submit-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      alarmCodeMap: {},
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
      getAlarmCodeDetail: function (startDate, endDate, machines) {
        var context = this
        hippo
          .newSimpleExhaler()
          .space('alarm_code_detail')
          .index('machine_id', machines)
          .indexRange('date', startDate, endDate)
          .columns(
            'machine_id',
            'cnc_id',
            'alarm_code',
            'start_time',
            'end_time',
            'duration'
          )
          .exhale(function (data) {
            const tableData = []
            data.exhalable
              .filter((elem) => elem.alarm_code !== '-1')
              .forEach((elem) => {
                const {
                  machine_id,
                  cnc_id,
                  alarm_code,
                  start_time,
                  end_time,
                  duration,
                } = elem
                const alarmStatus = alarm_code
                  .split(',')
                  .map(
                    (code) =>
                      `${code} : ${context.getAlarmStatus(
                        context.alarmCodeMap,
                        cnc_id,
                        code
                      )}`
                  )
                  .join('<br>')
                const alarmDesc = alarm_code
                  .split(',')
                  .map(
                    (code) =>
                      `${code} : ${context.getAlarmDesc(
                        context.alarmCodeMap,
                        cnc_id,
                        code
                      )}`
                  )
                  .join('<br>')

                tableData.push([
                  servkit.getMachineName(machine_id),
                  servkit.getBrandName(cnc_id),
                  alarm_code,
                  alarmStatus,
                  alarmDesc,
                  start_time.dateTimeBitsToFormatted(),
                  end_time.dateTimeBitsToFormatted(),
                  duration.millisecondToHHmmss(),
                ])
              })
            context.alarmCodeDetailTable.drawTable(tableData)
            context.loadingBtn.done()
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
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
