/** 步驟Modal
 * 適用Modal內容需要一步步引導/顯示的情境
 */
class StepModal {
  constructor(config) {
    this.$el = {
      modal: config.$modal,
      modalTitle: config.$modal.find('.modal-title'),
      modalBody: config.$modal.find('.modal-body'),
      modalFooter: config.$modal.find('.modal-footer'),
      nextBtn: config.$nextBtn,
      // prevBtn: config.$prevBtn,
      // cancelBtn: config.$cancelBtn,
    }
    this.store = config.store
    this.nextLoadingBtn = servkit.loadingButton(config.$nextBtn[0])
    // this.prevLoadingBtn = servkit.loadingButton(config.$prevBtn[0]);
    this.maxStep = config.maxStep
    this.hooks = config.hooks
    this.canStepBackward = !!config.canStepBackward // undefined => false
    this.initStep = config.initStep || 1
    this.stepNameList = config.stepNameList
    this.hasStepName = !!this.stepNameList
    this.config = config
    this.bindEvent()
    this.$steps = config.$modal.find('.step')
    this.reset()
  }
  reset() {
    /** 重置
     * 跳回初始步驟
     */
    this.jump(this.initStep)
  }
  bindEvent() {
    /**
     * 綁定事件
     */
    const self = this

    self.$el.nextBtn.on('click', function () {
      self.nextLoadingBtn.doing()
      self.stepForward().then(() => self.nextLoadingBtn.done())
    })

    // self.$el.prevBtn
    //   .on('click', function () {
    //     self.prevLoadingBtn.doing();
    //     self.prev()
    //       .then(() => self.prevLoadingBtn.done());
    //   });

    // self.$el.cancelBtn
    //   .on('click', function () {
    //     self.$modal.modal('hide');
    //   });
  }
  stepForward() {
    /** 下一步
     * 如果再afterValidate時回傳res({ step })就可以跳步
     */
    if (this.currStep + 1 > this.maxStep) {
      return
    }
    return this.excecuteHook('validate', this.currStep)
      .then((data) => {
        return this.excecuteHook('afterValidate', this.currStep)
      })
      .then((data = {}) => {
        this.currStep = data.step || this.currStep + 1
        this.render()
        return this.excecuteHook('init', this.currStep)
      })
      .catch((error) => {
        console.log(error)
        this.nextLoadingBtn.done()
      })
  }
  excecuteHook(hookName, step) {
    /** 執行處理函式
     * 對應步驟名稱和步驟數
     */
    return new Promise((res, rej) => {
      if (
        this.hooks[hookName] &&
        this.hooks[hookName][
          this.hasStepName ? this.stepNameList[step - 1] : step
        ]
      ) {
        this.hooks[hookName][
          this.hasStepName ? this.stepNameList[step - 1] : step
        ].call(this, res, rej)
      } else {
        res()
      }
    })
  }
  getStep(step) {
    /** 取得步驟名稱和步驟數的對應
     */
    let result
    switch (typeof step) {
      case 'string':
        result = this.stepNameList.findIndex(step) + 1
        break
      case 'number':
        result = step
        break
    }
    return result
  }
  // prev () {
  //   return this.goStep(this.currStep - 1);
  // }
  render() {
    /** 顯示 / 隱藏該步驟的元素 */
    this.$steps.each((i, el) => {
      el.classList.toggle(
        'hide',
        !el.classList.contains('step-' + this.currStep)
      )
    })
    this.$el.nextBtn.toggleClass('hide', this.currStep === this.maxStep)
    if (this.canStepBackward) {
      this.$el.prevBtn.toggleClass('hide', this.currStep === 1)
    }
  }
  jump(step) {
    /** 跳步 */
    this.currStep = step
    this.render()
    return this.excecuteHook('init', this.currStep)
  }
}
exports.StepModal = () => StepModal
