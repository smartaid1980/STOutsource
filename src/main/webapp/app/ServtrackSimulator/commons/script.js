exports.initializeDBData = function (DbData) {
  function Obj(data) {
    this.data = data
    this.map = {}
  }

  Obj.prototype.getData = function () {
    return this.data
  }
  Obj.prototype.getMap = function () {
    return this.map
  }
  Obj.prototype.init = function (key, val) {
    var that = this
    var html = ''
    _.each(this.data, function (record) {
      that.map[record[key]] = record[val]
      html +=
        '<option style="padding:3px 0 3px 3px;" value="' +
        record[key] +
        '">' +
        record[val] +
        '</option>'
    })
    that.selectHtml = html
  }

  Obj.prototype.getName = function (key) {
    return this.map[key]
  }
  Obj.prototype.getSelect = function () {
    return this.selectHtml
  }
  return new Obj(DbData)
}

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

exports.bling = function (blingTimes, frequency, $elements, color) {
  blingTimes = blingTimes * 2 + 1
  var blingCount = 1

  setTimeout(function change() {
    if (blingCount < blingTimes) {
      if (blingCount++ % 2 === 0) {
        $elements.css('background-color', '')
      } else {
        $elements.css('background-color', color)
      }
      setTimeout(change, frequency)
    }
  }, 0)
}

exports.uuidGenerator = function (len, radix) {
  // var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('')
  var uuid = [],
    i
  radix = radix || chars.length

  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)]
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
  $('#content').on('click touchend', '[name=submit-clean]', (e) => {
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

// 查詢sql的key結尾若為單引號與跳脫字元(反斜線)會導致sql語法錯誤
// 因此皆加入跳脫字元單反斜線，才能正常顯示單引號與單反斜線

exports.checkEscapeSymbol = function (str) {
  var temp
  var result
  if (str == null) {
    return str
  } else {
    temp = str.replace(/\\/g, '\\\\')
    result = temp.replace(/'/g, "\\'")
    return result
  }
}
// 驗正,<>半形全形空白
exports.symbolValidation = function (str) {
  var regSymbol = /[,"<>\v\s\u0020\u0085\u00A0\u1680\u180E\u2000-\u200A\u2028\u2029\u202F\u205F\u2060\u3000\ufeff\ufffe]/
  if (regSymbol.test(str)) {
    return true
  }
}
