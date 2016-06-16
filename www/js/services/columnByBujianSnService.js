'use strict';
angular.module('bridge.services')
.factory('columnByBujianSnService', function (
        $q, $http, $log, $util ,
        EnvService , DataBaseService
){
    var current , cols , bujian , bujianSn , changes , srv;
    return {
        current: null ,
        cols: null ,
        getChanges: function(c , cs , s){
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

    function getColIndex(colCode){
        return _.findIndex(cols, "code", colCode);
    }

    function getList(items , field , options){
        options = options || {};
        var itemPrefix = options.itemPrefix || "" ,
            itemSuffix = options.itemSuffix || "" ,
            itemsPrefix = options.itemsPrefix || [] ,
            itemsSuffix = options.itemsSuffix || [] ,
            field = field || options.field;
        if (!field) return;
        items = _.map(items, function (n) {
            var item =_.isObject(n) ? n : {name: n , value:n};
            item.name = itemPrefix +item.name+itemSuffix;
            return item;
        });
        var index = getColIndex(field);
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

    function getFeng(options){
        var items = [
            {name: (bujianSn.value - 1) + "#" ,value: bujianSn.value - 1},
            {name: bujianSn.value + "#" , value: bujianSn.value}
        ];
        getList(items , "dun" , options);    }

    //主要承重
    function getSSMain(){
        //梁号 , 孔中梁数遍历
        getLiang({
            itemsPrefix: [{name: "整体",value: "整体"}]
        });
        //距离墩 , 孔号-1 , 孔好
        var dun = parseInt(bujianSn.value || "0");
        var positions =[
            "距"+(dun-1)+"#"+(dun == 1 ? "台" : "墩")+"侧" ,
            "距"+dun+"#"+(bujianSn.isLast==1 ? "台" : "墩")+"侧" ,
            "跨中" , "1/4跨" , "3/4跨" ,
            (dun-1)+"#"+(dun == 1 ? "台" : "墩")+"支点处" ,
            dun+"#"+(bujianSn.isLast==1 ? "台" : "墩")+"支点处" ,
            "悬臂端"
        ];
        getList(positions , "dun");
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
        var zhizuoIndex = getColIndex("zhizuo");
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
        var liangIndex = getColIndex("liang");
        changes[liangIndex] = {};
        changes[liangIndex].items = _.map(_.range(1, 10), function (n) {
            return {name: n+"#" , value: n};
        });
        var kong = parseInt(bujianSn.value || "0");
        var positions =[
            "外侧" , "内侧" , "底部" , "外侧悬臂根处" , "内侧悬臂根处" , "跨中处" ,
            (kong+1)+"#孔侧" , kong+"#孔侧"
        ];
        getList(positions , "position");
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
        getFeng();
    }

    //伸缩缝装置
    function getBDJoint(){
        getFeng();
    }

    //人行道
    function getBDSidewalk(){
        getFeng();
    }

    //栏杆护栏
    function getBDRail(){
        getFeng();
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
    
    //限高标志
    function getISLogo(){
    }

});