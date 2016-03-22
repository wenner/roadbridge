"use strict";
angular.module("bridge.config", [])
    .constant("$ionicLoadingConfig", {
        template: "<ion-spinner></ion-spinner><div style='margin-top:5px'>读取数据...</div>"
    })
    .constant("defaultConfig", {
        version: "1.2.1",
        name: "production",
        debug: !1,
        apiType: "ionicproxy" ,
        apiUrls:{
            ionicproxy: "/api1/" ,
            //penavico: "http://10.128.60.49/penavico/ws/" ,
            //internet: "http://bridge.090730.com/api/",
            //internet: "http://192.168.0.107/BridgeWebApi/api/" ,
            //internet: "http://192.168.43.179/BridgeWebApi/api/"
            internet: "http://60.29.110.104:8093/api/"
        }
    })
    .constant('defaultSetting', {
        sendFrom: true,
        saverMode: true
    });