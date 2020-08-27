import {
  ajax,
  fetchDbData,
  fetchUserData,
} from '../../../../js/servtech/module/servkit/ajax.js'
import { downloadFile } from '../../../../js/servtech/module/servkit/form.js'
import { createReportTable } from '../../../../js/servtech/module/table/reportTable.js'
import { refreshButton } from '../../../../js/servtech/module/element/button.js'
import { servtechConfig } from '../../../../js/servtech/module/servtech.config.js'
import { initPrintQrcodeBtn } from '../../../../js/servtech/module/servkit/printQrcode.js'

export default async function () {
  const userMap = await fetchUserData().then((data) =>
    Object.fromEntries(
      data.map(({ user_id, user_name }) => [user_id, user_name])
    )
  )
  GoGoAppFun({
    gogo(context) {
      const downloadQRcode = (pkgid) => {
        context.pkgidCount = pkgid
        $('#dl_pkgid_hide').click()
      }
      function validatePkgidCount(count) {
        const reg = /\./g
        const isPkgidInRange = count > 0 && count <= 9999
        const isPkgidInteger = !reg.test(count) && !isNaN(count) && count !== ''
        return isPkgidInRange && isPkgidInteger
      }
      if (servtechConfig.ST_ENABLE_PRINTER_PRINTING_QRCODE) {
        initPrintQrcodeBtn(document.getElementById('dl_pkgid'), () => {
          const pkgIdCount = Number($('#pkgid').val())
          const isValid = validatePkgidCount(pkgIdCount)
          if (!isValid) {
            return
          }
          const requestData = {
            count: pkgIdCount,
          }
          return {
            url: 'api/ennoconn/material/pre-create-and-print-qrcode-by-tsc',
            data: requestData,
          }
        })
      } else {
        downloadFile(
          '#dl_pkgid_hide',
          '/api/ennoconn/material/pre-create-and-return-qrcode',
          () => ({ count: context.pkgidCount }),
          'GET'
        )
        $('#dl_pkgid').click(() => {
          const count = Number($('#pkgid').val())
          const isValid = validatePkgidCount(count)

          if (isValid) {
            context.canPrintQrcode(count).then((canPrint) => {
              if (canPrint) {
                downloadQRcode(count)
              }
            })
          } else {
            $.smallBox({
              sound: false,
              title: '下載失敗',
              content: '請輸入1~9999中間的整數',
              color: servkit.colors.red,
              iconSmall: 'fa fa-times',
              timeout: 4000,
            })
          }
        })
      }
      context.initReportTable()
      $('#to-re-download-tab').on('click', function (evt) {
        evt.preventDefault()
        context.refreshTable()
      })
    },
    util: {
      pkgidCount: null,
      thingPreTable: null,
      refreshLoadingBtn: null,
      userMap,
      initReportTable() {
        const context = this
        const refreshBtn = refreshButton()

        context.refreshLoadingBtn = $(refreshBtn).data('loadingButton')

        context.thingPreTable = createReportTable({
          $tableElement: $('#thing-pre-table'),
          $tableWidget: $('#search-query-conditions-widget'),
          autoWidth: false,
          customBtns: [
            refreshBtn,
            `<button
            type="button"
            id="re-download-pkgid-btn"
            class="btn btn-primary"
          >
            下載勾選之PKGID條碼
          </button>`,
          ],
          checkbox: true,
        })
        $(refreshBtn).on('click', context.refreshTable.bind(context))
        function getPrintData() {
          const rowDataList = context.thingPreTable.getSelectedRow()
          if (!rowDataList.length) {
            return false
          }
          return { 'thing_id[]': rowDataList.map(([thing_id]) => thing_id) }
        }
        if (servtechConfig.ST_ENABLE_PRINTER_PRINTING_QRCODE) {
          initPrintQrcodeBtn(
            document.getElementById('re-download-pkgid-btn'),
            () => {
              const requestData = getPrintData()
              if (!requestData) {
                return
              }
              return {
                url: 'api/ennoconn/material/pre-pkg-print-qrcode-by-tsc',
                data: requestData,
              }
            }
          )
        } else {
          downloadFile(
            '#re-download-pkgid-btn',
            '/api/ennoconn/material/pre-pkg-qrcode',
            getPrintData,
            'GET'
          )
        }
      },
      refreshTable(evt) {
        const context = this
        if (evt) {
          evt.preventDefault()
        }
        context.refreshLoadingBtn.doing()
        context.fetchThingPreData().then((data) => {
          context.thingPreTable.drawTable(
            data.map((obj) => [
              obj.thing_id,
              obj.create_time.toFormatedDatetime() || '',
              context.userMap[obj.create_by] || obj.create_by || '',
            ])
          )
          context.refreshLoadingBtn.done()
        })
      },
      fetchThingPreData() {
        return fetchDbData(
          'a_ennoconn_view_not_binding_bill_stock_in_thing_pre'
        )
      },
      canPrintQrcode(count) {
        return new Promise((res) =>
          ajax(
            {
              url: 'api/ennoconn/material/check-pre-pkg',
              type: 'GET',
              contentType: 'application/json',
              data: `count=${count}`,
            },
            {
              success() {
                res(true)
              },
              fail(data) {
                $.smallBox({
                  sound: false,
                  title: '下載失敗',
                  content: data,
                  color: servkit.colors.red,
                  iconSmall: 'fa fa-times',
                  timeout: 4000,
                })
                res(false)
              },
            }
          )
        )
      },
      checkPrintingStatus(id) {
        return new Promise((res) => res(true))
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
