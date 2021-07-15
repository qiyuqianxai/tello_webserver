// 当前使用功能
// 人体检测
body_detect = true
// 人脸检测
face_detect = false
// 人体关键点检测
keypoints_detect = false
// 识别
mask_reg = false
age_reg = false
gender_reg = false
dense_analysis = false
// 展示的当前的图片的id
img_id = 0
max_id = -1

// 播放视频
play_vedio = false
// 播放速度
normal_rate = 60
play_rate = normal_rate

// 当前视频名
current_video = "tello"


$(function () {
    // 加载按键信息
    set_click_response();
    // 获取视频列表等信息
    get_base_info()
    // 初始化读取读取显示图片图片
    show_pic();
    // 展示当前播放信息
    show_play_info();

});

// 加载网页基本信息
function get_base_info() {
    $.ajax({
        url:"/get_base_info/",
        contentType: "application/json; charset=utf-8",
        type:"GET",
        cache:false,
        success:function(data){
            //每次加载时重置一些参数
            var json_data=JSON.parse(data);
            var video_list = json_data['video_list'];//视频列表
            $('#current-video').empty();
            // 加载视频
            $.each(video_list, function (i, video_name) {
                $("#current-video").append("<option value=" + i + ">"+video_name+"</option>");
            });
            $('#current-video').on('change', function(e){
                if (e.originalEvent) {
                    let video_name = $(this).find("option:selected").text();
                    if(video_name !== current_video)
                    {
                        play_vedio = false;
                        current_video = video_name;
                        max_id = -1;
                        img_id = 0;
                        play_rate = normal_rate;
                        $('#show_img').attr("src", "images/cover.jpg");
                        show_pic();
                    }
                    console.log(current_video);
                }
            });

        },
        error:function(data){
            alert("数据加载出错，请联系管理员！");
            top.location.reload();
        }
    });
}

// 设置各个功能响应
function set_click_response() {
    // $('#body_detect').blur().on("click",function () {
    //     body_detect = true;
    //     $('#current-feature').html()
    // });
    // ai功能响应
    $('#face_detect').blur().on("click",function () {
        face_detect = true;
    });

    $('#mask_reg').blur().on("click",function () {
        mask_reg = true;
    });

    $('#age_reg').blur().on("click",function () {
        age_reg = true;
    });

    $('#gender_reg').blur().on("click",function () {
        gender_reg = true;
    });

    $('#dense_analysis').blur().on("click",function () {
        dense_analysis = true;
        dense_data_analysis();
    })

    $('.ai_feature').blur().on("click",function () {
        show_cur_function();
    })

    // 播放操作响应
    $('#play_video').blur().on("click",function () {
        play_vedio = true;
        play_rate = normal_rate;
        show_pic();
    });

    $('#play_stop').blur().on("click",function () {
       play_vedio = false;
    });

    $('#play_advance').blur().on("click",function () {
        img_id += play_rate;
    });

    $('#play_back').blur().on("click",function () {
        if(img_id - play_rate > 0)
            img_id -= play_rate;
        else
            img_id = 0;
    });

    $('#play_accelerate').blur().on("click",function () {
        if( current_video === "无人机")
        {
            alert("抱歉，播放无人机录像模式下无法加速或减速！");
        }
        else {
            if(play_rate > 10 ) play_rate -= 10;
            else alert("已经加速到最大值！");
        }
    });

    $('#play_reduce').blur().on("click",function () {
        if( current_video === "tello")
        {
            alert("抱歉，播放无人机录像模式下无法加速或减速！");
        }
        else {
            if(play_rate < 300) play_rate += 10;
            else alert("已经减速到最小值！");
        }
    })

    $('#play_end').blur().on("click",function () {
       play_vedio = false;
       max_id = -1;
       img_id = 0;
       play_rate = normal_rate;
       $.ajax({
            url: "/play_end/",
            type: "GET",
            cache:false,
            success: function (data) {
                console.log("video shutdowm!")
            },
            error: function (data) {
                alert("出现错误，请联系管理员！");
            }
       })
       $('#show_img').attr("src", "images/cover.jpg");
    });

    $('#upload_video').blur().on("click",function () {
        upload_video();
    })
}

