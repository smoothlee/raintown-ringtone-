import { get, post } from "../utils/network.js"
const util = require("../utils/util.js");

const HOT_CATEGORIES_URL = "https://page.appdao.com/pages?name=sw_pages_mini_theme"

const HOT_QUERY_URL = "https://bj1-pics-proxy.appdao.com/hot_queries?screen_w=1242&screen_h=2208"

const SEARCH_BASE_URL = "https://bj1-pics-proxy.appdao.com/pics?source=wallpaper&tag=pp_ios7_hd_cn&ev=3-6Gq5&sort=hot&maxid={0}&page={1}&limit={2}&show_type="

function loadHotKeywords(successCallback, failCallback) {
  var requestUrl = util.formatUrl(HOT_QUERY_URL);
  get(requestUrl)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}

function loadMoreWallpapers(params,successCallback, failCallback) {
  var requestUrl = util.formatUrl(SEARCH_BASE_URL);
  console.log('url=====', url)
  get(url, params)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}

function test(content, successCallback, failCallback) {
  wx.showLoading({
    title: 'loading',
  })
  var url = "";
  var header = {

  };
  get(url, {}, header).then(data => {
    console.log(data)
    if (successCallback != null) {
      successCallback(data)
      if (data && data.timestamp != null && data.sign != null) {
        // if (util.verify(data.timestamp, data.sign)) {
        //   successCallback(data)
        // }
      }
    }
    wx.hideLoading();
  }).catch(e => {
    if (failCallback != null) {
      failCallback(e)
    }
    wx.hideLoading();
  })
}

module.exports = {
  loadHotKeywords: loadHotKeywords,
  test: test
}