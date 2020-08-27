export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initCrudTable()
    },
    util: {
      toolLocationfor: document.getElementById('tool_location_for'),
      locationArea: document.getElementById('location_area'),
      table: document.getElementById('stk-table'),
      toolLocationforMap: {
        N: '新刀',
        B: '回收刀',
      },
      locationAreaMap: {
        1: '現場刀具庫',
        2: '備用刀具室',
        3: '廠外借用',
      },
      initCrudTable() {
        const context = this
        const {
          toolLocationforMap,
          toolLocationfor,
          locationArea,
          locationAreaMap,
        } = context
        const columns = [
          {
            name: 'tool_location',
            title: '儲位代碼',
            filterType: 'input',
            width: '30%',
          },
          {
            name: 'tool_location_for',
            title: '儲位刀具堪用程度',
            filterType: 'select',
            width: '30%',
          },
          {
            name: 'location_area',
            title: '儲存區域',
            filterType: 'select',
            width: '30%',
          },
          {
            name: 'is_open',
            title: '啟用',
            filterType: null,
            width: '10%',
          },
        ]

        servkit.initSelectWithList(locationAreaMap, $(locationArea))
        // 新刀需要在第一個，initSelectWithList會排序，所以自己寫
        Object.entries(toolLocationforMap).forEach(([value, text]) =>
          $(toolLocationfor).append(
            `<option style="padding:3px 0 3px 3px;" value="${value}">${text}</option>`
          )
        )
        context.commons.insertFilter(
          context.table.querySelector('thead>tr:first-child'),
          columns
        )
        context.commons.insertTitle(
          context.table.querySelector('thead>tr:nth-child(2)'),
          columns
        )
        // TODO: selectFilter text !== value的情形，e.g. is_open無法篩選
        servkit.crudtable({
          tableSelector: '#stk-table',
          tableModel:
            'com.servtech.servcloud.app.model.huangliang_tool.ToolLocation',
          create: {
            url: 'api/stdcrud',
            start(tdList, table) {
              tdList[1].querySelector('select').disabled = false
              tdList[2].querySelector('select').disabled = false
            },
          },
          read: {
            url: 'api/stdcrud',
            end: {
              3(data, rowData) {
                return locationAreaMap[data]
              },
            },
          },
          update: {
            url: 'api/stdcrud',
            start: {
              2(oldTd, newTd, oldTr, newTr, table) {
                const select = newTd.querySelector('select')
                const value = table.cell(oldTd).data()
                const key = _.findKey(toolLocationforMap, (v) => v === value)
                select.disabled = true
                select.value = key
              },
              3(oldTd, newTd, oldTr, newTr, table) {
                const select = newTd.querySelector('select')
                const value = table.cell(oldTd).data()
                const key = _.findKey(locationAreaMap, (v) => v === value)
                select.disabled = true
                select.value = key
              },
            },
          },
          delete: {
            unavailable: true,
          },
          validate: {
            1(td, table) {
              const tr = td.closest('tr')
              const toolLocationfor = tr.querySelector(
                'select[name=tool_location_for]'
              ).value
              const toolLocationNode = td.querySelector('input')
              const toolLocation = toolLocationNode.value
              const isEqual = toolLocation[1] === toolLocationfor
              if (toolLocation.length < 6) {
                return '代碼長度不符'
              } else if (!isEqual) {
                $(toolLocation).focus()
                return '儲位代碼與儲位刀具堪用程度不一致，請重新輸入'
              }
            },
          },
        })
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
