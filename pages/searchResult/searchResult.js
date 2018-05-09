import util from '../../utils/util.js'
var app = getApp()
var interval
const RINGTONE_URL = 'https://ringtone.appdao.com/v2/search?app=WXM_Ringtones&ev=0-nrVWE2g=' + '&page={0}&limit={1}&after={2}&q={3}'
Page({
  data: {
    ringtones: [],
    page:1,
    count:20,
    cursor:0,
    playing: false,
    music: {},
    currentPlay: {},
    position: 0,
    from_share: false,
    loadtxt: "正在努力的加载...",
    showModal: 0,
  },
  onLoad: function (options) {
    var that = this
    // 页面初始化 options为页面跳转所带来的参数
    var q = options.keyword
    that.setData({
      q: q
    })
    that.setData({
      navigationBarTitle: q
    })
    wx.setNavigationBarTitle({
      title: '搜索: ' + q,
    })
    var requestUrl = 'https://ringtone.appdao.com/v2/search?app=WXM_Ringtones&ev=0-nrVWE2g=' + '&page={0}&limit={1}&after={2}&q={3}'.format(that.data.page, that.data.count, that.data.cursor, q)
    console.log(requestUrl)
    wx.request({
      url: requestUrl,
      success: function(res){
        that.setData(
          {ringtones: res.data.data}
        )
      }
    })
     if (options.fn !== undefined && options.fn !== "") {
      that.fromShare(options.fn)
      that.setData({
        from_share: true
      })
    }
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
    wx.stopBackgroundAudio({
      success: function () {
        console.log('stopped')
        clearInterval(interval)
        that.setData({
          playing: false,
          position: 0,
        })
      }
    })
  },
  onUnload: function () {
    wx.stopBackgroundAudio({
      success: function () {
        console.log('stopped')
        clearInterval(interval)
        that.setData({
          playing: false,
          position: 0,
        })
      }
    })
  },
  onUnload: function () {
    // 页面关闭
  },
  onReachBottom: function () {
    console.log("上拉拉加载更多...." + this.data.page)
    this.loadMore()
  },
  onPullDownRefresh: function (e) {
    console.log("下拉刷新....")
    this.refresh()
  },
  onHide: function () {
    clearInterval(interval)
  },
  refresh: function () {
    this.setData({
      searchResult: [],
      resultIndex: [],
      loading: false,
      loaded: false,
      loadtxt: '正在努力的加载...',
      page: 1,
      count: 36,
      maxID: "",
      loadtxt: '加载中',
      selectedIndex: 0
    })
    this.loadMore()
  },
  loadPages: function () {
    var that = this;
    var params = {
      name: that.data.hotPagesName
      //name: 'rt_pages_mini_xiaochengxu'
    }
    smartPage.loadPages(params, function (data) {
      if (data != NaN && data.status == 0) {
        that.setData({
          hotPages: data.data,
        })
      }
    }, function (error) {
      that.setData({
      })
    })
  },
  loadMore: function () {
    var that = this
    console.log("isloading:" + that.data.loading)
    if (that.data.loaded == true || that.data.loading == true) {
      return;
    }
    this.setData({
      page: this.data.page + 1,
    })
    that.setData({
      loading: true
    })
    var requestUrl = util.formatUrl(RINGTONE_URL).format(that.data.page, that.data.count, that.data.cursor, that.data.q)
    console.log(requestUrl)
    wx.request({
      url: requestUrl,
      data: {},
      method: 'GET',
      success: function (res) {
        console.log(res)
        console.log(res.data.pagination.next_page)
        if (res.data.data != NaN && res.data.data.length > 0) {
          that.setData({
            ringtones: that.data.ringtones.concat(res.data.data),
            loading: false
          })
          if (res.data.info.count < res.data.info.limit || res.data.pagination.next_page==-1 || that.data.page > 15) {
            console.log('here')
            that.setData({
              loaded: true,
              loadtxt: "没有了~"
            })
          }
        } else {
          that.setData({
            loaded: true,
            loadtxt: "没有了~"
          })
        }
      },
      fail: function () {
        that.setData({
          loading: false
        })
      },
      complete: function () {
        that.setData({
          loading: false
        })
      }
    })
  },
  prepareSmartCoverData: function (data) {
    var that = this
    var length = data.length
    for (var i = 0; i < length; i++) {
      var contentCover = data[i]
      var content = contentCover.content
      var contentInfo = JSON.parse(content)
      var linkInfo = JSON.parse(contentInfo.params.wp_forwarddata)
      contentCover['contentInfo'] = contentInfo
      contentCover['linkInfo'] = linkInfo
    }
    that.setData({
      bannerData: data
    })
  },
  togglePlay: function (event) {
    console.log('toogleplay')
    var that = this
    //play here
    let music = event.currentTarget.dataset.music
    that.playMusic(music)
  },
  toggleStop: function (event) {
    var that = this
    wx.stopBackgroundAudio({
      success: function () {
        clearInterval(interval)
        that.setData({
          playing: false,
          music: {},
          currentPlay: {},
          position: 0,
          from_share: false
        })
      }
    })
    that.setData({
      playing: false
    })
  },
  setGlobalData: function (m) {
    app.globalData.playing = true
    console.log(m.fullname)
    if (app.globalData.currentId != m.fullname) {
      app.globalData.currentPlay = m
      app.globalData.currentId = m.fullname
      app.globalData.position = 0
    }
    console.log(app.globalData)
  },
  setThisRingtone: function () {
    var that = this
    wx.navigateTo({
      url: '../vip/vip',
    })
  },
  downloadThisRingtone: function (event) {
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        console.log(res.brand)
        console.log(res.system)
        console.log(res.version)
        console.log(res.platform)
        if (res.system.indexOf('iOS') != -1) {
          console.log('ios')
          wx.navigateTo({
            url: '../activity/activity?page=28',
          })
        } else {
          console.log(event.currentTarget.dataset.fn)
          wx.navigateTo({
            url: '../android/android?fullname=' + event.currentTarget.dataset.fn,
          })
        }
      }
    })
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  search: function () {
    wx.navigateTo({
      url: '../searchResult/searchResult?keyword=' + this.data.inputVal,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  fromShare: function (fullname) {
    var that = this
    wx.request({
      url: 'https://ringtone.appdao.com/apiv1/ringtone?ringtoneid=' + fullname,
      success: function (res) {
        if (res.data.status === 0) {
          let music = res.data.data
          that.playMusic(music)
        }
      }
    })
  },
  playMusic: function (music) {
    var that = this;
    wx.playBackgroundAudio({
      dataUrl: music.url,
      title: music.name,
      coverImgUrl: music.icon,
      success: function () {
        that.data.playing = true
        clearInterval(interval)
        that.setData({
          position: 0
        });
        that.setData({
          currentId: music.fullname,
          playing: true,
          music: music,
          currentPlay: music
        });
        interval = setInterval(function () {
          wx.getBackgroundAudioPlayerState({
            success: function (res) {
              //that.setData({
              //  position: res.currentPosition
              //})
              that.setData({
                position: that.data.position + 0.1
              })
            }
          });
        }, 100)
      }
    });
  },
  onShareAppMessage: function (res) {
    var fn = ""
    if (res.from === 'button') {
      fn = res.target.dataset.fn
      console.log(fn)
    }
    var appConfig = wx.getStorageSync('appConfig')
    var shareTitle = '抖音最火铃声都在这里了'
    if (appConfig['wxm_share_title']) {
      shareTitle = appConfig['wxm_share_title']
    }
    return {
      title: shareTitle,
      path: '/pages/index/index' + "?fn=" + fn
    }
  },
  scrollToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  addService: function (event) {
    this.setData({
      showModal: 1
    })
  },
  addService2: function (event) {
    var config = wx.getStorageSync("appConfig")
    if (config.wxm_ringtone_base_url) {
      wx.navigateTo({
        url: '../activity/activity?base_url={0}&fullname={1}'.format(config.wxm_ringtone_base_url, this.data.currentId),
      })
    } else {
      this.setData({
        showModal: 2
      })
    }
  },
  hideModal: function () {
    this.setData({
      showModal: 0
    })
  },
  onCancel: function () {
    wx.getStorage({
      key: 'appConfig',
      success: function (res) {
        var wxid = res.data.wxm_set_ringtone_wechat_number
        wx.setClipboardData({
          data: wxid,
          success: function(){wx.showToast({
            title: '客服微信号复制成功，快去添加好友吧',
            icon: 'none'
          })}
        })
      },
    })
    this.hideModal()
  },
  onConfirm: function (event) {
    wx.setClipboardData({
      data: this.data.currentId.toString(),
      success: function(){wx.showToast({
        title: '复制成功，去私信给客服吧',
        icon: 'none'
      })}
    })
    this.hideModal()
  },
  copyWxid: function () {
    wx.getStorage({
      key: 'appConfig',
      success: function (res) {
        var wxid = res.data.wxm_set_ringtone_wechat_number
        wx.setClipboardData({
          data: wxid,
          success: function () {
            wx.showToast({
              title: '客服微信号复制成功，快去添加好友吧',
              icon: 'none'
            })
          }
        })
      },
    })
  },
})
