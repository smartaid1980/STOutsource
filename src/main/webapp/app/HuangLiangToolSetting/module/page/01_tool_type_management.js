export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initCrudTable()
    },
    util: {
      table: document.getElementById('stk-table'),
      // toolForList: ['刀具', '刀架'],
      initCrudTable() {
        const context = this
        const columns = [
          {
            name: 'tool_type',
            title: '刀具類型',
            filterType: 'select',
            width: '20%',
          },
          {
            name: 'type_for',
            title: '成本分類',
            filterType: 'select',
            width: '20%',
          },
          {
            name: 'tool_rule',
            title: '編碼規則',
            filterType: 'select',
            width: '20%',
          },
          {
            name: 'cost_pc',
            title: '回收成本比例(%)',
            filterType: 'input',
            width: '20%',
          },
          {
            name: 'is_cost',
            title: '計算成本',
            filterType: null,
            width: '8%',
          },
          {
            name: 'is_open',
            title: '啟用',
            filterType: null,
            width: '8%',
          },
        ]
        servkit.initSelectWithList(
          context.preCon.map.typeForMap,
          $('#type-for')
        )
        context.commons.insertFilter(
          context.table.querySelector('thead>tr:first-child'),
          columns
        )
        context.commons.insertTitle(
          context.table.querySelector('thead>tr:nth-child(2)'),
          columns
        )
        // TODO: selectFilter text !== value的情形，e.g. is_open的值是Y，選項出來卻是ON(textContent)
        context.crudTable = servkit.crudtable({
          tableSelector: '#stk-table',
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_tool.ToolType',
          order: [],
          create: {
            url: 'api/stdcrud',
            start(tdList, table) {
              tdList[1].querySelector('select').disabled = false
              tdList[2].querySelector('input').disabled = false
            },
          },
          read: {
            url: 'api/stdcrud',
          },
          update: {
            url: 'api/stdcrud',
            start: {
              2(oldTd, newTd, oldTr, newTr, table) {
                const select = newTd.querySelector('select')
                const value = $(oldTr).data().rowData.type_for
                select.disabled = true
                select.value = value
              },
              3(oldTd, newTd, oldTr, newTr, table) {
                const input = newTd.querySelector('input')
                const value = table.cell(oldTd).data()
                input.disabled = true
                input.value = value
              },
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            entityPk(tdList) {
              return tdList[0].querySelector('input').value
            },
          },
        })
      },
    },
    preCondition: {
      map(done) {
        $.get(
          './app/HuangLiangToolSetting/data/map.json?' + new Date().getTime(),
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
        '/js/plugin/datatables/jquery.dataTables.rowReordering.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
  })
}
