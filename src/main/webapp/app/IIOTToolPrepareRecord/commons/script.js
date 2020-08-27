exports.smallBox = function (params) {
  var smallBoxColor = {
    green: '#739E73',
    red: '#C46A69',
    yellow: '#C79121',
  }
  var content = params.content
  if (!content) {
    content = ''
  }
  $.smallBox({
    title: params.title,
    content:
      "<i class='fa fa-clock-o'></i>" + content + '<i>1 seconds ago...</i>',
    color: smallBoxColor[params.color],
    iconSmall: params.icon,
    timeout: params.timeout,
  })
}

var tempBlingTimes = 0
exports.bling = function (blingTimes, frequency, $elements, color) {
  tempBlingTimes = blingTimes * 2 + 1
  var blingCount = 1

  setTimeout(function change() {
    if (blingCount < tempBlingTimes) {
      if (blingCount++ % 2 === 0) {
        $elements.css('background-color', '')
      } else {
        $elements.css('background-color', color)
      }
      setTimeout(change, frequency)
    }
  }, 0)
}

var tempRadix
exports.uuidGenerator = function (len, radix) {
  // var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
  var uuid = []
  var i
  tempRadix = radix || chars.length

  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * tempRadix)]
  } else {
    var r

    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'

    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16)
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r]
      }
    }
  }

  return uuid.join('')
}

// clear form
;(function () {
  $('#content').on('click touchend', '[name=submit-clean]', function (e) {
    e.preventDefault()

    $(e.target)
      .closest('form')
      .find('input[type=text]')
      .val('')
      .end()
      .find('select')
      .prop('selectedIndex', -1)
      .end()
      .find('select.select2')
      .select2('val', -1)
      .end()
      .find(':checkbox, :radio')
      .prop('checked', false)
  })
})()
