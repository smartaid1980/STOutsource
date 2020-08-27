export default function () {
  GoGoAppFun({
    gogo(context) {
      context.initAuth()
      context.initQueryConditionForm()
      context.initQueryResultTable()
      window.ma = context.materialAssign = context.commons.initMaterialAssign(
        {
          isCreate: false,
          auth: {
            canEdit: context.userAuth.canEditRecord,
          },
        },
        {
          statusMap: context.commons.statusMap,
          mstockNameMap: context.commons.mstockNameMap,
        },
        context.preCon
      )
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $orderIdInput: $('#order_id-input'),
      $machineSelect: $('#machine_id-select'),
      $queryConditionForm: $('#query-condition-form'),
      $queryResultTable: $('#query-result-table'),
      $confirmModal: $('#confirm-modal-widget'),
      $confirmContent: $('#confirm-content'),
      $confirmtitle: $('#confirm-title'),
      $confirmBtn: $('#confirm-yes'),
      queryResultTable: null,
      tempMaterialToAssignData: null,
      materialToAssignNumber: 1,
      userAuth: {},
      initAuth() {
        const context = this
        const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'))
        const userGroup = loginInfo.user_group || []
        const canEditRecordGroupList = [
          'material_stock_factory_service',
          'sys_manager_group',
        ]
        const canEditRecord =
          userGroup.findIndex((group) =>
            canEditRecordGroupList.includes(group)
          ) >= 0
        Object.assign(context.userAuth, {
          canEditRecord,
        })
      },
      initQueryConditionForm() {
        const context = this
        const {
          $submitBtn,
          $queryConditionForm,
          $machineSelect,
          $orderIdInput,
        } = context

        servkit.initMachineSelect($machineSelect)
        context.commons.autoCompleteOrderId($orderIdInput)

        servkit.validateForm($queryConditionForm, $submitBtn)
        $submitBtn.on('click', function (e) {
          e.preventDefault()
          context.getMaterialAssignment()
        })
      },
      initQueryResultTable() {
        const context = this
        const { $queryResultTable, $confirmBtn } = context
        const getExcelParams = () => {
          const rowData = context.queryResultTable.getSelectedRow()
          const dateTimeCols = ['wo_m_time', 'm_mat_time']
          const requestBody = rowData.map((data) => {
            return _.chain(data)
              .pick(['order_id', 'machine_id', 'wo_m_time', 'm_mat_time'])
              .mapObject((value, key) =>
                dateTimeCols.includes(key) ? value.toFormatedDatetime() : value
              )
          })
          return { data: JSON.stringify(requestBody) }
        }
        const excelUrl = '/api/huangliangMatStock/pickinglist/excel'
        const bindDownloadExcelEvent = (() => {
          let $btn
          let isBind
          return () => {
            if (!isBind) {
              $btn = $('#query-result-widget').find('.download-excel')
              if ($btn.length) {
                $btn.on('click', function (e) {
                  if (!context.queryResultTable.getSelectedRow().length) {
                    e.stopImmediatePropagation()
                  }
                })
                servkit.downloadFile($btn, excelUrl, getExcelParams)
                isBind = true
              }
            }
          }
        })()
        window.qrt = context.queryResultTable = createReportTable({
          $tableElement: $('#query-result-table'),
          $tableWidget: $('#query-result-widget'),
          autoWidth: false,
          order: [[3, 'desc']],
          checkbox: true,
          customBtns: [
            `<button class="btn btn-success download-excel"><span class="fa fa-file-excel-o fa-lg"></span> ${i18n(
              'Excel'
            )}</button>`,
          ],
          columns: [
            {
              data: 'order_id',
              name: 'order_id',
              width: '10%',
              render(data) {
                return data || ''
              },
            },
            {
              data: 'machine_id',
              name: 'machine_id',
              width: '10%',
              render(data, type) {
                if (type === 'display' || type === 'selectFilter') {
                  return servkit.getMachineName(data)
                } else {
                  return data
                }
              },
            },
            {
              data: 'type',
              name: 'type',
              width: '6%',
              render(data, type) {
                if (type === 'display' || type === 'selectFilter') {
                  return context.commons.matAssignmentTypeMap[data]
                } else {
                  return data
                }
              },
            },
            {
              data: 'm_mat_time',
              name: 'm_mat_time',
              width: '10%',
              render(data, type, rowData) {
                return data ? data.toFormatedDatetime() : ''
              },
            },
            {
              data: 'product_id',
              name: 'product_id',
              width: '12%',
              render(data) {
                return data || ''
              },
            },
            {
              data: 'product_pid',
              name: 'product_pid',
              width: '15%',
              render(data) {
                return data || ''
              },
            },
            {
              data: 'rework_size',
              name: 'rework_size',
              width: '10%',
              render(data) {
                return data || ''
              },
            },
            {
              data: null,
              name: 'location_detail',
              width: '8%',
              render(data, type, rowData) {
                return `<button class="btn btn-primary location-detail">明細</button>`
              },
            },
            {
              data: 'm_mat_status',
              name: 'm_mat_status',
              width: '8%',
              render(data, type) {
                if (type === 'display' || type === 'selectFilter') {
                  return context.commons.statusMap.m_mat_status[data]
                } else {
                  return data
                }
              },
            },
            {
              data: null,
              name: 'cancel',
              width: '8%',
              render(data, type, rowData) {
                const { m_mat_status } = rowData
                const canCancel =
                  m_mat_status === 0 && context.userAuth.canEditRecord
                return `<button class="btn btn-primary cancel-assignment" ${
                  canCancel ? '' : 'disabled'
                }>取消</button>`
              },
            },
          ],
          onDraw() {
            bindDownloadExcelEvent()
          },
        })
        context.queryResultTable.fillSelectFilterOptions = function (
          isResetSelectValue
        ) {
          const { selectFilter, table: dt, config } = this
          _.each(selectFilter, (select, index) => {
            const selectValue = select.value
            const colData = dt.column(index).data().toArray()
            const hasValue = colData.includes(selectValue)
            let options = _.chain(colData).uniq().value().sort()
            if (config.columns && config.columns[index].render) {
              options = options.map((opt) => [
                opt,
                config.columns[index].render(opt, 'selectFilter'),
              ])
            }
            options.unshift(['', i18n('Filter')])
            select.innerHTML = options.map(
              (entries) =>
                `<option value="${entries[0]}">${entries[1]}</option>`
            )
            if (!isResetSelectValue && hasValue) {
              select.value = selectValue
            }
          })
        }
        $queryResultTable
          .on('click', '.cancel-assignment', function () {
            context.showConfirmModal('cancel-assignment', this)
          })
          .on('click', '.location-detail', function () {
            context.showLocationDetailModal(this)
          })
        $confirmBtn.on('click', function () {
          context.confirmHandler(this)
        })
      },
      downloadExcel() {
        const context = this
        const rowData = context.queryResultTable.getSelectedRow()
        if (rowData.length) {
          const dateTimeCols = ['wo_m_time', 'm_mat_time']
          const requestBody = rowData.map((data) => {
            return _.chain(data)
              .pick(['order_id', 'machine_id', 'wo_m_time', 'm_mat_time'])
              .mapObject((value, key) =>
                dateTimeCols.includes(key) ? value.toFormatedDatetime() : value
              )
          })
          const url = 'api/huangliangMatStock/pickinglist/excel'
          let $form = context.$downloadExcelForm
          if ($form && $form.length) {
            $form.remove()
          }
          $form = context.$downloadExcelForm = $(
            `<form method="POST" action="${url}"></form>`
          )
        }
        // var iframeHtml = '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>';
        // $submitForm.append($('<input>').attr('name', 'data').val(JSON.stringify(dataCallback())));
        // $submitForm.attr({
        //   'action': servkit.rootPath + '/api/excel/download',
        //   'method': 'post',
        //   'target': 'download_target'
        // });
        // $(this).after($submitForm.hide());
        // $submitForm.append(iframeHtml);

        // document.querySelector('#' + hiddenFormId).submit();

        // $.each(params, function (k, v) {
        //   form.append($('<input type="hidden" name="' + k +
        //                 '" value="' + v + '">'));
        // });
        // $('body').append(form);
        // form.submit();

        // fetch('api/huangliangMatStock/pickinglist/excel', {
        //   method: 'POST',
        //   headers: new Headers({
        //     'Content-Type': 'application/json'
        //   }),
        //   body: JSON.stringify(requestBody)
        // })
        //   .then(res => {
        //     const headers = res.headers;
        //     const contentDisposition = headers.get('content-disposition');
        //     const filename = contentDisposition.match(/filename="(.+)"/)[1].trim();
        //     return ({
        //       blob: res.blob(),
        //       filename
        //     })
        //   })
        //   .then(res => {
        //     const {
        //       filename,
        //       blob
        //     } = res;
        //     // var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        //     var link = document.createElement('a');
        //     link.href = window.URL.createObjectURL(blob);
        //     link.download = filename;

        //     document.body.appendChild(link);

        //     link.click();

        //     document.body.removeChild(link);
        //   })

        // $.ajax({
        //   type: "POST",
        //   url,
        //   contentType: 'application/json',
        //   data: JSON.stringify(requestBody),
        //   always: function (response, status, xhr) {
        //     // check for a filename
        //     var filename = "";
        //     var disposition = xhr.getResponseHeader('Content-Disposition');
        //     if (disposition && disposition.indexOf('attachment') !== -1) {
        //       var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        //       var matches = filenameRegex.exec(disposition);
        //       if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        //     }

        //     var type = xhr.getResponseHeader('Content-Type');
        //     var blob = new Blob([response], { type: type });

        //     if (typeof window.navigator.msSaveBlob !== 'undefined') {
        //       // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
        //       window.navigator.msSaveBlob(blob, filename);
        //     } else {
        //       var URL = window.URL || window.webkitURL;
        //       var downloadUrl = URL.createObjectURL(blob);

        //       if (filename) {
        //         // use HTML5 a[download] attribute to specify filename
        //         var a = document.createElement("a");
        //         // safari doesn't support this yet
        //         if (typeof a.download === 'undefined') {
        //           window.location = downloadUrl;
        //         } else {
        //           a.href = downloadUrl;
        //           a.download = filename;
        //           document.body.appendChild(a);
        //           a.click();
        //         }
        //       } else {
        //         window.location = downloadUrl;
        //       }

        //       setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        //     }
        //   }
        // });

        // var xhr = new XMLHttpRequest();
        // xhr.open('POST', url, true);
        // xhr.responseType = 'arraybuffer';
        // xhr.onload = function () {
        //   if (this.status === 200) {
        //     var filename = "";
        //     var disposition = xhr.getResponseHeader('Content-Disposition');
        //     if (disposition && disposition.indexOf('attachment') !== -1) {
        //       var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        //       var matches = filenameRegex.exec(disposition);
        //       if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        //     }
        //     var type = xhr.getResponseHeader('Content-Type');

        //     var blob = typeof File === 'function'
        //       ? new File([this.response], filename, { type: type })
        //       : new Blob([this.response], { type: type });
        //     if (typeof window.navigator.msSaveBlob !== 'undefined') {
        //     // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
        //       window.navigator.msSaveBlob(blob, filename);
        //     } else {
        //       var URL = window.URL || window.webkitURL;
        //       var downloadUrl = URL.createObjectURL(blob);

        //       if (filename) {
        //         // use HTML5 a[download] attribute to specify filename
        //         var a = document.createElement("a");
        //         // safari doesn't support this yet
        //         if (typeof a.download === 'undefined') {
        //           window.location = downloadUrl;
        //         } else {
        //           a.href = downloadUrl;
        //           a.download = filename;
        //           document.body.appendChild(a);
        //           a.click();
        //         }
        //       } else {
        //         window.location = downloadUrl;
        //       }

        //       setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
        //     }
        //   }
        // };
        // xhr.setRequestHeader('Content-type', 'application/json');
        // xhr.send(JSON.stringify(requestBody));
      },
      getMaterialAssignment() {
        const context = this
        const { $queryConditionForm, $orderIdInput, $machineSelect } = context
        const status = $queryConditionForm
          .find('[name=m_mat_status]:checked')
          .map((i, el) => el.value)
          .toArray()
        const type = $queryConditionForm
          .find('[name=type]:checked')
          .map((i, el) => Number(el.value))
          .toArray()
        const order_id = $orderIdInput.val()
        const machine_id = $machineSelect.val().filter((name) => name !== 'ALL')
        const statusMap = {
          unclosed: [0, 1, 2, 3],
          closed: [9],
          canceled: [99],
        }
        let whereClause = `machine_id IN (${machine_id
          .map(() => '?')
          .join(',')})`
        const whereParams = [...machine_id]
        if (order_id) {
          whereClause += ' AND order_id=?'
          whereParams.push(order_id)
        }
        if (status.length) {
          const params = _.chain(status)
            .map((status) => statusMap[status])
            .flatten()
            .value()
          whereClause += ` AND m_mat_status IN (${params
            .map(() => '?')
            .join(',')})`
          whereParams.push(...params)
        }
        if (type.length) {
          whereClause += ` AND type IN (${type.map(() => '?').join(',')})`
          whereParams.push(...type)
        }
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_view_wo_m_mat_wo_list',
              whereClause,
              whereParams,
            }),
          },
          {
            success(data) {
              context.queryResultTable.drawTable(data)
            },
          }
        )
      },
      showConfirmModal(type, btn) {
        const context = this
        const {
          $confirmModal,
          $confirmBtn,
          $confirmContent,
          $confirmtitle,
        } = context
        const tr = btn.closest('tr')
        const rowData = context.queryResultTable.table.row(tr).data()

        let title = ''
        let content = ''
        switch (type) {
          case 'cancel-assignment':
            content = '確定要取消?'
            title = '取消'
            break
        }
        $confirmtitle.text(title)
        $confirmContent.text(content)
        $confirmBtn.data({
          'confirm-type': type,
          rowData,
          tr,
        })
        $confirmModal.modal('show')
      },
      confirmHandler(btn) {
        const context = this
        const btnData = $(btn).data()
        const { 'confirm-type': type, rowData, tr } = btnData
        const { order_id, machine_id, wo_m_time, m_mat_time } = rowData

        servkit.ajax(
          {
            url: 'api/huangliangMatStock/wo_m_mat/cancel',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
              order_id,
              machine_id,
              wo_m_time: wo_m_time.toFormatedDatetime(),
              m_mat_time: m_mat_time.toFormatedDatetime(),
            }),
          },
          {
            success(data) {
              context.queryResultTable.table
                .row(tr)
                .data(
                  _.extend(context.queryResultTable.table.row(tr).data(), {
                    m_mat_status: 99,
                  })
                )
                .draw(false)
              context.queryResultTable.fillSelectFilterOptions(false)
              context.$confirmModal.modal('hide')
            },
          }
        )
      },

      showLocationDetailModal(btn) {
        const context = this
        const tr = btn.closest('tr')
        const rowData = context.queryResultTable.table.row(tr).data()
        context.materialAssign.show(rowData)
      },
    },
    preCondition: {
      supplier(done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_huangliang_supplier',
              columns: ['sup_id', 'sup_name'],
            }),
          },
          {
            success(data) {
              done(Object.fromEntries(data.map((d) => [d.sup_id, d.sup_name])))
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
