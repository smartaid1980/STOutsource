import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#machine-ftp-table',
        tableModel:
          'com.servtech.servcloud.app.model.management.FileManageType', // 使用超eazy crud 時會幫你帶給API用的參數
        // hideCols: [1, 2],    //要隱藏的欄位，從1開始。適用於不能顯示給使用者看到，但儲存需要使用的欄位
        // centerColumn: [1, 2],    //指定欄位置中
        leftColumn: [0, 1], //指定欄位靠左
        //   rightColumn: [],    //指定欄位靠右
        create: {
          unavailable: false, //若不使用create功能
          url: 'api/stdcrud',
          start: function (newTr, table) {},
          fail: function (data, createConfig) {},
          finalDo: function () {},
        },
        read: {
          url: 'api/stdcrud',
          fail: function (data, readConfig) {},
          finalDo: function () {},
        },
        update: {
          unavailable: false, //若不使用update功能
          url: 'api/stdcrud',
          fail: function (data, updateConfig) {},
          finalDo: function () {},
        },
        delete: {
          unavailable: false, //若不使用delete功能
          url: 'api/stdcrud',
          titleFunc: function (deleteIds) {
            return (
              `${i18n('Manage_CNC_Server_Type_0004')} ${i18n(
                'Manage_CNC_Server_Type_0005'
              )} ` +
              deleteIds.toString() +
              ` ${i18n('Manage_CNC_Server_Type_0006')}?`
            )
          },
          contentFunc: function (deleteIds) {
            return `${i18n('Manage_CNC_Server_Type_0005')} ${i18n(
              'Manage_CNC_Server_Type_0002'
            )} `
          },
          fail: function (data, deleteConfig) {},
          finalDo: function () {},
        },
        validate: {
          0: function (td, table) {},
        },
      })

      // if (context.preCon.machines) {

      // }
    },
    util: {},
    preCondition: {},
    dependencies: [
      [
        '/js/plugin/flot/jquery.flot.cust.min.js',
        '/js/plugin/flot/jquery.flot.resize.min.js',
        '/js/plugin/flot/jquery.flot.fillbetween.min.js',
        '/js/plugin/flot/jquery.flot.orderBar.min.js',
        '/js/plugin/flot/jquery.flot.pie.min.js',
        '/js/plugin/flot/jquery.flot.tooltip.min.js',
        '/js/plugin/flot/jquery.flot.axislabels.js',
      ],
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
