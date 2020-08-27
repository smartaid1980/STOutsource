export default function () {
  GoGoAppFun({
    gogo: function (context) {
      pageSetUp()

      var $startDate = $('input[name="startDate"]'),
        $endDate = $('input[name="endDate"]'),
        $machienSelect = $('select[name=device]'),
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

        hiddenFormId && $('#' + hiddenFormId).remove()
        hiddenFormId =
          'download-rawdat-form-id-' + moment().format('YYYYMMDDHHmmssSSSS')

        var $submitForm = $('<form id="' + hiddenFormId + '"></form>'),
          iframeHtml =
            '<iframe name="download_target" style="width:0;height:0;border:0px solid #fff;"></iframe>'
        $submitForm.append(
          $('<input>').attr('name', 'startDate').val($startDate.val())
        )
        $submitForm.append(
          $('<input>').attr('name', 'endDate').val($endDate.val())
        )
        $submitForm.append(
          $('<input>').attr('name', 'space').val('source_data')
        )
        _.each($machienSelect.val(), function (machine) {
          $submitForm.append($('<input>').attr('name', 'machines').val(machine))
        })
        $submitForm.attr({
          action: 'api/getdata/anyDataDownload',
          method: 'get',
          target: 'download_target',
        })
        $(this).after($submitForm.hide())
        $submitForm.append(iframeHtml)

        document.querySelector('#' + hiddenFormId).submit()
      })
    },
  })
}
