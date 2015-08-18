'use strict';

angular.module('bridge.services')
    .service("CheckCurrent", function () {
        function Current() {
            /*
            code: 代码
            value: 当前值
            display: 显示值
            mapping: 对应的数据字段名称
            record: 对应的json数据
            getDisplay: 获取显示值方法
             */
            var initValue = {
                //病害基本信息
                sn: {},
                weather: {},
                checkuser: {},
                checkdept: {},
                checkday: {},

                road: {
                    mapping: "roadid" ,
                    getDisplay:function(current , code , info){
                        var record = info.roadRecord;
                        return record.sn +" "+record.name;
                    }
                } ,
                bridge: {
                    mapping: "bridgeid" ,
                    getDisplay: function(current , coe , info){
                        var road = info.roadRecord;
                        var bridge = info.bridgeRecord;
                        var direction = info.direction;
                        //name , sn , stakeNo , 上行 , 左右 , 起点终点
                        var displays = [bridge.name , bridge.sn , bridge.stakeNo];
                        if (direction != "S"){
                            displays = displays.concat([ ,
                                road.downDirection == direction ? "下行" : "上行" ,
                                direction == "L" ? "左幅" : "右幅" ,
                                road.downDirection == direction ? road.startCity+"-"+road.endCity : road.startCity +"-"+road.endCity
                            ])
                        }else{
                            displays = displays.concat([
                                bridge.wayType == "single" ? "单幅桥" : "匝道桥"
                            ]);
                        }
                        return displays.join(" ");
                    }

                },
                direction: {},
                buwei: {},
                bujianType: {} ,
                bujianGroup: {} ,

                bujianSn: {}, //孔,联
                bujian: {},
                goujian: {},
                diseaseCategory: {mapping: "categoryid"},
                diseaseType: {mapping: "typeid"},
                evaluate: {}
            };
            _.each(initValue, function (n, key) {
                n.code = key;
                if (!n.mapping) n.mapping = key;
            });
            _.extend(this, initValue);
        }

        Current.prototype.isEmpty = function () {
            return !(this.road.value && this.bridge.value);
        };

        Current.prototype.hasBujian = function(){
            return this.bujianSn.value && this.bujian.value;
        };

        Current.prototype.set = function(key , value , description){
            if (value) this[key].value = value;
            if (description) this[key].description = description;
        };
        Current.prototype.setInfo = function(info){
            var me = this;
            _.each(info , function(n , key){
                var item = me[key];
                if (item){
                    item.value = n;
                    item.display = n;
                    if (item.getDisplay){
                        item.display = item.getDisplay(me , key , info);
                    }
                    switch (key){
                        case "road":
                            item.record = info.roadRecord;
                            break;
                        case "bridge":
                            item.record = info.bridgeRecord;
                            break;
                    }

                }
            });
        };
        return Current;

    });


angular.module('bridge.services')
    .factory(
    'CheckSwipeService',
    function ($log, $q, $timeout, UserService, StorageService,
              SwipeBaseData, CheckCurrent,
              CheckListService, CheckDescriptionService) {

        var current = new CheckCurrent();
        var result = [
            //{name:"xxx" , value:"xxx" , nextstep:"xxx"}
        ];
        var medias = [];
        var db = SwipeBaseData;

        return {
            current: current ,

            getRoads: function(){
                return db.roads;
            } ,
            getRoadById: function(id){
                return _.find(db.roads, function(road) {
                    return road.id == id;
                });
            } ,
            getBridges: function(){
                return db.bridges;
            } ,
            getBridgeById: function(id){
                return _.find(db.bridges, function(bridge) {
                    return bridge.id == id;
                });
            } ,
            getDirections: function(road , bridge){
                var downDirection = road.downDirection;
                var downIsLeft = downDirection == "L";
                var directions = [];
                //下行
                directions.push({
                    direction: downIsLeft ? "L" : "R" ,
                    text: "下行 "+(downIsLeft ? "左幅" : "右幅")+" "+road.startCity+"-"+road.endCity
                });
                //上行
                directions.push({
                    direction: downIsLeft ? "R" : "L" ,
                    text: "上行 "+(downIsLeft ? "右幅" : "左幅") +" "+road.endCity +"-"+road.startCity
                });
                return directions;
            } ,
            getWeathers: function(){
                return db.weathers;
            } ,
            getBuweis: function(){
                var buweis = db.buweis;
                var s = _.uniq(buweis, 'bujianGroup');
                return s;
            } ,
            //获取孔,联号
            getBujianSns: function(){
                var buwei = _.find(db.buweis , "bujianGroup" , current.bujianGroup.value);
                var bujianType = buwei.bujianType;
                current.bujianType.value = bujianType;

                var items;
                switch (bujianType){
                    case "kong":
                        items = this.getKongs();
                        break;
                    case "lian":
                        items = this.getLians();
                        break;
                }
                return items;
            } ,
            getKongs: function(){
                var kongs = _.filter(db.kongs , function(n){
                    return n.direction == current.direction.value && n.bridgeId == current.bridge.value;
                });
                return _.map(kongs , function(n){
                    return {name: "第"+n.sn+"孔" , value: n.sn};
                });
            } ,
            getLians: function(){
                var jointCount = current.bridge.record.jointCount;
                return _.map(_.range(1 , jointCount+1) , function(n){
                    return {name:"第"+n+"联" , value:n};
                })
            } ,
            //获取部件
            getBujians: function(){
                var buweiIds = _.pluck(_.filter(db.buweis, 'bujianGroup', current.bujianGroup.value), 'id');
                var bujians = _.filter(db.bujians , function(n){
                    return _.indexOf(buweiIds , n.buweiId) > -1;
                });
                return _.map(bujians , function(n){
                    return {name: n.name , value: n.id};
                });
            }

        }
    });
