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
                    getDisplay:function(current , code){
                        var record = current.road.record;
                        return record.sn +" "+record.name;
                    }
                } ,
                bridge: {
                    mapping: "bridgeid" ,
                    getDisplay: function(current , code){
                        var road = current.road.record;
                        var bridge = current.bridge.record;
                        var direction = current.direction.value;
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

                bujianSn: {
                    getDisplay: function(current , code){
                        return current.bujianSn.record.name;
                    }
                }, //孔,联
                bujian: {
                    getDisplay: function(current , code){
                        return current.bujian.record.name;
                    }
                },
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

        Current.prototype.set = function(key , value){
            if (!this[key]) this[key] = {};
            if (!value) return;
            var item = this[key];
            if (_.isObject(value)){
                _.extend(item , value);
                item.display = item.display || item.name || item.value;
                if (item.getDisplay){
                    item.display = item.getDisplay(this , key);
                }
            }else{
                item.value = value;
            }
        };
        Current.prototype.setInfo = function(info){
            var me = this;
            _.each(info , function(n , key){
                var item = me[key];
                if (item){
                    switch (key){
                        case "road":
                            item.record = info.roadRecord;
                            break;
                        case "bridge":
                            item.record = info.bridgeRecord;
                            break;
                    }
                    item.value = n;
                    item.display = n;
                    if (item.getDisplay){
                        item.display = item.getDisplay(me , key);
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

            distances: _.map((function(){
                var step = 0.1 ,
                    rs = [];
                for(var i = 0.1 ; i<50 ; i=(i*10000000000000+step*10000000000000)/10000000000000){
                    step = i<1 ? 0.1 : 1;
                    rs.push(i);
                }
                return rs;
            })() , function(n){
                return {name:n , value:n};
            }) ,
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
                    return _.extend(n , {name: "第"+n.sn+"孔" , value: n.sn});
                });
            } ,
            getLians: function(){
                var jointCount = current.bridge.record.jointCount;
                return _.map(_.range(1 , jointCount+1) , function(n){
                    return _.extend(n , {name:"第"+n+"联" , value:n});
                })
            } ,
            //获取部件
            getBujians: function(){
                var buweiIds = _.pluck(_.filter(db.buweis, 'bujianGroup', current.bujianGroup.value), 'id');
                var bujians = _.filter(db.bujians , function(n){
                    return _.indexOf(buweiIds , n.buweiId) > -1;
                });
                return _.map(bujians , function(n){
                    return _.extend(n , {name: n.name , value: n.id});
                });
            } ,
            getPickerColumns: function(){
                if (!this.baseColumns){
                    this.baseColumns = [
                        {name:"梁号" , code:"liang"} ,
                        {name:"形式" , code:"formal"} ,
                        {name:"距墩" , code:"dun"} ,
                        {name:"米" , code:"distance"} ,
                        {name:"位置" , code:"position"} ,
                        {name:"分类" , code:"diseaseCategory"} ,
                        {name:"类型" , code:"diseaseType"} ,
                        {name:"长" , code:"length"} ,
                        {name:"宽" , code:"width"} ,
                        {name:"高" , code:"height"} ,
                        {name:"数量" , code:"quantity"} ,
                        {name:"数量1" , code:"extquantity"} ,
                        {name:"描述" , code:"description"} ,
                        {name:"评价" , code:"diseaseEvaluate"}
                    ];
                    this.baseColumns = _.map(_.range(1,19) , function(n){
                        return {name:"code"+n , code:"code"+n , hidden:true , items:[]}
                    });
                }
                return this.baseColumns;
            } ,
            getColumnsByBujian: function(cols) {
                var resetColumns = {};
                _.each(cols , function(n , i){
                    resetColumns[i] = {
                        code: "code"+i ,
                        hidden: true
                    };
                });
                var changes = {};
                var bujian = current.bujian.record;
                var fn = this["get" + bujian.code + "Columns"];
                console.log(fn)
                if (fn) {
                    changes =  fn(cols);
                }
                //通用
                _.each(changes , function(n){
                    n.hidden = n.hidden || false;
                    /*
                    switch (n.code){
                        case "diseaseCategory":
yy
                        case "diseaseType":

                            break;
                    }
                    */
                });
                changes = _.extend(resetColumns , changes);
                return changes;
            } ,
            getSSmainColumns: function(cols){
                var cs = [
                    {name:"梁号" , code:"liang" , width:70} ,
                    {name:"形式" , code:"formal" , width:100} ,
                    {name:"距墩" , code:"dun" , width:100} ,
                    {name:"米" , code:"distance" , width:80} ,
                    {name:"位置" , code:"position" , width:100} ,
                    {name:"分类" , code:"diseaseCategory" , width:120} ,
                    {name:"类型" , code:"diseaseType" , width:120} ,
                    {name:"长" , code:"length" , hidden:true} ,
                    {name:"宽" , code:"width" , hidden:true} ,
                    {name:"高" , code:"height" , hidden:true} ,
                    {name:"数量" , code:"quantity" , hidden:true} ,
                    {name:"数量1" , code:"extquantity" , hidden:true} ,
                    {name:"描述" , code:"description" , hidden:true} ,
                    {name:"评价" , code:"diseaseEvaluate"}
                ];
                var changes = {};
                _.each(cs , function(n , i){
                    changes[i] = n;
                    switch (n.code){
                        case "formal":
                            n.items = _.map(_.filter(db.goujians , "bujianId" , current.bujian.value) , function(n){
                               return _.extend(n , {name: n.name , value: n.id});
                            });
                            break;
                        case "distance":
                            var distances = (function(){
                                var step = 0.1 ,
                                    rs = [];
                                for(var i = 0.1 ; i<50 ; i=(i*10000000000000+step*10000000000000)/10000000000000){
                                    step = i<1 ? 0.1 : 1;
                                    rs.push(i);
                                }
                                return rs;
                            })();
                            n.items = _.map(distances , function(n){
                               return {name: n , value:n};
                            });
                            break;
                        case "position":
                            var positions = ["内测腹板" , "外侧腹板" , "底板" , "外侧翼板" , "内测翼板"];
                            n.items = _.map(positions , function(n){
                                return {name: n , value:n};
                            });
                            break;
                    }
                });
                return changes;
            } ,
            getColumnsByBujianSn: function(cols){
                if (!cols) return;
                var bujian = current.bujian.record;
                var bujianSn = current.bujianSn.record;
                var changes = {};
                switch (bujian.code){
                    case "SSmain":
                        //梁号 , 孔中梁数遍历
                        var liangIndex = _.findIndex(cols , "code" , "liang");
                        changes[liangIndex] = {};
                        changes[liangIndex].items = [{name:"整梁" , value:"整梁"}].concat(_.map(_.range(1 , bujianSn.liangCount+1) , function(n){
                            return {name: n+"#" , value:n};
                        }));
                        //距离墩 , 孔号-1 , 孔好
                        var dunIndex = _.findIndex(cols , "code" , "dun");
                        changes[dunIndex] = {};
                        changes[dunIndex].items = [
                            {name: "距"+(bujianSn.sn -1)+"#"+(bujianSn.sn == 1 ? "桥台" : "桥墩") , value:bujianSn.sn-1} ,
                            {name: "距"+bujianSn.sn+"#"+(bujianSn.isLast == 1 ? "桥台" : "桥墩") , value:bujianSn.sn}
                        ];
                    break;
                }
                return changes;
            } ,

            getColumnsByPick: function(cols , code){
                if (!cols) return;
                var bujian = current.bujian.record;
                var bujianSn = current.bujianSn.record;
                var changes = {};
                switch (bujian.code){
                    case "SSmain":
                        switch (code){
                            case "formal":
                                var goujianId = current.formal.value;
                                var categoryIndex = _.findIndex(cols , "code" , "diseaseCategory");
                                var items = _.map(
                                    _.filter(db.diseaseCategorys , function(n){
                                        return (","+n.goujianIds+",").indexOf(","+goujianId+",") > -1;
                                    }) ,
                                    function(n){
                                        return _.extend(n , {name: n.name , value: n.id});
                                    }
                                );
                                changes[categoryIndex] = {};
                                changes[categoryIndex].items = items;
                                break;
                            case "diseaseCategory":
                                var categoryId = current.diseaseCategory.value;
                                var typeIndex =  _.findIndex(cols , "code" , "diseaseType");
                                var items = _.map(
                                    _.filter(db.diseaseTypes , "categoryId" , categoryId) ,
                                    function(n){
                                        return _.extend(n , {name: n.name , value: n.id});
                                    }
                                );
                                changes[typeIndex] = {};
                                changes[typeIndex].items = items;
                                var lengthIndex = _.findIndex(cols , "code" , "length");
                                var widthIndex = _.findIndex(cols , "code" , "width");
                                var quantityIndex = _.findIndex(cols , "code" , "quantity");
                                var extquantityIndex = _.findIndex(cols , "code" , "extquantity");
                                var descriptionIndex = _.findIndex(cols , "code" , "description");

                                changes[lengthIndex] = {hidden:true};
                                changes[widthIndex] = {hidden:true};
                                changes[quantityIndex] = {hidden:true};
                                changes[extquantityIndex] = {hidden:true};
                                changes[descriptionIndex] = {hidden:true};

                                switch (categoryId){
                                    case 1:
                                        changes[lengthIndex] = {
                                            name:"长m" ,
                                            items: this.distances ,
                                            hidden: false
                                        };
                                        changes[widthIndex] = {
                                            name:"宽m" ,
                                            items: this.distances ,
                                            hidden: false
                                        };
                                        break;
                                    case 2:
                                        changes[lengthIndex] = {
                                            name:"长" ,
                                            items: this.distances ,
                                            hidden: false
                                        };
                                        changes[widthIndex] = {
                                            name:"最大缝宽" ,
                                            items: this.distances ,
                                            hidden: false ,
                                            width:100
                                        };
                                        changes[quantityIndex] = {
                                            name:"条数" ,
                                            items: _.map(_.range(1,11) , function(n){
                                                return {name:n , value:n};
                                            }) ,
                                            hidden: false
                                        };
                                        changes[descriptionIndex] = {
                                            name:"状态" ,
                                            items: _.map(["已封闭","已加固" , "有崩叉" , "通长" , "渗水"] , function(n){
                                                return {name:n , value:n};
                                            }) ,
                                            hidden: false ,
                                            width:100
                                        };
                                        break;

                                    case 3:
                                        changes[quantityIndex] = {
                                            name:"电位水平" ,
                                            items: _.map(_.range(1,11) , function(n){
                                                return {name:n , value:n};
                                            }) ,
                                            hidden: false
                                        };
                                        changes[extquantityIndex] = {
                                            name:"电阻率" ,
                                            items: _.map(_.range(1,11) , function(n){
                                                return {name:n , value:n};
                                            }) ,
                                            hidden: false
                                        };
                                        break;
                                        break;
                                }
                                break;
                            case "diseaseType":
                                var type = current.diseaseType.record;
                                if (!type) return;
                                var evaluateIndex = _.findIndex(cols , "code" , "diseaseEvaluate");
                                console.log(evaluateIndex , type.evalLevel , _.range(1 , type.evalLevel+1))
                                changes[evaluateIndex] = {};
                                changes[evaluateIndex].items = _.map(_.range(1 , type.evalLevel+1) , function(n){

                                    console.log(n)
                                    return {name:n , value:1};
                                });
                                break;
                        }
                        break;


                }
                return changes;
            }

        }
    });
