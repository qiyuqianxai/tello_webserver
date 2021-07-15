"""webserver URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import *
from django.conf.urls import url

urlpatterns = [
    path('admin/', admin.site.urls),
    url(r'index/$', index),
    url(r'^get_base_info/$',get_base_info),
    url(r'^get_analysis_data/$',get_analysis_data),
    url(r'^ensure_img_state/$',ensure_img_state),
    url(r'^play_end/$',play_end),

]
