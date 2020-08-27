import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo(context) {
      console.log('hi')
      context.userAuth = context.preCon.userAuth
      // 查詢條件表格
      context.initQueryConditionForm()
      // 詢價單列表
      context.initRfqListTable()
      // 透過url parameter載入查詢條件
      context.setQueryCondition()
      context.$submitBtn.click()
    },
    util: {
      submitBtn: servkit.loadingButton(document.querySelector('#submit-btn')), // 初始按鈕loading的功能
      $submitBtn: $('#submit-btn'),
      loginInfo: JSON.parse(window.sessionStorage.getItem('loginInfo')),
      rfqListTable: null,
      queryCondition: null,
      $rfqCanceledModal: null,
      returnMap: {
        strongled_presale: [1],
        strongled_rd: [6],
        strongled_rd_leader: [11],
        strongled_procurement: [16],
        strongled_procurement_leader: [21],
        strongled_financial: [26],
        strongled_financial_leader: [31],
        strongled_assistant: [36, 41, 98],
      },
      // ↓詢價單操作
      bindRfqListEvent() {
        const context = this
        // 詢價單列表上的各項操作
        $('#query-result')
          .on('click', '.detail-page', function (evt) {
            evt.preventDefault()
            context.goDetailPage($(this))
          })
          .on('click', '.return', function (e) {
            e.preventDefault()
            context.onReturnRfqModalShow($(this))
          })

        // 確定結案 / 退回
        $('#return-confirm').on('click', function (e) {
          e.preventDefault()
          context.returnRfq()
        })

        // 確認「詢價單已被取消」，重新載入列表
        context.$rfqCanceledModal = context.commons.initRfqCanceledModal(() => {
          context.$submitBtn.click()
        })
      },
      onReturnRfqModalShow($thisBtn) {
        const form_id = String($thisBtn.data('form_id')),
          status = parseInt($thisBtn.data('status'))
        $('#confirm-return-form-id').text(form_id)
        $('#return-confirm-modal-widget')
          .data({ form_id, status })
          .modal('show')
      },
      goDetailPage($thisBtn) {
        const context = this
        const lang = servkit.getCookie('lang')
        const queryParam = _.pick($thisBtn.data(), ['formId', 'status'])
        _.each(context.queryCondition, (value, key) => {
          if (value) {
            queryParam[key] = value
          }
        })
        window.location = `#app/StrongLED/function/${lang}/11_rfq_detail.html?${$.param(
          queryParam
        )}`
      },
      returnRfq() {
        const context = this
        const $modal = $('#return-confirm-modal-widget')
        const form_id = $modal.data('form_id')
        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            servkit.ajax(
              {
                url: `api/strongled/changestatus`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                  form_id,
                  status: 97,
                  quote_status: 30,
                }),
              },
              {
                success() {
                  $modal.modal('hide')
                  context.$submitBtn.click()
                },
              }
            )
          },
          canceledCallback() {
            $modal.modal('hide')
            context.$rfqCanceledModal.modal('show')
          },
        })
      },
      // ↓查詢詢價單
      initQueryConditionForm() {
        const context = this
        const queryForm = $('#main-form1')
        const setFormIdAutoComplete = () => {
          const context = this
          $('#demand-order-number').autocomplete({
            source: context.preCon.formIds,
          })
        }
        servkit.initDatePicker($('#startDate'), $('#endDate'), false, false)
        setFormIdAutoComplete()
        // servkit.validateForm(queryForm, context.$submitBtn);
        context.$submitBtn.on('click', function (e) {
          e.preventDefault()
          let validator = queryForm.data('validator')
          if (!validator) {
            validator = queryForm.validate({
              rules: {
                'startDate': {
                  required: true,
                  dateISO: true,
                },
                'endDate': {
                  required: true,
                  dateISO: true,
                },
                'data-status': {
                  required: true,
                },
              },
              // messeges: {
              //   startDate: {
              //     dateISO: '請輸入正確的日期格式'
              //   },
              //   endDate: {
              //     dateISO: '請輸入正確的日期格式'
              //   }
              // },
              errorPlacement(error, $el) {
                const $section = $el.closest('section')
                $section.children('.error').remove()
                $section.append(error)
              },
            })
          }
          if (validator.form()) {
            context.getRfqList()
          }
        })
      },
      getRfqList() {
        const context = this
        const type = $('#widget-tab-1').find('.active').index()
        const start = $('#startDate').val()
        const end = $('#endDate').val()
        const form_id = $('#demand-order-number').val()
        const requestBody = {
          start,
          end,
        }
        const filterListGreaterThan = (statusList, number) => {
          return statusList.filter((num) => num >= number)
        }

        context.submitBtn.doing() // 查詢按鈕開始loading
        context.queryCondition = {
          start: undefined,
          end: undefined,
          type: undefined,
          id: undefined,
        }
        switch (type) {
          case 0: // 綜合查詢
            context.queryCondition.start = start.replace(/\//g, '_')
            context.queryCondition.end = end.replace(/\//g, '_')
            break
          case 1: // 詢價單號查詢
            requestBody.form_id = form_id
            context.queryCondition.id = form_id
            break
        }

        // 綁定各權限可看到的詢價單狀態
        let statusList = Object.keys(
            context.preCon.rfqStatusI18nIdMap
          ).map((str) => parseInt(str)),
          quoteStatusList = Object.keys(
            context.preCon.rfqQuoteStatusI18nIdMap
          ).map((str) => parseInt(str))

        // 副總助理 可以查看全部
        if (context.userAuth.assistant) {
          statusList = filterListGreaterThan(statusList, 0)
        }
        // 售前 可以看[待售前審查/1]之後的
        if (context.userAuth.presale) {
          statusList = filterListGreaterThan(statusList, 1)
        }
        // 研發、研發主管 可以看[待拆BOM/6]之後的
        if (context.userAuth.rd || context.userAuth.rdLeader) {
          statusList = filterListGreaterThan(statusList, 6)
        }
        // 採購、採購主管 可以看[待填料價/16]之後的
        if (context.userAuth.procurement || context.userAuth.procLeader) {
          statusList = filterListGreaterThan(statusList, 16)
        }
        // 財務、財務主管 可以看[待填出廠利潤/26]之後的
        if (context.userAuth.financial || context.userAuth.finLeader) {
          statusList = filterListGreaterThan(statusList, 26)
        }

        const isSearchUnclosedRFQ = $(
          '#search1 [name=data-status][value=unclosed]'
        ).prop('checked')
        const isSearchClosedRFQ = $(
          '#search1 [name=data-status][value=closed]'
        ).prop('checked')
        const isSearchCanceledRFQ = $(
          '#search1 [name=data-status][value=canceled]'
        ).prop('checked')

        context.queryCondition.type = [
          isSearchUnclosedRFQ,
          isSearchClosedRFQ,
          isSearchCanceledRFQ,
        ]
          .map((bool) => bool + 0)
          .join('')

        if (!isSearchUnclosedRFQ) {
          statusList = _.filter(statusList, (num) => [99, 96].includes(num))
          quoteStatusList = _.filter(quoteStatusList, (num) =>
            [99, 98].includes(num)
          )
        }
        if (!isSearchClosedRFQ) {
          statusList = _.filter(statusList, (num) => num !== 99)
          quoteStatusList = _.filter(quoteStatusList, (num) => num !== 99)
        }
        if (!isSearchCanceledRFQ) {
          statusList = _.filter(statusList, (num) => num !== 96)
          quoteStatusList = _.filter(quoteStatusList, (num) => num !== 98)
        }

        Object.assign(requestBody, {
          status: _.uniq(statusList),
          quote_status: _.uniq(quoteStatusList),
        })
        servkit.ajax(
          {
            url: 'api/strongled/getrfqlist',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestBody),
          },
          {
            success(data) {
              context.drawRfqListTable(data)
              context.submitBtn.done() // 查詢按鈕結束loading
            },
          }
        )
      },
      initRfqListTable() {
        const context = this
        // 可退回的狀態和職位對照表
        const { returnMap } = context
        // 可退回的狀態列表
        const canReturnStatusList = context.loginInfo.user_group.reduce(
          (a, g) => {
            if (returnMap[g]) {
              return a.concat(returnMap[g])
            }
            return a
          },
          []
        )
        const btns = (quote_status, form_id, status) => {
          const returnBtn = `<li>
                <a 
                class="return" 
                data-form_id="${form_id}" 
                data-status="${status}" 
                href="javascript:void(0);">
                ${i18n('Return_Rfq')}
                </a>
              </li>`
          let btnGroupHtml = ''
          const wholeBtn = (btnGroupHtml) => `<div class="btn-group">
              <button class="btn dropdown-toggle btn-success" data-toggle="dropdown" ${
                [98, 99].includes(quote_status) || btnGroupHtml === ''
                  ? 'disabled'
                  : ''
              }>
                ${i18n(
                  'Operating'
                )} <i aria-hidden="true" class="fa fa-caret-down"></i>
              </button>
              <ul class="dropdown-menu pull-right">
                ${btnGroupHtml}
              </ul>
            </div>`
          if (
            canReturnStatusList.includes(status) &&
            context.userAuth.canReturnRfq
          ) {
            btnGroupHtml += returnBtn
          }
          return wholeBtn(btnGroupHtml)
        }
        const $tableElement = $('#query-result')
        const $tableWidget = $('#query-result-widget')
        const columns = [
          {
            title: `${i18n('RFQ_Number')}`,
            name: 'form_id',
            data: 'form_id',
            width: '6%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'input',
          },
          {
            title: `${i18n('Product_Description')}`,
            name: 'product_info',
            data: null,
            width: '13%',
            render(data, type, rowData) {
              const {
                model_number,
                color_temperature,
                lamp_length,
                watt,
              } = rowData
              return `${i18n('Lighting_Model')}： ${model_number || '--'}<br>
              ${i18n('Color_Temperature_Value')}： ${
                color_temperature
                  ? color_temperature.replace(/&/g, '、').replace(/=/g, '_')
                  : '--'
              }<br>
              ${i18n('Lighting_Length')}： ${lamp_length || '--'}<br>
              ${i18n('Lighting_Power')}： ${watt || '--'}`
            },
            filterType: 'input',
          },
          {
            title: `${i18n('clients_name')}`,
            name: 'cus_id',
            data: 'cus_id',
            width: '13%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'select',
          },
          {
            title: `${i18n('Date_of_filing')}`,
            name: 'create_time',
            data: 'create_time',
            width: '10%',
            type: 'date',
            render: {
              _: 'display',
              // sort: 'filter',
              filter: 'filter',
            },
            filterType: 'select',
          },
          {
            title: `${i18n('Quoted_price')}`,
            name: 'quote',
            data: 'quote',
            width: '8%',
            type: 'num',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'input',
          },
          {
            title: `${i18n('Rfq_State')}(${i18n('Residence_Time')})`,
            name: 'status',
            data: 'status',
            type: 'num',
            width: '12%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'select',
          },
          {
            title: `${i18n('Quote_Status')}(${i18n('Residence_Time')})`,
            name: 'quote_status',
            data: 'quote_status',
            type: 'num',
            width: '12%',
            render: {
              _: 'display',
              sort: 'filter',
              filter: 'filter',
            },
            filterType: 'select',
          },
          {
            title: `${i18n('Closing_Time')}`,
            name: 'close_time',
            data: 'close_time',
            type: 'date',
            width: '10%',
            render: {
              _: 'display',
              // sort: 'filter',
              filter: 'filter',
            },
            filterType: 'select',
          },
          {
            title: `${i18n('Operating')}`,
            name: 'manipulating',
            data: null,
            width: '3%',
            render(data, type, rowData) {
              return type === 'display'
                ? btns(
                    rowData.quote_status.orig,
                    rowData.form_id.orig,
                    rowData.status.orig
                  )
                : data
            },
          },
        ]
        const unorderableCols = ['manipulating', 'product_info']
        const getColumnIndex = (name) =>
          columns.findIndex((map) => map.name === name)
        const configData = {
          $tableElement,
          $tableWidget,
          order: [
            [getColumnIndex('status'), 'asc'],
            [getColumnIndex('create_time'), 'desc'],
          ],
          autoWidth: false,
          orderMulti: true,
          columnDefs: [
            {
              orderable: false,
              targets: unorderableCols.map((name) => getColumnIndex(name)),
            },
          ],
          columns,
        }
        // 要加filter就要連title一起加，不然DataTable長title時會蓋掉filter那行；不加filter則可以讓DataTable自己長
        context.commons.fillTableFilter($tableElement, configData.columns)
        context.commons.fillTableTitle($tableElement, configData.columns)
        context.commons.initMomentJSLang()
        if (!context.userAuth.canSeeQuoteAndStatus) {
          const hideCols = ['quote', 'quote_status']
          configData.hideCols = hideCols.map((name) => getColumnIndex(name))
        }
        window.dr = context.rfqListTable = createReportTable(configData)
        context.bindRfqListEvent()
      },
      drawRfqListTable(data) {
        const context = this
        let tableData
        context.rfqListTableData = context.preprocessTableData(data)
        tableData = Object.values(context.rfqListTableData)
        context.commons.fillFilterOptions(tableData, context.rfqListTable)
        context.rfqListTable.table.clear().rows.add(tableData).draw()
      },
      preprocessTableData(data) {
        const context = this
        const getFormatTime = (timeStr, format) =>
          timeStr
            ? moment(new Date(timeStr)).format(format || 'YYYY/MM/DD HH:mm:ss')
            : '---'
        const getTimeStamp = (timeStr) =>
          timeStr ? new Date(timeStr).getTime() : '---'
        return data.reduce((a, x) => {
          const { status, quote_status, close_time, create_time } = x
          const closeTimeFormated = getFormatTime(close_time)
          const createTimeFormated = getFormatTime(create_time)
          const statusI18n = i18n(context.preCon.rfqStatusI18nIdMap[status])
          const quoteStatusI18n = i18n(
            context.preCon.rfqQuoteStatusI18nIdMap[quote_status]
          )
          a[x.form_id] = _.extend(x, {
            form_id: {
              display: x.form_id
                ? `<a href="javascript:void(0);" class="detail-page" data-form-id="${x.form_id}" data-status="${x.status}">${x.form_id}</a>`
                : '---',
              orig: x.form_id || '---',
              filter: x.form_id || '---',
            },
            product_id: {
              display: x.product_id || x.product_name || '---',
              orig: x.product_id || x.product_name || '---',
              filter: x.product_id || x.product_name || '---',
            },
            cus_id: {
              display: x.cus_id || '---',
              orig: x.cus_id || '---',
              filter: x.cus_id || '---',
            },
            quote: {
              display: x.quote || '---',
              orig: x.quote || '---',
              filter: x.quote || '---',
            },
            status: {
              display: `${statusI18n}(${moment(
                new Date(x.status_chg_time)
              ).fromNow()})`,
              orig: status,
              filter: status,
              filterDisplay: statusI18n,
            },
            quote_status: {
              display: `${quoteStatusI18n}(${moment(
                new Date(x.quote_status_chg_time)
              ).fromNow()})`,
              orig: quote_status,
              filter: quote_status,
              filterDisplay: quoteStatusI18n,
            },
            close_time: {
              orig: close_time,
              display: closeTimeFormated,
              filter:
                closeTimeFormated === '---'
                  ? getTimeStamp(closeTimeFormated.replace(/\s.+/, ''))
                  : '---',
              filterDisplay: getFormatTime(close_time, 'YYYY/MM/DD'),
            },
            create_time: {
              orig: create_time,
              display: createTimeFormated,
              filter: getTimeStamp(createTimeFormated.replace(/\s.+/, '')),
              filterDisplay: getFormatTime(create_time, 'YYYY/MM/DD'),
            },
          })
          return a
        }, {})
      },
      setQueryCondition() {
        const queryStart = servkit.getURLParameter('start')
        const queryEnd = servkit.getURLParameter('end')
        const type = servkit.getURLParameter('type')
        const id = servkit.getURLParameter('id')

        if (id) {
          $('a[href="#search2"]').click()
          $('#demand-order-number').val(id)
        } else if (queryStart) {
          $('a[href="#search1"]').click()
          $('#startDate').val(queryStart.split('_').join('/'))
          $('#endDate').val(queryEnd.split('_').join('/'))
          Array.from($('#search1 [name=data-status]')).forEach((el, i) => {
            el.checked = !!Number(type[i])
          })
        }
      },
    },
    preCondition: {
      formIds(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_demand_list',
              columns: ['form_id'],
            }),
          },
          {
            success(data) {
              done(_.pluck(data, 'form_id'))
            },
          }
        )
      },
      userAuth(done) {
        const context = this
        context.commons.initAuth(done)
      },
      rfqStatusI18nIdMap(done) {
        $.get(
          './app/StrongLED/data/rfqStatusI18nIdMap.json?' +
            new Date().getTime(),
          (res) => {
            done(res)
          }
        )
      },
      rfqQuoteStatusI18nIdMap(done) {
        $.get(
          './app/StrongLED/data/rfqQuoteStatusI18nIdMap.json?' +
            new Date().getTime(),
          (res) => {
            done(res)
          }
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
      ['/js/plugin/moment/locale/zh-cn.js'],
    ],
  })
}
