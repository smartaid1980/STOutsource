export default function () {
  pageSetUp()
  ;(function () {
    var $startDate = $('input[name="startDate"]'),
      $endDate = $('input[name="endDate"]'),
      $machienSelect = $('select[name=device]'),
      hiddenFormId

    servkit.initDatePicker($startDate, $endDate, true)
    servkit.initMachineSelect($machienSelect)

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
      _.each($machienSelect.val(), function (machine) {
        $submitForm.append($('<input>').attr('name', 'machines').val(machine))
      })
      $submitForm.attr({
        action: 'api/getdata/rawDownload',
        method: 'get',
        target: 'download_target',
      })
      $(this).after($submitForm.hide())
      $submitForm.append(iframeHtml)

      document.querySelector('#' + hiddenFormId).submit()
    })
  })()
}
