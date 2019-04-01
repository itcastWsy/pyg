"use strict";

$(function () {
  // 全局的商品的信息对象
  var GoodsInfo;
  init();

  function init() {

    getDetail();
    eventList();
  }

  function eventList() {
    $("#add_btn").on("tap", function () {

      if (!$.isLogin()) {
        mui.toast("请重新登录");
        $.setPageUrl();
        setTimeout(function () {
          location.href = "login.html";
        }, 1000);

        return;
      } else {

        var goodsObj = {
          cat_id: GoodsInfo.cat_id,
          goods_id: GoodsInfo.goods_id,
          goods_name: GoodsInfo.goods_name,
          goods_number: GoodsInfo.goods_number,
          goods_price: GoodsInfo.goods_price,
          goods_small_logo: GoodsInfo.goods_small_logo,
          goods_weight: GoodsInfo.goods_weight
        };

        var goodsStr = JSON.stringify(goodsObj);

        var token = $.getUserInfo().token;
        $.post("my/cart/add", {
          info: goodsStr
        }, function (result) {

          if (result.meta.status == 200) {
            mui.confirm("是否跳转到购物车页面？", "温馨提示", ["跳转", "取消"], function (eType) {
              if (eType.index == 0) {
                location.href = "cart.html";
              } else if (eType.index == 1) {
                console.log("取消");
              }
            });
          } else {
            mui.toast(result.meta.msg);
          }
        });
      }
    });
  }

  function getDetail() {
    $.get("goods/detail", {
      goods_id: $.getUrlValue("goods_id")
    }, function (result) {
      if (result.meta.status == 200) {
        GoodsInfo = result.data;
        var html = template("mainTpl", {
          data: GoodsInfo
        });
        $(".pyg_view").html(html);

        var gallery = mui('.mui-slider');
        gallery.slider({
          interval: 5000
        });
      }
    });
  }
});