export default function () {
  ;(function () {
    var $deliverIdInput = $('#deliverId'),
      timeoutId

    function renderResult(data) {
      var html =
        '<br />收料時間：' +
        data.datetime +
        '<br />收料單號：' +
        data.deliverId +
        '<br />'
      html +=
        '<table class="table table-bordered">' +
        _.map(data.itemList, function (row, lineNumber) {
          if (lineNumber !== 0 && row[3] !== row[4]) {
            return (
              '<tr>' +
              _.map(row, function (cell, i) {
                if (i === 3 || i === 4) {
                  return (
                    '<td style="background-color: rgb(255, 102, 102);">' +
                    cell +
                    '</td>'
                  )
                } else {
                  return '<td>' + cell + '</td>'
                }
              }).join('') +
              '</tr>'
            )
          } else {
            return (
              '<tr>' +
              _.map(row, function (cell) {
                return '<td>' + cell + '</td>'
              }).join('') +
              '</tr>'
            )
          }
        }).join('') +
        '</table>'
      $('#result').html(html)
    }

    $deliverIdInput.on('change', function (e) {
      var deliverId = $deliverIdInput.val()
      $deliverIdInput.val('')

      servkit.ajax(
        {
          url: 'api/juihua/deliverOrder/receive',
          type: 'POST',
          data: {
            deliverId: deliverId,
          },
        },
        {
          success: renderResult,
        }
      )
    })

    $deliverIdInput
      .on('blur', function (e) {
        setTimeout(function () {
          $deliverIdInput.focus()
        }, 500)
      })
      .trigger('blur')
  })()
}
