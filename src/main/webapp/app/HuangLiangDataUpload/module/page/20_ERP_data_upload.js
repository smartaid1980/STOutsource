import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#erp-table'),
        $tableWidget: $('#erp-widget'),
      })

      context.setUserpermittedAuthes()
      context.drawTable()

      Dropzone.autoDiscover = false
      context.$golfOrder
        .html(context.HTML)
        .find('.dropzone')
        .dropzone(context.dropzoneConfig('api/dataUpload/golfProduct'))
      context.$golfSample
        .html(context.HTML)
        .find('.dropzone')
        .dropzone(context.dropzoneConfig('api/dataUpload/golfSample'))
      context.$mrpOrder
        .html(context.HTML)
        .find('.dropzone')
        .dropzone(context.dropzoneConfig('api/dataUpload/mrpProduct'))
      context.$mrpSample
        .html(context.HTML)
        .find('.dropzone')
        .dropzone(context.dropzoneConfig('api/dataUpload/mrpSample'))
    },
    util: {
      reportTable: undefined,
      setUserpermittedAuthes: function () {
        var context = this
        //業務副理、研發副理，僅可查詢
        var queryGroup = [
            context.commons.sales_manager,
            context.commons.rd_manager,
          ],
          //admin, 高階主管、廠務部副理可多次修改
          noLimitedGroup = [
            context.commons.sys_super_admin_group,
            context.commons.sys_manager_group,
            context.commons.top_manager,
            context.commons.factory_service_deputy_manager,
          ]

        var userGroupList = JSON.parse(sessionStorage.loginInfo).user_group
        if (
          !_.intersection(userGroupList, noLimitedGroup).length &&
          _.intersection(userGroupList, queryGroup).length
        ) {
          //若包含有可多次修改的群組就不會進到這裡
          $('#dropzone-widget').addClass('hide')
        }
      },
      drawTable: function () {
        var context = this
        servkit.multiAjax(
          {
            getProductList: {
              url: 'api/huangliang/product/get',
              contentType: 'application/json',
              type: 'GET',
            },
            getSampleList: {
              url: 'api/huangliang/sample/get',
              contentType: 'application/json',
              type: 'GET',
            },
          },
          function (resultObj) {
            var tableData = []
            _.each(resultObj.getProductList, function (data) {
              tableData.push([
                //類別
                '訂單',
                //訂單編號
                data.order_id,
                //管編
                data.standard_id,
                //圖號
                data.product_name,
                //客戶編號
                '',
                //客戶簡稱
                '',
                //總數量
                data.quantity,
                //未交數
                data.quantity_undelivered,
              ])
            })

            _.each(resultObj.getSampleList, function (data) {
              tableData.push([
                //類別
                '樣品',
                //訂單編號
                '',
                //管編
                data.sample_id,
                //圖號
                data.sample_name,
                //客戶編號
                data.customer_id,
                //客戶簡稱
                '',
                //總數量
                '',
                //未交數
                '',
              ])
            })

            context.reportTable.drawTable(tableData)
          }
        )
      },
      HTML:
        '<div class="row no-margin">' +
        '<form action="" class="dropzone dropzone-v15">' +
        '<span class="text-center">' +
        '<span class="font-lg visible-xs-block visible-sm-block visible-lg-block">' +
        '<span class="font-lg">' +
        `<i class="fa fa-caret-right text-danger"></i> ${i18n(
          'dragXlsxFile'
        )}` +
        `<span class="font-xs">${i18n('orClick')}</span>` +
        '</span>' +
        '</span>' +
        '</span>' +
        '</form>' +
        '</div>',
      $golfOrder: $('#golf-order'),
      $golfSample: $('#golf-sample'),
      $mrpOrder: $('#mrp-order'),
      $mrpSample: $('#mrp-sample'),
      dropzoneConfig: function (api) {
        var context = this
        return {
          url: api,
          paramName: 'file',
          addRemoveLinks: true,
          maxFilesize: 20, // MB
          acceptedFiles: '.xlsx, .xls',
          dictResponseError: `${i18n('Upload_Failed')}`,
          init: function () {
            this.on('success', function (file, res) {
              servkit.responseRule(res, {
                success: function (resData, textStatus, jqXHR) {
                  context.drawTable()
                },
                exception: function (resData, textStatus, jqXHR) {
                  //type:999
                  var $fileResult = $(file.previewElement)
                  $fileResult.removeClass('dz-success').addClass('dz-error')
                  $fileResult
                    .find('.dz-error-message span')
                    .text(resData)
                    .css('color', '#fff')
                    .parent()
                    .css('background-color', 'rgba(0, 0, 0, 0.8)')
                },
              })
            })
          },
        }
      },
    },
    dependencies: [
      ['/js/plugin/dropzone/dropzone.min.js'],
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
