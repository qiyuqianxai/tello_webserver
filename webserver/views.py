import os
import time
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.http import HttpResponse,HttpResponseRedirect
import json
from django.shortcuts import render, redirect
import re
from time import sleep
# 需要与算法模型代码一致
# 预测的图片存放路径
predict_dir = "/BOBO/cv_proj/webserver/static/predictions"
# 视频存放路径
videos_pth = "/BOBO/cv_proj/videos"
# 信息交流的json的路径
message_json = "/BOBO/cv_proj/message.json"

def index(request):
    return HttpResponseRedirect('/static/index.html')

# 返回video list
def get_base_info(request):
    if not os.path.exists(videos_pth):
        os.makedirs(videos_pth)
    video_list = ["tello"] + os.listdir(videos_pth)
    resp_jsondata = json.dumps({"video_list": video_list})
    return HttpResponse(resp_jsondata)

# 向算法模型传输信息并确认预测的图片是否生成
def ensure_img_state(request):
    data_json = json.loads(request.body)
    message = {
        "play_video": True,
        "video_name": data_json["video"],
        # 需要的ai功能
        "req_face_detect": data_json["req_face_detect"],
        "req_mask_reg": data_json["req_mask_reg"],
        "req_age_reg": data_json["req_age_reg"],
        "req_gender_reg": data_json["req_gender_reg"]
    }
    with open(message_json,"w",encoding="utf-8")as f:
        f.write(json.dumps(message,indent=4,ensure_ascii=False))

    img_id = data_json["id"]
    current_video = data_json["video"]
    req_json = {"max_id": -1}
    if not os.path.exists(os.path.join(predict_dir,current_video,str(img_id)+".jpg")):
        req_json["img_state"] = False
        sleep(3)
    else:
        req_json["img_state"] = True
        max_id = len([file for file in os.listdir(os.path.join(predict_dir, current_video)) if
                      file.endswith(".jpg")]) - 1
        req_json["max_id"] = max_id
    req_json = json.dumps(req_json)
    return HttpResponse(req_json)

# 获取分析的数据
def get_analysis_data(request):
    data_json = json.loads(request.body)
    img_id = data_json["id"]
    current_video = data_json["video"]

    req_json = {}
    if os.path.exists(os.path.join(predict_dir,current_video,str(img_id)+".json")):
        with open(os.path.join(predict_dir,current_video,str(img_id)+".json"),"r",encoding="utf-8")as f:
            json_data = json.load(f)
        req_json["mask_data"] = json_data["mask_data"]
        req_json["gender_data"] = json_data["gender_data"]
        req_json["age_data"] = json_data["age_data"]

    req_json = json.dumps(req_json)
    return HttpResponse(req_json)

def play_end(request):
    with open(message_json,"w",encoding="utf-8")as f:
        f.write(json.dumps({"play_video": False},indent=4,ensure_ascii=False))
    req_json = json.dumps({})
    return HttpResponse(req_json)

