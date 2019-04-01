"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

$(function () {

  var QueryObj = {
    query: $.getUrlValue("query") || "",
    cid: $.getUrlValue("cid") || "",
    pagenum: 1,
    pagesize: 10
    // 总的页数
  };var TotalPages = 1;

  init();

  function init() {

    mui.init({
      pullRefresh: {
        container: ".pyg_view",
        down: {
          auto: true,
          callback: function callback() {
            QueryObj = {
              query: $.getUrlValue("query") || "",
              cid: $.getUrlValue("cid") || "",
              pagenum: 1,
              pagesize: 10
            };

            getGoods(function (html) {
              $(".goods_wrap").html(html);
              mui('.pyg_view').pullRefresh().endPulldownToRefresh();
              mui('.pyg_view').pullRefresh().refresh(true);
            });
          }
        },
        up: {
          callback: function callback() {
            if (QueryObj.pagenum >= TotalPages) {
              mui('.pyg_view').pullRefresh().endPullupToRefresh(true);
            } else {
              QueryObj.pagenum++;
              getGoods(function (html) {
                $(".goods_wrap").append(html);
                mui('.pyg_view').pullRefresh().endPullupToRefresh();
              });
            }
          }
        }
      }
    });

    eventList();
  }

  function eventList() {
    $(".goods_wrap,.search_list,.pyg_footer").on("tap", "a", function () {
      var href = this.href;
      location.href = href;
    });
    // 绑定点击搜索事件
    $(".query_btn").on("tap", function () {
      var query_txt = $(".query_txt").val().trim();
      if (!query_txt) {
        mui.toast("输入非法");
        return;
      }

      location.href = "goods_list.html?query=" + query_txt;
    });

    // 绑定输入事件
    var delay = -1;
    $(".query_txt").on("input", function () {
      var txt = $(this).val().trim();
      clearTimeout(delay);
      if (!txt) {
        return;
      }
      delay = setTimeout(function () {
        // 获取本地存储中的搜索历史 本地存储的库
        var searchkeys = store.get("searchkey") || [];
        var searchSet = new Set([].concat(_toConsumableArray(searchkeys)));
        searchSet.add(txt);
        store.set("searchkey", [].concat(_toConsumableArray(searchSet)));
        $.get("goods/qsearch", {
          query: txt
        }, function (result) {
          if (result.meta.status == 200) {}
          var data = result.data;
          var html = data.map(function (v, i) {
            return "<li ><a href=\"goods_detail.html?goods_id=" + v.goods_id + "\" >" + v.goods_name + "</a></li>";
          });

          $(".search_list").css("height", parseInt($("body").height()) - 45 - 45);
          $(".search_list ul").html(html);
          new IScroll(".search_list");
        });
      }, 800);
    });

    $('.mui-off-canvas-wrap').on('shown', function (event) {
      var searchkeys = store.get("searchkey") || [];
      if (searchkeys.length != 0) {
        var html = searchkeys.map(function (v, i) {
          return "<li class=\"local_word\"><a href=\"goods_list.html?query=" + v + "\" >" + v + "</a></li>";
        });
        $(".search_list ul").html(html);
      }
    });

    $(".fa-search").on("tap", function () {
      mui('.mui-off-canvas-wrap').offCanvas('show');
    });

    $(".clear_key").on("tap", function () {
      store.remove("searchkey");
      $(".search_list ul").html('');
    });
  }

  function getGoods(cb) {
    $.get("goods/search", QueryObj, function (result) {
      TotalPages = Math.ceil(result.data.total / QueryObj.pagesize);
      console.log(TotalPages);

      if (result.meta.status == 200) {
        var html = template("mainTpl", {
          data: result.data.goods
        });

        cb(html);
      }
    });
  }
});