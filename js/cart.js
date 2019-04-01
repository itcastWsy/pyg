"use strict";

$(function () {
  /* 
  1 权限验证  
    已经登录 继续执行下面的流程
    未登录 要跳转到 登录页面 
      1 存当前的页面 $.setPageUrl();
      2 再去跳转到登录页面
  2 发送请求 开始渲染数据 
  
     */
  init();

  function init() {
    // 1 开始验证
    if (!$.isLogin()) {
      // 未登录
      $.setPageUrl();

      // 跳转页面 要不要等待一会再？？？
      // 购物车页面 必须要登录后才可以看到里面东西
      location.href = "login.html";
    } else {
      // 通过验证
      $("body").fadeIn();
      queryCart();
      eventList();
    }
  }

  // 绑定一坨事件
  function eventList() {
    // 绑定增加减少的按钮的事件 要注意使用委托的方式
    $(".cart_list").on("tap", ".mui-numbox .mui-btn", function () {
      // console.log(123);
      // 计算总的价格
      cart_count();
    });

    // 编辑按钮
    $("#edit_btn").on("tap", function () {
      // console.log("编辑了");
      // 切换class
      $("body").toggleClass("editCls");
      if ($("body").hasClass("editCls")) {
        // 把按钮文本 编辑 ->完成
        $("#edit_btn").text("完成");
      } else {
        $("#edit_btn").text("编辑");
        editCart();
      }
    });

    // 删除按钮
    $("#delete_btn").on("tap", function () {
      // console.log("两个香蕉，走着走着 有一个突然摔跤？？？");
      // console.log("因为 脱衣服 。。。。");
      /* 
      1 先获取 已经勾选了的复选框的父容器 li标签的长度 
        长度为0  给出一个提示 return
      2 通过了 弹出 确认框
        取消 不执行 return。。
      3 点击确认删除 。。。。
      4 删除的接口数据分析
        1 查询的数据 [苹果，香蕉，西瓜]
        1.5 以前 只需要发送 被删除的商品到后台。。。
        2 现在  删除苹果数据 发送需要同步的数据 =>[香蕉，西瓜]
      5 获取 未被选中中的li标签 因为被选中的需要删除=不需要提交到后台的！！
      6 开始循环
        1 获取每一个li标签身上的 obj对象
        2 动态的去修改 obj.amount = li标签里面的输入框的值
        3 根据接口的规定 封装一个参数对象 infos  infos[goods_obj.goods_id]=goods_obj
      7 再执行同步数据。。。
         */

      //  1 获取已经勾选了的复选框的父容器 li标签的长度
      var $activeLis = $(".cart_list .goods_chk:checked").parents("li");
      // console.log($activeLis);
      if ($activeLis.length == 0) {
        // 未选中
        mui.toast("你还没有选中要删除的商品");
        return;
      } else {
        // 通过验证。。
        // 2 弹出确认框
        mui.confirm("您确定删除吗", "警告", ["确定", "取消"], function (eType) {
          // 判断 点击了删除 还是 取消
          if (eType.index == 0) {
            // 删除
            // 获取未被选中的li标签 数组
            var $unActiveLis = $(".cart_list .goods_chk").not(":checked").parents("li");
            // 开始同步
            syncCart($unActiveLis);
          } else if (eType.index == 1) {
            // 取消
          }
        });
      }
    });

    // 生成订单
    $(".cp_order_btn").on("tap", function () {
      /* 
      1 判断有没有商品= li  要求所有的li标签 
      2 构造参数 开始生成订单
       */

      var $lis = $(".cart_list li");
      //  1 判断长度
      if ($lis.length == 0) {
        // 不合法
        mui.toast("你还没有选购商品，快去！");
        return;
      }

      // 2 开始构造参数
      var order_obj = {
        "order_price": $(".totol_price").text(),
        "consignee_addr": "召唤师峡谷",
        "goods": []
      };

      // "goods_id":5, 商品的id
      //       "goods_number":3, 商品的购买的数量 不是库存！！！
      //       "goods_price":15 单价

      for (var i = 0; i < $lis.length; i++) {
        var li = $lis[i];
        // 获取li标签身上的obj对象
        var goods_obj = $(li).data("obj");
        // 要添加到order_obj.goods 数组里面的对象
        var tmp_obj = {
          goods_id: goods_obj.goods_id,
          goods_number: $(li).find(".mui-numbox-input").val(),
          goods_price: goods_obj.goods_price
        };

        // 添加到goods数组中
        order_obj.goods.push(tmp_obj);
      }

      // 开始生成订单
      $.post("my/orders/create", order_obj, function (result) {
        if (result.meta.status == 200) {
          // 成功
          // 给出提示信息
          // 跳转页面 - 订单页面！！！
          mui.toast(result.meta.msg);
          setTimeout(function () {
            location.href = "order.html";
          }, 1000);
        } else {
          mui.toast(result.meta.msg);
        }
      });
    });
  }

  // http://api.pyg.ak48.xyz/api/public/v1/my/cart/all
  function queryCart() {
    // var token = $.getUserInfo().token;

    // $.get post
    $.get("my/cart/all", function (result) {
      // console.log(result);
      if (result.meta.status == 200) {
        var cart_infoStr = result.data.cart_info;
        // cart_info 是一个对象 对象也是可以遍历！！！

        // console.log(cart_info);
        // 判断 有没有数据
        if (cart_infoStr) {
          var cart_info = JSON.parse(cart_infoStr);
          console.log(cart_info);
          var html = template("mainTpl", {
            data: cart_info
          });
          $(".cart_list").html(html);

          // 初始化数字输入框
          mui(".mui-numbox").numbox();
          // setInterval(function () {
          // trigger(要触发的事件名！！！)
          //   $(".mui-numbox-btn-plus").trigger("tap");
          // }, 100);

          // 计算总价格
          cart_count();
        } else {
          console.log("没有数据");
        }
      }
    });
    // $.ajax({
    //   url:"my/cart/all",
    //   // headers:{
    //   //   "Authorization" : token
    //   // },
    //   success:function (result) {
    //     console.log(result);
    //   }
    // })
  }

  /**
   * 这个是计算总价格的功能
   * @param {number} a  价格
   * @param {Boolean} b  真假
   * @param {String} c  名称
   */
  function cart_count() {
    /* 
    1 把每一种商品的数据 都绑定到了对应的li标签上 data-obj={{value}}
    2 获取所有的li 数组
    3 循环li标签
      1 先获取被循环的li标签身上 属性 data-obj
      2 再获取 obj 里面的单价
      3 再去获取 li标签 里面的一个子标签 Input-》 数量
      4 总价+= 单价 * 数量
    4 把总的价格 设置到对应的标签里面！！！
     */

    //  1 获取所有的li标签 数组  名字上 加一个$ 为了区分它是jq对象（伪数组）还是js原生的dom对象！！
    var $lis = $(".cart_list li");
    // console.log($lis);
    // 总价格
    var total_price = 0;
    for (var i = 0; i < $lis.length; i++) {
      // li 是一个js原生的dom对象
      var li = $lis[i];
      // console.dir(li);
      // 获取li标签身上的商品对象

      // h5自定义属性 命名  data- 开头  js： dom.dataset.obj  obj默认是 json字符串类型 
      // var goods_obj1=li.dataset.obj;
      // jq 获取h5自定义属性的写法  obj 默认 就是 对象类型！！！
      var goods_obj2 = $(li).data("obj");
      // console.log(goods_obj1);
      // console.log(goods_obj2);

      // 获取单价
      var tmp_price = goods_obj2.goods_price;
      // 数量 要购买的数量  从li'标签里面 找到数字输入框的值来获取
      var tmp_nums = $(li).find(".mui-numbox-input").val();

      total_price += tmp_price * tmp_nums;
    }
    // 把总的价格 设置到 对应的标签里面
    $(".totol_price").text(total_price);
  }

  // 编辑购物车
  function editCart() {

    //  1 获取所有的li标签数组
    var $lis = $(".cart_list li");
    // 0 判断有没有数据 就判断有没有li标签？？？？ 有没有长度大于1
    if ($lis.length == 0) {
      // 没有数据
      mui.toast("您还没有购买过商品，快去！！");
      return;
    }
    // 同步购物车
    syncCart($lis);
  }

  // 同步购物车
  function syncCart(lis) {
    var infos = {};
    for (var i = 0; i < lis.length; i++) {
      var li = lis[i];
      var goods_obj = $(li).data("obj");
      goods_obj.amount = $(li).find(".mui-numbox-input").val();
      infos[goods_obj.goods_id] = goods_obj;
    }
    $.post("my/cart/sync", {
      infos: JSON.stringify(infos)
    }, function (result) {

      if (result.meta.status == 200) {
        mui.toast(result.meta.msg);
        queryCart();
      }
    });
  }
});