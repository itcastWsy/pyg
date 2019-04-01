"use strict";

$(function () {
  init();
  function init() {
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
      getOrders();
    }
  }

  // 发送请求去获取数据
  function getOrders() {
    $.get("my/orders/all", { type: 1 }, function (result) {
      if (result.meta.status == 200) {
        // 成功
        // 判断有没有 订单数据
        if (result.data.length == 0) {
          // 没有数据
        } else {
          // 有数据
          var html = template("mainTpl", { data: result.data });
          $(".all_order_list").html(html);
        }
      }
    });
  }
});