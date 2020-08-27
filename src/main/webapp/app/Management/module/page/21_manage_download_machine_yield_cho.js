export default function () {
  GoGoAppFun({
    gogo: function (context) {
      var $startDate = $('input[name="startDate"]'),
        $startDateClock = $('input[name="startDateClock"]'),
        $endDate = $('input[name="endDate"]'),
        $endDateClock = $('input[name="endDateClock"]'),
        $machienSelect = $('select[name=device]'),
        $typeRawData = $('#type-raw-data'),
        $typeMachineYield = $('#type-machine-yield'),
        datepickerConfig = {
          dateFormat: 'yy/mm/dd',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
        },
        hiddenFormId

      $startDate
        .datepicker(datepickerConfig)
        .val(new Date().toISOString().slice(0, 10).replace(/-/g, '/'))

      $endDate
        .datepicker(datepickerConfig)
        .val(new Date().toISOString().slice(0, 10).replace(/-/g, '/'))

      //$startDate.datepicker(datepickerConfig)
      //          .val("2016/11/21");

      //$endDate.datepicker(datepickerConfig)
      //        .val("2016/11/27");

      $startDateClock
        .clockpicker({
          placement: 'left',
          donetext: 'Done',
        })
        .on('change', function () {
          var temp = this.value
          $(this).val(temp.split(':')[0] + ':00')
        })

      $endDateClock
        .clockpicker({
          placement: 'left',
          donetext: 'Done',
        })
        .on('change', function () {
          var temp = this.value
          $(this).val(temp.split(':')[0] + ':00')
        })

      var machineSelectHtml = ''
      servkit.eachMachine(function (id, name) {
        machineSelectHtml +=
          '<option style="padding:3px 0 3px 3px;" value="' +
          id +
          '">' +
          name +
          '</option>'
      })
      $machienSelect.append(machineSelectHtml)
      servkit.multiselectHeightOptimization($machienSelect[0])
      $machienSelect
        .on('mousedown', servkit.multiselectWithoutCtrlMouseDown)
        .on('mousemove', servkit.multiselectWithoutCtrlMouseMove)

      $('#send-btn').on('click', function (e) {
        e.preventDefault()
        //console.log("*** ", $startDate.val(), $endDate.val());
        var startDate = moment($startDate.val(), 'YYYY/MM/DD')
        var endDate = moment($endDate.val(), 'YYYY/MM/DD')

        var diffDay = endDate.diff(startDate) / (24 * 60 * 60 * 1000)
        //console.log("--- ", diffDay);
        if (diffDay >= 7) {
          $.smallBox({
            sound: false, //不要音效
            title:
              'Download fail: Select a time interval of more than one week.',
            content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
            color: '#C79121',
            iconSmall: 'fa fa-warning',
            timeout: 10000,
          })
          return
        }

        hiddenFormId && $('#' + hiddenFormId).remove()
        hiddenFormId =
          'download-rawdat-form-id-' + moment().format('YYYYMMDDHHmmssSSSS')

        var startTime =
          $startDate.val() + ' ' + $startDateClock.val().split(':')[0]
        var endTime = $endDate.val() + ' ' + $endDateClock.val().split(':')[0]

        if (startTime > endTime) {
          $.smallBox({
            sound: false, //不要音效
            title:
              'Download fail: The start time is greater than the end time.',
            content: "<i class='fa fa-clock-o'></i> <i>1 seconds ago...</i>",
            color: '#C79121',
            iconSmall: 'fa fa-warning',
            timeout: 10000,
          })
          return
        }

        var downloadType = 'MACHINE_YIELD'
        /*if($typeMachineYield.is(':checked')){
            downloadType = 'MACHINE_YIELD';
        }else{
            downloadType = 'RAW_DATA';
        }*/

        var $submitForm = $('<form id="' + hiddenFormId + '"></form>'),
          iframeHtml =
            '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
        $submitForm.append(
          $('<input>').attr('name', 'startTime').val(startTime)
        )
        $submitForm.append($('<input>').attr('name', 'endTime').val(endTime))
        $submitForm.append(
          $('<input>').attr('name', 'downloadType').val(downloadType)
        )
        _.each($machienSelect.val(), function (machine) {
          $submitForm.append($('<input>').attr('name', 'machines').val(machine))
        })
        $submitForm.attr({
          action: 'api/cho/rawdata/download', //'api/getdata/rawDownload',
          method: 'get',
          target: 'download_target',
        })
        $(this).after($submitForm.hide())
        $submitForm.append(iframeHtml)

        document.querySelector('#' + hiddenFormId).submit()
      })
    },
    dependencies: [['/js/plugin/clockpicker/clockpicker.min.js']],
  })
}
