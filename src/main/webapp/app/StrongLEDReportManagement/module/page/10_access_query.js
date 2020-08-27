import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function gogo(context) {
      servkit.initSelectWithList(context.preCon.getStoreData, $('#store-id'))
      context.resultReportTable = createReportTable({
        $tableElement: $('#query-result'),
        $tableWidget: $('#query-result-widget'),
      })
      servkit.initDatePicker($('#startDate'), $('#endDate'), false, false)
      $('#query-result-widget .dt-toolbar').addClass('hide')

      servkit.validateForm($('#form'), $('#submit-btn'))
      $('#submit-btn').on('click', function (evt) {
        evt.preventDefault()
        context.submitBtn.doing()
        servkit.ajax(
          {
            url: 'api/stdcrud',
            type: 'GET',
            data: {
              tableModel: 'com.servtech.servcloud.app.model.storage.Log',
              whereClause: `store_id in ('${$('#store-id')
                .val()
                .join("','")}') AND log_time between '${$(
                '#startDate'
              ).val()} 00:00:00' AND '${$('#endDate').val()} 23:59:59'`,
            },
          },
          {
            success: function (data) {
              context.resultRenderTable(data)
              context.submitBtn.done() // 查詢按鈕結束loading
            },
          }
        )
      })
    },
    util: {
      resultReportTable: null,
      submitBtn: servkit.loadingButton(document.querySelector('#submit-btn')), // 初始按鈕loading的功能
      resultRenderTable: function (data) {
        var ctx = this
        var typeMap = {
          '1': `${i18n('Move_In')}`,
          '2': `${i18n('Move_Out')}`,
        }
        ctx.resultReportTable.drawTable(
          _.map(data, (val) => {
            var material = ctx.preCon.getMaterialThingData[val.thing_id]
            return [
              val.log_time
                ? moment(val.log_time).format('YYYY/MM/DD HH:mm:ss')
                : '---',
              ctx.preCon.getStoreData[val.store_id] || '---',
              ctx.preCon.getEmpData[val.user_id] || '---',
              material || '---',
              ctx.preCon.getMaterialData[material] || '---',
              val.thing_id || '---',
              // ctx.preCon.getDocData[val.doc_id] || '---',
              ctx.preCon.getSenderData[val.sender_id] || '---',
              typeMap[val.log_type] || '---',
              val.log_count,
              // val.log_desc || '---'
            ]
          })
        )
      },
    },
    preCondition: {
      getStoreData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_store',
              columns: ['store_id', 'store_name'],
            }),
          },
          {
            success: function (data) {
              var storeData = {}
              _.each(data, function (elem) {
                storeData[elem.store_id] = elem.store_name
              })
              done(storeData)
            },
          }
        )
      },
      getEmpData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_employee',
              columns: ['emp_id', 'emp_name'],
            }),
          },
          {
            success: function (data) {
              var empData = {}
              _.each(data, function (elem) {
                empData[elem.emp_id] = elem.emp_name
              })
              done(empData)
            },
          }
        )
      },
      getMaterialThingData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_material_thing',
              columns: ['thing_id', 'material_id'],
            }),
          },
          {
            success: function (data) {
              var materialThingData = {}
              _.each(data, function (elem) {
                materialThingData[elem.thing_id] = elem.material_id
              })
              done(materialThingData)
            },
          }
        )
      },
      getMaterialData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_material',
              columns: ['material_id', 'material_name'],
            }),
          },
          {
            success: function (data) {
              var materialData = {}
              _.each(data, function (elem) {
                materialData[elem.material_id] = elem.material_name
              })
              done(materialData)
            },
          }
        )
      },
      getDocData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_document',
              columns: ['doc_id', 'doc_name'],
            }),
          },
          {
            success: function (data) {
              var docData = {}
              _.each(data, function (elem) {
                docData[elem.doc_id] = elem.doc_name
              })
              done(docData)
            },
          }
        )
      },
      getSenderData: function (done) {
        servkit.ajax(
          {
            url: 'api/getdata/db',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              table: 'a_storage_sender',
              columns: ['sender_id', 'sender_name'],
            }),
          },
          {
            success: function (data) {
              var senderData = {}
              _.each(data, function (elem) {
                senderData[elem.sender_id] = elem.sender_name
              })
              done(senderData)
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
      ['/js/plugin/dropzone/dropzone.min.js'],
    ],
  })
}
