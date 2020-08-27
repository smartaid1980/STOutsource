import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo(context) {
      console.log('hi')
      context.userAuth = context.initUserAuth(
        context.loginInfo.user_group,
        context.preCon.sysGroupMap
      )
      // 新增詢價單表格
      context.initRfqForm()
      // 詢價單列表
      context.initDemandListTable()
      // 透過url parameter載入查詢條件
      context.getDemandList()
      context.initProjectInfo()

      $('#leave-btn').on('click', function () {
        context.goPreviousPage()
      })
    },
    util: {
      project_id: servkit.getURLParameter('projectId'),
      loginInfo: JSON.parse(window.sessionStorage.getItem('loginInfo')),
      rfqListTable: null,
      queryCondition: null,
      discountHistoryTable: null,
      $cancelRfqModal: $('#canceled-alert-modal-widget'),
      initUserAuth(currentGroup, allGroupMap) {
        const result = {}
        let hasGroup, groupId
        for (var role in allGroupMap) {
          groupId = allGroupMap[role]
          hasGroup = currentGroup.includes(groupId)
          result[role] = hasGroup
        }
        return result
      },
      initProjectInfo() {
        const context = this
        const isAccount = context.userAuth.account
        let userId = context.loginInfo.user_id
        if (!isAccount) {
          userId = JSON.parse(sessionStorage.getItem('projectInfo')).userId
        }
        servkit.ajax(
          {
            url: `api/strongled/project/${userId}`,
            type: 'GET',
          },
          {
            success(projects) {
              const projectInfo = projects.filter(
                (project) => project.project_id === context.project_id
              )[0]
              const getTdhtml = (value) => `<td>${value}</td>`
              const rowOrder = ['project_id', 'user_id', 'cus_id']
              const trHtml = rowOrder.reduce((a, id) => {
                if (id === 'user_id') {
                  const userName = context.preCon.getUserName[projectInfo[id]]
                  return a + getTdhtml(userName)
                }
                return a + getTdhtml(projectInfo[id])
              }, '')
              context.projectInfo = projectInfo
              $('#project-info-title').text(
                `${i18n('Project_Name')}：${projectInfo.project_name}`
              )
              $('#project-info-row').html(trHtml)
            },
          }
        )
      },
      goPreviousPage() {
        const lang = servkit.getCookie('lang')
        window.location = `#app/StrongLED/function/${lang}/13_project_management.html`
      },
      // ↓詢價單操作
      bindDemandListEvent() {
        const context = this
        $('#query-result-widget').on('click', '#refresh-rfq-list', function (
          e
        ) {
          e.preventDefault()
          context.getDemandList()
        })
        // 詢價單列表上的各項操作
        $('#query-result')
          .on('click', '.request-discount-btn', function (e) {
            e.preventDefault()
            context.onRequestDiscountModalShow($(this))
          })
          .on('click', '.print-rfq', function (evt) {
            evt.preventDefault()
            context.goPrintRfqPage($(this))
          })
          .on('click', '.detail-page', function (evt) {
            evt.preventDefault()
            context.goDetailPage($(this))
          })
          .on('click', '.finished', function (e) {
            e.preventDefault()
            context.onCloseRfqModalShow($(this))
          })
          .on('click', '.cancel', function (e) {
            e.preventDefault()
            context.onCancelRfqModalShow($(this))
          })

        // init 折扣紀錄
        const columns = [
          {
            title: `${i18n('Time')}`,
            name: 'create_time',
            data: 'create_time',
            type: 'date',
            width: '25%',
          },
          {
            title: `${i18n('The_Reason')}`,
            name: 'reason',
            data: 'reason',
            width: '50%',
          },
          {
            title: `${i18n('Quoted_price')}`,
            name: 'quote',
            data: 'quote',
            type: 'num',
            width: '25%',
          },
        ]
        context.discountHistoryTable = createReportTable({
          $tableElement: $('#quote-history-table'),
          showNoData: false,
          columns,
          columnDefs: [
            {
              orderable: false,
              targets: ['reason'].map((name) =>
                context.commons.getColumnIndex(name, columns)
              ),
            },
          ],
        })
        $('#show-history-btn')
          .on('click', function () {
            $(this).next().toggle()
          })
          .click()

        // 要求折扣 / 取消報價
        servkit.validateForm(
          $('#request-discount-modal'),
          $('#request-discount-btn')
        )
        $('#request-discount-btn').on('click', function (e) {
          e.preventDefault()
          context.requestDiscountAndCancelRfq()
        })

        // 確定結案
        $('#close-confirm').on('click', function (e) {
          e.preventDefault()
          context.closeRfq()
        })

        // 確認「詢價單已被取消」，重新載入列表
        context.$rfqCanceledModal = context.commons.initRfqCanceledModal(() => {
          context.getDemandList()
        })
      },
      onRequestDiscountModalShow($thisBtn) {
        const form_id = $thisBtn.data('form_id').toString(),
          quote = $thisBtn.data('quote'),
          context = this

        $('#request-discount-modal-widget')
          .toggleClass('request-modal', true)
          .toggleClass('cancel-modal', false)
        $('#request-discount-modal')
          .data('form_id', form_id)
          .data('quote', quote)
          .find('input[name="discount_reason"]')
          .val('')

        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel:
                'com.servtech.servcloud.app.model.strongLED.RequestDiscountLog',
              whereClause: `form_id='${form_id}'`,
            },
          },
          {
            success(data) {
              context.discountHistoryTable.table.clear().rows.add(data).draw()
            },
          }
        )
      },
      onCancelRfqModalShow($thisBtn) {
        const context = this

        $('#request-discount-modal-widget')
          .toggleClass('request-modal', false)
          .toggleClass('cancel-modal', true)
        $('#request-discount-modal')
          .data('form_id', $thisBtn.data('form_id').toString())
          .data('quote', $thisBtn.data('quote'))
          .find('input[name="discount_reason"]')
          .val('')
      },
      onCloseRfqModalShow($thisBtn) {
        let form_id = String($thisBtn.data('form_id')),
          status = parseInt($thisBtn.data('status'))
        $('#confirm-close-form-id').text(form_id)
        $('#close-confirm-modal-widget').data({ form_id, status }).modal('show')
      },
      goDetailPage($thisBtn) {
        const context = this
        const lang = servkit.getCookie('lang')
        const buttonData = $thisBtn.data()
        const detail = `?formId=${buttonData.form_id}&status=${buttonData.status}&projectId=${context.project_id}`
        window.location = `#app/StrongLED/function/${lang}/11_rfq_detail.html${detail}`
      },
      goPrintRfqPage($thisBtn) {
        const context = this
        const lang = servkit.getCookie('lang')
        const $btn = $thisBtn
        const form_id = $btn.data('form_id').toString()
        const quoteStatus = $btn.data('quote-status')
        const quote = $btn.data('quote')
        const isFirstCreateQuotaion = quoteStatus === 1
        const detail = `?formId=${form_id}&projectId=${context.project_id}`
        const go = () =>
          (window.location =
            '#app/StrongLED/function/' + lang + '/12_rfq_print.html' + detail)
        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            if (isFirstCreateQuotaion) {
              servkit.ajax(
                {
                  url: 'api/strongled/createquotation',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    quote,
                    quote_status: 10,
                    form_id,
                  }),
                },
                {
                  success() {
                    go()
                  },
                }
              )
            } else {
              go()
            }
          },
          canceledCallback() {
            context.$rfqCanceledModal.modal('show')
          },
        })
      },
      closeRfq() {
        const context = this
        const $modal = $('#close-confirm-modal-widget')
        const form_id = $modal.data('form_id')
        const status = $modal.data('status')

        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            servkit.ajax(
              {
                url: 'api/strongled/closerfq',
                type: 'GET',
                data: {
                  form_id,
                  status,
                },
              },
              {
                success() {
                  $.smallBox({
                    title: `${i18n('End_Quote')}`,
                    content: `<i aria-hidden='true' class='fa fa-clock-o'></i> <i>${i18n(
                      'End_Quote'
                    )}</i>`,
                    color: '#659265',
                    iconSmall: 'fa fa-check fa-2x fadeInRight animated',
                    timeout: 4000,
                  })
                  $modal.modal('hide')
                  context.getDemandList()
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
      requestDiscountAndCancelRfq() {
        const context = this,
          $form = $('#request-discount-modal'),
          $modal = $('#request-discount-modal-widget'),
          form_id = $form.data('form_id').toString(),
          reason = $form.find('input[name="discount_reason"]').val(),
          quote = $form.data('quote'),
          currPage = context.rfqListTable.table.page.info().page,
          isRequestDiscountModal = $modal.hasClass('request-modal'),
          isCancelRfqModal = $modal.hasClass('cancel-modal')

        context.commons.checkIsRfqCanceled({
          form_id,
          uncancelCallback() {
            if (isRequestDiscountModal) {
              servkit.ajax(
                {
                  url: 'api/strongled/requestdiscount',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    quote,
                    quote_status: 20,
                    form_id,
                    reason,
                  }),
                },
                {
                  success() {
                    context.getDemandList()
                    $modal.modal('hide')
                  },
                }
              )
            } else if (isCancelRfqModal) {
              servkit.ajax(
                {
                  url: `api/strongled/changestatus`,
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    form_id: form_id,
                    status: 96,
                    quote_status: 98,
                    reason,
                  }),
                },
                {
                  success() {
                    context.getDemandList()
                    $modal.modal('hide')
                  },
                }
              )
            }
          },
          canceledCallback() {
            $modal.modal('hide')
            context.$rfqCanceledModal.modal('show')
          },
        })
      },
      // ↓查詢詢價單
      initDemandListTable() {
        const context = this
        const addDemandListButton = `<button class="btn btn-primary" id="add-demandList" data-toggle="modal" data-target="#add-demand-modal-widget"><span class="fa fa-plus fa-lg"></span> ${i18n(
          'Create_rfq'
        )}</button>`
        const refreshButton = `<button class="btn btn-primary" id="refresh-rfq-list" title="Refresh"><span class="fa fa-refresh fa-lg"></span> ${i18n(
          'Reforming'
        )}</button>`
        const $tableElement = $('#query-result')
        const $tableWidget = $('#query-result-widget')
        const btns = (quote_status, form_id, status, quote) => {
          const cancelBtn = `<li>
              <a 
              class="cancel" 
              data-form_id="${form_id}" 
              data-status="${status}" 
              data-toggle="modal" 
              data-target="#request-discount-modal-widget" 
              href="javascript:void(0);">
              ${i18n('Cancel_Quote')}
              </a>
            </li>`
          const requestDiscountBtn = `<li>
                <a 
                class="request-discount-btn" 
                data-toggle="modal" 
                data-target="#request-discount-modal-widget" 
                data-form_id="${form_id}" 
                data-status="${status}" 
                data-quote="${quote}" 
                href="javascript:void(0);">
                ${i18n('Request_Discounts')}
                </a>
              </li>`
          const printRfqBtn = `<li>
                <a 
                class="print-rfq" 
                data-form_id="${form_id}" 
                data-status="${status}" 
                data-quote-status="${quote_status}" 
                data-quote="${quote || '---'}" 
                href="javascript:void(0);">
                ${
                  quote_status === 1
                    ? `${i18n('Produce_Quotations')}`
                    : `${i18n('View_Quote')}`
                }
                </a>
              </li>`
          const closeRfqBtn = `<li>
                <a 
                class="finished" 
                data-form_id="${form_id}"
                data-status="${status}"
                href="javascript:void(0);">
                ${i18n('End_Quote')}
                </a>
              </li>`
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
          const isAccount = context.userAuth.account
          const isAccountAssistant = context.userAuth.accountAst
          let btnGroupHtml = ''

          if (isAccount || isAccountAssistant) btnGroupHtml += cancelBtn
          if (
            isAccount &&
            (quote_status === 1 || quote_status === 10) &&
            ![30, 99].includes(quote_status)
          )
            btnGroupHtml += requestDiscountBtn
          if (isAccount && [1, 10, 20].includes(quote_status))
            btnGroupHtml += printRfqBtn
          if (isAccount && quote_status === 10) btnGroupHtml += closeRfqBtn

          return wholeBtn(btnGroupHtml)
        }
        const columns = [
          {
            name: 'form_id',
            title: `${i18n('RFQ_Number')}`,
            data: 'form_id',
            width: '10%',
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
            width: '14%',
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
            title: `${i18n('Date_of_filing')}`,
            name: 'create_time',
            data: 'create_time',
            width: '12%',
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
            type: 'num',
            width: '8%',
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
            width: '18%',
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
            width: '18%',
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
            width: '12%',
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
            width: '3%',
            data: null,
            render(data, type, rowData) {
              return type === 'display'
                ? btns(
                    rowData.quote_status.orig,
                    rowData.form_id.orig,
                    rowData.status.orig,
                    rowData.quote.orig
                  )
                : data
            },
          },
        ]
        const getColumnIndex = (name) =>
          columns.findIndex((map) => map.name === name)
        const unorderableCols = ['manipulating', 'product_info']
        const configData = {
          $tableElement,
          $tableWidget,
          order: [
            [getColumnIndex('status'), 'asc'],
            [getColumnIndex('quote_status'), 'asc'],
            [getColumnIndex('create_time'), 'desc'],
          ],
          customBtns: [
            // addDemandListButton,
            refreshButton,
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
        if (context.userAuth.accountAst) {
          configData.hideCols = configData.columns.reduce((a, value, key) => {
            const isHide = value.name === 'quote'
            return isHide ? [...a, key] : a
          }, [])
        }
        context.commons.fillTableFilter($tableElement, configData.columns)
        context.commons.fillTableTitle($tableElement, configData.columns)
        context.commons.initMomentJSLang()
        window.dr = context.rfqListTable = createReportTable(configData)
        class RefreshButton {
          constructor({ selector }) {
            this.$el = $(selector)
            this.$span = this.$el.find('.fa-refresh')
          }
          searching() {
            this.$span.addClass('fa-spin')
          }
          quitSearching() {
            setTimeout(() => this.$span.removeClass('fa-spin'), 500)
          }
        }
        context.refreshBtn = new RefreshButton({
          selector: '#refresh-rfq-list',
        })
        context.bindDemandListEvent()
      },
      getDemandList() {
        const context = this
        const { project_id } = context
        context.refreshBtn.searching()
        servkit.ajax(
          {
            url: `api/strongled/project/${project_id}/getrfqlist`,
            type: 'GET',
          },
          {
            success(data) {
              context.rfqListData = data.reduce((a, x) => {
                a[x.form_id] = x
                return a
              }, {})
              context.drawDemandListTable(data)
              context.refreshBtn.quitSearching()
            },
          }
        )
      },
      drawDemandListTable(data) {
        const context = this
        let tableData
        context.rfqListTableData = context.preProcessTableData(data)
        tableData = Object.values(context.rfqListTableData)
        context.commons.fillFilterOptions(tableData, context.rfqListTable)
        context.rfqListTable.table.clear().rows.add(tableData).draw()
      },
      preProcessTableData(data) {
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
                ? `<a href="javascript:void(0);" class="detail-page" data-form_id="${x.form_id}" data-status="${x.status}">${x.form_id}</a>`
                : '---',
              orig: x.form_id || '---',
              filter: x.form_id || '---',
            },
            product_id: {
              display: x.product_id || x.product_name || '---',
              orig: x.product_id || x.product_name || '---',
              filter: x.product_id || x.product_name || '---',
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
              filter: getTimeStamp(closeTimeFormated.replace(/\s.+/, '')),
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
      // ↓新增詢價單
      createDemandList(data, isSaveTemp) {
        const context = this
        const project_id = context.project_id
        const status = isSaveTemp ? 0 : 1
        const extraData = {
          project_id,
          status,
          create_by: context.loginInfo.user_id,
          create_time: moment().format('YYYY/MM/DD HH:mm:ss'),
          po_check: 'N',
          quote_status: 30,
          is_quote: 'N',
          has_bom_list: false,
        }

        servkit.ajax(
          {
            url: 'api/strongled/createRFQ',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(_.extend(data, extraData)),
          },
          {
            success(data) {
              context.getDemandList()
              if (isSaveTemp) {
                $('#add-demand-modal-widget').modal('hide')
              } else {
                $('#confirm-brand-modal-widget').modal('hide')
              }
            },
          }
        )
      },
      initRfqForm() {
        const context = this
        servkit.initDatePicker($('.date'), null, false, false)
        servkit.initSelectWithList(
          context.preCon.getUserName,
          $('select[name="create_by"]')
        )
        context.commons.initValidationSetting()
        context.commons.createRfqForm('#custom-rfq-column').then((rfqForm) => {
          window.rfqform = context.rfqForm = rfqForm
        })

        // 新增詢價單modal.onShow，把表單裡的資料重置
        $('#add-demand-modal-widget').on('show.bs.modal', function () {
          context.resetRfqForm()
        })

        // 新增詢價單
        $('#add-rfq-btn').on('click', function (evt) {
          evt.preventDefault()

          // 驗證表格
          context.validator = $('#rfq-detail-edit').validate({
            errorPlacement(error, $el) {
              $el.closest('.value').append(error)
            },
          })
          if (!context.validator.form())
            return alert(`${i18n('Form_Is_Not_Completed')}`)

          let data = context.getRfqFormValue()
          // return console.log(data)
          $('#confirm-brand').html(
            `<br>${data.light_brand
              .split('&')
              .filter((s) => !s.includes('型'))
              .map((s) => s.replace(/=/g, ': '))
              .join('<br>')}`
          )
          $('#confirm-brand-btn').data('formData', data)
          $('#add-demand-modal-widget').modal('hide')
          $('#confirm-brand-modal-widget').modal('show')
          context.isKeepData = true
        })
        $('#save-rfq-btn').on('click', function (evt) {
          evt.preventDefault()
          context.createDemandList(context.getRfqFormValue(), true)
        })
        // 確認品牌
        $('#confirm-brand-btn').on('click', function (evt) {
          let formData = $(this).data('formData')
          context.createDemandList(formData)
        })
        $('#cancel-brand-btn').on('click', function (evt) {
          $('#confirm-brand-modal-widget').modal('hide')
          $('#add-demand-modal-widget').modal('show')
          setTimeout(() => $('body').addClass('modal-open'), 500)
        })
      },
      resetRfqForm() {
        const context = this
        if (context.isKeepData) return

        let name, value

        $(
          '#rfq-detail-edit fieldset:not(#custom-rfq-column) .form-control'
        ).each((i, el) => {
          name = el.name
          switch (name) {
            case 'create_by':
              value = context.loginInfo.user_id
              break
            case 'create_time':
              value = moment().format('YYYY/MM/DD')
              break
            case 'form_type':
              value = '2'
              break
            case 'cus_id':
              value = context.projectInfo ? context.projectInfo.cus_id : ''
              break
            default:
              value = ''
              break
          }
          $(el).val(value)
        })
        context.rfqForm.setDefaultState()
        if (context.validator) context.validator.destroy()
      },
      getRfqFormValue() {
        let context = this,
          data = context.rfqForm.getValue()

        $('#rfq-detail-edit fieldset:visible:not(#custom-rfq-column)').each(
          (i, el) => {
            $(el)
              .find('.form-control')
              .each((i, element) => {
                if (element.value) data[element.name] = element.value
              })
          }
        )

        return data
      },
    },
    preCondition: {
      getUserName(done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
            data: {
              tableModel: 'com.servtech.servcloud.module.model.SysUser',
            },
          },
          {
            success(data) {
              var userData = {}
              _.each(data, (elem) => {
                userData[elem.user_id] = elem.user_name
              })
              done(userData)
            },
          }
        )
      },
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
      sysGroupMap(done) {
        $.get(
          './app/StrongLED/data/sysGroupIdMap.json?' + new Date().getTime(),
          (res) => {
            done(res)
          }
        )
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
        '/js/plugin/moment/locale/zh-cn.js',
      ],
    ],
  })
}
