import { context } from '../page/04_pre_scheduling.js'
import { fetchStandardSecond } from '../dataModel.js'
import { WoList, Work } from '../Work.js'

class EditScheduleModal {
  constructor($modal) {
    this.status = 'edit'
    this.$modal = $modal
    this.$editContainer = $modal.find('.edit-container')
    this.$checkContainer = $modal.find('.check-result-container')
    this.$recommendContainer = $modal.find('.recommend-result-container')
    this.$modalFooter = $modal.find('.modal-footer')
    this.$btns = {
      remove: $('#cancel-p-schedule-btn'),
      convertAssignment: $('#to-wo-m-status-btn'),
      saveAssignment: $('#transfer-to-wo-m-status-btn'),
      insertSchedule: $('#insert-p-schedule-btn'),
      inspectSchedule: $('#inspect-p-schedule-btn'),
      confirmInsert: $('#confirm-insert-btn'),
      return: $('#return-btn'),
      editSchedule: $('#edit-schedule-btn'),
    }
    this.titleStatusMap = {
      'only-recommend': '推薦列表',
      'show-check-and-recommend-result': '檢查結果和推薦列表',
      'confirm-data': '確認資料',
      'create-schedule': '新增預排',
      'edit-schedule': '編輯預排',
      'view-schedule': '檢視預排',
      'save-assignment': '轉派工',
    }
    this.$form = $('#edit-p-schedule-form')
    this.editableInputList = [
      'machine_id',
      'm_ptime',
      'm_usage',
      'schedule_quantity',
      'exp_mdate',
      'correction_time',
      'buffer_time',
    ]
    this.editType = 'create'
  }
  // 重設編輯排程
  resetModal() {
    const isCreate = this.editType === 'create'
    this.$recommendContainer.hide()
    this.$btns.inspectSchedule.data('loadingButton').done() // 開啟「檢查排程」按鈕
    this.$btns.convertAssignment.data('loadingButton').done() // 開啟「轉派工」按鈕
    this.$btns.saveAssignment.data('loadingButton').done() // 開啟「派工」按鈕
    this.$btns.insertSchedule.data('loadingButton').done() // 開啟「插入排程」按鈕
    this.$btns.remove.data('loadingButton').done() // 開啟「取消排程」按鈕
    this.toggleBtnVisibility({
      remove: !isCreate,
      convertAssignment: !isCreate,
      saveAssignment: false,
      insertSchedule: false,
      inspectSchedule: true, // 顯示「檢查排程」按鈕
    })
  }
  toggleBtnVisibility(map) {
    let loadingButton
    Object.entries(map).forEach(([btnName, isShow]) => {
      this.$btns[btnName].toggleClass('hide', !isShow)
      if (
        isShow &&
        (loadingButton = this.$btns[btnName].data('loadingButton'))
      ) {
        loadingButton.done()
      }
    })
  }
  changeStatus(status) {
    let isShowEditContainer = false
    let isShowCheckContainer = false
    let isShowRecommendContainer = false
    const btnVisibilityMap = {
      remove: false,
      convertAssignment: false,
      saveAssignment: false,
      insertSchedule: false,
      inspectSchedule: false,
      confirmInsert: false,
      return: false,
      editSchedule: false,
    }
    this.status = status
    switch (status) {
      case 'only-recommend': // 生產指令智慧推薦後
        isShowRecommendContainer = true
        btnVisibilityMap.insertSchedule = true
        this.editType = ''
        break
      case 'show-check-and-recommend-result': // 檢查排程後
        isShowCheckContainer = true
        isShowRecommendContainer = true
        btnVisibilityMap.insertSchedule = true
        btnVisibilityMap.return = true
        break
      case 'confirm-data': // 插入排程後
        isShowEditContainer = true
        this.changeFormStatus(status)
        btnVisibilityMap.confirmInsert = true
        btnVisibilityMap.return = true
        break
      case 'create-schedule': // 推拉生產指令進calendar後
        isShowEditContainer = true
        this.editType = 'create'
        this.changeFormStatus(status)
        btnVisibilityMap.inspectSchedule = true
        break
      case 'edit-schedule': // 編輯預排
        isShowEditContainer = true
        this.editType = 'update'
        this.changeFormStatus(status)
        btnVisibilityMap.inspectSchedule = true
        btnVisibilityMap.return = true
        break
      case 'view-schedule': // 點擊calendar上的預排後
        isShowEditContainer = true
        this.changeFormStatus(status)
        btnVisibilityMap.editSchedule = true
        btnVisibilityMap.convertAssignment = true
        btnVisibilityMap.remove = true
        break
      case 'save-assignment': // 轉派工後
        isShowEditContainer = true
        this.changeFormStatus(status)
        btnVisibilityMap.saveAssignment = true
        btnVisibilityMap.return = true
        break
    }
    this.$modal.find('.modal-minor-title').text(this.titleStatusMap[status])
    this.$editContainer.toggleClass('hide', !isShowEditContainer)
    this.$checkContainer.toggleClass('hide', !isShowCheckContainer)
    this.$recommendContainer.toggleClass('hide', !isShowRecommendContainer)
    this.toggleBtnVisibility(btnVisibilityMap)
  }
  changeFormStatus(status) {
    let editableSet
    let isShowWorkBy = false
    let isShowExpEdate = false
    let validator = this.$form.data('validateForm')
    if (validator) {
      validator.resetForm()
    }
    switch (status) {
      case 'confirm-data': // 插入排程後
        editableSet = new Set(['m_usage', 'buffer_time'])
        isShowExpEdate = true
        break
      case 'create-schedule': // 推拉生產指令進calendar後
      case 'edit-schedule':
        editableSet = new Set([
          'm_usage',
          'm_ptime',
          'machine_id',
          'schedule_quantity',
          'exp_mdate',
          'buffer_time',
          'correction_time',
        ])
        this.$form.find('.edit-group:eq(1)').addClass('hide')
        break
      case 'view-schedule': // 點擊calendar上的預排後
        editableSet = new Set()
        isShowExpEdate = true
        break
      case 'save-assignment': // 轉派工後
        editableSet = new Set(['work_by'])
        isShowExpEdate = true
        isShowWorkBy = true
        break
    }
    this.$form
      .find('input, select')
      .toArray()
      .forEach((el) => (el.disabled = !editableSet.has(el.name)))
    this.$form
      .find('[name=work_by]')
      .toArray()
      .forEach((el) =>
        el.closest('section').classList.toggle('hide', !isShowWorkBy)
      )
    this.$form
      .find('[name=exp_edate]')
      .toArray()
      .forEach((el) =>
        el.closest('section').classList.toggle('hide', !isShowExpEdate)
      )
  }
  fillFormData(dataList) {
    const $editGroup = this.$form.find('.edit-group')
    const promiseList = [] // 取得標工和單件用量
    $editGroup.each((i, el) => {
      el.classList.toggle('hide', !dataList[i])
    })
    dataList.forEach((data, i) => {
      $editGroup.eq(i).find('input[name=order_id]').val(data.order_id)
      $editGroup.eq(i).find('select[name=machine_id]').val(data.machine_id)
      $editGroup.eq(i).find('input[name=product_id]').val(data.product_id)
      $editGroup
        .eq(i)
        .find('input[name=m_usage]')
        .val(data.m_usage || data.mat_usage || '')
      $editGroup
        .eq(i)
        .find('input[name=schedule_quantity]')
        .val(data.schedule_quantity || WoList.getQuantity(data))
      $editGroup
        .eq(i)
        .find('input[name=exp_mdate]')
        .val(Work.toShiftTime(data.start))
      $editGroup
        .eq(i)
        .find('input[name=exp_edate]')
        .val(Work.toShiftTime(data.end))
      $editGroup
        .eq(i)
        .find('input[name=exp_date]')
        .val(data.exp_date.toFormatedDate() || '')
      $editGroup.eq(i).find('input[name=pg_seq]').val(data.pg_seq)
      $editGroup
        .eq(i)
        .find('input[name=correction_time]')
        .val(data.correction_time || 8)
      $editGroup
        .eq(i)
        .find('input[name=buffer_time]')
        .val(data.buffer_time || 24)
      let id = context.productionScheduling.getId(data)
      if (!context.productionScheduling.getData(id)) {
        id = data.order_id
      }
      $editGroup.eq(i).data({
        id: id,
        rearrangedData: data.rearrangedData,
        schedule_time: data.schedule_time,
      })
      if (data.m_ptime && data.m_ptime !== 1) {
        promiseList.push(data.m_ptime)
      } else {
        promiseList.push(
          fetchStandardSecond(data.product_id, data.machine_id, data.pg_seq)
        )
      }
      // if (data.m_usage) {
      //   promiseList.push(data.m_usage);
      // } else {
      //   promiseList.push(dataModel.fetchMatUsage(data.product_id));
      // }
    })
    return Promise.all(promiseList)
      .then((dataList) => {
        // let m_usage;
        let m_ptime
        for (let i = 0, len = dataList.length; i < len; i++) {
          m_ptime = dataList[i]
          // m_usage = dataList[i + 1];
          this.$form
            .find(`.edit-group:eq(${i}) input[name=m_ptime]`)
            .val(m_ptime === 1 ? '' : m_ptime)
          // this.$form.find(`.edit-group:eq(${i / 2}) input[name=m_ptime]`).val(m_ptime)
          // this.$form.find(`.edit-group:eq(${i / 2}) input[name=m_usage]`).val(m_usage)
        }
        // this.$modal.modal('show');
      })
      .catch((err) => {
        const isLackStdHour = /orderhistory.*stdhour/.test(err)
        const errorMsg = isLackStdHour
          ? '沒有標準工時的歷史紀錄'
          : '請聯絡系統管理員'
        this.$form.find(`.edit-group input[name=m_ptime]`).val('')
        $.smallBox({
          title: '發生錯誤',
          content: errorMsg,
          color: servkit.statusColors.alarm,
          timeout: 4000,
        })
      })
  }
  // show (dataList) {
  //   this.$form.find('[name=work_by]').closest('section').addClass('hide'); // 隱藏「校車人員」

