var bsurl = require('bsurl.js');
var globalApp = null;

module.exports = {
  setApp: setApp,
  formatTime: formatTime,
  json2Form:json2Form,
  buildHeader: buildHeader,
  formatUrl: formatUrl,
  parseSmartLinkUrl: parseSmartLinkUrl,
  formatduration: formatduration,
  playAlrc: playAlrc,
  //toggleplay: toggleplay
}
function setApp(app) {
  console.log("app:" + app);
  globalApp = app;
}
function json2Form(json) {  
    var str = [];  
    for (var p in jformatUrlson){  
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));  
    }  
    return str.join("&");  
}  

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function buildHeader() {
  var sessionId = wx.getStorageSync("token");
  if (sessionId == null) {
    sessionId = ""
  }
  var header = {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
    "session": sessionId
  }
  return header;
}

function formatUrl(sourceUrl) {
  var that = this;
  var appName = globalApp.globalData.appName;
  var appVersion = globalApp.globalData.appVersion;
  var ir = 1
  if (globalApp.isInReview() == true) {
    ir = 1
  } else {
    ir = 0
  }
  var appendString = "&app="+appName+"&ir=" + ir + "&v="+appVersion;
  if (sourceUrl.indexOf("?") == -1) {
    if (sourceUrl.slice(-"?".length) == "?") {
      appendString = "app=" + appName + "&ir=" + ir + "&v=" + appVersion;
    } else {
      appendString = "?app=" + appName + "&ir=" + ir + "&v=" + appVersion;
    }
  }
  wx.getSystemInfo({
    success: function (res) {
      appendString = appendString.concat("&model=" + res.model),
        appendString = appendString.concat("&lang=" + res.language),
        appendString = appendString.concat("&osn=Weixin&osv=" + res.version)
      if (sourceUrl.indexOf("screen_w") == -1) {
        appendString = appendString.concat("&screen_w=750")
      }
      if (sourceUrl.indexOf("screen_h") == -1) {
        appendString = appendString.concat("&screen_h=1334")
      }
    }
  })
  var resultString = sourceUrl + appendString
  return resultString
}

function parseSmartLinkUrl(url) {
  url = url.replace("app://", "")
  var result = {}
  var query = url.split("?")[1]
  if (query == null) {
    query = url
  }
  var queryArr = query.split("&")
  queryArr.forEach(function (item) {
    // var obj = {};
    var value = item.split("=")[1]
    var key = item.split("=")[0]
    result[key] = value
    // result.push(obj);
  });
  console.log(result)
  return result
}

function formatduration(duration) {
  duration = new Date(duration);
  return formatNumber(duration.getMinutes()) + ":" + formatNumber(duration.getSeconds());
}

function playAlrc(that, app) {
  if (app.globalData.globalStop) {
    that.setData({
      playtime: '00:00',
      duration: '00:00',
      percent: 0.1,
      playing: false,
      downloadPercent: 0
    });
    return;
  }
  if (that.data.music.id != app.globalData.curplay.id) {
    that.setData({
      music: app.globalData.curplay,
      lrc: [],
      showlrc: false,
      lrcindex: 0,
      duration: formatduration(app.globalData.curplay.duration || app.globalData.curplay.dt)
    });
    wx.setNavigationBarTitle({ title: app.globalData.curplay.name });
  }
  wx.getBackgroundAudioPlayerState({
    complete: function (res) {
      var time = 0, lrcindex = that.data.lrcindex, playing = false, playtime = 0, downloadPercent = 0;
      if (res.status != 2) {
        time = res.currentPosition / res.duration * 100;
        playtime = res.currentPosition;
        downloadPercent = res.downloadPercent
        if (that.data.showlrc && !that.data.lrc.scroll) {
          for (let i in that.data.lrc.lrc) {
            var se = that.data.lrc.lrc[i];
            if (se.lrc_sec <= res.currentPosition) {
              lrcindex = i
            }
          }
        };

      } if (res.status == 1) {
        playing = true;
      }
      app.globalData.play = playing;
      that.setData({
        playtime: formatduration(playtime * 1000),
        percent: time,
        playing: playing,
        lrcindex: lrcindex,
        downloadPercent: downloadPercent
      })
    }
  });
}

function gPlay(music, app) {
  if (app.globalData.playing) {
    console.log("暂停播放");
    app.globalData.playing = false
    //app.gStop();
  } else {
    console.log("继续播放")
    app.globalData.playing = true
    app.gSeek(app.globalData.currentPosition);
  }
}

/*String format*/
String.prototype.format = function (replacements) {
  replacements = (typeof replacements === 'object') ? replacements : Array.prototype.slice.call(arguments, 0);
  return formatString(this, replacements);
}
var formatString = function (str, replacements) {
  replacements = (typeof replacements === 'object') ? replacements : Array.prototype.slice.call(arguments, 1);
  return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
    if (m == '{{') { return '{'; }
    if (m == '}}') { return '}'; }
    return replacements[n];
  });
};

String.prototype.endsWith = function (str) {
  return this.slice(-str.length) == str;
};