// 展示播放内容
function show_pic() {
  if(play_vedio){
      if(img_id > max_id){
          var data=JSON.stringify({
          id: img_id,//当前index
          video: current_video,// 当前视频名称
          // 需要的ai功能
          req_face_detect:face_detect,
          req_mask_reg:mask_reg,
          req_age_reg: age_reg,
          req_gender_reg: gender_reg,
      });
      $.ajax({
        url: "/ensure_img_state/",
        type: "POST",
        cache:false,
        data:data,
        success: function (data) {
            var json_data=JSON.parse(data);
            var ok = json_data["img_state"];
            max_id = json_data["max_id"];
            // 如果后台图片已经生成
            if(ok && play_vedio)
            {
                $('#show_img').attr("src", "predictions/"+ current_video+ "/" + (img_id).toString() + ".jpg");
                img_id++;
            }
            setTimeout("show_pic()", play_rate);
        },
        error: function (data) {
            alert("出现错误，请联系管理员！");
        }
    })
      }
      else {
          $('#show_img').attr("src", "predictions/"+ current_video+ "/" + (img_id).toString() + ".jpg");
          img_id++;
          setTimeout("show_pic()", play_rate);
      }

  }

}

// 展示当前已启动的功能
function show_cur_function() {
    var html_s = "";
    if(face_detect) html_s += '<button value="face_detect" class="cur_features btn-block">人脸检测</button>';
    else
    {
        mask_reg = false;
        gender_reg = false;
        age_reg = false;
        // dense_analysis = false;
    }
    if(mask_reg) html_s += '<button value="mask_reg" class="cur_features btn-block">口罩识别</button>';
    if(gender_reg) html_s += '<button value="gender_reg" class="cur_features btn-block">性别识别</button>';
    if(age_reg) html_s += '<button value="age_reg" class="cur_features btn-block">年龄识别</button>';
    if(dense_analysis) html_s += '<button value="dense_analysis" class="cur_features btn-block">人群密度分析</button>';
    $('#current-function').html(html_s);
    $('.cur_features').blur().on("click",function () {
        var id_name = $(this).attr("value");
        console.log(id_name);
        if(id_name === "dense_analysis")
        {
            $(".data_pie").html("");
        }
        eval(id_name+"="+"false");
        show_cur_function();
    })

}

// 上传视频到服务器
function upload_video() {

}

// 展示数据分析的结果
function dense_data_analysis() {
    if(dense_analysis&&play_vedio) {
        var data=JSON.stringify({
          id: 0,//当前index
          video: current_video,// 当前视频名称
        });
        $.ajax({
            url: "/get_analysis_data/",
            type: "POST",
            data: data,
            cache:false,
            success: function (data) {
                var json_data = JSON.parse(data);
                var mask_data = json_data["mask_data"];
                var gender_data = json_data["gender_data"];
                var age_data = json_data["age_data"];
                draw_pie_chart(mask_data,"mask");
                draw_pie_chart(gender_data,"gender");
                draw_pie_chart(age_data,"age");
                setTimeout("dense_data_analysis()", 200*play_rate);
            },
            error: function (data) {
                alert("出现错误，请联系管理员！");
            }
        });
    }
}

function draw_pie_chart(task_data,target) {
    var chart = {
       plotBackgroundColor: null,
       plotBorderWidth: null,
       plotShadow: false
   };
   var title = {
      text: target+"分布"
   };
   var tooltip = {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
   };
   var plotOptions = {
      pie: {
         allowPointSelect: true,
         cursor: 'pointer',
         dataLabels: {
            enabled: true,
            format: '<b>{point.name}%</b>: {point.percentage:.1f} %',
            style: {
               color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
         }
      }
   };
   var series= [{
      type: 'pie',
      name: target+"占比",
      data: task_data,

   }];

   var json = {};
   json.chart = chart;
   json.title = title;
   json.tooltip = tooltip;
   json.series = series;
   json.plotOptions = plotOptions;
   $('#'+target+'_data_analysis').highcharts(json);
}

function show_play_info() {
    let html_s = "<p>视频名称："+current_video+"</p>"
        + "<p>播放速度："+play_rate.toString()+"</p>"
        + "<p>当前帧数："+img_id.toString()+"</p>"
        + "<p>当前帧率："+(1000/play_rate).toFixed(1).toString()+"</p>"
    $("#play_info").html(html_s)
    setTimeout("show_play_info()",play_rate);
}