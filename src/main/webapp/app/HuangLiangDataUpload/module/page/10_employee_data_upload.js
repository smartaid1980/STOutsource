import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.reportTable = createReportTable({
        $tableElement: $('#care-emp-table'),
        $tableWidget: $('#care-emp-widget'),
      })

      Dropzone.autoDiscover = false
      $('#dropzone').dropzone(context.dropzoneConfig('api/dataUpload/employee'))

      context.setUserpermittedAuthes()
      context.drawTable()
    },
    util: {
      reportTable: undefined,
      setUserpermittedAuthes: function () {
        var context = this
        //業務副理、研發副理、研發/業務副課長、廠務部製造課長、廠務部製造副課長，僅可查詢
        var queryGroup = [
            context.commons.sales_manager,
            context.commons.rd_manager,
            context.commons.rd_deputy_manager,
            context.commons.sales_deputy_manager,
            context.commons.process_manager_1,
            context.commons.process_manager_2,
            context.commons.process_deputy_manager_1,
            context.commons.process_deputy_manager_2,
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
        hippo
          .newSimpleExhaler()
          .space('HUL_care_employees')
          .index('customer_id', ['HuangLiang'])
          .columns('employee_id', 'employee_name')
          .exhale(function (exhalable) {
            context.reportTable.drawTable(
              exhalable.map(function (data, groupKeys) {
                return [data.employee_id, data.employee_name]
              })
            )
          })
      },
      dropzoneConfig: function (api) {
        var context = this
        return {
          url: api,
          paramName: 'file',
          addRemoveLinks: true,
          maxFilesize: 20, // MB
          acceptedFiles: '.xlsx',
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
