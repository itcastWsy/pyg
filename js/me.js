"use strict";

$(function () {
  init();
  function init() {
    // 权限的验证。。。
    // 权限的验证
    if (!$.isLogin()) {
      // 未登录
      $.setPageUrl();
      // 跳转页面 要不要等待一会再？？？
      // 购物车页面 必须要登录后才可以看到里面东西
      location.href = "login.html";
    } else {
      // 通过验证
      $("body").fadeIn();

      getUserinfo();
      eventList();
    }
  }

  function eventList() {
    // 退出登录功能
    $("#btn_login_out").on("tap", function () {
      /* 
      0 弹出 确认框。。。
      1 清除缓存
      2 跳转页面登录页面
      3 要不要存入一个来源页面
        看情况而定  存入一个来源页面
       */

      mui.confirm("您确定要退出吗", "提示", ["退出", "取消"], function (eType) {
        if (eType.index == 0) {
          //  退出
          // 删除缓存
          $.removeUserInfo();
          $.setPageUrl();
          location.href = "login.html";
        } else {}
      });
    });
  }

  // 获取用户信息
  function getUserinfo() {
    $.get("my/users/userinfo", function (result) {
      // 判断
      if (result.meta.status == 200) {
        // 渲染数据
        // ur_phone
        $(".username").text(result.data.user_tel);
        $(".user_email").text(result.data.user_email);
      } else {
        console.log("获取失败。。。");
      }
    });
  }
});