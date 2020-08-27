import { ajax } from '../servkit/ajax.js'

/**
 * 更改使用者密碼
 * @memberof module:feature
 */
// 使用者 view
const $changePwdPanel = $('.change-pwd-panel')
function resetChangePwdPanel($changePwdPanel) {
  var faClass = ['fa fa-unlock', 'fa fa-lock', 'fa fa-chain']
  $changePwdPanel.find('.input-group').each(function (i) {
    $(this).attr('class', 'input-group').find('.fa').attr('class', faClass[i])
  })
  $changePwdPanel.find('input').each(function (i) {
    $(this).val('')
  })
  $changePwdPanel.find('.has-success').removeClass('has-success')
  $changePwdPanel.find('.has-error').removeClass('has-error')
  $changePwdPanel.find('.help-block').addClass('hide')
}
function toggleChangePwdPanel(e) {
  const isOpen = !$changePwdPanel.is(':visible')
  $changePwdPanel.slideToggle(200)
  if (isOpen) {
    $changePwdPanel.find('input')[0].focus()
    $(this).find('.fa-chevron-down').css('transform', 'rotate(180deg)')
  } else {
    $(this).find('.fa-chevron-down').css('transform', 'rotate(0deg)')
    resetChangePwdPanel($changePwdPanel)
  }
}
function updatePwd(e) {
  e.preventDefault()
  // 不檢查第一個 username(hide) 的 input
  const inputEles = $changePwdPanel.find('input').toArray().slice(1)
  const $inputGroupEles = $changePwdPanel.find('.input-group')
  const emptyInput = _.find(inputEles, function (inputEle) {
    return inputEle.value === ''
  })

  if (emptyInput) {
    $(emptyInput)
      .parent()
      .addClass('has-error')
      .find('.fa')
      .attr('class', 'fa fa-warning')
    return
  }

  ajax(
    {
      url: 'api/user/changepwd',
      type: 'POST',
      data: {
        oldpwd: inputEles[0].value,
        newpwd: inputEles[1].value,
        confirmpwd: inputEles[2].value,
      },
    },
    {
      success() {
        $inputGroupEles
          .attr('class', 'input-group has-success')
          .next()
          .addClass('hide')
        $inputGroupEles.find('.fa').attr('class', 'fa fa-check')
        var lastInputFormGroup = $changePwdPanel.find('.form-group')[2]
        $(lastInputFormGroup)
          .addClass('has-success')
          .find('.help-block')
          .text('Success!')
          .removeClass('hide')
      },
      fail(data) {
        switch (data) {
          case '2004':
            var firstInputGroup = $($inputGroupEles[0])
            firstInputGroup
              .addClass('has-error')
              .find('.fa')
              .attr('class', 'fa fa-warning')
            firstInputGroup
              .next()
              .text('Old password incorrect!')
              .removeClass('hide')
            break
          case '2006':
            _.each([0, 1, 2], function (i) {
              var $inputGroup = $($inputGroupEles[i])
              if (i === 0) {
                $inputGroup
                  .attr('class', 'input-group')
                  .find('.fa')
                  .attr('class', 'fa fa-unlock')
                $inputGroup.next().addClass('hide')
              } else {
                $inputGroup
                  .addClass('has-error')
                  .find('.fa')
                  .attr('class', 'fa fa-warning')
                $inputGroup
                  .next()
                  .text('New password different!')
                  .removeClass('hide')
              }
            })
            break
          case '2007':
            var inputGroup = $($inputGroupEles[1])
            inputGroup
              .addClass('has-error')
              .find('.fa')
              .attr('class', 'fa fa-warning')
            inputGroup.next().text('Maximum length 20!').removeClass('hide')
            break
        }
      },
    }
  )
}
function cancelChangePwd(e) {
  e.preventDefault()
  $changePwdPanel.slideToggle(200)
  $('#user').find('.fa-chevron-down').css('transform', 'rotate(0deg)')
  resetChangePwdPanel($changePwdPanel)
}
function initChangePwdPanel() {
  // 當前使用者顯示，點擊可以更改密碼
  $('#user').on('click', toggleChangePwdPanel)

  $changePwdPanel
    // 送出變更密碼
    .on('click', 'button.submit-change-pwd', updatePwd)
    // 取消變更密碼
    .on('click', 'button.cancel-change-pwd', cancelChangePwd)
}

export { initChangePwdPanel }
