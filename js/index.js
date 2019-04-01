"use strict";

$(function () {
  init();

  function init() {
    getSwiperdata();
    getCatitems();
    getGoodslist();
  }

  // 获取轮播图数据
  function getSwiperdata() {
    $.get("home/swiperdata", function (result) {
      if (result.meta.status == 200) {
        var html = template("swiperTpl", {
          data: result.data
        });
        $(".pyg_slides").html(html);

        var gallery = mui('.mui-slider');
        gallery.slider({
          interval: 1000
        });
      } else {
        console.log(result);
      }
    });
  }

  function getCatitems() {
    $.get("home/catitems", function (result) {
      if (result.meta.status == 200) {
        var html = template("navTpl", {
          data: result.data
        });
        $(".pyg_nav").html(html);
      }
    });
  }

  function getGoodslist() {
    $.get("home/goodslist", function (result) {
      // 判断
      if (result.meta.status == 200) {
        // 成功
        var html = template("listTpl", {
          data: result.data
        });
        $(".goods_list").html(html);
      } else {
        console.log(result);
      }
    });
  }
});