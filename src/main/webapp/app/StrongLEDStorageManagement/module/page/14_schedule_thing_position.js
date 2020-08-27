import { InfoTable } from '../infoTable.js'
import { getPositionStructure, Section } from '../positionStructure.js'
import { getPurchaseOrder } from '../purchaseOrderList.js'

export default function () {
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      $table: $('#schedule-table'),
      $tableWidget: $('#schedule-table-widget'),
      $poListResult: $('#po-list-result'),
      $scheduleThingInfoTable: $('#schedule-thing-info-table'),
      $editScheduleModal: $('#edit-schedule-modal'),
      $editScheduleForm: $('#edit-schedule-form'),
      scheduleThingInfoTable: null,
      scheduleTable: null,
      purchaseOrder: null,
      $form: $('#query-condition-form'),
      $startDate: null,
      $endDate: null,
      $purIdInput: null,
      $purOrderTypeSelect: null,
      $serialNumSelect: null,
      scheduleFormValidator: null,
      queryParam: {},
      dateColumnIdList: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'],
      main() {
        const context = this
        context.initScheduleTable()
        context.initQueryForm()
        context.initScheduleThingList()
        context.initEditScheduleModal()
      },
      initQueryForm() {
        const context = this
        const { $form } = context
        const $startDate = (context.$startDate = $('#start-date'))
        const $endDate = (context.$endDate = $('#end-date'))
        const $purIdInput = (context.$purIdInput = $form.find(
          'input[name=pur_id]'
        ))
        const $purIdSelect = (context.$purIdSelect = $form.find(
          'select[name=pur_id]'
        ))
        const $purOrderTypeSelect = (context.$purOrderTypeSelect = $form.find(
          'select[name=pur_order_type]'
        ))
        const $serialNumSelect = (context.$serialNumSelect = $form.find(
          'select[name=serial_num]'
        ))
        const $purDisplayTypeRadio = (context.$purDisplayTypeRadio = $form.find(
          'input[name=pur_display_type]'
        ))
        const $purIdLabel = $form.find('label[data-type]')
        const today = ''.toFormatedDate()
        const datepickerOption = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
          minDate: 0,
        }
        const scheduledPoData = context.preCon.purchaseOrder.poData.filter(
          (map) => map.status === 1 && map.is_scheduled === 0
        )

        context.preCon.purchaseOrder.initQueryFormEls(
          $purIdInput[0],
          $purOrderTypeSelect[0],
          $serialNumSelect[0]
        )
        servkit.initSelectWithList(
          _.chain(scheduledPoData).pluck('pur_id').uniq().value(),
          $purIdSelect
        )
        $purIdSelect
          .on('change', function () {
            const pur_id = this.value
            const typeAndSerialList = _.chain(scheduledPoData)
              .filter((map) => map.pur_id === pur_id)
              .groupBy('pur_order_type')
              .mapObject((mapList) => _.pluck(mapList, 'serial_num'))
              .value()
            $purIdInput.val(pur_id)
            servkit.initSelectWithList(
              Object.keys(typeAndSerialList),
              $purOrderTypeSelect
            )
            context.preCon.purchaseOrder.typeAndSerialList = typeAndSerialList
            $purOrderTypeSelect.change()
          })
          .change()

        $purDisplayTypeRadio.on('change', function () {
          const type = this.value
          $purIdLabel.each((i, el) => {
            el.querySelector('[name=pur_id]').value = ''
            el.classList.toggle('hide', el.dataset.type !== type)
          })
        })

        $startDate.datepicker(datepickerOption).val(today)
        $endDate
          .datepicker(datepickerOption)
          .val(moment(today).add(6, 'days').format('YYYY/MM/DD'))
        // 固定時間區間為七天，並兩個時間都不小於今天
        $startDate.on('change', function () {
          let startDate = this.value
          let endDate
          const today = ''.toFormatedDate()
          const isEarlierThanToday = moment(startDate).isBefore(today)
          if (isEarlierThanToday) {
            startDate = today
            $startDate.val(startDate)
          }
          endDate = moment(startDate).add(6, 'days').format('YYYY/MM/DD')
          $endDate.val(endDate)
        })
        $endDate.on('change', function () {
          let endDate = this.value
          let startDate = moment(endDate)
            .subtract(6, 'days')
            .format('YYYY/MM/DD')
          const today = ''.toFormatedDate()
          const isEarlierThanToday = moment(startDate).isBefore(today)
          if (isEarlierThanToday) {
            startDate = today
            endDate = moment(startDate).add(6, 'days').format('YYYY/MM/DD')
            $endDate.val(endDate)
          }
          $startDate.val(startDate)
        })
        servkit.validateForm($form, $('#submit'))
        $('#submit').on('click', function (e) {
          e.preventDefault()
          context
            .getScheduleData()
            .then((data) => context.drawScheduleTable(data))
        })
      },
      initScheduleTable() {
        const context = this
        const render = function (data = {}, type, rowData) {
          const { realTotalThingPcs } = rowData
          const { scheduleTotalThingPcs = 0, date } = data
          return `<div class="row">
            <div class="col-lg-6 text-align-center title">${i18n(
              'Pre-Quantity_Row'
            )}</div>
            <div class="col-lg-6 text-align-right subtotal">${scheduleTotalThingPcs.toFixed(
              3
            )}</div>
          </div>
          <div class="row">
              <div class="col-lg-6 text-align-center title">${i18n(
                'The_Actual_Amount'
              )}</div>
              <div class="col-lg-6 text-align-right subtotal">${realTotalThingPcs.toFixed(
                3
              )}</div>
          </div>
          <div class="row">
            <div class="col-lg-6 text-align-center title">${i18n('Total')}</div>
            <div class="col-lg-6 text-align-right qty total">${window.Decimal.add(
              realTotalThingPcs,
              scheduleTotalThingPcs
            ).toFixed(3)}</div>
          </div>
          <div class="row">
            <div class="col-lg-12">
              <a tabindex="0" class="btn btn-xs btn-primary show-detail" role="button" data-date="${date}">${i18n(
            'Show'
          )}</a>
            </div>
          </div>`
        }
        context.scheduleTable = createReportTable({
          $tableElement: context.$table,
          $tableWidget: context.$tableWidget,
          showNoData: false,
          customBtns: [
            `<h3 class="hide">${i18n(
              'Item_Number'
            )}：<span id="display-material-id"></span></h3>`,
            `<button class="btn btn-primary" id="to-last-week">${i18n(
              'Last_Week'
            )}</button>`,
            `<button class="btn btn-primary" id="to-current-week">${i18n(
              'For_The_Current_Week'
            )}</button>`,
            `<button class="btn btn-primary" id="to-next-week">${i18n(
              'A_Week_Later'
            )}</button>`,
          ],
          paging: false,
          order: [
            [0, 'asc'],
            [1, 'asc'],
            [2, 'asc'],
          ],
          columnDefs: [
            {
              targets: [3, 4, 5, 6, 7, 8, 9],
              orderable: false,
            },
            {
              targets: [3, 4, 5, 6, 7, 8, 9],
              className: 'drop',
            },
          ],
          columns: [
            {
              name: 'section',
              data: 'section',
              width: '5%',
              render(data, type, rowData) {
                return Section.toString(data, rowData.positionIdPath.storeMap)
              },
            },
            {
              name: 'level',
              data: 'level',
              width: '5%',
            },
            {
              name: 'position',
              data: 'position',
              width: '5%',
            },
            {
              name: 'd1',
              data: 'd1',
              width: '12%',
              render,
            },
            {
              name: 'd2',
              data: 'd2',
              width: '12%',
              render,
            },
            {
              name: 'd3',
              data: 'd3',
              width: '12%',
              render,
            },
            {
              name: 'd4',
              data: 'd4',
              width: '12%',
              render,
            },
            {
              name: 'd5',
              data: 'd5',
              width: '12%',
              render,
            },
            {
              name: 'd6',
              data: 'd6',
              width: '12%',
              render,
            },
            {
              name: 'd7',
              data: 'd7',
              width: '12%',
              render,
            },
          ],
          // 每次畫表格就初始化「檢視」原料明細按鈕的popover
          onDraw(tableData, pageData, tableApi) {
            let realTotalThingPcs
            let realThingIds
            let scheduleTotalThingPcs
            let scheduleThingsInfo
            let content
            let date
            let rowData
            const trList = tableApi.rows().nodes().toArray()
            if (!tableApi.data().length) {
              return
            }
            Array.from(trList).forEach((tr) => {
              rowData = context.scheduleTable.getData(tr)
              Array.from(tr.querySelectorAll('.show-detail')).forEach((btn) => {
                date = btn.dataset.date
                ;({ realTotalThingPcs, realThingIds } = rowData)
                ;({ scheduleTotalThingPcs, scheduleThingsInfo } = Object.values(
                  rowData
                ).find((map) => map && map.date === date))
                content = `<div class="display-flex title subtotal">
                    <div class="">${i18n('Walkthrough')}</div>
                    <div class="">${scheduleTotalThingPcs.toFixed(3)}</div>
                </div>
                <div class="thing-list">
                  ${
                    scheduleThingsInfo.length
                      ? scheduleThingsInfo
                          .map(
                            ({
                              scheduleThingId,
                              scheduleThingPcs,
                            }) => `<div class="display-flex">
                      <div class="">${scheduleThingId}</div>
                      <div class="">${scheduleThingPcs}</div>
                  </div>`
                          )
                          .join('')
                      : `<div class="text-align-center">${i18n(
                          'No_Information_Walkthrough'
                        )}</div>`
                  }
                </div>
                <div class="display-flex title subtotal">
                    <div class="">${i18n('Actual')}</div>
                    <div class="">${realTotalThingPcs.toFixed(3)}</div>
                </div>
                <div class="thing-list">
                  ${
                    realThingIds.length
                      ? realThingIds
                          .map(
                            ({
                              thingId,
                              thingPcs,
                            }) => `<div class="display-flex">
                      <div class="">${thingId}</div>
                      <div class="">${thingPcs.toFixed(3)}</div>
                  </div>`
                          )
                          .join('')
                      : `<div class="text-align-center">${i18n(
                          'No_Actual_Data'
                        )}</div>`
                  }
                </div>
                <div class="display-flex title">
                  <div class="">${i18n('Total')}</div>
                  <div class="">${window.Decimal.add(
                    realTotalThingPcs,
                    scheduleTotalThingPcs
                  ).toFixed(3)}</div>
                </div>`

                $(btn).popover({
                  trigger: 'focus',
                  title: i18n('Material_Details'),
                  boundary: document.getElementById('schedule-table-widget'),
                  content,
                  html: true,
                  placement: 'top',
                })
              })
            })
          },
        })
        context.scheduleTable.$tableElement
          .parent()
          .find('.dt-toolbar-footer')
          .addClass('hide')
        $('#to-last-week').on('click', function () {
          const { start_date } = context.queryParam
          if (!start_date) {
            return
          }
          context.queryParam.start_date = moment(start_date)
            .subtract(6, 'days')
            .format('YYYY/MM/DD')
          context.$startDate.val(context.queryParam.start_date).change()
          context.$purIdInput.val(context.queryParam.pur_id).change()
          context.$purOrderTypeSelect
            .val(context.queryParam.pur_order_type)
            .change()
          context.$serialNumSelect.val(context.queryParam.serial_num)
          context
            .getScheduleData()
            .then((data) => context.drawScheduleTable(data))
        })
        $('#to-current-week').on('click', function () {
          const { start_date } = context.queryParam
          if (!start_date) {
            return
          }
          context.queryParam.start_date = ''.toFormatedDate()
          context.$startDate.val(context.queryParam.start_date).change()
          context.$purIdInput.val(context.queryParam.pur_id).change()
          context.$purOrderTypeSelect
            .val(context.queryParam.pur_order_type)
            .change()
          context.$serialNumSelect.val(context.queryParam.serial_num)
          context
            .getScheduleData()
            .then((data) => context.drawScheduleTable(data))
        })
        $('#to-next-week').on('click', function () {
          const { start_date } = context.queryParam
          if (!start_date) {
            return
          }
          context.queryParam.start_date = moment(start_date)
            .add(6, 'days')
            .format('YYYY/MM/DD')
          context.$startDate.val(context.queryParam.start_date).change()
          context.$purIdInput.val(context.queryParam.pur_id).change()
          context.$purOrderTypeSelect
            .val(context.queryParam.pur_order_type)
            .change()
          context.$serialNumSelect.val(context.queryParam.serial_num)
          context
            .getScheduleData()
            .then((data) => context.drawScheduleTable(data))
        })
      },
      changeDateRange(startDate) {
        const context = this
        const dateList = [startDate.toFormatedDate(null, 'MM/DD')]
        let lastDate = startDate
        for (let i = 0; i < 6; i++) {
          dateList.push(
            (lastDate = moment(lastDate).add(1, 'days').format('MM/DD'))
          )
        }
        context.scheduleTable.$tableElement
          .find('thead .date')
          .toArray()
          .forEach((el, i) => {
            el.textContent = dateList[i]
          })
      },
      getScheduleData(dataMap = {}) {
        const context = this
        const start_date = dataMap.start_date || context.$startDate.val()
        const end_date = dataMap.end_date || context.$endDate.val()
        const pur_id = dataMap.pur_id || context.$purIdInput.val()
        const pur_order_type =
          dataMap.pur_order_type || context.$purOrderTypeSelect.val()
        const serial_num = dataMap.serial_num || context.$serialNumSelect.val()

        context.queryParam = {
          pur_order_type,
          pur_id,
          serial_num,
          start_date,
          end_date,
        }
        context
          .getScheduleThingData({
            pur_order_type,
            pur_id,
            serial_num,
          })
          .then((data) => context.drawScheduleThingCards(data))

        return new Promise((res) =>
          servkit.ajax(
            {
              url: 'api/comoss/schedule/get-schedule-info',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(
                Object.assign({}, context.queryParam, {
                  start_date: context.queryParam.start_date.replace(/\//g, '-'),
                  end_date: context.queryParam.end_date.replace(/\//g, '-'),
                })
              ),
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        )
      },
      drawScheduleTable(data) {
        const context = this
        let realTotalThingPcs
        let realThingIds
        let dataPerDay
        let position_id
        let positionMap
        let store_id
        let grid_index
        let cell_index
        let section
        let level
        let position
        let positionIdPath
        const selectablePositionMap = {}
        const tableData = _.map(data, (map, positionStr) => {
          ;({ realTotalThingPcs, realThingIds } = map)
          positionMap = context.getPostionMap(positionStr)
          ;({
            store_id,
            grid_index,
            cell_start_index: cell_index,
          } = positionMap)
          position_id = context.getPositionId(store_id, grid_index, cell_index)
          positionIdPath = context.preCon.positionStructure.getPositionIdPath(
            position_id
          )
          selectablePositionMap[position_id] = positionIdPath.toString()
          ;({ section, level, position } = positionIdPath)

          dataPerDay = Object.entries(map)
            .filter(([key]) => new Date(key).toString() !== 'Invalid Date') // 日期格式YYYYMMDD
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, data]) =>
              Object.assign(
                {
                  date,
                },
                data
              )
            )
          return Object.assign(
            {
              position_id,
              section,
              level,
              position,
              positionIdPath,
              realTotalThingPcs,
              realThingIds,
              store_id,
              grid_index,
              cell_index,
            },
            Object.fromEntries(
              context.dateColumnIdList.map((key, i) => [key, dataPerDay[i]])
            )
          )
        })
        context.selectablePositionMap = selectablePositionMap
        context.changeDateRange(context.queryParam.start_date)
        if (tableData.length) {
          context.scheduleTable.drawTable(tableData)
          context.scheduleTable.$tableElement.find('.drop').droppable({
            accept: '.drag',
            // hoverClass在新版(1.12)被classes這個屬性取代，目前版本為1.10
            hoverClass: 'ui-state-hover',
            drop(event, ui) {
              context.$editScheduleModal.data({
                drop: this,
                drag: ui.draggable[0],
              })
              context.showEditScheduleModal()
            },
          })
        } else {
          context.scheduleTable.clearTable()
          const appInfo =
            servkit.appMap.StrongLEDStorageManagement[
              '31_Storage_location_setting'
            ]
          $.smallBox({
            sound: false,
            title: i18n('This_Material_Is_Placed_No_Storage_Spaces'),
            content: `${i18n('Go_To')} "${appInfo.app_name}" > "${
              appInfo.func_name
            }" ${i18n('Set_Up')}`,
            color: servkit.colors.red,
            iconSmall: 'fa fa-times',
            timeout: 4000,
          })
        }
      },
      showEditScheduleModal() {
        const context = this
        const { $editScheduleForm, $editScheduleModal } = context
        const $expDate = $editScheduleForm.find('[name=exp_date]')
        const $expEDate = $editScheduleForm.find('[name=exp_edate]')
        const $bufferHour = $editScheduleForm.find('[name=buffer_hour]')
        const $position = $editScheduleForm.find('[name=position]')
        const { drag, drop } = $editScheduleModal.data()
        const tr = drop.closest('tr')
        const rowData = context.scheduleTable.getData(tr)
        const code_no = drag.dataset.codeNo
        const scheduleThing = context.scheduleThingData[code_no]
        const exp_date = drop
          .querySelector('.show-detail')
          .dataset.date.replace(/-/g, '/')
        const position_id = rowData.position_id
        const buffer_hour = 24

        context.scheduleThingInfoTable.draw(
          _.pick(scheduleThing, [
            'pur_id',
            'pur_order_type',
            'serial_num',
            'material_id',
            'code_no',
            'thing_pcs',
            'schedule_thing_id',
          ])
        )
        $expDate.datepicker('option', 'minDate', exp_date).val(exp_date)
        $expEDate.datepicker('option', 'minDate', exp_date).val('')
        $bufferHour.val(buffer_hour)
        $editScheduleModal.modal('show')
        servkit.initSelectWithList(context.selectablePositionMap, $position)
        $position.val(position_id)
      },
      initScheduleThingList() {
        const context = this
        const { $editScheduleForm } = context
        const $expDate = $editScheduleForm.find('[name=exp_date]')
        const $expEDate = $editScheduleForm.find('[name=exp_edate]')
        const $bufferHour = $editScheduleForm.find('[name=buffer_hour]')
        const $position = $editScheduleForm.find('[name=position]')
        $('#po-batch-widget').sticky({
          topSpacing: 89,
        })
        $('#po-list-result').on('click', '.edit', function () {
          const code_no = this.dataset.codeNo
          const scheduleThing = context.scheduleThingData[code_no]
          const {
            exp_date,
            exp_edate,
            store_id,
            grid_index,
            cell_start_index,
            buffer_hour = '',
          } = scheduleThing
          const position_id = context.getPositionId(
            store_id,
            grid_index,
            cell_start_index
          )

          context.$editScheduleModal.data({
            drag: this,
          })

          context.scheduleThingInfoTable.draw(
            _.pick(scheduleThing, [
              'pur_id',
              'pur_order_type',
              'serial_num',
              'material_id',
              'code_no',
              'thing_pcs',
              'schedule_thing_id',
            ])
          )
          $expDate.val(exp_date.toFormatedDate())
          $expEDate.val(exp_edate.toFormatedDate())
          servkit.initSelectWithList(context.selectablePositionMap, $position)
          $position.val(position_id)
          $bufferHour.val(buffer_hour)
          context.$editScheduleModal.modal('show')
        })
      },
      getScheduleThingData({ pur_order_type, pur_id, serial_num }) {
        const context = this
        return new Promise((res) =>
          servkit.ajax(
            {
              url: 'api/getdata/db',
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({
                table: 'a_comoss_view_purchase_order_schedule',
                whereClause:
                  'pur_order_type = ? AND pur_id = ? AND serial_num = ?',
                whereParams: [pur_order_type, pur_id, serial_num],
              }),
            },
            {
              success(data) {
                res(data)
              },
            }
          )
        )
      },
      drawScheduleThingCards(data = []) {
        const context = this
        const { $poListResult } = context
        const batchedData = data.filter((map) =>
          Object.prototype.hasOwnProperty.call(map, 'thing_pcs')
        )
        const material_id = data.length ? data[0].material_id : ''

        $('#display-material-id')
          .text(material_id)
          .parent()
          .toggleClass('hide', !material_id)

        context.scheduleThingData = _.indexBy(batchedData, 'code_no')

        if (batchedData.length) {
          $poListResult.html(
            batchedData
              .map(
                (d) => `<div class="panel ${
                  d.status === 0 ? 'drag panel-blue' : 'edit panel-default'
                }" title="${
                  d.status === 0 ? '拖曳至表格中以預排' : '點擊以編輯預排'
                }" data-code-no="${d.code_no}">
            <div class="panel-body">
              ${i18n('Batch_Number')}：${d.code_no}
              <br>
              ${i18n('Quantity')}：${d.thing_pcs}
              <br>
              ${i18n('Thing_ID')}：${d.schedule_thing_id}
              <br>
              ${i18n('During_The_Walkthrough')}：${
                  d.status === 1
                    ? d.exp_date.toFormatedDate() +
                      ' ~ ' +
                      d.exp_edate.toFormatedDate()
                    : '尚未預排'
                }
              <br>
              ${i18n('Storage_Spaces_Walkthrough')}：${
                  d.status === 1
                    ? context.preCon.positionStructure
                        .getPositionIdPath(
                          context.getPositionId(
                            d.store_id,
                            d.grid_index,
                            d.cell_start_index
                          )
                        )
                        .toString()
                    : '尚未預排'
                }
            </div>
          </div>`
              )
              .join('')
          )
          $poListResult.find('.drag').draggable({
            opacity: 0.6,
            helper: 'clone',
            cursor: 'move',
          })
        } else {
          $poListResult.html(
            `<h3>${i18n(
              'This_Purchase_Order_Has_Not_Yet_Approved_Demolition'
            )}</h3>`
          )
        }
      },
      getPositionId(store_id, grid_index, cell_index) {
        const context = this
        const positionData = context.preCon.positionList.find(
          (map) =>
            map.store_id.toString() === store_id.toString() &&
            map.store_grid_index.toString() === grid_index.toString() &&
            map.store_cell_index.toString() === cell_index.toString()
        )
        return positionData ? positionData.position_id : null
      },
      getPostionMap(positionStr) {
        const positionArr = positionStr.split('|')
        const [
          store_id,
          grid_index,
          cell_start_index,
          cell_end_index,
        ] = positionArr
        return {
          store_id,
          grid_index,
          cell_start_index,
          cell_end_index,
        }
      },
      initEditScheduleModal() {
        const context = this

        context.initScheduleThingInfoTable()
        context.initEditSheduleForm()
        context.scheduleFormValidator = servkit.validateForm(
          context.$editScheduleForm,
          $('#save-schedule'),
          {
            rules: {
              exp_date: {
                dateISO: true,
              },
              exp_edate: {
                dateISO: true,
              },
              buffer_hour: {
                positiveNumber: true,
              },
            },
          }
        )
        $('#save-schedule').on('click', context.saveSchedule.bind(context))

        context.$editScheduleModal.on('show.bs.modal', function () {
          if (context.scheduleFormValidator) {
            context.scheduleFormValidator.resetForm()
          }
        })
      },
      initEditSheduleForm() {
        const context = this
        const { $editScheduleForm } = context
        const $expDate = $editScheduleForm.find('[name=exp_date]')
        const $expEDate = $editScheduleForm.find('[name=exp_edate]')
        const today = ''.toFormatedDate()
        servkit.initDatePicker(
          $expDate,
          $expEDate,
          false,
          null,
          '#save-schedule',
          { minDate: today }
        )
      },
      initScheduleThingInfoTable() {
        const context = this
        const columns = [
          {
            title: i18n('Purchase_Order_No'),
            name: 'pur_id',
          },
          {
            title: i18n('Do_Not_Purchase_Orders'),
            name: 'pur_order_type',
          },
          {
            title: i18n('Purchase_Order_Number'),
            name: 'serial_num',
          },
          {
            title: i18n('Item_Number'),
            name: 'material_id',
          },
          {
            title: i18n('Thing_ID'),
            name: 'schedule_thing_id',
          },
          {
            title: i18n('Batch_Number'),
            name: 'code_no',
          },
          {
            title: i18n('Quantity'),
            name: 'thing_pcs',
          },
        ]
        context.scheduleThingInfoTable = new InfoTable(
          context.$scheduleThingInfoTable[0],
          4,
          columns
        )
      },
      saveSchedule() {
        const context = this
        const { $editScheduleForm, $editScheduleModal } = context

        const $position = $editScheduleForm.find('[name=position]')
        const $expDate = $editScheduleForm.find('[name=exp_date]')
        const $expEDate = $editScheduleForm.find('[name=exp_edate]')
        const $bufferHour = $editScheduleForm.find('[name=buffer_hour]')
        const position_id = $position.val()
        const exp_date = $expDate.val() + ' 00:00:00'
        const exp_edate = $expEDate.val() + ' 23:59:59'
        const bufferHour = $bufferHour.val()
        const { drag } = $editScheduleModal.data()
        const code_no = drag.dataset.codeNo
        const scheduleThing = context.scheduleThingData[code_no]
        const { schedule_thing_id, thing_pcs } = scheduleThing
        const {
          store_id,
          store_grid_index,
          store_cell_index,
        } = context.preCon.positionList.find(
          (map) => map.position_id === position_id
        )
        const requestParam = {
          schedule_thing_id,
          store_id,
          grid_index: store_grid_index.toString(),
          cell_index: store_cell_index.toString(),
          thing_pcs,
          exp_date,
          exp_edate,
          buffer_hour: bufferHour,
        }

        servkit.ajax(
          {
            url: 'api/comoss/schedule',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestParam),
          },
          {
            success(data) {
              context.getScheduleData().then((data) => {
                context.drawScheduleTable(data)
                context.$editScheduleModal.modal('hide')
              })
            },
          }
        )
      },
    },
    preCondition: {
      positionStructure(done) {
        getPositionStructure().then((instance) => done(instance))
      },
      positionList(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store_position',
            }),
          },
          {
            success(data) {
              done(data)
            },
          }
        )
      },
      purchaseOrder(done) {
        getPurchaseOrder().then((instance) => done(instance))
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
      ['/js/plugin/sticky/jquery.sticky.js'],
      ['/js/plugin/decimal/decimal.min.js'],
    ],
  })
}
