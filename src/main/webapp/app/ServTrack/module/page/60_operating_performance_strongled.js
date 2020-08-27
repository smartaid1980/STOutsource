import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'
import {
  loadingButton,
  validateForm,
  initDatePicker,
  initSelect2WithData,
} from '../../../../js/servtech/module/servkit/form.js'
import {
  fetchDbData,
  ajax,
} from '../../../../js/servtech/module/servkit/ajax.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
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
  const productData = await fetchDbData('a_servtrack_product', {
    columns: ['product_id', 'product_name', 'is_open'],
  })
  const productMap = productData.reduce((acc, map) => {
    acc[map.product_id] = map.product_name
    return acc
  }, {})

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      lotPurposeMap,
      productMap,
      lineMap,
      $startDate: $('#startDate'),
      $endDate: $('#endDate'),
      $productId: $('#productId'),
      $lineId: $('#lineId'),
      $submitBtn: $('#submit-btn'),
      $demoBtn: $('#showdemo1'),
      $labelColor: $('[name=labelColor]'), // 燈號
      $toolLifeChar: $('#bar-chart-h'),
      $shiftRangeTitle: $('#shift-range-title'),
      $productNameTitle: $('#product-name-title'),
      $lineTitle: $('#line-title'),
      loadingBtn: loadingButton(document.getElementById('submit-btn')),
      reportTable: null,
      main() {
        const context = this
        pageSetUp()
        context.initQueryForm()
        context.initDemo()
        context.initReportTable()
      },
      initQueryForm() {
        const context = this

        initDatePicker(context.$startDate, context.$endDate, true)
        initSelect2WithData(context.$productId, context.productMap, true, {
          minimumInputLength: 0,
          allowClear: true,
          placeholder: i18n('ServTrack_000012'),
        })
        select2AllowClearHelper(context.$productId[0])
        context.$productId.prop('selectedIndex', -1)
        initSelect2WithData(context.$lineId, context.lineMap, true, {
          minimumInputLength: 0,
          allowClear: true,
          placeholder: i18n('ServTrack_000009'),
        })
        select2AllowClearHelper(context.$lineId[0])
        context.$lineId.prop('selectedIndex', -1)
        validateForm($('#main-form'), context.$submitBtn)

        //submit click
        context.$submitBtn.on('click', function (evt) {
          evt.preventDefault()
          context.loadingBtn.doing()
          const currentTime = moment().format('YYYY/MM/DD HH:mm:ss')
          document.getElementById('query-time').textContent = `${i18n(
            'ServTrack_000019'
          )} : ${currentTime}`
          context.drawTable()
        })
      },
      initDemo() {
        const context = this
        // ctx.commons.dynamicDemo(ctx);
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
            line: '',
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
            $('#s2id_productId .select2-chosen').text('')
          }
          context.$lineId.val(showdemoConfig.line).trigger('change.select2') // only for select2 plugin
          if (showdemoConfig.line === '') {
            $('#s2id_lineId .select2-chosen').text('')
          }
          context.$submitBtn.click()
        })
      },
      initReportTable() {
        const context = this
        context.reportTable = createReportTable({
          $tableElement: $('#date-table'),
          $tableWidget: $('#date-table-widget'), //reporttable.js有說明
          rightColumn: [4, 7, 8, 16, 17, 18, 19, 20],
          onRow(row) {
            var rows = $(row).find('td')
            var performanceQty = rows.eq(19).text()
            var performanceTime = rows.eq(20).text()
            if (performanceQty < 0) {
              rows
                .eq(19)
                .html('<font style="color:red;">' + performanceQty + '</font>')
            }
            if (performanceTime < 0) {
              rows
                .eq(20)
                .html('<font style="color:red;">' + performanceTime + '</font>')
            }
          },
          excel: {
            fileName: '60_operating_performance',
            format: Array.from(new Array(21), () => 'text'),
          },
        })
      },
      drawTable() {
        const context = this
        const params = {
          startDate: context.$startDate.val(),
          endDate: context.$endDate.val(),
          productId: context.commons.checkEscapeSymbol(
            context.$productId.val()
          ),
          lineId: context.commons.checkEscapeSymbol(context.$lineId.val()),
        }
        const lindId = !context.$lineId.val()
          ? ''
          : context.lineMap[context.$lineId.val()]
        const productName = !context.$productId.val()
          ? ''
          : context.productMap[context.$productId.val()]
        context.$shiftRangeTitle.html(
          context.$startDate.val() + ' ~ ' + context.$endDate.val()
        )
        context.$lineTitle.html(lindId)
        context.$productNameTitle.html(productName)

        new Promise((res) =>
          ajax(
            {
              url:
                servkit.rootPath +
                '/api/yihcheng/operatingperformance/readperformance',
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
        ).then((dbData) => {
          const tableData = dbData.map((data) => {
            return [
              data.shift_day,
              data.shift || '',
              data.product_name,
              data.work_id,
              data.e_quantity,
              data.op,
              data.process_name,
              data.cust_field_2,
              parseFloat(data.std_hour).toFixed(2),
              data.line_name,
              moment(data.move_in).format('YYYY-MM-DD HH:mm:ss'),
              moment(data.move_out).format('YYYY-MM-DD HH:mm:ss'),
              /*模號*/
              data.mold_id || '',
              /*刀號*/
              data.tool_id || '',
              /*人員*/
              employeeMap[data.employee_id] || data.employee_id || '',
              /*拆單目的*/
              context.lotPurposeMap[data.lot_purpose] || '',
              data.output,
              Number(data.cust_field_3) === -1 ? '--' : data.cust_field_3,
              Number(data.cust_field_4) === -1 ? '--' : data.cust_field_4,
              data.output_variance,
              parseFloat(data.duration_variance).toFixed(2),
            ]
          })

          context.reportTable.drawTable(tableData)
          context.reportTable.showWidget()
          context.loadingBtn.done()
        })
      },
    },
    preCondition: {},
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
  })
}
