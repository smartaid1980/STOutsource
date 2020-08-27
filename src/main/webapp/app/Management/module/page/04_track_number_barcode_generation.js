import { crudtable } from '../../../../js/servtech/module/table/crudTable.js'
import fetchCodePrefixMap from '../fetchCodePrefixMap.js'
import { servtechConfig } from '../../../../js/servtech/module/servtech.config.js'
import { initPrintQrcodeBtn } from '../../../../js/servtech/module/servkit/printQrcode.js'

export default async function () {
  const codePrefixMap = await fetchCodePrefixMap()

  GoGoAppFun({
    gogo(ctx) {
      ctx.crudtable = crudtable({
        tableModel: 'com.servtech.servcloud.app.model.ennoconn.SMTStationTrack',
        tableSelector: '#stk-table',
        customBtns: [
          `<button id='print' class='btn btn-primary'>列印勾選項目條碼</button>`,
        ],
        create: {
          url: 'api/stdcrud',
        },
        read: {
          url: 'api/stdcrud',
        },
        update: {
          url: 'api/stdcrud',
        },
        delete: {
          url: 'api/stdcrud',
        },
      })
      // 隱藏刪除按鈕
      $('.stk-delete-btn').hide()

      function getPrintData() {
        const data = ctx.crudtable.getSelectedRowData()
        if (data.length > 0) {
          const ans = []
          _.each(ctx.crudtable.getSelectedRowData(), (val) => {
            const dataObj = {
              track: val[0],
              sub_track: val[1],
              description: val[2],
            }
            ans.push(dataObj)
          })
          const printObj = {
            'print_info': JSON.stringify(ans),
            'key_order[]': ['track', 'sub_track'],
            'delimiter': '-',
            'prefix': codePrefixMap[ctx.codeType],
            'size': 'Std',
          }
          return printObj
        } else {
          ctx.crudtable.getAllSelectedRowBling()
          return
        }
      }
      // QR code下載
      if (servtechConfig.ST_ENABLE_PRINTER_PRINTING_QRCODE) {
        initPrintQrcodeBtn(document.getElementById('print'), function () {
          const requestData = getPrintData()
          if (!requestData) {
            return
          }
          return {
            url: 'api/ennoconn/smt/device/qrcode-by-tsc',
            data: requestData,
          }
        })
      } else {
        servkit.downloadFile(
          '#print',
          '/api/ennoconn/smt/device/qrcode',
          getPrintData,
          'GET'
        )
      }
    },
    util: {
      codePrefixMap,
      codeType: 'track',
      crudtable: '',
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
