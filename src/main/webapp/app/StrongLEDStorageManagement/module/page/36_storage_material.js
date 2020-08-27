import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.initSelectWithList(
        context.preCon.getMaterialData,
        $('[name=material_id]')
      )
      context.materialReportTable = createReportTable({
        $tableElement: $('#material'),
        $tableWidget: $('#material-widget'),
        checkbox: true,
        customBtns: [
          `<button class="btn bg-color-blueDark txt-color-white stk-qrcode-btn" title="${i18n(
            'Print_Checked_Qrcode'
          )}" style="margin-right:10px"><span class="fa fa-qrcode fa-lg"></span></button>`,
        ],
      })
      servkit.validateForm($('#storage-form'), $('#storage-btn'))
      $('#storage-btn').on('click', function (evt) {
        evt.preventDefault()
        context.submitBtn.doing()
        servkit.ajax(
          {
            url: 'api/storage/material/createThingByMaterial',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
              material_id: $('[name=material_id]').val(),
              qty: $('[name=qty]').val(),
            }),
          },
          {
            success: function (data) {
              context.materialRenderTable(data)
              context.submitBtn.done()
            },
          }
        )
      })
      servkit.downloadFile(
        '.stk-qrcode-btn',
        '/api/storage/material/qrcode',
        function () {
          var thingData = []
          _.each(context.materialReportTable.getSelectedRow(), function (data) {
            thingData.push(data[0])
          })
          return {
            'thing_id[]': thingData,
          }
        },
        'GET'
      )
    },
    util: {
      submitBtn: servkit.loadingButton(document.querySelector('#storage-btn')),
      materialReportTable: null,
      materialRenderTable: function (data) {
        var ctx = this
        ctx.materialReportTable.drawTable(
          _.map(data, (val) => {
            return [
              val.thing_id || '---',
              val.thing_pcs || '---',
              val.material_id || '---',
              val.material_name || '---',
              val.exp_date ? moment(val.exp_date).format('YYYY/MM/DD') : '---',
            ]
          })
        )
      },
    },
    preCondition: {
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
