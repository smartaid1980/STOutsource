import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  initSelect2WithData,
  initDatePicker,
  loadingButton,
  validateForm,
} from '../../../../js/servtech/module/servkit/form.js'
import lotPurposeMap from '../lotPurposeMap.js'
import {
  fetchDbData,
  ajax,
} from '../../../../js/servtech/module/servkit/ajax.js'
import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
import {
  colors as servkitColors,
  fonts,
} from '../../../../js/servtech/module/servkit/var.js'

export default async function () {
  const employeeMap = await fetchDbData('a_yihcheng_employee')
    .then((data) =>
      Object.fromEntries(data.map(({ emp_id, emp_name }) => [emp_id, emp_name]))
    )
    .catch((err) => {
      console.warn('fetch employee data error', err)
      return {}
    })
  const productData = await fetchDbData('a_servtrack_product', {
    columns: ['product_id', 'product_name', 'is_open'],
  })
  const workData = await fetchDbData('a_servtrack_work', {
    columns: ['work_id'],
  })
  const productMap = productData.reduce((acc, map) => {
    acc[map.product_id] = map.product_name
    return acc
  }, {})
  const workIdList = _.pluck(workData, 'work_id')

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      lotPurposeMap,
      employeeMap,
      workIdList,
      productMap,
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $workId: $('#work-id'),
      $productId: $('#product-id'),
      $multiConditionSubmitBtn: $('#submit-btn'),
      $queryByWorkIdSubmitBtn: $('#submit-btn2'),
      $workStatus: $('[name=work-status]'),
      $demoBtn: $('#demo-btn'),
      $demoBtn2: $('#demo-btn2'),
      $labelColor: $('#label-color'),
      $modalBarChart: $('#bar-chart-h'),
      $barChartTitle: $('#bar-chart-title'),
      loadingBtn: loadingButton(document.getElementById('submit-btn')),
      loadingBtn2: loadingButton(document.getElementById('submit-btn2')),
      mainReportTable: null,
      detailReportTable: null,
      workStatusMap: {
        2: i18n('ServTrack_000093'),
        999: i18n('ServTrack_000097'),
      },
      main() {
        const context = this
        pageSetUp()
        context.initQueryForm()
        context.initReportTable()
        context.initDemo()

        const barChartLegendHtml = `<span class="btn" style="background:${
          servkitColors.green
        }"></span>&nbsp;<span>${i18n(
          'ServTrack_000108'
        )}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="btn" style="background:${
          servkitColors.white
        };border: 2px solid${servkitColors.red}"></span>&nbsp;<span>${i18n(
          'ServTrack_000146'
        )}</span>`
        context.$labelColor.html(barChartLegendHtml)
      },
      initReportTable() {
        const context = this
        context.mainReportTable = createReportTable({
          $tableElement: $('#date-table'),
          $tableWidget: $('#date-table-widget'),
          order: [[0, 'asc']],
          rightColumn: [2, 3, 4, 5],
          onRow(row) {
            var total = Number($(row).find('td').eq(5).text())
            var target = Number($(row).find('td').eq(4).text())
            if (total < target) {
              $(row).find('td').eq(5).css('color', 'red')
            }
          },
          onDraw(tableData, pageData) {
            if (pageData.length > 0 && pageData[0].length > 1) {
              context.drawChart(pageData)
            }
          },
          excel: {
            fileName: '20_dispatch_list_quality',
            format: ['text', 'text', 'text', 'text', 'text', 'text', 'text'],
          },
          showNoData: false,
        })
        context.detailReportTable = createReportTable({
          $tableElement: $('#date-table2'),
          $tableWidget: $('#date-table-widget'),
          rightColumn: [13, 14, 15, 16, 17],
          onRow(row, rowData) {
            const quality = Number(rowData[17])
            const target = Number(rowData[16])
            if (quality < target) {
              $(row).find('td').eq(12).css('color', 'red')
            }
          },
          excel: {
            fileName: '20_detail',
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
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ],
          },
          showNoData: false,
        })
      },
      initDemo() {
        const context = this
        context.commons.dynamicDemo(context)
        var showdemoConfig
        try {
          showdemoConfig = servkit.showdemoConfig[context.appId][context.funId]
        } catch (e) {
          console.warn(e)
        } finally {
          showdemoConfig = showdemoConfig || {
            startDate: '2017/09/01',
            endDate: '2017/09/30',
            product: '',
            workStatus: ['2', '999'],
            workId: '',
          }
        }

        context.$demoBtn.on('click', function (evt) {
          evt.preventDefault()
          context.$startDate.val(showdemoConfig.startDate)
          context.$endDate.val(showdemoConfig.endDate)
          context.$productId
            .val(showdemoConfig.product)
            .trigger('change.select2') // only for select2 plugin
          if (showdemoConfig.product === '') {
            $('.select2-chosen').text('')
          }
          $('[name="work-status"]').each(function () {
            for (var i = 0; i < showdemoConfig.workStatus.length; i++) {
              if ($(this).val() === showdemoConfig.workStatus[i]) {
                $(this).attr('checked', true)
              }
            }
          })
          context.$multiConditionSubmitBtn.click()
        })
        context.$demoBtn2.on('click', function (evt) {
          evt.preventDefault()
          context.$workId.val(showdemoConfig.workId)
          context.$queryByWorkIdSubmitBtn.click()
        })
      },
      renderQueryStatus(isQueryByWorkId) {
        const context = this
        const status = isQueryByWorkId
          ? ''
          : context.$workStatus
              .toArray()
              .filter((el) => el.checked)
              .map((el) => context.workStatusMap[el.value] || el.value)
              .join(', ')
        const productId =
          !isQueryByWorkId && context.$productId.val()
            ? context.productMap[context.$productId.val()]
            : ''
        const currentDate = moment().format('YYYY/MM/DD HH:mm:ss')
        const workId = isQueryByWorkId ? context.$workId.val() || '' : ''
        const startDate = context.$startDate.val()
        const endDate = context.$endDate.val()
        const dateRange = isQueryByWorkId ? '' : `${startDate}~${endDate}`
        const queryStatusHtmlArr = []
        if (dateRange) {
          queryStatusHtmlArr.push(`${i18n('ServTrack_000015')} : ${dateRange}`)
        }
        if (productId) {
          queryStatusHtmlArr.push(`${i18n('ServTrack_000012')} : ${productId}`)
        }
        if (workId) {
          queryStatusHtmlArr.push(`${i18n('ServTrack_000017')} : ${workId}`)
        }
        if (status) {
          queryStatusHtmlArr.push(`${i18n('ServTrack_000095')} : ${status}`)
        }
        queryStatusHtmlArr.push(`${i18n('ServTrack_000019')} : ${currentDate}`)

        Array.from(document.getElementsByClassName('query-status')).forEach(
          (el) => {
            el.innerHTML = queryStatusHtmlArr.join('<br>')
          }
        )
        context.updateBarChartTitle(productId)
      },
      initQueryForm() {
        const context = this
        initDatePicker(context.$startDate, context.$endDate, true)
        initSelect2WithData(context.$productId, context.productMap, true, {
          minimumInputLength: 0,
          allowClear: true,
          placeholder: i18n('ServTrack_000094'),
        })
        select2AllowClearHelper(context.$productId[0])
        context.$productId.prop('selectedIndex', -1)
        initSelect2WithData(context.$workId, context.workIdList, true, {
          minimumInputLength: 0,
        })
        context.$workId.prop('selectedIndex', -1)
        validateForm($('#form1'), context.$multiConditionSubmitBtn)
        validateForm($('#form2'), context.$queryByWorkIdSubmitBtn)

        //submit click
        context.$multiConditionSubmitBtn.on('click', function (evt) {
          const queryType = 'multiCondition'
          evt.preventDefault()
          context.loadingBtn.doing()
          context.drawMainTable(queryType)
          context.drawDetailTable(queryType)
        })

        context.$queryByWorkIdSubmitBtn.on('click', function (evt) {
          const queryType = 'workId'
          evt.preventDefault()
          context.loadingBtn2.doing()
          context.drawMainTable(queryType)
          context.drawDetailTable(queryType)
        })
      },
      drawChart(dataList) {
        const context = this
        const $chartEle = context.$modalBarChart
        const colors = []
        const ticks = []
        const chartData = []

        dataList.forEach((data, index) => {
          var work_id = data[0]
          var isAchieved = parseFloat(data[5]) >= parseFloat(data[4])
          var color = isAchieved ? servkitColors.green : servkitColors.red

          //bar
          chartData.push({
            label: index,
            bars: {
              fillColor: color,
            },
            valueLabels: {
              show: true,
              labelFormatter(v) {
                return parseFloat(v).toFixed(2) + '%'
              },
              font: '12pt ' + fonts,
              valign: 'middle', // above, below, middle, bottom
            },
            data: [[index, parseFloat(data[5] === '--' ? 0 : data[5])]],
          })
          colors.push(color)
          ticks.push([index, work_id])

          //stack
          if (!isAchieved) {
            //bar
            chartData.push({
              label: index,
              bars: {
                fill: false,
              },
              data: [
                [index, data[5] === '--' ? 0 : parseFloat(data[4] - data[5])],
              ],
            })
            colors.push(color)
          }
        })

        var options = {
          colors: colors,
          series: {
            stack: true,
            bars: {
              show: true,
              align: 'center',
              barWidth: 0.2,
            },
          },
          tooltip: true,
          tooltipOpts: {
            content: "<div class='hide'>%x</div><span>%y.2(%)</span>", // 爛 plugin, 竟然一定要有%x
            defaultTheme: false,
          },
          grid: {
            show: true,
            hoverable: true,
            clickable: true,
            tickColor: '#EFEFEF',
            borderWidth: 0,
            borderColor: '#EFEFEF',
          },
          xaxis: {
            ticks: ticks,
          },
          yaxis: {
            tickFormatter(v) {
              return v + '.00%'
            },
          },
        }

        $.plot($chartEle, chartData, options)
      },
      drawMainTable(queryType) {
        const context = this
        const { mainReportTable } = context
        const isQueryByWorkId = queryType === 'workId'
        let requestParam
        switch (queryType) {
          case 'workId':
            requestParam = {
              startDate: '',
              endDate: '',
              workId: context.commons.checkEscapeSymbol(context.$workId.val()),
            }
            break
          case 'multiCondition':
          default:
            requestParam = {
              startDate: context.$startDate.val(),
              endDate: context.$endDate.val(),
              productId: context.commons.checkEscapeSymbol(
                context.$productId.val()
              ),
              workId: context.commons.checkEscapeSymbol(context.$workId.val()),
              status: [],
            }
            _.each(this.$workStatus, function (ele) {
              if ($(ele).prop('checked')) {
                if (ele.value === '999') {
                  requestParam.status.push('0', '1')
                } else {
                  requestParam.status.push(ele.value)
                }
              }
            })
            break
        }
        new Promise((res) =>
          ajax(
            {
              url: 'api/servtrack/workquality/readwork',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(requestParam),
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
        ).then((dbData) => {
          const tableData = dbData.map((data) => [
            data.work_id,
            data.product_name,
            data.input,
            data.go_quantity ?? `${i18n('ServTrack_000117')}`,
            parseFloat(data.product_quality_sp).toFixed(2),
            !data.quality && data.quality !== 0
              ? '--'
              : parseFloat(data.quality).toFixed(2),
            data.op_duration ?? '--',
          ])

          if (tableData.length) {
            mainReportTable.drawTable(tableData)
          } else {
            mainReportTable.clearTable()
          }
          context.renderQueryStatus(isQueryByWorkId)
          mainReportTable.showWidget()
          context.loadingBtn.done()
        })
      },
      drawDetailTable(queryType) {
        const context = this
        const { detailReportTable } = context
        let requestParam
        switch (queryType) {
          case 'workId':
            requestParam = {
              startDate: '',
              endDate: '',
              workId: context.commons.checkEscapeSymbol(context.$workId.val()),
            }
            break

          case 'multiCondition':
          default:
            requestParam = {
              startDate: context.$startDate.val(),
              endDate: context.$endDate.val(),
              productId: context.commons.checkEscapeSymbol(
                context.$productId.val()
              ),
              workId: '',
              status: [],
            }
            _.each(this.$workStatus, function (ele) {
              if ($(ele).prop('checked')) {
                if (ele.value === '999') {
                  requestParam.status.push('0')
                  requestParam.status.push('1')
                } else {
                  requestParam.status.push(ele.value)
                }
              }
            })
            break
        }

        new Promise((res) =>
          ajax(
            {
              url: 'api/yihcheng/workquality/readtracking',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(requestParam),
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
        ).then((dbData) => {
          const tableData = dbData.map((data) => [
            data.work_id,
            data.product_name,
            data.shift_day,
            data.shift || '',
            data.op,
            data.process_name,
            data.line_name,
            moment(data.move_in).format('YYYY/MM/DD HH:mm:ss'),
            moment(data.move_out).format('YYYY/MM/DD HH:mm:ss'),
            /*模號*/
            data.mold_id || '',
            /*刀號*/
            data.tool_id || '',
            /*人員*/
            employeeMap[data.employee_id] || data.employee_id || '',
            /*拆單目的*/
            context.lotPurposeMap[data.lot_purpose] || '',
            data.output,
            data.go_quantity,
            data.ng_quantity,
            parseFloat(data.product_quality_sp).toFixed(2),
            parseFloat(data.quality).toFixed(2),
          ])

          if (tableData.length) {
            detailReportTable.drawTable(tableData)
          } else {
            detailReportTable.clearTable()
          }
          detailReportTable.showWidget()
          context.loadingBtn2.done()
        })
      },
      updateBarChartTitle(productId) {
        const context = this

        context.$barChartTitle.html(
          productId ? `${i18n('ServTrack_000012')} : ${productId}` : ''
        )
      },
    },
    preCondition: {},
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.symbol.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
        '/js/servtech/cosmos/jquery.flot.valuelabels-2.2.0.js',
        '/js/plugin/flot/jquery.flot.stack.min.js',
      ],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
      ['/js/plugin/select2/select2.min.js'],
    ],
  })
}
