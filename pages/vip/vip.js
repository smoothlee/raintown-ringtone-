var app = getApp()
Page({
  data: {
    // text:"这是一个页面"
    userInfo: {},
    tel: '',

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    var that = this
    var sessionInfo = wx.getStorageSync('sessionInfo')
    var globalUserInfo = wx.getStorageSync('globalUserInfo')
    if (!sessionInfo || !globalUserInfo) {
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.userInfo']) {
            app.checkAuth(function (res) {
              if (res.authSetting['scope.userInfo']) {
                wx.getUserInfo({
                  success: function (user) {
                    that.setData({
                      userInfo: user.userInfo,
                    })
                  }
                })
                // 已授权
                app.userLogin(function (data) {
                }, function (e) {
                  console.log('登录失败！' + res.errMsg)
                })
              } else {
                wx.showToast({
                  title: '登录失败',
                })
              }
            })
          }
        }
      })
    } else {

    }
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  postVipRequest: function (){
    //开通包月
  },
  onShareAppMessage: function () {
    var that = this;
    var appConfig = wx.getStorageSync('appConfig')
    var shareTitle = '每天更新最美壁纸'
    if (appConfig['wxm_share_title'] && appConfig['wxm_share_title'] != undefined) {
      shareTitle = appConfig['wxm_share_title']
    }
    return {
      path: '/pages/index/index',
      title: shareTitle,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  awconfigSuccessCallback: function () {
    var that = this;
    var config = wx.getStorageSync("appConfig");
    var isInReview = true
  },
  
})
