export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initQueryConditionForm()
      context.initQueryResultTable()
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $mstockSelect: $('#mstock_name-select'),
      $productIdInput: $('#product_id-input'),
      $productPidInput: $('#product_pid-input'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      queryResultTable: null,
      initQueryConditionForm() {
        const context = this
        const {
          $queryConditionForm,
          $submitBtn,
          $mstockSelect,
          $queryResultTable,
          $productIdInput,
          $productPidInput,
        } = context
        const initSelect = () => {
          const mstockNameArr = Object.values(context.commons.mstockNameMap)
          const matShapeArr = ['C', 'H', 'S', 'X', 'P', 'L']
          const processArr = ['走刀', '走心']
          servkit.initSelectWithList(mstockNameArr, $mstockSelect, false)
          servkit.initSelectWithList(
            mstockNameArr,
            $queryResultTable.find('[name=mstock_name]'),
            false
          )
          servkit.initSelectWithList(
            matShapeArr,
            $queryResultTable.find('[name=mat_shape]'),
            false
          )
          servkit.initSelectWithList(
            context.preCon.matId,
            $queryResultTable.find('[name=mat_id]'),
            false
          )
          servkit.initSelectWithList(
            context.preCon.macType,
            $queryResultTable.find('[name=def_mactype]'),
            false
          )
          servkit.initSelectWithList(
            processArr,
            $queryResultTable.find('[name=process]'),
            false
          )
        }

        initSelect()
        context.commons.autoCompleteProductId($productIdInput).then(() => {
          context.commons.autoCompleteProductPid($productPidInput)
        })
        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function () {
          context.refreshTable()
        })
      },
      initQueryResultTable() {
        const context = this

        context.queryResultTable = servkit.crudtable({
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_matStock.ProductProfile',
          tableSelector: '#query-result-table',
          read: {
            url: 'api/stdcrud',
            preventReadAtFirst: true,
          },
          create: {
            url: 'api/stdcrud',
            start(tdArr, table) {
              $(tdArr[2]).find('[name=product_pid]').prop('disabled', false)
            },
            send(tdEles) {
              const entries = tdEles
                .slice(5, 8)
                .map((td) => {
                  const input = td.querySelector('input')
                  const name = input.name
                  const value = input.value
                  return [name, value]
                })
                .filter((entry) => entry[1] === '')
                .map((entry) => [entry[0], null])
              return Object.fromEntries(entries)
            },
          },
          update: {
            url: 'api/stdcrud',
            start: {
              3(oldTd, newTd, oldTr, newTr, table) {
                const productPidInput = newTd.querySelector('input')
                productPidInput.disabled = true
                productPidInput.value = oldTd.textContent
              },
            },
            send(tdEles) {
              const entries = tdEles
                .slice(5, 8)
                .map((td) => {
                  const input = td.querySelector('input')
                  const name = input.name
                  const value = input.value
                  return [name, value]
                })
                .filter((entry) => entry[1] === '')
                .map((entry) => [entry[0], null])
              return Object.fromEntries(entries)
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            3(td, table) {
              const product_pid = td.querySelector('input').value
              const isIncludeSpecialSymbol = /[\\]/.test(product_pid)
              if (isIncludeSpecialSymbol) {
                return '不可包含反斜線\\'
              }
            },
            11(td, table) {
              const multiprogramInput = td.querySelector('input')
              const multiprogram = multiprogramInput.value
              const isPositiveInteger = /^[1-9]\d*$/.test(multiprogram)
              if (!isPositiveInteger) {
                return '請填最小為 1 的整數'
              }
            },
            entityPk(tdArr) {
              const mstock_name = tdArr[0].querySelector('select').value
              const product_id = tdArr[1].querySelector('input').value
              const pks = {
                mstock_name,
                product_id,
              }
              return pks
            },
          },
        })
      },
      refreshTable() {
        const context = this
        const {
          $productIdInput,
          $productPidInput,
          $mstockSelect,
          queryResultTable,
        } = context
        const productId = $productIdInput.val()
        const productPid = $productPidInput.val()
        const mstockName = $mstockSelect.val().filter((name) => name !== 'ALL')
        let whereClause = `mstock_name IN (${mstockName
          .map((name) => `'${name}'`)
          .join(',')})`
        if (productId) {
          whereClause += ` AND product_id='${productId}'`
        }
        if (productPid) {
          whereClause += ` AND product_pid='${productPid}'`
        }
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
      matId(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_mat_profile',
              columns: ['mat_id'],
            }),
          },
          {
            success(data) {
              done(
                _.chain(data)
                  .filter((map) => map.mat_id !== '通用')
                  .pluck('mat_id')
                  .uniq()
                  .value()
                  .sort()
              )
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
