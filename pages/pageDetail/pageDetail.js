var util = require('../../utils/util.js')


var smartPage = require("../../api/smartPage.js");
var app = getApp()

var interval
Page({
  data:{
    isLoading: false,
    isLoaded: false,
    loadMoreText: "正在努力的加载...",
    currentPageName: null,
    currentPageItems: null,
    forwardPageItem: null,
    requestPage: 1,//请求页数
    totalpage: 0,
    page: 1,
    limit: 20,
    cursor: 0,
    linkFullname: null,
    pageItemFullname: null,
    style: null,
    pageCells: [],
    isInReview: true,
    navigationBarTitle: '铃声大全',
    singleItem: {},
    ringtones: [],
    playing: false,
    music: {},
    currentPlay: {},
    position: 0,
    from_share: false,
    showModal: 0
  },
  onLoad: function(options){
    var that = this
    console.log(options)
    that.setData({
      currentPageName: options.page
    })
    if (options.title) {
      that.setData({
        navigationBarTitle: options.title
      })
      wx.setNavigationBarTitle({
        title: options.title,
      })
    }
    that.loadPage();
    that.awconfigSuccessCallback();
    if (options.fn !== undefined && options.fn !== "") {
      that.fromShare(options.fn)
      that.setData({
        from_share: true
      })
    }
  },
  onShow: function(){
    var that = this;
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        })
      }
    })
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
  onHide: function () {
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
  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {
    console.log("上拉拉加载更多...." + this.data.requestPage)
    console.log("isLoading" + this.data.isLoading);
    this.loadMore()
  },
  onPullDownRefresh: function (e) {
    var that = this;
    console.log("下拉刷新....")
    that.refresh()
  },
  scrollToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  refresh: function () {
    this.setData({
      searchResult: [],
      resultIndex: [],
      loading: false,
      loaded: false,
      loadtxt: '正在努力的加载...',
      page: 1,
      count: 20,
      maxID: "",
      loadtxt: '加载中',
      selectedIndex: 0
    })
    this.loadMore()
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
      requestPage: that.data.requestPage + 1
    })
    that.loadPageCells();
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
    var that = this
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
          console.log(event.currentTarget.dataset.du)
          var link = event.currentTarget.dataset.du
          wx.setClipboardData({
            data: link,
            success: function (res) {
              wx.showModal({
                showCancel: false,
                title: '提示',
                content: '链接已经复制在剪贴板中，请前往浏览器中打开',
              })
            }
          })
        }
      }
    })
  },
  loadPage: function () {
    var that = this;
    if (that.data.currentPageName == null || that.data.currentPageName.length == 0) {
      return;
    }
    var parmas = {
      "name": that.data.currentPageName
      //"name": 'sw_page_rt_cata_phone'
    }
    smartPage.loadPage(parmas, function (data) {
      console.log(data)
      if (data != null && data.status == 0) {
        that.setData({
          currentPageItems: data.data
        })
        for (var i = 0, length = that.data.currentPageItems.length; i < length; i++) {
          var pageItem = that.data.currentPageItems[i];
          if (pageItem != null && pageItem.preload == 0) {
            that.setData({
              forwardPageItem: pageItem
            })
            break;
          }
        }
        that.resetLoadPageCellsInfo();
        that.loadPageCells();
      }
    }, function (error) {

    });
  },
  resetLoadPageCellsInfo: function () {
    var that = this;
    that.setData({
      requestPage: that.data.requestPage,
      limit: that.data.limit,
      after: that.data.after,
      style: that.data.forwardPageItem.style,
      pageItemFullname: that.data.forwardPageItem.fullname
    })
  },
  loadPageCells: function () {
    var that = this;
    if (that.data.forwardPageItem == null || that.data.forwardPageItem.length == 0) {
      return;
    }
    that.setData({
      isLoading: true
    })
    var linkFullname = that.data.forwardPageItem.link.fullname;
    var page = that.data.requestPage;
    var limit = that.data.limit;
    var after = that.data.after;
    var style = that.data.style;
    var item = that.data.pageItemFullname;
    var params = {
      link: linkFullname,
      page: page,
      limit: limit,
      after: after,
      style: style,
      item: item
    }
    smartPage.loadPageCells(params, function (data) {
      if (data != null && data.status == 0) {
        var pageCells = data.data;
        for(var i=0, length = pageCells.length; i<length; i++){
          that.getRingtone(pageCells[i]["fullname"])
        }
        //pageCells = that.data.pageCells.concat(pageCells)
        that.setData({
          pageCells: data.pageCells,
          after: data.after,
          totalpage: data.totalpage,
        })
        if (data.info.page >= data.info.total || data.after==-1 || that.data.page > 20) {
          that.setData({
            isLoaded: true,
            loadMoreText: "没有了~"
          })
        }
        that.setData({
          isLoading: false,
        })
      }
    }, function (error) {
      that.setData({
        isLoading: false,
      })
    })
  },
  awconfigSuccessCallback: function () {
    var that = this;
    var config = wx.getStorageSync("appConfig");
    var isInReview = true
    if (config.wxm_in_review_version == app.globalData.appVersion) {
      isInReview = true
    } else {
      isInReview = false
    }
    that.setData({
      isInReview: isInReview,
      recommendTag: config.wxm_rt_recommend_tag,
      recommendSort: config.wxm_rt_recommend_sort,
      shareTitle: config.wxm_rt_share_title,
      topText: config.wxm_rt_recommend_top_text,
      hotPagesName: config.wxm_rt_hot_pages,
    })
  },
  getRingtone: function (fullname) {
    var that = this
    wx.request({
      url: 'https://ringtone.appdao.com/apiv1/ringtone?ringtoneid=' + fullname,
      success: function (res) {
        if (res.data.status === 0) {
          //console.log(res.data.data)
          let ringtones = that.data.ringtones
          ringtones.push(res.data.data)
          that.setData({
            ringtones: ringtones
          })
        }
      },
      fail: function(){
        console.log('fail')
      }
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
