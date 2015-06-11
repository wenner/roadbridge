'use strict';
angular.module('bridge.services')
    .factory(
    'CheckListService',
    function ($log, $q, BaseData) {

        var getList = function (step, current) {
            //递归获取node items
            var getItemsFromNode = function (data, current) {
                var nodes = data.nodes ,
                    nodeKey = data.nodeKey ,
                    nodeKeyValue = "default" ,
                    items;
                //console.log(data)
                if (nodes) {
                    //通过NodeKey, 获取nodes中对应的Key值
                    if (nodeKey) {
                        var nodeKeys = nodeKey.split(".");
                        if (nodeKeys.length == 1) nodeKeys.push("value");
                        var nodeKeyStep = current[nodeKeys[0]];
                        if (nodeKeyStep) nodeKeyValue = nodeKeyStep[nodeKeys[1]];
                    }
                    var currentNode = nodes[nodeKeyValue] || nodes["default"];
                    items = getItemsFromNode(currentNode, current);
                } else if (data.items) {
                    items = data.items;
                }
                return items ? _.clone(items) : items;
            };

            //获取该step的列表信息
            var currentItems = [] , items = step.items;
            if (items) {
                var _items;
                //解析items
                if (_.isArray(items)) {  //数组
                    _items = items;
                } else if (_.isString(items)) { //字符串
                    _items = BaseData[items];
                } else if (_.isObject(items)) { //object
                    switch (items.type) {
                        case 'ranger':
                            var rangers = [] ,
                                min = items.min || 1 ,
                                max = items.max ,
                                step = items.step || 1 ,
                                unit = items.unit || "" ,
                                template = _.template(items.template || "第 {{index}} " + unit);
                            //min , max , step , unit
                            for (var ri = min; ri <= max; ri = ri + step) {
                                rangers.push({name: template({
                                    index: ri
                                }), value: ri});
                            }
                            _items = rangers;
                            break;
                    }
                }
                currentItems = _.clone(_items);
            } else {
                //根据上一步的值获取nodes中的items
                var nodeItems = getItemsFromNode(step, current);
                if (nodeItems) currentItems = nodeItems;
            }

            _.forEach(currentItems, function (n) {
                if (!n.value) n.value = n.name;
            }, this);
            return currentItems;
        };

        return {
            getSourceData: function(item , currentValues){
                var source;
                switch (item.code){
                    case "road":
                        source = _.find(BaseData.roads , function(n){
                            return n.id == item.value;
                        });
                        break;
                    case "direction":
                        var directions = this.getDirection(currentValues , true);
                        source = _.find(directions , function(n){
                            return n.value == item.value;
                        });
                        break;
                    case "bridge":
                        source = _.find(BaseData.bridges , function(n){
                            return n.sn == item.value;
                        });
                        break;
                    case "kong":
                        var kongs = this.getKong(currentValues , true);
                        source = _.find(kongs , function(n){
                            return n.number == item.value;
                        });
                        break;
                    case "binghai":
                        source = {
                            display: _.template(item.value.template)(item.value)
                        };
                        break;
                }
                return source;
            } ,

            getList: function (step, current) {
                var stepCode = _.capitalize(step.code);
                var fn = this["get" + stepCode];
                if (fn && _.isFunction(fn)) {
                    return fn(current);
                } else {
                    var defer = $q.defer();
                    defer.resolve(getList(step, current));
                    return defer.promise;
                }

            },
            //roads
            getRoad: function (current) {
                var defer = $q.defer();
                var roads = BaseData.roads;
                _.forEach(roads , function(n){
                    n.value = n.id;
                })
                defer.resolve(roads);
                return defer.promise;
            },
            //direction
            getDirection: function (current , notReturnPromise) {
                var defer = $q.defer();
                var road = current.road.sourceData;
                var startCity = road.startcity ,
                    endCity = road.endcity;
                var items = [
                    {name: startCity + " - " + endCity , value:"L"} ,
                    {name: endCity + " - " + startCity , value:"R"} ,
                    {name: "匝道桥" , value:"Z"}
                ];
                if (notReturnPromise == true){
                    return items;
                }
                defer.resolve(items);
                return defer.promise;
            },
            //bridges
            getBridge: function (current) {
                var defer = $q.defer();
                var road = current.road.sourceData ,
                    roadId = road.id;
                var bridges = _.filter(BaseData.bridges, function (n) {
                    return n.road == roadId;
                });
                _.forEach(bridges , function(n){
                    n.value = n.sn;
                })
                defer.resolve(bridges);
                return defer.promise;
            },
            //buwei部位
            getBuwei: function (current) {
                var defer = $q.defer();
                defer.resolve(BaseData.buweis);
                return defer.promise;
            },
            //Kong 孔号
            getKong: function (current , notReturnPromise) {
                var defer = $q.defer();
                var bridge = current.bridge.sourceData;
                var kongs = [];
                var add = function(ix , item){
                    var kong = _.clone(item);
                    delete kong.numbers;
                    kong.number = ix;
                    kong.name = ix;
                    kong.value = ix;
                    kongs.push(kong);
                };
                _.forEach(bridge.kongs, function (n) {
                    var numbers = _.trim(n.numbers).split(",");
                    _.forEach(numbers, function (m) {
                        if (m.indexOf("-")) {
                            var ms = m.split("-") ,
                                min = ms[0] ,
                                max = ms[1];
                            for(var mi = min ; mi <= max ; mi++){
                                add(mi , n);
                            }
                        } else {
                            add(m , n);
                        }
                    });
                });
                kongs = _.sortByAll(kongs, ['number']);
                if (notReturnPromise) return kongs;
                defer.resolve(kongs);
                return defer.promise;
            } ,
            //lian 联号
            getLian: function(current){
                var defer = $q.defer() ,
                    lians = [];
                for(var i = 1 ; i<= 10 ; i++){
                    lians.push({name:i});
                }
                defer.resolve(lians);
                return defer.promise;
            } ,
            //bujian 部件
            getBujian: function (current) {
                var defer = $q.defer();
                var buwei = current.buwei.value ,
                    bujians = _.filter(BaseData.bujians, function (n) {
                        return n.buwei == buwei;
                    });
                defer.resolve(bujians);
                return defer.promise;
            } ,
            //Goujian 构件 梁
            getGoujian: function(current){
                var defer = $q.defer() ,
                    kong = current.kong.sourceData ,
                    liang = kong.liang ,
                    liangs = [];
                for(var i = 1 ; i<= liang ; i++){
                    liangs.push({name:i});
                }
                defer.resolve(liangs);
                return defer.promise;
            } ,
            //Leibie 病害类别
            getLeibie: function(current){
                var defer = $q.defer() ,
                    bujian = current.bujian.value;
                //获取默认值;
                var defaultItems = _.filter(BaseData.leibies, function (n) {
                    return n.bujian == bujian && n.bujian_value == "default";
                });
                //获取bujian_value
                var bujianValue = "";
                switch (bujian){
                    case "上部主要承重构件":
                        bujianValue = current.kong.sourceData.type;
                        break;
                    case "支座":
                        bujianValue = current.bridge.sourceData["支座"];
                        break;
                    case "桥面铺装":
                        bujianValue = current.bridge.sourceData["桥面铺装"];
                        break;
                }
                var bujianItems = _.filter(BaseData.leibies, function (n) {
                    return n.bujian == bujian && n.bujian_value == bujianValue;
                });
                var leibies = bujianItems.length > 0 ? bujianItems : defaultItems;
                defer.resolve(leibies);
                return defer.promise;
            }

        };
    }
);
