"use strict";

$(function () {
  init();

  function init(params) {
    eventList();
  }

  // 绑定事件
  function eventList() {
    // 获取验证码
    $("#code_btn").on("tap", function () {
      /* 
      0 验证手机号码是否合法
        不合法 给出用户提示！！
      1 发送请求到后台 让后台 给 手机发送验证码  注意-通过控制台的数据来模拟接收到了 验证码
      1.5 禁用按钮  给按钮 添加一个属性 disabled
      2 按钮开启定时器 
        1 开始倒计 一边修改按钮的文本
      3 时间到了
        1 启用的按钮
        2 修改按钮的文本 
       */

      //  1 先获取手机 验证  属性选择器  trim:去掉值两边的空格
      var mobile_txt = $("[name='mobile']").val().trim();
      // console.log(mobile_txt);  
      //  2 网找一段正则就可以了！！！

      // 3 判断是否通过
      if (!$.checkPhone(mobile_txt)) {
        mui.toast("手机号码不合法");
        return;
      }

      // 4 构造参数发送请求 获取验证码
      $.post("users/get_reg_code", {
        mobile: mobile_txt
      }, function (result) {
        console.log(result);
        if (result.meta.status == 200) {
          // 禁用按钮
          $("#code_btn").attr("disabled", true);
          // 倒计时的总时间
          var times = 5;
          $("#code_btn").text(times + "秒后再获取");
          var timeId = setInterval(function () {
            times--;
            $("#code_btn").text(times + "秒后再获取");
            if (times == 0) {
              clearInterval(timeId);
              $("#code_btn").text("获取验证码");
              // 启用按钮  移除一个属性
              $("#code_btn").removeAttr("disabled");
            }
          }, 1000);
        } else {
          // 失败
          console.log(result);
        }
      });
    });

    // 注册按钮
    $("#register_btn").on("tap", function () {
      /* 
      1 获取一堆输入框的值
      2 按个验证
      3 构造参数 发送请求到后台
      4 请求成功=注册成功  给出一个提示 等待一会 跳转页面到- 登录页面
      5 注册失败了  给出一个提示就可以了？？？
        手机号码已经存在  
       */

      //  1 获取值
      var mobile_txt = $("[name='mobile']").val().trim();
      var code_txt = $("[name='code']").val().trim();
      var email_txt = $("[name='email']").val().trim();
      var pwd_txt = $("[name='pwd']").val().trim();
      var pwd_txt2 = $("[name='pwd2']").val().trim();
      var gender_txt = $("[name='gender']:checked").val();

      // js 打断点
      // debugger

      // 验证手机号码
      if (!$.checkPhone(mobile_txt)) {
        mui.toast("手机号码不合法");
        return;
      }

      // code_txt 只是验证格式而已 能验证它真实性吗  验证它长度 ！= 4 格式不正确！！！
      if (code_txt.length != 4) {
        mui.toast("验证码格式不正常");
        return;
      }

      // 验证邮箱
      if (!$.checkEmail(email_txt)) {
        mui.toast("邮箱不合法");
        return;
      }
      // 验证密码  长度不能少于6 
      if (pwd_txt.length < 6) {
        mui.toast("密码格式不对");
        return;
      }
      //  验证重复的密码
      if (pwd_txt != pwd_txt2) {
        mui.toast("两次密码不一致");
        return;
      }

      // 构造参数 发送 注册 
      // console.log("ok");
      // users/reg

      var regParams = {
        mobile: mobile_txt,
        code: code_txt,
        email: email_txt,
        pwd: pwd_txt,
        gender: gender_txt
      };

      $.post("users/reg", regParams, function (result) {
        // 成功
        if (result.meta.status == 200) {
          mui.toast(result.meta.msg);
          setTimeout(function () {
            location.href = "login.html";
          }, 1000);
        } else {
          // 失败
          mui.toast(result.meta.msg);
        }
      });
    });
  }
});