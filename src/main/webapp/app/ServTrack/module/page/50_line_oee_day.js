import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  fetchDbData,
  ajax,
} from '../../../../js/servtech/module/servkit/ajax.js'
import {
  initDatePicker,
  validateForm,
  initSelect2WithData,
  loadingButton,
} from '../../../../js/servtech/module/servkit/form.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
import { colors as servkitColors } from '../../../../js/servtech/module/servkit/var.js'
import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'
import lotPurposeMap from '../lotPurposeMap.js'

export default async function () {
  const employeeMap = await fetchDbData('a_yihcheng_employee')
    .then((data) =>
      Object.fromEntries(data.map(({ emp_id, emp_name }) => [emp_id, emp_name]))
    )
    .catch((err) => {
      console.warn('fetch employee data error', err)
      return {}
    })
  const lineData = await fetchDbData('a_servtrack_line', {
    columns: ['line_id', 'line_name'],
  })
  const lineMap = lineData.reduce((acc, { line_id, line_name }) => {
    acc[line_id] = line_name
    return acc
  }, {})

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      lineMap,
      lotPurposeMap,
      datepickerConfig: {
        dateFormat: 'yy/mm/dd',
        prevText: '<i class="fa fa-chevron-left"></i>',
        nextText: '<i class="fa fa-chevron-right"></i>',
      },
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $lineId: $('#line-id'),
      $submitBtn: $('#submit-btn'),
      $dateTable: $('#date-table'),
      $demoBtn: $('#showdemo1'),
      $toolLifeChar: $('#bar-chart-h'),
      loadingBtn: loadingButton(document.getElementById('submit-btn')),
      mainReportTable: null,
      detailReportTable: null,
      main() {
        const context = this

        pageSetUp()
        context.initQueryForm()
        context.initDemo()
        context.initReportTable()
      },
      initDemo() {
        const context = this
        var showdemoConfig
        try {
          showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
        } catch (e) {
          console.warn(e)
        } finally {
          showdemoConfig = showdemoConfig || {
            startDate: '2017/09/01',
            endDate: '2017/09/30',
            line: 'BM03',
          }
        }
        context.$demoBtn.on('click', function (evt) {
          evt.preventDefault()
          context.$startDate.val(showdemoConfig.startDate)
          context.$endDate.val(showdemoConfig.endDate)
          context.$lineId.val(showdemoConfig.line).trigger('change.select2') // only for select2 plugin
          context.$submitBtn.click()
        })
      },
      initReportTable() {
        const context = this

        context.mainReportTable = createReportTable({
          $tableElement: context.$dateTable,
          $tableWidget: $('#date-table-widget'),
          rightColumn: [2, 3, 4, 5, 6, 7, 8],
          onRow(row, data) {
            var total = Number($(row).find('td').eq(8).text())
            var target = Number($(row).find('td').eq(7).text())
            if (total < target) {
              $(row).find('td').eq(8).css('color', servkitColors.red)
            }
            if (data[3] == '--') {
              $(row).find('td').eq(3).css('color', servkitColors.red)
            }
          },
          excel: {
            fileName: '50_oee',
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
            ],
            customHeaderFunc(tableHeader) {
              return _.filter(tableHeader, function (num, index) {
                var columnList = [0, 1, 2, 3, 4, 5, 6, 7, 8]
                var findIndex = _.find(columnList, (val) => {
                  return index == val
                })
                return findIndex !== undefined
              })
            },
            customDataFunc(tableData) {
              var cloneTableData = $.extend(true, {}, tableData)
              return _.map(cloneTableData, function (elem) {
                return _.filter(elem, function (num, index) {
                  var columnList = [0, 1, 2, 3, 4, 5, 6, 7, 8]
                  var findIndex = _.find(columnList, (val) => {
                    return index == val
                  })
                  return findIndex !== undefined
                })
              })
            },
          },
          showNoData: false,
        })

        context.detailReportTable = createReportTable({
          $tableElement: $('#date-table2'),
          $tableWidget: $('#date-table-widget'),
          rightColumn: [5, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
          onRow(row, data) {
            // 產能效率(WORK_TRACKING.perf)<線別產能效率目標值(LINE.perf_sp)或
            // 良率(WORK_TRACKING.quality)<線別良率目標值(LINE.line_quality_sp)以紅字顯示
            if (parseFloat(data[19]) < parseFloat(data[18])) {
              $(row).find('td').eq(19).css('color', servkitColors.red)
            }
            if (parseFloat(data[21]) < parseFloat(data[20])) {
              $(row).find('td').eq(21).css('color', servkitColors.red)
            }
            if (data[17] == '##') {
              $(row).find('td').eq(17).css('color', servkitColors.red)
            }
            if (data[22] == '##') {
              $(row).find('td').eq(22).css('color', servkitColors.red)
            }
          },
          excel: {
            fileName: '50_move_in_out_detail',
            format: Array.from(new Array(23), () => 'text'),
          },
          showNoData: false,
        })
        context.$dateTable.on('click', '[name=dayUse]', function (evt) {
          evt.preventDefault()
          const tr = this.closest('tr')
          const rowData = context.mainReportTable.getData(tr)
          const lineName = rowData[0]
          const shiftDay = rowData[1]
          const oee = rowData[8]
          context.gogoAnother({
            appId: 'ServTrack',
            funId: '51_line_use_day',
            currentTab: false,
            graceParam: {
              startDate: shiftDay,
              endDate: shiftDay,
              lineId: context.commons.checkEscapeSymbol($(this).attr('value')),
              lineName,
              oee,
            },
          })
        })
      },
      renderQueryStatus(message) {
        const context = this
        const lineId = context.$lineId.val()
          ? context.lineMap[context.$lineId.val()]
          : ''
        const currentDate = moment().format('YYYY/MM/DD HH:mm:ss')
        const dateRange = `${context.$startDate.val()}~${context.$endDate.val()}`
        const queryStatusHtmlArr = []

        queryStatusHtmlArr.push(`${i18n('ServTrack_000015')} : ${dateRange}`)
        if (lineId) {
          queryStatusHtmlArr.push(`${i18n('ServTrack_000010')} : ${lineId}`)
        }
        queryStatusHtmlArr.push(
          `${i18n('ServTrack_000019')} : ${currentDate}<br>`,
          `${i18n('ServTrack_000087')}`,
          `${i18n('ServTrack_000088')}`,
          message
        )

        Array.from(document.getElementsByClassName('query-status')).forEach(
          (el) => {
            el.innerHTML = queryStatusHtmlArr.join('<br>')
          }
        )
      },
      initQueryForm() {
        const context = this

        initDatePicker(context.$startDate, context.$endDate, true)
        initSelect2WithData(context.$lineId, context.lineMap, true, {
          minimumInputLength: 0,
          allowClear: true,
          placeholder: i18n('ServTrack_000010'),
        })
        select2AllowClearHelper(context.$lineId[0])
        context.$lineId.prop('selectedIndex', -1)
        validateForm($('#main-form'), context.$submitBtn)

        //submit click
        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          context.drawOeeTrackingTable()
        })
      },
      drawOeeTrackingTable() {
        const context = this
        const { mainReportTable, detailReportTable } = context
        const params = {
          startDate: context.$startDate.val(),
          endDate: context.$endDate.val(),
          lineId: context.commons.checkEscapeSymbol(context.$lineId.val()),
        }

        context.loadingBtn.doing()

        Promise.all([
          context.fetchOeeData(params),
          context.fetchTrackingData(params),
        ]).then(([oeeData, trackingData]) => {
          const mainTableData = oeeData.reduce((acc, data) => {
            const op_duration = data.op_duration
              ? parseFloat(data.op_duration / 60).toFixed(2)
              : '0.00'
            const aval = data.aval ? parseFloat(data.aval).toFixed(2) : '0.00'
            if (!(data.op_duration > 0 && Number(data.aval) === 0)) {
              acc.push([
                data.line_name,
                data.shift_day,
                op_duration,
                !data.output_sp && data.output_sp !== 0 ? '--' : data.output_sp,
                !data.output ? 0 : data.output,
                !data.go_quantity ? 0 : data.go_quantity,
                aval,
                data.oee_sp === '' ? '---' : parseFloat(data.oee_sp).toFixed(2),
                !data.oee ? '0.00' : parseFloat(data.oee).toFixed(2),
                `<button class="btn btn-primary" name="dayUse" ${
                  !data.output_sp && data.output_sp !== 0 ? 'disabled' : ''
                } title="${i18n('ServTrack_000081')}" value="${
                  data.line_id
                }" style="margin-right:5px">${i18n(
                  'ServTrack_000081'
                )}</button>`,
              ])
            }
            return acc
          }, [])
          let message = mainTableData.length
            ? ''
            : `${i18n('ServTrack_000082')}`
          mainReportTable.drawTable(mainTableData)
          mainReportTable.showWidget()

          const detailTableData = trackingData.map((data) => {
            return [
              data.line_name,
              data.work_id,
              data.shift_day,
              data.shift || '',
              data.product_name,
              data.op,
              data.process_name,
              /*模號*/
              data.mold_id || '',
              /*刀號*/
              data.tool_id || '',
              /*人員*/
              employeeMap[data.employee_id] || data.employee_id || '',
              /*拆單目的*/
              context.lotPurposeMap[data.lot_purpose] || '',
              parseFloat(data.std_hour).toFixed(4),
              data.user_name,
              parseFloat(data.op_duration).toFixed(4),
              data.output,
              data.go_quantity,
              data.output_sp,
              Number(data.aval) === 0 ? '##' : parseFloat(data.aval).toFixed(2),
              parseFloat(data.line_quality_sp).toFixed(2),
              parseFloat(data.quality).toFixed(2),
              parseFloat(data.perf_sp).toFixed(2),
              parseFloat(data.perf).toFixed(2),
              // 要先判斷若利用率為0，代表各線各班次天應生產工時為0，oee直接代入##
              Number(data.aval) === 0 ? '##' : parseFloat(data.oee).toFixed(2),
            ]
          })
          if (!(mainTableData.length && detailTableData.length)) {
            message += `,${i18n('ServTrack_000085')}`
          } else if (!detailTableData.length) {
            message += `${i18n('ServTrack_000080')}`
          } else {
            message += ''
          }
          context.renderQueryStatus(message)
          detailReportTable.drawTable(detailTableData)
          detailReportTable.showWidget()
          context.loadingBtn.done()
        })
      },
      fetchOeeData(params) {
        return new Promise((res) =>
          ajax(
            {
              url: 'api/servtrack/lineoeeday/readoee',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success(dbData) {
                res(dbData)
              },
              fail(data) {
                console.warn(data)
              },
            }
          )
        )
      },
      fetchTrackingData(params) {
        return new Promise((res) =>
          ajax(
            {
              url: 'api/yihcheng/lineoeeday/readtracking',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(params),
            },
            {
              success(dbData) {
                res(dbData)
              },
              fail(data) {
                console.warn(data)
              },
            }
          )
        )
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
      ['/js/plugin/select2/select2.min.js'],
    ],
    preCondition: {},
  })
}
