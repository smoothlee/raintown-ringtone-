//mine.js
var app = getApp();
Page({
  data: {
    userInfo: {},
    isVIP: false,
    isInReview: false,
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

    //that.awconfigSuccessCallback();
  },

  onReady: function () {

  },

  onShow: function () {
    var that = this;

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
                  var globalUserInfo = wx.getStorageSync('globalUserInfo')
                  if (globalUserInfo.is_vip == true) {
                    that.setData({
                      isVIP: true
                    })
                  }
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
      var globalUserInfo = wx.getStorageSync('globalUserInfo')
      if (globalUserInfo.is_vip == true) {
        that.setData({
          isVIP: true
        })
      }
    }
  },
  onShareAppMessage: function () {
    var that = this;
    var appConfig = wx.getStorageSync('appConfig')
    var shareTitle = '雨镇'

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
  goVipCenter: function () {
    var that = this;
    wx.navigateTo({
      url: '../vip/vip',
    })
  },
  goQnas: function () {
    var that = this;
    wx.navigateTo({
      url: '../tutorial/tutorial',
    })
  },
  goFeedback: function () {
    var that = this;
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  },
  addService: function () {
    wx.getStorage({
      key: 'appConfig',
      success: function (res) {
        var wxid = res.data.wxm_set_ringtone_wechat_number
        wx.setClipboardData({
          data: wxid,
          success: function(){wx.showToast({
            title: '微信号复制成功，快去添加好友吧',
            icon: 'none'
          })}
        })
      },
    })
  },
})

