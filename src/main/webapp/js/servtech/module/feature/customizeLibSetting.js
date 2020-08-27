import i18n from '../servcloud.i18n.js'
import { servtechConfig } from '../servtech.config.js'
import { formatFileSize } from '../servkit/filesize.js'

function initJqueryValidation() {
  // jQuery validation add method
  $.validator.addMethod(
    'positiveNumber',
    function (value, element, params) {
      return (
        this.optional(element) ||
        /(^\d*\.?\d*[1-9]+\d*$)|(^[1-9]+\d*\.\d*$)/.test(value)
      )
    },
    i18n('Please_Enter_A_Decimal_Or_Integer_Greater_Than_Zero')
  )

  $.validator.addMethod(
    'positiveInteger',
    function (value, element, params) {
      return this.optional(element) || /^[1-9]\d*$/.test(value)
    },
    i18n('Please_Enter_A_Positive_Integer')
  )

  $.validator.addMethod(
    'filesize',
    function (value, element, params) {
      return (
        this.optional(element) ||
        Array.from(element.files).every(({ size }) => size < params)
      )
    },
    `檔案大小不得超過 ${formatFileSize($.validator.format('{0}'))}`
  )

  // jQuery validation i18n
  i18n.addChangeLangListener(function updateJqueryValidationMessages() {
    $.extend($.validator.messages, {
      required: i18n('Required'),
      date: i18n('Format_Error'),
      dateISO: i18n('Format_Error'),
      require_from_group: i18n('Require_From_Group'),
      digits: i18n('Please_Enter_The_Number'),
      number: i18n('Please_Enter_A_Decimal'),
      min: $.validator.format(i18n('The_Minimum_Value_Is') + '{0}'),
      max: $.validator.format(i18n('A_Maximum_Of') + '{0}'),
      maxlength: $.validator.format(i18n('Length_Should_Not_Exceed') + '{0}'),
      minlength: $.validator.format(
        i18n('Not_Less_Than_The_Length_Of') + '{0}'
      ),
      positiveNumber: i18n(
        'Please_Enter_A_Decimal_Or_Integer_Greater_Than_Zero'
      ),
      positiveInteger: i18n('Please_Enter_A_Positive_Integer'),
    })
  }, 'validate')
}

function initSelect2() {
  if (servtechConfig.ST_SELECT2_MINIMUMINPUTLENGTH) {
    $.fn.select2.defaults.minimumInputLength =
      servtechConfig.ST_SELECT2_MINIMUMINPUTLENGTH
  }
}

// select2 option.allowClear = true 時，正常顯示關閉的圖示
function select2AllowClearHelper(selectElement) {
  $(selectElement)
    .prev()
    .find('a.select2-choice .select2-search-choice-close')
    .addClass('fa fa-close')
}

// 讓 jquery.ui.dialog 的 title 可以用 HTML 字串來設定
function initJqueryUiDialog() {
  $.widget(
    'ui.dialog',
    $.extend({}, $.ui.dialog.prototype, {
      _title(title) {
        if (!this.options.title) {
          title.html('&#160;')
        } else {
          title.html(this.options.title)
        }
      },
    })
  )
}

export {
  initJqueryValidation,
  initSelect2,
  initJqueryUiDialog,
  select2AllowClearHelper,
}
