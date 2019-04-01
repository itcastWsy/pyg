"use strict";

$(function () {
  var CatesData;
  var LeftScroll;
  init();

  function init() {
    setHtmlFont();
    renderMain();
    eventList();
  }

  function eventList() {
    $(".menus_wrap").on("tap", "li", function () {
      $(this).addClass("active").siblings().removeClass("active");
      var index = $(this).index();
      renderRight(index);
      LeftScroll.scrollToElement(this);
    });
  }

  function renderMain() {
    var localDataStr = $.getCates();
    if (!localDataStr) {
      getCategories();
    } else {
      var localData = JSON.parse(localDataStr);
      if (Date.now() - localData.time > 1000000) {
        getCategories();
      } else {
        CatesData = localData.data;
        renderLeft();
        renderRight(0);
      }
    }
  }

  function getCategories() {
    $.get("categories", function (result) {
      if (result.meta.status == 200) {
        CatesData = result.data;
        $.setCates(CatesData);
        renderLeft();
        renderRight(0);
      } else {}
    });
  }

  function renderLeft() {
    var html = template("leftTpl", {
      data: CatesData
    });
    $(".menus_wrap").html(html).hide().fadeIn(2000);
    LeftScroll = new IScroll(".left_menu");
  }

  function renderRight(index) {
    var html2 = template("rightTpl", {
      data: CatesData[index].children
    });
    $(".right_content").html(html2).hide().fadeIn(2000);

    var nums = $(".right_content img").length;
    $(".right_content img").on("load", function () {
      nums--;
      if (nums == 0) {
        var rightScroll = new IScroll(".right_content");
      }
    });
  }

  function setHtmlFont() {
    var baseVal = 100;
    var pageWidth = 375;
    var screenWidth = document.querySelector("html").offsetWidth;
    var fs = screenWidth * baseVal / pageWidth;
    document.querySelector("html").style.fontSize = fs + "px";
  }
  window.onresize = function () {
    setHtmlFont();
  };
});