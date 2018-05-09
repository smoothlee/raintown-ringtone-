Page({
  data: {
    // text:"这是一个页面"
    wxid: "refertonull"
  },
  onLoad: function (options) {
    var that = this;
    wx.getUserInfo({
      success: function (user) {
        console.log(user)
        that.setData({
          userInfo: user.userInfo,
        })
      }
    })
    var config = wx.getStorageSync("appConfig")
    that.setData({
      wxid: config.wxm_set_ringtone_wechat_number
    })
    wx.request({
      url: 'https://enter.appdao.com/media/text?app=Appwill&tag=QandA&state=10',
      method: "GET",
      success: function(res){
        if (res.data.status===0){
          that.setData({QNAs: res.data.data})
        }
      }
    })
  },
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.QNAs;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      QNAs: list
    });
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
  }
})
