import i18n from '../../../../js/servtech/module/servcloud.i18n.js'

export default function () {
  GoGoAppFun({
    gogo: function (context) {
      console.log('hi')
      servkit.initSelectWithList(
        context.preCon.getUserName,
        $('select[name="create_by"]')
      )
      servkit.initDatePicker($('.date'), null, false, false)
      servkit.initDatePicker($('input[name="close_time"]'), null, false, false)
      context.commons.initValidationSetting()
      window.rfqform = context.rfqForm = context.commons.createRfqForm(
        context.preCon.rfqColumnConfig,
        '#custom-rfq-column'
      )
      context.commons.initRfqForm(
        context,
        '#custom-rfq-column',
        context.rfqForm
      )

      // init 詢價單列表
      context.detailReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
        order: [0, 'asc'],
        customBtns: [
          `<button class="btn btn-primary" id="add-demandList" data-toggle="modal" data-target="#add-demand-modal-widget"><span class="fa fa-plus fa-lg"></span> ${i18n(
            'Create_rfq'
          )}</button>`,
        ],
        hideCols: [7],
        onRow: function (row, data) {
          let $isBomList = $(row).find('td').eq(7)
          $isBomList.html(
            `<span style="color:${
              data[7] === `${i18n('Yes')}` ? 'green' : 'red'
            }">${data[7]}</span>`
          )
        },
      })

      context.detailRenderTable()

      // 新增需求單modal.onShow，把表單裡的資料重置
      $('#add-demand-modal-widget').on('show.bs.modal', function () {
        if (context.isKeepData) return

        let name, value
        $(
          '#add-demand-list-modal fieldset:not(#custom-rfq-column) .form-control'
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
            default:
              value = ''
              break
          }
          $(el).val(value)
        })

        context.rfqForm.setDefaultState()
        if (context.validator) context.validator.destroy()
      })
      // 新增需求單
      // servkit.validateForm($('#add-demand-list-modal'), $('#add-rfq-btn'))
      $('#add-rfq-btn').on('click', function (evt) {
        evt.preventDefault()
        context.validator = $('#add-demand-list-modal').validate({
          errorPlacement: function (error, $el) {
            $el.closest('.value').append(error)
          },
        })
        if (!context.validator.form())
          return alert(`${i18n('Form_Is_Not_Completed')}`)
        let data = context.getRfqFormValue()
        $('#confirm-brand').text(
          data.light_brand.replace(/=/g, ': ').replace(/&/g, ', ')
        )
        $('#confirm-brand-btn').data('formData', data)
        $('#add-demand-modal-widget').modal('hide')
        $('#confirm-brand-modal-widget').modal('show')
        context.isKeepData = true
      })
      $('#confirm-brand-btn').on('click', function (evt) {
        let form_id = $('#add-demand-list-modal [name="form_id"]').val(),
          formData = $(this).data('formData')
        // 檢查詢價單號是否重複
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
            success: function (data) {
              let isDuplicate = data.find((obj) => obj.form_id === form_id)
                ? true
                : false
              if (isDuplicate) {
                $.smallBox({
                  title: `${i18n('Rfq_No._Repeated_The')}...`,
                  content: `<i class='fa fa-clock-o'></i> <i>${i18n(
                    'Please_Confirm_Again'
                  )}</i>`,
                  color: '#C46A69',
                  iconSmall: 'fa fa-times fa-2x fadeInRight animated',
                  timeout: 4000,
                })
              } else {
                context.createDemandList(formData)
              }
            },
          }
        )
      })
      $('#cancel-brand-btn').on('click', function (evt) {
        $('#confirm-brand-modal-widget').modal('hide')
        $('#add-demand-modal-widget').modal('show')
        setTimeout(() => $('body').addClass('modal-open'), 500)
      })
      $('#query-result')
        // 前往詢價單細節
        .on('click', '.detail-page', function (evt) {
          evt.preventDefault()
          var lang = servkit.getCookie('lang')
          var detail = `?formId=${$(this).data('form_id')}&bom=${$(this).data(
            'has_bom_list'
          )}`
          window.sessionStorage.setItem('demandLidtDetail', detail)
          window.location =
            '#app/StrongLED/function/' +
            lang +
            '/21_product_detail.html' +
            detail
        })
    },
    util: {
      detailReportTable: null,
      thisGroup: JSON.parse(window.sessionStorage.getItem('loginInfo'))
        .user_group,
      loginInfo: JSON.parse(window.sessionStorage.getItem('loginInfo')),
      series: null,
      modelNumber: null,
      detailRenderTable: function () {
        var context = this
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel:
                'com.servtech.servcloud.app.model.strongLED.DemandList',
              whereClause: 'status=99',
            },
          },
          {
            success: function (data) {
              var tableData = []
              tableData = data.map((val) => {
                return [
                  '<a href="javascript:void(0);" class="detail-page" data-form_id="' +
                    val.form_id +
                    '" data-has_bom_list="' +
                    val.has_bom_list +
                    '">' +
                    val.form_id +
                    '</a>',
                  val.product_id || val.product_name || '---', // 品號
                  val.seq_no || '---', // 序號
                  val.cus_id || '---', // 客戶
                  val.create_time, // 填表日期
                  val.quote,
                  val.close_time
                    ? moment(new Date(val.close_time)).format(
                        'YYYY/MM/DD HH:mm:ss'
                      )
                    : '---', // 結案時間
                  val.has_bom_list ? `${i18n('Yes')}` : `${i18n('No')}`,
                ]
              })

              context.detailReportTable.drawTable(tableData)
            },
          }
        )
      },
      createDemandList: function (data) {
        var context = this
        // return console.log(data)
        servkit.ajax(
          {
            url: 'api/strongled/createRFQ',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(
              _.extend(data, {
                po_check: 'Y',
                status: 99,
                quote_status: 99,
                is_quote: 'Y',
                has_bom_list: false,
              })
            ),
          },
          {
            success: function (data) {
              context.detailRenderTable()
              $('#confirm-brand-modal-widget').modal('hide')
            },
          }
        )
      },
      // 取得詢價單表格全部的值
      getRfqFormValue: function () {
        let context = this,
          data = context.rfqForm.getValue()

        $(
          '#add-demand-list-modal fieldset:visible:not(#custom-rfq-column)'
        ).each((i, el) => {
          $(el)
            .find('.form-control')
            .each((i, element) => {
              if (element.value) data[element.name] = element.value
            })
        })

        return data
      },
    },
    preCondition: {
      getUserName: function (done) {
        servkit.ajax(
          {
            url: 'api/user/read',
            type: 'GET',
            data: {
              tableModel: 'com.servtech.servcloud.module.model.SysUser',
            },
          },
          {
            success: function (data) {
              var userData = {}
              _.each(data, (elem) => {
                userData[elem.user_id] = elem.user_name
              })
              done(userData)
            },
          }
        )
      },
      getSeriesData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_strongled_rfq_columns',
              columns: ['series', 'model', 'content'],
            }),
          },
          {
            success: function (data) {
              var seriesData = {}
              _.each(data, (val) => {
                if (!seriesData[val.series]) {
                  seriesData[val.series] = {}
                }
                seriesData[val.series][val.model] = JSON.parse(val.content)
              })
              done(seriesData)
            },
          }
        )
      },
      lightAngleMap: function (done) {
        $.get(
          './app/StrongLED/data/lightAngleMap.json?' + new Date().getTime(),
          (res) => {
            done(res)
          }
        )
      },
      rfqColumnConfig: function (done) {
        $.get(
          './app/StrongLED/data/rfqColumnConfig.json?' + new Date().getTime(),
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
    ],
  })
}
