import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import { getPositionStructure } from '../../../StrongLEDStorageManagement/module/positionStructure.js'
import { servtechConfig } from '../../../../js/servtech/module/servtech.config.js'

export default async function () {
  const positionStructure = await getPositionStructure()

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      positionStructure,
      detailReportTable: null,
      isStrongLED: servtechConfig.ST_CUSTOMER === 'StrongLED',
      main() {
        const context = this

        context.initQueryForm()
        context.initReportTable()
      },
      initReportTable() {
        const context = this
        context.detailReportTable = createReportTable({
          $tableElement: $('#detail-table'),
          $tableWidget: $('#detail-table-widget'),
          customBtns: [
            `<button class="btn bg-color-blueDark txt-color-white" data-toggle="modal" data-target="#print-modal"  title="${i18n(
              'Print_Checked_Qrcode'
            )}"><span class="fa fa-qrcode fa-lg"></span></button>`,
          ],
          checkbox: true,
        })
      },
      initQueryForm() {
        const context = this

        positionStructure.initQueryPositionSelects(
          $('#show-level'),
          $('#level-option')
        )

        // 列印qrcode
        servkit.downloadFile(
          '.print',
          '/api/storage/storeposition/qrcode',
          function (evt) {
            var storePositionId = []
            var storePositionOrgId = []
            var storePositionPath = []
            const selectedRowData = context.detailReportTable.getSelectedRow()

            if (!selectedRowData.length) {
              return false
            }

            _.each(selectedRowData, function (data) {
              storePositionId.push(data[3]) // 給id(table上沒有)
              storePositionOrgId.push(data[1]) // 給新id(table上沒有)
              storePositionPath.push(data[0]) // 給路徑
            })
            $('#print-modal').modal('hide')
            return {
              'position_id[]': storePositionId,
              'org_ids': storePositionOrgId,
              'paths': storePositionPath,
              'size': $(evt.target).data('id'),
              'showPath': $('[name=show-path]').prop('checked'),
            }
          },
          'GET'
        )

        servkit.validateForm($('#query-form'), $('#query-btn'))
        $('#query-btn').on('click', function (evt) {
          context.renderPostionTable(evt)
        })
      },
      renderPostionTable(evt) {
        const context = this
        const currLevel = $('#show-level').val()
        const tableData = []
        const selectedIdPath = $('#level-option').val()

        evt.preventDefault()
        _.filter(
          positionStructure.storageMap,
          (storeData, storePath) => storePath.indexOf(selectedIdPath) === 0
        ).forEach((storeData) => {
          let selectedIdNamePath = storeData.levels[currLevel].idNamePath // 顯示選擇的路徑
          if (selectedIdNamePath) {
            if (context.isStrongLED) {
              selectedIdNamePath = selectedIdNamePath.replace(
                storeData.levels['1'].idNamePath + '-',
                ''
              )
            }
            $('#chose-position')
              .removeClass('hide')
              .html(`${i18n('Choose_Position_Zone')} : ` + selectedIdNamePath)
          } else {
            $('#chose-position').addClass('hide')
          }

          storeData.position.forEach((positionData) => {
            tableData.push([
              $('#level-option>option:selected').text() || '---',
              positionData.idPath
                ? positionData.idPath.replace(
                    storeData.levels[currLevel].idPath,
                    ''
                  )
                : '---',
              positionData.idNamePath
                ? positionData.idNamePath.replace(
                    storeData.levels[currLevel].idNamePath + '-',
                    ''
                  )
                : '---',
              positionData.db_id || '',
              positionData.id || '',
            ])
          })
        })
        context.detailReportTable.drawTable(tableData)
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