  //   // 開啟可以編輯的部分
  //   this.editableInputList.forEach((input) => this.$form.find(`[name=${input}]`).attr('disabled', false));

  //   // 帶入資料
  //   let getMPtimePromiseList = [] // 取得標工
  //   dataList.forEach((data, index) => {
  //     this.$form.find(`.edit-group:eq(${index}) input[name=order_id]`).val(data.order_id)
  //     this.$form.find(`.edit-group:eq(${index}) select[name=machine_id]`).val(data.machine_id)
  //     this.$form.find(`.edit-group:eq(${index}) input[name=product_id]`).val(data.product_id)
  //     this.$form.find(`.edit-group:eq(${index}) input[name=m_usage]`).val(data.m_usage || '')
  //     this.$form.find(`.edit-group:eq(${index}) input[name=schedule_quantity]`).val(data.schedule_quantity || context.woList.getQuantity(data))
  //     this.$form.find(`.edit-group:eq(${index}) input[name=exp_mdate]`).val(context.woList.toShiftTime(data.start))
  //     this.$form.find(`.edit-group:eq(${index}) input[name=exp_edate]`).val(context.woList.toShiftTime(data.end))
  //     this.$form.find(`.edit-group:eq(${index}) input[name=exp_date]`).val(data.exp_date.toFormatedDate() || '')
  //     this.$form.find(`.edit-group:eq(${index}) input[name=pg_seq]`).val(data.pg_seq)
  //     this.$form.find(`.edit-group:eq(${index}) input[name=correction_time]`).val(data.correction_time || 8)
  //     this.$form.find(`.edit-group:eq(${index}) input[name=buffer_time]`).val(data.buffer_time || 24)
  //     let id = context.productionScheduling.getId(data)
  //     if (!context.productionScheduling.getData(id)) {
  //       id = data.order_id
  //     }
  //     this.$form.find(`.edit-group:eq(${index})`).data('id', id)

  //     if (data.m_ptime) {
  //       getMPtimePromiseList.push(data.m_ptime);
  //     } else {
  //       getMPtimePromiseList.push(dataModel.fetchStandardSecond(data.product_id, data.machine_id, data.pg_seq));
  //     }
  //   })

  //   Promise.all(getMPtimePromiseList)
  //     .then(mPTimeArr => {
  //       _.each(mPTimeArr, (m_ptime, index) => {
  //         this.$form.find(`.edit-group:eq(${index}) input[name=m_ptime]`).val(m_ptime)
  //       })
  //       this.$form.find(`input[name=exp_mdate]`).datetimepicker(context.datetimePickerOptions)
  //       this.$modal.modal('show');
  //     })
  // }
}

export { EditScheduleModal }
