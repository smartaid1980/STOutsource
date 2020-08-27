import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'
import {
  loadingButton,
  initDatePicker,
  initSelect2WithData,
  initSelectWithList,
  validateForm,
} from '../../../../js/servtech/module/servkit/form.js'
import {
  fetchDbData,
  ajax,
} from '../../../../js/servtech/module/servkit/ajax.js'
import { hasOwnProperty } from '../../../../js/servtech/module/servkit/util.js'
import { select2AllowClearHelper } from '../../../../js/servtech/module/feature/customizeLibSetting.js'
import { createReportTable } from '../../../../js/servtech/module/table/reportTable.js'
import lotPurposeMap from '../../../ServTrack/module/lotPurposeMap.js'

export default async function () {
  const [divisionData, processData, productData] = await Promise.all([
    fetchDbData('a_yihcheng_division', {
      columns: ['division_id', 'division_name', 'is_open'],
    }).catch((err) => {
      console.warn('fetch division error', err)
      return []
    }),
    fetchDbData('a_servtrack_process', {
      columns: ['process_code', 'process_name', 'is_open', 'division_id'],
    }).catch((err) => {
      console.warn('fetch process error', err)
      return []
    }),
    fetchDbData('a_servtrack_product', {
      columns: ['product_id', 'product_name', 'is_open'],
    }).catch((err) => {
      console.warn('fetch product error', err)
      return []
    }),
  ])
  const divisionMap = divisionData.reduce((acc, data) => {
    if (data.is_open === 'Y') {
      acc[data.division_id] = data
    }
    return acc
  }, {})
  const processMap = processData.reduce((acc, data) => {
    if (data.is_open === 'Y') {
      acc[data.process_code] = data
    }
    return acc
  }, {})
  const divisionProcessMap = Object.values(processMap).reduce((acc, data) => {
    if (!hasOwnProperty(divisionMap, data.division_id)) {
      return acc
    }
    if (hasOwnProperty(acc, data.division_id)) {
      acc[data.division_id].push(data.process_code)
    } else {
      acc[data.division_id] = [data.process_code]
    }
    return acc
  }, {})
  const productMap = productData.reduce((acc, data) => {
    if (data.is_open === 'Y') {
      acc[data.product_id] = data
    }
    return acc
  }, {})
  const employeeMap = await fetchDbData('a_yihcheng_employee')
    .then((data) =>
      Object.fromEntries(data.map(({ emp_id, emp_name }) => [emp_id, emp_name]))
    )
    .catch((err) => {
      console.warn('fetch employee data error', err)
      return {}
    })

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      lotPurposeMap,
      $submitBtn: $('#submit-btn'),
      submitLoadingBtn: loadingButton(document.getElementById('submit-btn')),
      $tableTab: $('.table-tab'),
      loadingBtn: loadingButton(document.getElementById('submit-btn')),
      $detailTable: $('#detail-table'),
      $processTable: $('#process-table'),
      $workTable: $('#work-table'),
      detailReportTable: null,
      processReportTable: null,
      workReportTable: null,
      $queryForm: $('#query-form'),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $divisionSelect: $('#division-select'),
      $processSelect: $('#process-select'),
      $productSelect: $('#product-select'),
      processCodeList: [], // 根據選擇的工作中心，可顯示的製程選項
      main() {
        const context = this
        context.initQueryForm()
        context.initWorkTable()
        context.initProcessTable()
        context.initDetailTable()
      },
      initQueryForm() {
        const context = this
        const productOptionMap = _.mapObject(
          productMap,
          ({ product_name }) => product_name
        )
        const divisionOptionMap = _.mapObject(
          divisionMap,
          ({ division_name }) => division_name
        )

        initDatePicker(context.$startDate, context.$endDate)
        initSelect2WithData(context.$productSelect[0], productOptionMap, true, {
          minimumInputLength: 0,
          allowClear: true,
          placeholder: '產品',
          multiple: true,
        })
        select2AllowClearHelper(context.$productSelect[0])
        initSelectWithList(divisionOptionMap, context.$divisionSelect)
        context.$processSelect.select2({
          minimumInputLength: 0,
          multiple: true,
          data() {
            return {
              results: context.processCodeList.map((process_code) => ({
                id: process_code,
                text: processMap[process_code].process_name,
              })),
            }
          },
        })
        context.$divisionSelect.on('change', function () {
          const divisionList = $(this).val()
          const processCodeList =
            divisionList && divisionList.length
              ? _.chain(divisionProcessMap)
                  .pick(divisionList)
                  .values()
                  .flatten(true)
                  .value()
              : []
          const processCodeVal = context.$processSelect.select2('val')
          // 製程清單改變，已選中的製程要拿掉不存在清單中的
          if (processCodeVal && processCodeVal.length) {
            context.$processSelect.select2(
              'val',
              processCodeVal.filter((code) => processCodeList.includes(code))
            )
          }
          context.processCodeList = processCodeList
        })
        validateForm(context.$queryForm, context.$submitBtn)
        context.$submitBtn.on('click', context.submitHandler.bind(context))
      },
      msToMinutes(ms) {
        return ms / 60 / 1000
      },
      initProcessTable() {
        const context = this
        context.processReportTable = createReportTable({
          $tableElement: context.$processTable,
          $tableWidget: $('#query-result-widget'),
          excel: {
            fileName: '生產日報統計-依製程',
            format: Array.from(new Array(15), () => 'text'),
          },
        })
      },
      initWorkTable() {
        const context = this
        context.workReportTable = createReportTable({
          $tableElement: context.$workTable,
          $tableWidget: $('#query-result-widget'),
          excel: {
            fileName: '生產日報統計-依工單',
            format: Array.from(new Array(13), () => 'text'),
          },
        })
      },
      initDetailTable() {
        const context = this
        context.detailReportTable = createReportTable({
          $tableElement: context.$detailTable,
          $tableWidget: $('#query-result-widget'),
          autoWidth: false,
          excel: {
            fileName: '生產日報統計-進出站明細',
            format: Array.from(new Array(18), () => 'text'),
          },
        })
      },
      async submitHandler() {
        const context = this
        context.submitLoadingBtn.doing()
        const [
          processReport,
          workReport,
          trackingData,
        ] = await context.fetchTrackingData()
        context.drawDetailTable(trackingData)
        context.drawProcessTable(processReport)
        context.drawWorkTable(workReport)
        context.submitLoadingBtn.done()
      },
      async fetchTrackingData() {
        const context = this
        const startDate = context.$startDate.val()
        const endDate = context.$endDate.val()
        const division_id = _.compact(context.$divisionSelect.val()).filter(
          (val) => val !== 'ALL'
        )
        const process_code = context.$processSelect.select2('val')
        const product_id = context.$productSelect.select2('val')
        const whereClause = `shift_day BETWEEN '${startDate}' AND '${endDate}' AND division_id IN (${division_id
          .map((val) => `'${val}'`)
          .join(', ')}) AND process_code IN (${process_code
          .map((val) => `'${val}'`)
          .join(', ')})${
          product_id && product_id.length
            ? ` AND product_id IN ('${product_id.join("', '")}')`
            : ''
        }`
        const requestData = {
          startDate,
          endDate,
          processCodes: process_code,
          division_id: division_id,
        }
        if (product_id && product_id.length) {
          requestData.product_id = product_id
        }
        const fetchProcessReport = new Promise((res) =>
          ajax(
            {
              url: 'api/yihcheng/daily-produce/by-process',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(requestData),
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        )
        const fetchWorkReport = new Promise((res) =>
          ajax(
            {
              url: 'api/yihcheng/daily-produce/by-work',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(requestData),
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        )
        const trackingData = await Promise.all([
          fetchProcessReport,
          fetchWorkReport,
          fetchDbData('a_yihcheng_view_work_tracking_detail', {
            whereClause,
          }),
        ])
        return trackingData
      },
      drawDetailTable(data) {
        const context = this
        context.detailReportTable.drawTable(
          _.chain(data)
            .groupBy(
              ({ op, line_id, work_id, move_in }) =>
                `${work_id}||${line_id}||${op}||${move_in}`
            )
            .values()
            .value()
            .map((groupData) => {
              const trackingData = Object.assign({}, groupData[0])
              trackingData.tool_id = groupData.tool_id
                ? _.pluck(groupData, 'tool_id')
                : []
              trackingData.mold_id = groupData.mold_id
                ? _.pluck(groupData, 'mold_id')
                : []
              trackingData.employee_id = groupData.employee_id
                ? _.pluck(groupData, 'employee_id')
                : []

              return [
                /*工序*/
                trackingData.op,
                /*製程*/
                trackingData.process_name,
                /*班次日期*/
                trackingData.shift_day.replace(/-/g, '/'),
                /*班次*/
                trackingData.shift || '---',
                /*線別*/
                trackingData.line_name || '---',
                /*派工單號*/
                trackingData.work_id || '---',
                /*產品*/
                trackingData.product_name || '---',
                /*進站時間*/
                trackingData.move_in.toFormatedDatetime(),
                /*出站時間*/
                trackingData.move_out
                  ? trackingData.move_out.toFormatedDatetime()
                  : '---',
                /*模號*/
                trackingData.mold_id.length
                  ? trackingData.mold_id.join(', ')
                  : '---',
                /*刀號*/
                trackingData.tool_id.length
                  ? trackingData.tool_id.join(', ')
                  : '---',
                /*人員*/
                trackingData.employee_id.length
                  ? trackingData.employee_id
                      .map((id) => employeeMap[id] || id)
                      .join(', ')
                  : '---',
                /*拆單目的*/
                trackingData.lot_purpose
                  ? context.lotPurposeMap[trackingData.lot_purpose] || '---'
                  : '---',
                /*產量*/
                trackingData.output || '---',
                /*良品數*/
                trackingData.go_quantity || '---',
                /*不良數*/
                trackingData.ng_quantity || '---',
                /*良率*/
                trackingData.quality || '---',
              ]
            })
        )
      },
      drawProcessTable(data) {
        const context = this
        context.processReportTable.drawTable(
          data.map((obj) => [
            // 班次日期
            obj.shift_day ? obj.shift_day.toFormatedDate() : '',
            // 班別
            obj.shift || '',
            // 工作中心
            divisionMap[obj.division_id] || obj.division_id || '',
            // 製程
            processMap[obj.process_code] || obj.process_code || '',
            // 機台運轉時間(分)
            obj.machine_operation_time
              ? context.msToMinutes(obj.machine_operation_time)
              : '',
            // 生產時間(分)
            obj.duration ? context.msToMinutes(obj.duration) : '',
            // 產量
            _.isNumber(obj.output) ? obj.output.numberWithCommas() : '',
            // 機連網產量
            _.isNumber(obj.machine_output)
              ? obj.machine_output.numberWithCommas()
              : '',
            // 小時產出
            _.isNumber(obj.output_per_hour)
              ? obj.output_per_hour.numberWithCommas()
              : '',
            // 稼動率
            obj.oee_rate || '',
            // 不良數
            _.isNumber(obj.ng_quantity)
              ? obj.ng_quantity.numberWithCommas()
              : '',
            // 不良率
            obj.ng_rate || '',
            // 報工人員
            _.isArray(obj.tracking_emp_names)
              ? obj.tracking_emp_names
                  .map((user_id) => employeeMap[user_id] || user_id || '')
                  .join(', ')
              : '',
            // 人數
            obj.number_of_tracking,
            // 標工
            obj.std_hour,
          ])
        )
      },
      drawWorkTable(data) {
        const context = this
        context.workReportTable.drawTable(
          data.map((obj) => [
            // 班次日期
            obj.shift_day ? obj.shift_day.toFormatedDate() : '',
            // 班別
            obj.shift || '',
            // 工作中心
            divisionMap[obj.division_id] || obj.division_id || '',
            // 製程
            processMap[obj.process_code] || obj.process_code || '',
            // 工單號
            obj.work_id || '',
            // 上層工單
            obj.parent_id ? obj.parent_id.split('|')[0] : '',
            // 產品編號
            obj.product_id || '',
            // 產品系列
            obj.product_set || '',
            // 產品柄數
            obj.product_handle || '',
            // 產品材質
            obj.product_material || '',
            // 產量
            _.isNumber(obj.output) ? obj.output.numberWithCommas() : '',
            // 不良數
            _.isNumber(obj.ng_quantity)
              ? obj.ng_quantity.numberWithCommas()
              : '',
            // 不良率
            obj.ng_rate || '',
          ])
        )
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
