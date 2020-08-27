export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initQueryConditionForm()
      context.initQueryResultTable()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $macTypeSelect: $('#mac_type-select'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      queryResultTable: null,
      initQueryConditionForm() {
        const context = this
        const { $queryConditionForm, $submitBtn, $macTypeSelect } = context
        servkit.initSelectWithList(
          ['ALL', ...context.preCon.macType],
          $macTypeSelect
        )

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function () {
          context.refreshTable()
        })
      },
      initQueryResultTable() {
        const context = this
        const { $queryResultTable } = context
        const $editRow = $queryResultTable.find('tbody tr')
        const $machine_id = $editRow.find('[name=machine_id]')
        const $mac_type = $editRow.find('[name=mac_type]')

        servkit.initMachineSelect($machine_id)
        servkit.initSelectWithList(context.preCon.macType, $mac_type)

        context.queryResultTable = servkit.crudtable({
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_matStock.MacList',
          tableSelector: '#query-result-table',
          read: {
            url: 'api/stdcrud',
          },
          create: {
            unavailable: true,
          },
          update: {
            url: 'api/stdcrud',
            send() {
              return {
                modify_time: ''.toFormatedDatetime(null, 'YYYY-MM-DD HH:mm:ss'),
              }
            },
            end: {
              6(td, formData) {
                return formData.modify_time
              },
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            3(td, table) {
              const size = td.querySelector('input').value
              const isPositiveNumber = /(^\d*\.?\d*[1-9]+\d*$)|(^[1-9]+\d*\.\d*$)/.test(
                size
              )
              if (size && !isPositiveNumber) {
                return '請填正數'
              }
            },
            4(td, table) {
              const size = td.querySelector('input').value
              const isPositiveNumber = /(^\d*\.?\d*[1-9]+\d*$)|(^[1-9]+\d*\.\d*$)/.test(
                size
              )
              if (size && !isPositiveNumber) {
                return '請填正數'
              }
            },
            5(td, table) {
              const size = td.querySelector('input').value
              // TODO: validate DECIMAL(8,2)
              const isPositiveNumber = /(^\d*\.?\d*[1-9]+\d*$)|(^[1-9]+\d*\.\d*$)/.test(
                size
              )
              if (size && !isPositiveNumber) {
                return '請填正數'
              }
            },
            7(td, table) {
              const checkbox = td.querySelector('[name=is_open]')
              const is_open = checkbox.checked
              if (is_open) {
                const tr = td.closest('tr')
                const mac_type = tr.querySelector('[name=mac_type]').value
                const c_scrapsize = tr.querySelector('[name=c_scrapsize]').value
                const t_scrapsize = tr.querySelector('[name=t_scrapsize]').value
                const process_cost = tr.querySelector('[name=process_cost]')
                  .value
                if (
                  !mac_type ||
                  !c_scrapsize ||
                  !t_scrapsize ||
                  !process_cost
                ) {
                  return '資料全部填完才可啟用'
                }
              }
            },
          },
        })
      },
      refreshTable() {
        const context = this
        const { $macTypeSelect, queryResultTable } = context
        const mac_type = $macTypeSelect.val()
        const isSelectAll = mac_type === 'ALL'
        const whereClause = isSelectAll ? '1' : `mac_type = '${mac_type}'`
        queryResultTable.changeReadUrl({
          whereClause,
        })
        queryResultTable.refreshTable()
      },
    },
    preCondition: {
      macType(done) {
        // servkit.ajax({
        //   url: 'api/getdata/db',
        //   type: 'POST',
        //   contentType: 'application/json',
        //   data: JSON.stringify({
        //     table: 'a_huangliang_mac_list',
        //     columns: ['mac_type']
        //   })
        // }, {
        //   success (data) {
        //     done(_.chain(data).pluck('mac_type').uniq().value().sort());
        //   },
        //   fail (data) {
        //     done(['A', 'B', 'C'])
        //   }
        // })
        done(
          _.chain([
            'B-12',
            'B007-Ⅱ',
            'L12',
            'B0-18Ⅱ',
            'L20E',
            'B0-18Ⅲ',
            'BNC-42C5',
            'B0326-Ⅱ',
            'BND-51SY',
            'BN-20',
            'BNE-51SYS',
            'BO 205',
            'BNJ-42SY',
            'BO 205Ⅱ',
            'NN-10SⅡ',
            'BO 205Ⅲ',
            'NN-10SB',
            'BO-20F',
            'SB-16',
            'BO265Ⅱ',
            'SP1-10J',
            'BO325Ⅱ',
            'SR-10J',
            'BO-7',
            'SR-20Ⅵ',
            'S 206',
            'SR-20J',
            'SR-20JC',
            'SR-20R',
            'SR-20RⅡ',
            'SR-20RIV-A',
            'SR-32',
            'SR-32JN',
          ])
            .uniq()
            .value()
            .sort()
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
