'use strict';
angular.module('bridge.services')
.factory('checkSwipeCustomDataService', function (
        $q, $http, $log, $util ,
        EnvService , DataBaseService
){
    var current , cols , bujian , bujianSn , changes , srv;
    return {
        current: null ,
        cols: null ,
        getCustomData: function(c , cs , s){
            srv = s;
            current = c;
            cols = cs;
            bujian = current.bujian.record;
            bujianSn = current.bujianSn.record;
            changes = {};
            var fn = "get"+bujian.code.substring(0,2)+bujian.code.substring(2,3).toUpperCase()+bujian.code.substring(3);
            try{
                eval(fn+"()");
            }catch(e){
                console.log("error on "+fn+":"+e.message);
            }
            return changes;
        }
    };

    function getList(items , field , options){
        options = options || {};
        var itemPrefix = options.itemPrefix || "" ,
            itemSuffix = options.itemSuffix || "" ,
            itemsPrefix = options.itemsPrefix || [] ,
            itemsSuffix = options.itemsSuffix || [] ,
            field = field || options.field;
        if (!field) return;
        items = _.map(items, function (n) {
            n.name = itemPrefix +n.name+itemSuffix;
            return n;
        });
        var index = _.findIndex(cols, "code", field);
        changes[index] = {};
        changes[index].items = itemsPrefix.concat(items).concat(itemsSuffix);
    }

    function getLiang(options){
        var items = _.map(_.range(1, bujianSn.liangCount + 1), function (n) {
            return {name: n+"#" , value: n};
        });
        getList(items , "liang" , options);
    }

    function getDun(options){
        var items = [
            {name: (bujianSn.sn - 1) + "#" + (bujianSn.sn == 1 ? "桥台" : "桥墩"),value: bujianSn.sn - 1},
            {name: bujianSn.sn + "#" + (bujianSn.isLast == 1 ? "桥台" : "桥墩"), value: bujianSn.sn}
        ];
        getList(items , "dun" , options);
    }

    function getAbutment(){
        var kongs = srv.bujianSns;
        var items = [
            {name: (kongs[0].sn - 1)+"#台" , value:kongs[0].sn - 1} ,
            {name: (kongs[kongs.length-1].sn)+"#台" , value:kongs[kongs.length-1].sn}
        ];
        getList(items , "dun");
    }

    //主要承重
    function getSSMain(){
        //梁号 , 孔中梁数遍历
        getLiang({
            itemsPrefix: [{name: "整梁",value: "整梁"}]
        });
        //距离墩 , 孔号-1 , 孔好
        getDun({
            itemPrefix: "距"
        });
    }

    //一般承重
    function getSSNormal(){
        //梁号 , 孔中梁数遍历
        getLiang();
    }

    //支座
    function getSSBearing(){
        getDun();
        getLiang();
        var zhizuoIndex = _.findIndex(cols, "code", "zhizuo");
        changes[zhizuoIndex] = {};
        changes[zhizuoIndex].items = _.map(_.range(1, 10), function (n) {
            return {name: n+"#" , value: n};
        });
    }

    //翼墙/耳墙
    function getISWingwall(){
        getAbutment();
    }

    //锥坡/护坡
    function getISSlope(){
        getAbutment()
    }

    //桥墩
    function getISPier(){
        getDun();
        var liangIndex = _.findIndex(cols, "code", "liang");
        changes[liangIndex] = {};
        changes[liangIndex].items = _.map(_.range(1, 10), function (n) {
            return {name: n+"#" , value: n};
        });
    }

    //桥台
    function getISAbutment(){
        getAbutment();
    }

    //墩台基础
    function getISBase(){
        getDun();
    }

    //河床
    function getISBed(){
    }

    //调治构造物
    function getISRs(){
    }

    //桥面铺装
    function getBDPaving(){
    }

    //伸缩缝装置
    function getBDJoint(){
    }

    //人行道
    function getBDSidewalk(){
    }

    //栏杆护栏
    function getBDRail(){
    }

    //桥下排水系统
    function getBDDrain(){
    }

    //照明/标志
    function getBDLight(){
    }

    //桥上排水系统
    function getISDrain(){
    }

});