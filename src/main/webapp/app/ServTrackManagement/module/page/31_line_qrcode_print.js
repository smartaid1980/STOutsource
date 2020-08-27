import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
import { getMachineName } from '../../../../js/servtech/module/servkit/machine.js'
import { crudtable } from '../../../../js/servtech/module/table/crudTable.js'
import {
  loadingButton,
  downloadFile,
  initMachineSelect,
} from '../../../../js/servtech/module/servkit/form.js'
import { fetchDbData } from '../../../../js/servtech/module/servkit/ajax.js'
import GoGoAppFun from '../../../../js/servtech/module/servcloud.gogoappfun.js'

export default async function () {
  const bindedMachineSet = await fetchDbData('a_servtrack_line', {
    columns: ['DISTINCT(device_id)'],
  }).then((data) => new Set(_.chain(data).pluck('device_id').compact().value()))

  GoGoAppFun({
    gogo(context) {
      window.c = context
      context.main()
    },
    util: {
      bindedMachineSet, // 已綁定的機聯網設備代碼
      $tableBody: $('#line-table-body'),
      $table: $('#stk-line-table'),
      $queryLineId: $('#query-line-id'),
      $submitBtn: $('#submit-btn'),
      $clearBtn: $('#clear-btn'),
      $form: $('#query-form'),
      submitLoadingBtn: loadingButton(document.querySelector('#submit-btn')),
      crudTable: null,
      origDeviceId: null, // 執行 Update 之前舊的機聯網設備代碼
      deleteRowDatas: null, // 即將要刪除的資料
      main() {
        const context = this
        context.initCrudTable()
        context.initQueryForm()
      },
      getPrintData() {
        const context = this
        const lineIds = _.pluck(context.crudTable.getSelectedRowData(), '0')
        const uuid = context.commons.uuidGenerator(32)
        if (lineIds.length) {
          return { lineIds, uuid }
        } else {
          $.smallBox({
            title: `${i18n('ServTrackManagement_000003')}`,
            content: '<i class="fa fa-clock-o"></i> <i>2 seconds ago...</i>',
            color: '#C79121',
            iconSmall: 'fa fa-warning shake animated',
            timeout: 2000,
          })
          return
        }
      },
      initQueryForm() {
        const context = this
        context.$submitBtn
          .on('click', function (evt) {
            evt.preventDefault()
            context.drawTable()
          })
          .click()
      },
      initCrudTable() {
        const context = this
        const getMachineDatas = function (td) {
          const result = $(td)
            .find('input')
            .toArray()
            .map((el) => el.value)
          for (let i = result.length - 1; i >= 0; i--) {
            if (!result[i]) {
              result.pop()
            } else {
              break
            }
          }
          return result
        }
        const createAndUpdateSend = function (tdEles) {
          const machineIds = getMachineDatas(tdEles[2])
          const machineNames = getMachineDatas(tdEles[3])
          const machine_info = machineIds.map((val, i) => ({
            machine_id: val,
            machine_name: machineNames[i],
          }))
          const result = {
            qrcode_line: context.commons.uuidGenerator(32),
            machine_info,
          }
          return result
        }
        const renderPercentage = function (td) {
          const result = $(td).find('input').val()
          return parseFloat(result).toFixed(2)
        }
        const createAndUpdateEnd = {
          3(td, formData) {
            return formData.machine_info.length
              ? formData.machine_info
                  .map(({ machine_id }) => `<span>${machine_id}</span>`)
                  .join('<br>')
              : '暫無設備代碼	'
          },
          4(td, formData) {
            return formData.machine_info.length
              ? formData.machine_info
                  .map(({ machine_name }) => `<span>${machine_name}</span>`)
                  .join('<br>')
              : '暫無設備名稱'
          },
          5: renderPercentage,
          6: renderPercentage,
          7: renderPercentage,
          8(td, formData) {
            return formData.device_id
              ? getMachineName(formData.device_id)
              : '暫無設備代碼'
          },
        }
        const validatePercentage = function (td) {
          const input = td.querySelector('input')
          if (input.value === '') {
            return `${i18n('ServTrackManagement_000005')}`
          } else if (isNaN(input.value)) {
            return `${i18n('ServTrackManagement_000006')}`
          } else if (input.value < 0 || input.value > 100) {
            return `${i18n('ServTrackManagement_000004')}`
          }
        }
        initMachineSelect(context.$table.find('select[name=device_id]'))
        context.$table
          .find('select[name=device_id]')
          .prepend('<option value="" disabled>機聯網設備代碼</option>')
        context.crudTable = crudtable({
          tableSelector: '#stk-line-table',
          rightColumn: [5, 6, 7],
          tableModel: 'com.servtech.servcloud.app.model.servtrack.Line',
          create: {
            url: 'api/yihcheng/line',
            start(tdEles) {
              const deviceIdSelect = tdEles[7].querySelector('select')
              Array.from(deviceIdSelect.options).forEach((opt) =>
                opt.classList.toggle('hide', bindedMachineSet.has(opt.value))
              )
              deviceIdSelect.selectedIndex = 0
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            finalDo(newRow) {
              const { rowData } = $(newRow).data()
              const { device_id } = rowData
              if (device_id) {
                bindedMachineSet.add(device_id)
              }
            },
          },
          read: {
            url: 'api/getdata/db',
            type: 'POST',
            requestParam: {
              table: 'a_yihcheng_view_line_machine_map',
              whereClause: '1 GROUP BY line_id',
              columns: [
                'line_id',
                'line_name',
                'oee_sp',
                'line_quality_sp',
                'perf_sp',
                'device_id',
                'is_open',
                "group_concat(machine_id separator '||') AS all_machine_id",
                "group_concat(machine_name separator '||') AS all_machine_name",
              ],
            },
            end: {
              3(data, rowData) {
                const { all_machine_id } = rowData
                if (all_machine_id) {
                  return all_machine_id
                    .split('||')
                    .map((machine_id) => `<span>${machine_id}</span>`)
                    .join('<br/>')
                } else {
                  return '暫無設備代碼'
                }
              },
              4(data, rowData) {
                const { all_machine_name } = rowData
                if (all_machine_name) {
                  return all_machine_name
                    .split('||')
                    .map((machine_name) => `<span>${machine_name}</span>`)
                    .join('<br/>')
                } else {
                  return '暫無設備名稱'
                }
              },
              5(data) {
                return _.isNumber(data) ? parseFloat(data).toFixed(2) : '---'
              },
              6(data) {
                return _.isNumber(data) ? parseFloat(data).toFixed(2) : '---'
              },
              7(data) {
                return _.isNumber(data) ? parseFloat(data).toFixed(2) : '---'
              },
              8(data, rowData) {
                return rowData.device_id
                  ? getMachineName(rowData.device_id)
                  : '暫無設備代碼'
              },
              10(data, rowData) {
                return rowData.device_id
                  ? `<span>${rowData.device_id}</span>`
                  : `<span></span>`
              },
            },
          },
          update: {
            url: 'api/yihcheng/line',
            start: {
              3(oldTd, newTd) {
                const machineIdList = $(oldTd)
                  .find('span')
                  .toArray()
                  .map((el) => el.textContent)
                if (machineIdList.length > 1) {
                  for (let i = 0; i < machineIdList.length - 1; i++) {
                    const clonedGroup = newTd.children[0].cloneNode(true)
                    newTd.append(clonedGroup)
                  }
                }
                Array.from(
                  newTd.querySelectorAll('input[name=device_code]')
                ).forEach((el, i) => {
                  el.value = machineIdList[i] || ''
                })
              },
              4(oldTd, newTd) {
                const machineNameList = $(oldTd)
                  .find('span')
                  .toArray()
                  .map((el) => el.textContent)
                if (machineNameList.length > 1) {
                  for (let i = 0; i < machineNameList.length - 1; i++) {
                    const clonedGroup = newTd.children[0].cloneNode(true)
                    newTd.append(clonedGroup)
                  }
                }
                Array.from(
                  newTd.querySelectorAll('input[name=device_name]')
                ).forEach((el, i) => {
                  el.value = machineNameList[i] || ''
                })
              },
              5(oldTd, newTd) {
                const val = oldTd.textContent
                newTd.querySelector('input').value = val === '---' ? '' : val
              },
              6(oldTd, newTd) {
                const val = oldTd.textContent
                newTd.querySelector('input').value = val === '---' ? '' : val
              },
              7(oldTd, newTd) {
                const val = oldTd.textContent
                newTd.querySelector('input').value = val === '---' ? '' : val
              },
              8(oldTd, newTd, oldTr) {
                const device_id = $(oldTr).data('rowData').device_id
                const $deviceIdSelect = $(newTd).find('[name=device_id]')
                Array.from($deviceIdSelect[0].options).forEach((opt) =>
                  opt.classList.toggle(
                    'hide',
                    device_id !== opt.value && bindedMachineSet.has(opt.value)
                  )
                )
                if (device_id) {
                  $deviceIdSelect.val(device_id)
                  context.origDeviceId = device_id
                } else {
                  $deviceIdSelect[0].selectedIndex = 0
                  context.origDeviceId = null
                }
              },
            },
            send: createAndUpdateSend,
            end: createAndUpdateEnd,
            finalDo(newRow) {
              const { rowData } = $(newRow).data()
              const { device_id } = rowData
              if (device_id !== context.origDeviceId) {
                bindedMachineSet.add(device_id)
                bindedMachineSet.delete(context.origDeviceId)
              }
            },
          },
          delete: {
            url: 'api/yihcheng/line/machine',
            contentTitle(deleteIds) {
              // 為了在刪除前先存好要刪除的 ID，所以寫在這，沒有其他副作用
              context.deleteRowDatas = context.crudTable.table
                .rows()
                .data()
                .toArray()
                .filter((rowData) => deleteIds.includes(rowData[0]))

              return i18n('Delete_title')
            },
            finalDo() {
              // 成功刪除後將綁定的機台去掉，未刪除不會執行 finalDo
              const deletedDeviceIds = _.chain(context.deleteRowDatas)
                .pluck('7')
                .compact()
                .value()
              deletedDeviceIds.forEach((id) => {
                bindedMachineSet.delete(id)
              })
              context.deleteRowDatas = null
            },
          },
          validate: {
            entityPkErrorMsg: '線別代碼已經存在',
            entityPk(tdList) {
              return tdList[0].querySelector('[name=line_id]').value
            },
            1(td) {
              const input = td.querySelector('input')
              const regChinese = /^[\u4E00-\u9FA5]+$/
              const regHalfwidth = /[^\x20-\xff]/g
              if (regChinese.test(input.value)) {
                return `<br>${i18n('ServTrackManagement_000022')}`
              }
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000024')}`
              }
              if (context.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            2(td) {
              const input = td.querySelector('input')
              const regHalfwidth = /[\uFE30-\uFFA0]/g
              if (regHalfwidth.test(input.value)) {
                return `${i18n('ServTrackManagement_000023')}`
              }
              if (context.commons.symbolValidation(input.value)) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            3(td) {
              const machineIds = getMachineDatas(td)
              const machineNames = getMachineDatas(td.nextElementSibling)

              if (machineIds.length !== machineNames.length) {
                return `設備代碼與設備名稱數量需相同`
              } else if (new Set(machineIds).size !== machineIds.length) {
                return `設備代碼不能重複`
              } else if (machineIds.some((val) => !val)) {
                return `${i18n('ServTrackManagement_000019')}`
              } else if (
                machineIds.some((val) => context.commons.symbolValidation(val))
              ) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            4(td) {
              const machineIds = getMachineDatas(td.previousElementSibling)
              const machineNames = getMachineDatas(td)

              if (machineIds.length !== machineNames.length) {
                return `設備代碼與設備名稱數量需相同`
              } else if (machineNames.some((val) => !val)) {
                return `${i18n('ServTrackManagement_000019')}`
              } else if (
                machineNames.some((val) =>
                  context.commons.symbolValidation(val)
                )
              ) {
                return `${i18n('ServTrackManagement_000197')}`
              }
            },
            5: validatePercentage,
            6: validatePercentage,
            7: validatePercentage,
            8(td) {
              const select = td.querySelector('select')
              const device_id = $(select).val()
              const isCreate = td.closest('tr').hasAttribute('stk-create')
              const isDuplicate =
                (isCreate && bindedMachineSet.has(device_id)) ||
                (!isCreate &&
                  context.origDeviceId !== device_id &&
                  bindedMachineSet.has(device_id))
              if (isDuplicate) {
                return '機聯網設備代碼不能重複'
              }
            },
          },
          customBtns: [
            "<button class='btn bg-color-blueDark txt-color-white stk-qrcode-btn' title='print QRCode' style='margin-right:10px'><span class='fa fa-qrcode fa-lg'></span></button>",
          ],
        })
        $('#stk-line-table')
          .on('focus', '.inline-group', function (e) {
            if (
              !this.nextElementSibling ||
              this.nextElementSibling.nodeName === 'CODE'
            ) {
              const newInputGroup = this.cloneNode(true)
              newInputGroup.querySelector('input').value = ''
              this.insertAdjacentElement('afterend', newInputGroup)
            }
          })
          .on('mouseenter', '.inline-group', function (e) {
            $(this).find('.fa-times-circle-o').removeClass('hide')
          })
          .on('mouseleave', '.inline-group', function (e) {
            $(this).find('.fa-times-circle-o').addClass('hide')
          })
          .on('click', '.fa-times-circle-o', function (e) {
            if (
              this.closest('td').querySelectorAll('.inline-group').length > 1
            ) {
              this.closest('td').removeChild(this.parentNode)
            }
          })
        //* ************** Custom *****************
        // crudtable.js 額外 客製 按鈕們  的事件處理
        // 把 QRCode btn 綁 事件
        downloadFile(
          context.$tableBody.find('.stk-qrcode-btn')[0],
          '/api/servtrack/managementline/printQRCode',
          context.getPrintData.bind(context)
        )
        // QRCODE Btn 如果點選 編輯的話 要 disabled , 然後如果是點其它的要把他還原成可以點
        $('#stk-line-table > tbody').on(
          'click',
          '.stk-edit-btn,.stk-cancel-btn,.stk-save-btn',
          function (evt) {
            const name = evt.target.className
            if (
              name.indexOf('stk-edit-btn') > 1 ||
              name.indexOf('fa-pencil') > 1
            ) {
              $('#stk-line-table')
                .closest('div')
                .find('div > .stk-qrcode-btn')
                .prop('disabled', true)
            } else {
              $('#stk-line-table')
                .closest('div')
                .find('div > .stk-qrcode-btn')
                .prop('disabled', false)
            }
          }
        )
        context.$tableBody.on('draw.dt', '#stk-line-table', function (evt) {
          evt.preventDefault()
          context.activeCheck()
        })
      },
      drawTable() {
        const context = this
        const line_id = context.commons.checkEscapeSymbol(
          context.$queryLineId.val()
        )
        const whereClause = line_id
          ? `line_id = '${line_id}' GROUP BY line_id`
          : '1 GROUP BY line_id'

        context.submitLoadingBtn.doing()

        context.crudTable.changeReadUrl(null, { whereClause })
        context.crudTable
          .refreshTable()
          .then(() => context.submitLoadingBtn.done())
      },
      activeCheck() {
        // 不能刪線別，取消啟用的線別不能列印
        $('#stk-line-table')
          .closest('div')
          .find('div > .stk-delete-btn')
          .addClass('hide')
        _.each($('#stk-line-table').find('tbody > tr'), function (trEle) {
          const tdCheckBoxEle = $(trEle).find('td:first-child input')
          const type = $(trEle).find('td:nth-child(10)').text()
          if (type !== 'ON') {
            tdCheckBoxEle.addClass('hide')
          } else {
            tdCheckBoxEle.removeClass('hide')
          }
        })
      },
    },
    dependencies: [
      ['/js/plugin/select2/select2.min.js'],
      [
        '/js/plugin/datatables/jquery.dataTables.min.js',
        '/js/plugin/datatables/dataTables.colVis.min.js',
        '/js/plugin/datatables/dataTables.tableTools.min.js',
        '/js/plugin/datatables/dataTables.bootstrap.min.js',
        '/js/plugin/datatable-responsive/datatables.responsive.min.js',
      ],
    ],
    preCondition: {},
  })
}
