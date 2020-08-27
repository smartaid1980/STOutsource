import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import {
  iconButton,
  refreshButton,
} from '../../../../js/servtech/module/element/button.js'
import { createReportTable } from '../../../../js/servtech/module/table/reportTable.js'
import servkit from '../../../../js/servtech/module/servkit/servkit.js'
import {
  ajax,
  fetchDbData,
} from '../../../../js/servtech/module/servkit/ajax.js'
import { getPositionStructure } from '../positionStructure.js'
import {
  initSelectWithList,
  validateForm,
} from '../../../../js/servtech/module/servkit/form.js'
import { initPrintQrcodeBtn } from '../../../../js/servtech/module/servkit/printQrcode.js'

export default async function () {
  const positionStructure = await getPositionStructure()

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      table: null,
      refreshLoadingBtn: null,
      $structureLevelSelect: $('#structure-level'),
      $pathSelect: $('#path'),
      $submitBtn: $('#submit-btn'),
      $queryForm: $('#query-form'),
      positionStructure,
      main() {
        const context = this
        context.initTable()
        context.initQueryForm()
        context.refreshTable()
      },
      initQueryForm() {
        const context = this
        const {
          $pathSelect,
          $structureLevelSelect,
          $submitBtn,
          $queryForm,
        } = context

        positionStructure.initQueryPositionSelects(
          $structureLevelSelect,
          $pathSelect
        )

        validateForm($queryForm, $submitBtn)
        $submitBtn.on('click', context.refreshTable.bind(context))
      },
      initTable() {
        const context = this
        const printBtn = iconButton(
          {
            className: ['btn', 'bg-color-blueDark', 'txt-color-white'],
            id: 'stk-qrcode-btn',
            attributes: {
              title: i18n('Print_Checked_Qrcode'),
            },
          },
          'fa-qrcode',
          'fa-lg'
        )
        const refreshBtn = refreshButton()
        context.refreshLoadingBtn = $(refreshBtn).data('loadingButton')

        context.table = createReportTable({
          $tableElement: $('#store-table'),
          $tableWidget: $('#store-table-widget'),
          customBtns: [refreshBtn, printBtn],
          checkbox: true,
          columns: [
            {
              name: 'store_org_id',
              data: 'store_org_id',
              render(data) {
                return data || ''
              },
            },
            {
              name: 'store_name',
              data: 'store_name',
              render(data, type, rowData) {
                return context.getFormattedStoreName(
                  rowData.store_id,
                  data || ''
                )
              },
            },
            {
              name: 'store_type_id',
              data: 'store_type_id',
              render(data, type) {
                if (type === 'display' || type === 'selectFilter') {
                  return context.preCon.getStoreTypeData[data] || data || ''
                } else {
                  return data
                }
              },
            },
          ],
        })

        $(refreshBtn).on('click', context.refreshTable.bind(context))
        // QR Code 列印
        if (servtechConfig.ST_ENABLE_PRINTER_PRINTING_QRCODE) {
          initPrintQrcodeBtn(printBtn, () => {
            const requestData = context.getPrintParam()
            if (!requestData) {
              return
            }
            return {
              url: 'api/ennoconn/store/qrcode-by-tsc',
              data: requestData,
            }
          })
        } else {
          servkit.downloadFile(
            printBtn,
            '/api/storage/store/qrcode',
            context.getPrintParam.bind(context),
            'GET'
          )
        }
      },
      // store_name 加上分隔符號(db 存的名稱沒有分隔)
      getFormattedStoreName(store_id, store_name) {
        const storeLevel = positionStructure.structure.length - 1
        const levelData = Object.values(positionStructure.storageMap).find(
          (map) => map?.levels?.[storeLevel]?.db_id === store_id
        )?.levels
        let result = store_name
        if (levelData) {
          const storeData = levelData[storeLevel]
          const parentData = levelData[storeLevel - 1]
          result = `${parentData.name} - ${storeData.name}`
        }
        return result
      },
      fetchStoreData() {
        const context = this
        const { $pathSelect, $structureLevelSelect } = context
        const path = $pathSelect.val()
        const level = $structureLevelSelect.val()
        const storeLevel = positionStructure.structure.length - 1
        const storePathList = positionStructure.getLevelData(level)[path]
        const storeIdList = _.chain(positionStructure.storageMap)
          .pick(storePathList)
          .pluck('levels')
          .map((map) => map[storeLevel].db_id)
          .value()
        const whereClause = `store_id IN (${storeIdList
          .map(() => '?')
          .join(', ')})`
        const whereParams = storeIdList
        const option = {
          whereClause,
          whereParams,
        }
        return fetchDbData('a_storage_store', option)
      },
      refreshTable() {
        const context = this
        context.refreshLoadingBtn.doing()
        return context.fetchStoreData().then((data) => {
          context.table.drawTable(data)
          context.refreshLoadingBtn.done()
        })
      },
      getPrintParam() {
        const context = this
        const { table } = context
        const selectedRow = table.getSelectedRow()
        const storeData = _.pluck(selectedRow, 'store_id')

        if (!selectedRow.length) {
          return
        }
        return {
          'store_id[]': storeData,
        }
      },
    },
    preCondition: {
      getStoreTypeData(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store_type',
              columns: ['store_type_id', 'store_type_name'],
            }),
          },
          {
            success(data) {
              var storeTypeData = {}
              _.each(data, function (elem) {
                storeTypeData[elem.store_type_id] = elem.store_type_name
              })
              done(storeTypeData)
            },
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
