export default function () {
  GoGoAppFun({
    gogo: function (context) {
      context.initSelectAll()

      pageSetUp()
      var datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        repairListTable = createReportTable({
          $tableWidget: $('#repair-list-widget'),
          $tableElement: $('#repair-list-table'),
          excel: {
            fileName: 'RepairListExcel',
            format: [
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
            ],
          },
        })
      context.$startDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))
      context.$endDate
        .datepicker(datepickerConfig)
        .val(moment().format('YYYY/MM/DD'))

      context.$submitBtn.on('click', function (evt) {
        evt.preventDefault()
        var startData = context.$startDate.val()
        var endDate = context.$endDate.val()
        var customers = context.$cusID.val() || ''
        var machineID = context.$machineID.val() || ''
        var repairID = context.$repairID.val() || ''
        var status = []
        var urgency = []
        context.$status.each(function () {
          if (this.checked) {
            status.push($(this).val())
          }
        })
        context.$urgency.each(function () {
          if (this.checked) {
            urgency.push($(this).val())
          }
        })

        context.drawTable(
          startData,
          endDate,
          customers,
          machineID,
          repairID,
          status,
          urgency
        )
      })
      context.$clearBtn.on('click', function (evt) {
        evt.preventDefault()
        // context.$cusID.get(0).selectedIndex = -1;
        // context.$machineID.get(0).selectedIndex = -1;
        // context.$repairID.get(0).selectedIndex = -1;
        context.$cusID.prop('selectedIndex', -1)
        context.$machineID.prop('selectedIndex', -1)
        context.$repairID.prop('selectedIndex', -1)
        pageSetUp()
      })
    },
    util: {
      $submitBtn: $('#submit-btn'),
      $clearBtn: $('#clear-btn'),
      loadingBtn: servkit.loadingButton(document.querySelector('#submit-btn')),
      $startDate: $('#start-date'),
      $endDate: $('#end-date'),
      $cusID: $('#cus_id'),
      $machineID: $('#machine_id'),
      $repairID: $('#repair_id'),
      $status: $('[name=repairStatus]'),
      $urgency: $('[name=repairEmergency]'),
      getDBObject: {},
      drawTable: function (
        startDate,
        endDate,
        customers,
        machines,
        repairs,
        status,
        urgency
      ) {
        var dbObj = {
          startDate: startDate,
          endDate: endDate,
          customers: customers,
          machines: machines,
          repairs: repairs,
          status: status,
          urgency: urgency,
        }

        $.ajax({
          url: 'api/aftersalesservice/repairassign/query',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(dbObj),
        }).done(function (data) {
          console.log(data)
        })
      },
      initSelectAll: function () {
        this.initCustomerSelect()
        this.initMachineSelect()
        this.initRepairSelect()
      },
      initCustomerSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getCustomer',
          tableName: 'a_aftersalesservice_customer',
          columns: ['cus_id', 'cus_name'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getCustomer, function (data) {
            dataMap[data.cus_id] = data.cus_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$cusID[0].innerHTML = selectResultHtml
              that.$cusID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initMachineSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getMachine',
          tableName: 'm_device',
          columns: ['device_id', 'device_name'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getMachine, function (data) {
            dataMap[data.device_id] = data.device_name
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$machineID[0].innerHTML = selectResultHtml
              that.$machineID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
      initRepairSelect: function () {
        var that = this
        var dataConfig = {
          objKey: 'getRepair',
          tableName: 'a_aftersalesservice_repair',
          columns: ['repair_id'],
        }

        var callbackfunction = function () {
          var result
          var selectResultHtml
          var dataMap = {}
          _.map(that.getDBObject.getRepair, function (data) {
            dataMap[data.repair_id] = data.repair_id
          })
          servkit
            .politeCheck()
            .until(function () {
              return dataMap
            })
            .thenDo(function () {
              result = dataMap
              var selectHtml = ''
              _.each(_.keys(result).sort(), function (key) {
                selectHtml +=
                  '<option value="' + key + '" >' + result[key] + '</option>'
              })
              selectResultHtml = selectHtml
            })
            .tryDuration(0)
            .start()
          servkit
            .politeCheck()
            .until(function () {
              return selectResultHtml
            })
            .thenDo(function () {
              that.$repairID[0].innerHTML = selectResultHtml
              that.$repairID.prop('selectedIndex', -1)
            })
            .tryDuration(0)
            .start()
        }
        this.commons.getDataFromDB.apply(that, [dataConfig, callbackfunction])
      },
    },
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
