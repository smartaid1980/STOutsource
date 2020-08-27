import i18n from '../../../../js/servtech/module/servcloud.i18n.js'
export default function () {
  GoGoAppFun({
    gogo: function (context) {
      servkit.crudtable({
        tableSelector: '#stk-machine-table',
        create: {
          url: 'api/aerowin/departmachine/create',
          fail: function (data) {
            if (data.indexOf('Duplicate') > -1) {
              return `${i18n('ID_Already_Exists')}`
            } else {
              return `${i18n('Exception_Msg')}`
            }
          },
          /* send: function (tdEles) {
           var machineTypeId = $(tdEles[5]).find('select').val();
           return {device_type: machineTypeId};
           }, */
          start: function (newTr, table) {
            // 預設都選'OTHER'
            // $(newTr[4]).find('option[value="OTHER"]').prop('selected', true);
            // $(newTr[5]).find('option[value="OTHER"]').prop('selected', true);
          },
        },
        read: {
          url: 'api/aerowin/departmachine/read',
        },
        update: {
          unavailable: true,
          /* url: 'api/machine/update',
           send: function (tdEles) {
           var machineTypeId = $(tdEles[5]).find('select').val();
           return {device_type: machineTypeId};
           } */
        },
        delete: {
          url: 'api/aerowin/departmachine/delete',
        },
      })
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
