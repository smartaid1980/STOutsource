import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo(context) {
      console.log('hi')

      context.commons.createRfqView('#custom-rfq-column').then((rfqView) => {
        window.rfqview = context.rfqView = rfqView
      })
      context.getDemandListData()
      context.bindEvent()
    },
    util: {
      project_id: servkit.getURLParameter('projectId'),
      bindEvent() {
        const context = this
        // 列印
        $('#print-btn').click(function () {
          window.print()
        })
        // 回上一頁
        $('#leave-btn').on('click', function () {
          const lang = servkit.getCookie('lang')
          window.location = `#app/StrongLED/function/${lang}/14_project_rfq_list.html?projectId=${context.project_id}`
        })
      },
      getDemandListData() {
        const context = this
        servkit.ajax(
          {
            url: 'api/strongled/wholerfq',
            type: 'GET',
            data: {
              form_id: servkit.getURLParameter('formId'),
            },
          },
          {
            success(data) {
              servkit.ajax(
                {
                  url: 'api/stdcrud',
                  type: 'GET',
                  data: {
                    tableModel:
                      'com.servtech.servcloud.app.model.strongLED.PrintQuotationLog',
                    whereClause: `form_id='${servkit.getURLParameter(
                      'formId'
                    )}'`,
                  },
                },
                {
                  success(log) {
                    context.rfqContent = data
                    context.printQuotationLog = log
                    context.renderDemandListData()
                  },
                }
              )
            },
          }
        )
      },
      renderDemandListData() {
        const context = this
        const { rfqContent } = context
        const formTypeMap = {
          2: `${i18n('Inquiry_Order')}`,
        }
        const moneyFormatter = (money) => {
          let formatted =
              typeof money === 'number'
                ? money.toFixed(2)
                : parseFloat(money).toFixed(2),
            intPart = formatted.split('.')[0],
            floatPart = formatted.split('.')[1],
            regEx = /(\d+)(\d{3})/

          if (intPart.length > 4) {
            while (regEx.test(intPart)) {
              intPart = intPart.replace(regEx, '$1' + ',' + '$2')
            }
          }

          return 'RMB¥' + intPart + '.' + floatPart
        }
        const lampTypeMap = {
          '0': '点光源',
          '1': '洗墙灯/线条灯',
          '2': '投光灯',
        }
        let column
        let $el
        let value
        let user_name
        $(
          '#rfq-detail-view fieldset:visible:not(#custom-rfq-column) .value'
        ).each((i, el) => {
          $el = $(el)
          column = $el.data('column')
          switch (column) {
            case 'create_time':
              value = rfqContent[column]
                ? moment(new Date(rfqContent[column])).format(
                    'YYYY/MM/DD HH:mm:ss'
                  )
                : ''
              break
            case 'st_lead_time':
            case 'st_po_time':
              value = rfqContent[column]
                ? moment(rfqContent[column], 'MMM DD, YYYY').format(
                    'YYYY/MM/DD'
                  )
                : ''
              break
            case 'form_type':
              value =
                formTypeMap[rfqContent[column]] || `${i18n('Inquiry_Order')}`
              break
            case 'create_by':
              user_name = context.preCon.getUserName[rfqContent[column]]
              value = user_name ? user_name : rfqContent[column]
              break
            case 'quote_time':
              value = context.printQuotationLog.length
                ? context.printQuotationLog.sort((a, b) => {
                    if (a.create_time < b.create_time) return 1
                    if (a.create_time > b.create_time) return -1
                    return 0
                  })[0].create_time
                : ''
              break
            case 'quoted_price':
              value = moneyFormatter(rfqContent.quote)
              break
            default:
              value = rfqContent[column]
              break
          }

          $el.text(value === undefined ? '' : value)
        })
        context.rfqView.setValue(
          _.extend(rfqContent, {
            lamp_type: lampTypeMap[rfqContent['lamp_type']],
          })
        )
        // 列印模式下排版靠flex，不是BS3的grid，所以要補div避免跑版
        if (
          rfqContent.color_temperature &&
          rfqContent.color_temperature.split('&').length % 2
        ) {
          $(
            '.subgroup[data-column=color_temperature] .row:nth-child(2)'
          ).append('<div class="col col-lg-5"></div>')
        }
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
      // rfqColumnConfig (done) {
      //   $.get('./app/StrongLED/data/rfqColumnConfig.json?' + (new Date).getTime(), (res) => {
      //     done(res)
      //   })
      // },
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
