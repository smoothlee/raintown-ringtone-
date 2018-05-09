import { get, post } from "../utils/network.js"
const util = require("../utils/util.js")

function loadPages(params, successCallback, failCallback) {
  var requestUrl = getApp().globalData.host + "/pages"
  requestUrl = util.formatUrl(requestUrl);
  get(requestUrl, params)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}

function loadPage(params, successCallback, failCallback) {
  var requestUrl = getApp().globalData.host + "/page"
  requestUrl = util.formatUrl(requestUrl);
  console.log(requestUrl)
  get(requestUrl, params)
    .then(data => {
      successCallback(data)
    })
    .catch(e => {
      failCallback(e)
    })
}
function loadPageCells(params, successCallback, failCallback) {
  var requestUrl = getApp().globalData.host + "/forward"
  requestUrl = util.formatUrl(requestUrl);
  get(requestUrl, params)
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
  loadPages: loadPages,
  loadPage: loadPage,
  loadPageCells: loadPageCells,
  test: test
}