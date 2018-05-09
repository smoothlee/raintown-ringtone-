var app=getApp()
Page({
  data: {
    userInfo: {},
    inputValue: "",
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示

  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  submitIt: function () {
    var that=this;
    if (that.data.inputValue == '' || that.data.inputValue == undefined) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '请输入文字',
      })
      return
    }
    var data = {
      'text': that.data.inputValue,
      'tags': "feedback",
      'state': "0"
    }
    wx.request({
      url: 'http://enter.appdao.com/media/text?app=Appwill',
      method: "POST",
      data: data,
      success: wx.showModal({
        title: "提交成功!",
        content: '谢谢您的反馈与建议，我们将会尽快解决您的问题',
        showCancel: false,
      })
    })
 
  },
  inputValue: function (event) {
    var that = this
    that.setData({
      inputValue: event.detail.value
    })
  },
})
