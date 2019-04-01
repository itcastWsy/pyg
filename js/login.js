"use strict";

$(function () {
  init();

  function init() {
    eventList();
  }

  function eventList() {
    // 点击登录按钮
    $("#login_btn").on("tap", function () {
      /* 
      1 获取 输入框的值
      2 验证合法性
      3 构造参数 完成 登录！！
      4 手动把 token 存起来 
        本地存储来存  
          看需求而定！！！
         1 会话 ***** 
         2 永久
       */

      //  1 获取 输入框的值
      var username_txt = $("[name='username']").val().trim();
      var password_txt = $("[name='password']").val().trim();

      // 2 验证 
      // 验证手机号码
      if (!$.checkPhone(username_txt)) {
        mui.toast("手机号码不合法");
        return;
      }
      // 验证密码  长度不能少于6 
      if (password_txt.length < 6) {
        mui.toast("密码格式不对");
        return;
      }
      // console.log("ok");
      $.post("login", {
        username: username_txt,
        password: password_txt
      }, function (result) {
        console.log(result);

        // 成功
        if (result.meta.status == 200) {
          // 显示 用户提示  等待一会 跳？？？？  默认 首页
          // 看 有没有来源的页面  跳转来源页面
          // 没有来源页面 再跳到 首页。。。
          mui.toast(result.meta.msg);

          // 会话存储 存入用户信息 复杂数据 要先转成json 否则会导致 数据丢失！！！
          // sessionStorage.setItem("userinfo", JSON.stringify(result.data));
          $.setUserInfo(result.data);

          // 获取来源页面
          // var pageurl = sessionStorage.getItem("pageurl");
          var pageurl = $.getPageUrl();
          if (!pageurl) {
            pageurl = "../index.html";
          }
          setTimeout(function () {
            location.href = pageurl;
          }, 1000);
        } else {
          mui.toast(result.meta.msg);
        }
      });
    });
  }
});