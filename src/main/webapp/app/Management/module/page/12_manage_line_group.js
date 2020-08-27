import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import { fetchDbData } from '../../../../js/servtech/module/servkit/ajax.js'
import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'
import { crudtable } from '../../../../js/servtech/module/table/crudTable.js'
import { naturalSort } from '../../../../js/servtech/module/servkit/util.js'

export default async function () {
  const lineData = await fetchDbData('a_servtrack_line', {
    columns: ['line_id', 'line_name'],
  })
  const lineMap = Object.fromEntries(
    lineData.map(({ line_id, line_name }) => [line_id, line_name])
  )
  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      groupMap: {},
      groupLineTable: null,
      MAX_LINE_COUNT_PER_GROUP: 2,
      isYihCheng: servtechConfig.ST_CUSTOMER === 'YihCheng', // 義成有自己的設定
      lineData,
      lineMap,
      main() {
        const context = this
        context.groupLineTable = crudtable({
          tableSelector: '#line-group-table',
          tableModel: 'com.servtech.servcloud.app.model.strongLED.GroupLine',
          create: {
            url: 'api/strongLED/groupLine/create',
            finalDo(newRow) {
              const group_id = JSON.parse($(newRow).attr('stk-db-id'))
              const group_name = $(newRow).find('td:eq(2)').text()
              context.groupMap[group_id] = group_name
            },
          },
          read: {
            url: 'api/strongLED/groupLine/read?hideClose=false',
            end: {
              3(lineIdList, rowData) {
                context.groupMap[rowData.group_id] = rowData.group_name
                return naturalSort(lineIdList)
              },
            },
          },
          update: {
            url: 'api/strongLED/groupLine/update',
            end: {
              2(td, formData) {
                const group_name = $(td).find('input').val()
                context.groupMap[formData.group_id] = group_name
                return group_name
              },
            },
          },
          delete: {
            url: 'api/stdcrud',
            contentFunc(deleteIds) {
              const groupNameList = deleteIds
                .map((group_id) => context.groupMap[group_id])
                .sort()
              return `${groupNameList.join(', ')}, ${i18n('Sure_Delete_Data')}`
            },
          },
          validate: {
            entityPk(tdList) {
              return $(tdList[0]).find('input[name=group_id]').val()
              // const input = td.querySelector('input')
              // if (!input.disabled) {
              //   if (
              //     _.find(table.columns(0).data().eq(0), function (existId) {
              //       return existId.toLowerCase() === input.value.toLowerCase()
              //     })
              //   ) {
              //     return `${i18n('Stk_Pk')}`
              //   }
              // }
            },
            3(td) {
              const $select = $(td).find('select[name=lines]')
              const lineIdList = $select.val()
              if (!lineIdList || !lineIdList.length) {
                return `${i18n('Stk_Required')}`
              }
            },
          },
        })
        if (context.isYihCheng) {
          $('#line-group-table').on(
            'click',
            'select[name=lines] option',
            function () {
              const targetOption = this
              const selectEl = this.closest('select')
              const lineIdList = $(selectEl).val()
              const lineIdCount = lineIdList ? lineIdList.length : 0
              const isGreaterThanMax =
                lineIdCount > context.MAX_LINE_COUNT_PER_GROUP
              if (isGreaterThanMax) {
                const selectedOptions = selectEl.selectedOptions
                const firstOptionExcludeTarget = Array.from(
                  selectedOptions
                ).find((el) => el !== targetOption)
                firstOptionExcludeTarget.selected = false
              }
            }
          )
        }
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
    ],
  })
}
