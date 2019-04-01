"use strict";

$(function () {
  /* 
     
   */
  // 公共的路径
  var BaseUrl = "http://157.122.54.189:9094/";

  // 在art-template里面导入 变量
  // template.defaults.imports.log = console.log;
  if (window.template) {
    template.defaults.imports.imgurl = BaseUrl;
  }
  $.extend($, {
    // name:123
    // 获取url上的参数
    getUrlValue: function getUrlValue(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURI(r[2]);
      return null;
    },
    // 验证手机号码
    checkPhone: function checkPhone(phone) {
      if (!/^1[34578]\d{9}$/.test(phone)) {
        return false;
      } else {
        return true;
      }
    },
    // 验证邮箱
    checkEmail: function checkEmail(myemail) {
      var myReg = /^[a-zA-Z0-9_-]+@([a-zA-Z0-9]+\.)+(com|cn|net|org)$/;
      if (myReg.test(myemail)) {
        return true;
      } else {
        return false;
      }
    },
    // 把用户信息存入到 本地存储中
    setUserInfo: function setUserInfo(obj) {
      sessionStorage.setItem("userinfo", JSON.stringify(obj));
    },
    // 判断用户是否存在
    isLogin: function isLogin() {
      var userinfoStr = sessionStorage.getItem("userinfo");
      if (userinfoStr) {
        return true;
      } else {
        return false;
      }
    },
    // 获取用户信息
    getUserInfo: function getUserInfo() {
      var userinfoStr = sessionStorage.getItem("userinfo");
      return JSON.parse(userinfoStr);
    },
    // 删除用户信息
    removeUserInfo: function removeUserInfo() {
      sessionStorage.removeItem("userinfo");
    },
    // 存入当前页面的路径
    setPageUrl: function setPageUrl() {
      sessionStorage.setItem("pageurl", location.href);
    },
    // 获取当前的页面路径
    getPageUrl: function getPageUrl() {
      return sessionStorage.getItem("pageurl");
    },
    // 设置分类数据
    setCates: function setCates(catesData) {
      localStorage.setItem("cates", JSON.stringify({
        time: Date.now(),
        data: catesData
      }));
    },
    // 获取分类数据
    getCates: function getCates() {
      return localStorage.getItem("cates");
    }
  });

  // <img src="http://api.pyg.ak48.xyz/{{value2.cat_icon}}" alt="">
  // ajax发送前调用
  // 关于zepto中的ajax拦截器 只需要记得怎么用和怎么改就可以。 
  $.ajaxSettings.beforeSend = function (xhr, obj) {
    // console.log("发送之前");

    // ajax原生 对象 
    // console.log(xhr);
    obj.url = BaseUrl + "api/public/v1/" + obj.url;
    // console.log(obj);

    // 判断 公开路径还是私有路径
    // /my/
    if (obj.url.indexOf("/my/") != -1) {
      // 私有路径
      // 动态添加请求头
      // 直接通过obj 来动态的添加请求头 无效的！！！
      // obj.headers={Authorization:$.getUserInfo().token};
      // 必须要使用人家原生的xhr 对象里面方法 setRequestHeader 来设置！！！
      xhr.setRequestHeader("Authorization", $.getUserInfo().token);
    }

    // 显示正在等待 在首页的使用 还存在优化的地方！！
    $("body").addClass("waiting");
    // debugger
    // console.log(xhr);
  };

  // 发送结束了 会自动被调用
  $.ajaxSettings.complete = function () {
    $("body").removeClass("waiting");
  };

  // 扩展zepto =》给zepto添加自定义的方法或者变量 可以在后期通过 $.函数 $.变量 来使用
  // $.name   $.getUrlValue 

});