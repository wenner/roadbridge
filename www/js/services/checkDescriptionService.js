'use strict';
angular.module('bridge.services')
    .factory(
    'CheckDescriptionService',
    function ($log, $q, BaseData) {
        return {
            getDescription: function(current , disease){
                var desc;
                var bms = BaseData.bujianMap;
                /*
                 BCabutment: "桥台"
                 BCbase: "墩台基础"
                 BCbed: "河床"
                 BCdrain: "排水系统"
                 BCjoint: "伸缩缝装置"
                 BCpaving: "桥面铺装"
                 BCpier: "桥墩"
                 BCrail: "栏杆护栏"
                 BCrs: "调治构造物"
                 BCsidewalk: "人行道"
                 BCslope: "锥坡/护坡"
                 BCwingwall: "翼墙/耳墙"
                 BDlight: "照明/标志"
                 TCmain: "上部主要承重构件"
                 TCnormal: "上部一般承重构件"
                 TCsupport: "支座"
                 */
                var bujian = disease.bujian;
                var bujianCode = _.find(BaseData.bujians , function(n){
                    return n.name == bujian;
                }).code;
                var fn = this["get" + bujianCode];
                if (fn && _.isFunction(fn)) {
                    desc = fn(current , disease);
                } else {
                    desc = "test description";
                }
                console.log(desc);
                return desc;
            } ,

            //TCmain: "上部主要承重构件"
            getTCmain: function (current , disease) {
                var desc = "" , binghai = disease.binghai;
                switch(disease.leibie){
                    case "蜂窝麻面":
                    case "剥落掉角":
                    case "空洞孔洞":
                        desc = [
                            disease.kong ,
                            (disease.goujian ? "-"+disease.goujian+"#梁" : "#孔") ,
                            " 距" , binghai.dun , "墩" , binghai.distance , "m " ,
                            binghai.weizhi , " " ,
                            binghai.desc , " " ,
                            "面积为 " + binghai.length +"x"+binghai.width +"m2"
                        ].join("");
                        break;
                    case "简支桥钢架桥裂缝":
                        //11-5#梁外侧腹板跨中处水平裂缝，长1m；
                        desc = [
                            disease.kong ,
                            (disease.goujian ? "-"+disease.goujian+"#梁" : "#孔") ,
                            " "+binghai.weizhi , " " ,
                            binghai.desc , " " ,
                            " , 长 " + binghai.length +" m"
                        ].join("");
                        break;
                    default:
                        desc = "";
                        break;
                }
                return desc;
            }

        };
    }
);
