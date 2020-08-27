export default function () {
  pageSetUp()

  var table = function () {
    var colNames_detail = [
      {
        id: 'names',
        name: 'i18n_ServCloud_Name',
      },
      {
        id: 'series',
        name: 'Id-1',
      },
      {
        id: 'versions',
        name: 'Id-2',
      },
    ]

    var obj = [
      {
        names: 'CNC basic software',
        series: '',
        versions: '',
      },
      {
        names: 'CNC option software A2',
        series: '----',
        versions: '----',
      },
      {
        names: 'BOOT Software',
        series: '60W1',
        versions: '0001',
      },
      {
        names: 'PMC system software 1',
        series: '40A0',
        versions: '03.0',
      },
      {
        names: 'PPMC ladder 1 (first ladder)',
        series: '',
        versions: '',
      },
      {
        names: '1st spindle software',
        series: '',
        versions: '',
      },
      {
        names: 'Graphic software 1',
        series: '60V8',
        versions: '03.0',
      },
      {
        names: 'Graphic software 4(font dat)',
        series: '60VE',
        versions: '0001',
      },
      {
        names: 'Network management',
        series: '656F',
        versions: '0002',
      },
      {
        names: 'Embedded Ethernet',
        series: '656E',
        versions: '0003',
      },
    ]

    $._table.createTable($('#table_widget'), obj, colNames_detail)
    var responsiveHelper_dt_basic = undefined

    var breakpointDefinition = {
      tablet: 1024,
      phone: 480,
    }

    $('#table').dataTable({
      sDom:
        "<'dt-toolbar'<'col-xs-12 col-sm-6'f><'col-sm-6 col-xs-12 hidden-xs'l>r>" +
        't' +
        "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
      autoWidth: true,
      preDrawCallback: function () {
        // Initialize the responsive datatables helper once.
        if (!responsiveHelper_dt_basic) {
          responsiveHelper_dt_basic = new ResponsiveDatatablesHelper(
            $('#table'),
            breakpointDefinition
          )
        }
      },
      rowCallback: function (nRow) {
        responsiveHelper_dt_basic.createExpandIcon(nRow)
      },
      drawCallback: function (oSettings) {
        responsiveHelper_dt_basic.respond()
      },
    })
  }

  window.loadScript(
    '../frontend/js/plugin/flot/jquery.flot.cust.min.js',
    function () {
      window.loadScript(
        '../frontend/js/plugin/flot/jquery.flot.resize.min.js',
        function () {
          window.loadScript(
            '../frontend/js/plugin/flot/jquery.flot.fillbetween.min.js',
            function () {
              window.loadScript(
                '../frontend/js/plugin/flot/jquery.flot.orderBar.min.js',
                function () {
                  window.loadScript(
                    '../frontend/js/plugin/flot/jquery.flot.pie.min.js',
                    function () {
                      window.loadScript(
                        '../frontend/js/plugin/flot/jquery.flot.tooltip.min.js',
                        function () {
                          window.loadScript(
                            '../frontend/js/plugin/flot/jquery.flot.axislabels.js',
                            function () {
                              window.loadScript(
                                '../frontend/js/plugin/datatables/jquery.dataTables.min.js',
                                function () {
                                  window.loadScript(
                                    '../frontend/js/plugin/datatables/dataTables.colVis.min.js',
                                    function () {
                                      window.loadScript(
                                        '../frontend/js/plugin/datatables/dataTables.tableTools.min.js',
                                        function () {
                                          window.loadScript(
                                            '../frontend/js/plugin/datatables/dataTables.bootstrap.min.js',
                                            function () {
                                              window.loadScript(
                                                '../frontend/js/plugin/datatable-responsive/datatables.responsive.min.js',
                                                table
                                              )
                                            }
                                          )
                                        }
                                      )
                                    }
                                  )
                                }
                              )
                            }
                          )
                        }
                      )
                    }
                  )
                }
              )
            }
          )
        }
      )
    }
  )
  // load all flot plugins
}
