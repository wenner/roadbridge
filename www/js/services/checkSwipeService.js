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
                //状态
                status: {isBase: true, value: "病害"},
                //编号
                sn: {},
                //天气
                weather: {isBase: true},
                //检查人 , string
                checkUser: {isBase: true},
                checkUserName: {isBase: true} ,
                //检查部门 , string
                checkDept: {isBase: true},
                //检查日期 , date
                checkDay: {isBase: true},
                //道路
                road: {
                    mapping: "roadId",
                    isBase: true,
                    getDisplay: function (current, code) {
                        var record = current.road.record;
                        return record.sn + " " + record.name;
                    }
                },
                //桥梁
                bridge: {
                    mapping: "bridgeId",
                    isBase: true,
                    getDisplay: function (current, code) {
                        var road = current.road.record;
                        var bridge = current.bridge.record;
                        var direction = current.direction.value;
                        //name , sn , stakeNo , 上行 , 左右 , 起点终点
                        var displays = [bridge.name, bridge.sn, bridge.stakeNo];
                        if (direction != "S") {
                            displays = displays.concat([,
                                road.downDirection == direction ? "下行" : "上行",
                                direction == "L" ? "左幅" : "右幅",
                                road.downDirection == direction ? road.startCity + "-" + road.endCity : road.startCity + "-" + road.endCity
                            ])
                        } else {
                            displays = displays.concat([
                                bridge.wayType == "single" ? "单幅桥" : "匝道桥"
                            ]);
                        }
                        return displays.join(" ");
                    }

                },
                //项目
                project: {isBase: true, mapping: "projectId"},
                //方向
                direction: {isBase: true},
                //部位
                buwei: {isBase: true, mapping: "buweiId"},
                //部位类型 kong/lian
                bujianType: {},
                //部位分组 桥上/桥下
                bujianGroup: {},

                //部件号 , x孔/x联
                bujianSn: {
                    isBase: true,
                    getDisplay: function (current, code) {
                        if (current.bujianSn.record) return current.bujianSn.record.name;
                    }
                },
                //部件 , 16个部件Id
                bujian: {
                    isBase: true,
                    mapping: "bujianId",
                    getDisplay: function (current, code) {
                        return current.bujian.record ? current.bujian.record.name : "";
                    }
                },
                //构件 , 应该是formal
                goujian: {},
                //病害类型
                diseaseCategory: {
                    isBase: true,
                    mapping: "categoryId"
                },
                //病害定性描述
                diseaseQualitative: {
                    isBase: true,
                    mapping: "qualitativeId"
                },
                //病害标度
                diseaseEvaluate: {
                    isBase: true,
                    mapping: "evaluateId"
                },
                content: {
                    isBase: true
                },
                //形式 = 构件
                formal: {
                    mapping: "goujianId"
                },
                //墩
                dun: {},
                //梁
                liang: {},
                //距离
                distance: {},
                //支座
                zhizuo: {},
                //位置
                position: {},
                //长
                length: {},
                //宽
                width: {},
                //高
                height: {},
                //数量
                quantity: {},
                //数量1
                extquantity: {},
                //描述,状态
                description: {}
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

        Current.prototype.hasBujian = function () {
            return this.bujianSn.value && this.bujian.value;
        };

        Current.prototype.set = function (key, value) {
            if (!this[key]) this[key] = {};
            if (!value) return;
            var item = this[key];
            if (_.isObject(value)) {
                _.extend(item, value);
                item.display = (value.record ? value.record.name : null)
                    || item.name
                    || item.display
                    || item.value;
                if (item.getDisplay) {
                    item.display = item.getDisplay(this, key);
                }
            } else {
                item.value = value;
            }
        };
        Current.prototype.setInfo = function (info) {
            var me = this;
            _.each(info, function (n, key) {
                var item = me[key];
                if (item) {
                    switch (key) {
                        case "road":
                            item.record = info.roadRecord;
                            break;
                        case "bridge":
                            item.record = info.bridgeRecord;
                            break;
                    }
                    item.value = n;
                    item.display = n;
                    if (item.getDisplay) {
                        item.display = item.getDisplay(me, key);
                    }
                }
            });
        };
        return Current;

    });


angular.module('bridge.services')
    .factory(
    'CheckSwipeService',
    function ($log, $q, $timeout, UserService, StorageService, $util,
              SwipeBaseData, CheckCurrent,
              DataBaseService) {

        var current = new CheckCurrent();
        var result = [
            //{name:"xxx" , value:"xxx" , nextstep:"xxx"}
        ];
        var medias = [];
        var jsdb = SwipeBaseData;

        var db = DataBaseService.db;

        return {
            current: current,
            fieldItemDatas: {
                range: {},
                select: {}
            },

            baseSql: {
                road: "select * from road order by sn",
                bridge: "select * from bridge order by sn",
                buwei: "select bujianGroup from buwei group by bujianGroup"
            },

            getBaseInfo: function (table, params) {
                var sql = this.baseSql[table] || table;
                return DataBaseService.query(sql, params || []);
            },

            //获取路线列表
            getRoads: function () {
                return this.getBaseInfo("road");
            },
            //通过Id获取路线
            getRoadById: function (id) {
                return DataBaseService.single("select * from road where id = " + id + " limit 1");
                /*
                 return _.find(jsdb.roads, function (road) {
                 return road.id == id;
                 });
                 */
            },
            //获取桥梁列表
            getBridges: function () {
                return this.getBaseInfo("bridge");
            },
            //通过ID获取桥梁
            getBridgeById: function (id) {
                return DataBaseService.single("select * from bridge where id = " + id + " limit 1");
                /*
                 return _.find(jsdb.bridges, function (bridge) {
                 return bridge.id == id;
                 });
                 */
            },
            //获取方向列表
            getDirections: function (road, bridge) {
                var defer = $q.defer();

                var downDirection = road.downDirection;
                var downIsLeft = downDirection == "L";
                var directions = [];
                //下行
                directions.push({
                    direction: downIsLeft ? "L" : "R",
                    text: "下行 " + (downIsLeft ? "左幅" : "右幅") + " " + road.startCity + "-" + road.endCity
                });
                //上行
                directions.push({
                    direction: downIsLeft ? "R" : "L",
                    text: "上行 " + (downIsLeft ? "右幅" : "左幅") + " " + road.endCity + "-" + road.startCity
                });
                defer.resolve(directions);
                return defer.promise;
            },
            //获取天气
            getWeathers: function () {
                var defer = $q.defer();
                defer.resolve(jsdb.weathers);
                return defer.promise;
                //return jsdb.weathers;
            },
            //获取部位列表
            getBuweis: function () {
                return this.getBaseInfo("buwei");
                /*
                 var buweis = jsdb.buweis;
                 var s = _.uniq(buweis, 'bujianGroup');
                 return s;
                 */
            },
            //获取孔,联号
            getBujianSns: function () {
                var me = this;
                var defer = $q.defer();
                var sql = "select * from buwei where bujianGroup = '" + current.bujianGroup.value + "' limit 1";
                return DataBaseService
                    .single(sql)
                    .then(function (buwei) {
                        var bujianType = buwei.bujianType;
                        current.bujianType.value = bujianType;
                        var items;
                        switch (bujianType) {
                            case "kong":
                                items = me.getKongs();
                                break;
                            case "lian":
                                items = me.getLians();
                                break;
                        }
                        return items;
                    });
                /*
                 var buwei = _.find(jsdb.buweis, "bujianGroup", current.bujianGroup.value);
                 var bujianType = buwei.bujianType;
                 current.bujianType.value = bujianType;
                 var items;
                 switch (bujianType) {
                 case "kong":
                 items = this.getKongs();
                 break;
                 case "lian":
                 items = this.getLians();
                 break;
                 }
                 return items;
                 */
            },
            getKongs: function () {
                var sql = "select * from bridgekong where bridgeId = ? and direction = ? order by id";
                var params = [current.bridge.value, current.direction.value];
                return DataBaseService.query(sql, params).then(function(items){
                    return _.map(items , function(n){
                        return _.extend(n, {name: "第" + n.sn + "孔", value: n.sn});
                    })
                });

                /*
                 var kongs = _.filter(jsdb.kongs, function (n) {
                 return n.direction == current.direction.value && n.bridgeId == current.bridge.value;
                 });
                 return _.map(kongs, function (n) {
                 return _.extend(n, {name: "第" + n.sn + "孔", value: n.sn});
                 });
                 */
            },
            getLians: function () {
                var defer = $q.defer();
                var jointCount = current.bridge.record.jointCount;
                var items = _.map(_.range(1, jointCount + 1), function (n) {
                    return {name: "第" + n + "联", value:n};
                });
                defer.resolve(items);
                return defer.promise
            },
            //获取部件
            getBujians: function () {
                var sql = "select * from bujian where buweiId in (select id from buwei where bujianGroup = ?) order by id";
                var params = [current.bujianGroup.value];
                return DataBaseService.query(sql, params);
                /*
                 var buweiIds = _.pluck(_.filter(jsdb.buweis, 'bujianGroup', current.bujianGroup.value), 'id');
                 var bujians = _.filter(jsdb.bujians, function (n) {
                 return _.indexOf(buweiIds, n.buweiId) > -1;
                 });
                 return _.map(bujians, function (n) {
                 return _.extend(n, {name: n.name, value: n.id});
                 });
                 */
            },

            //获取初始化列
            getPickerColumns: function () {
                if (!this.baseColumns) {
                    this.baseColumns = _.map(_.range(1, 18), function (n) {
                        return {
                            name: "code" + n,
                            code: "code" + n,
                            hidden: true,
                            items: []
                        }
                    });
                }
                return this.baseColumns;
            },
            //根据部件获取列change
            getColumnsByBujian: function (cols) {
                var defer = $q.defer(),
                    me = this;
                var promise = defer.promise;

                //reset , 将所有的都隐藏
                var resetColumns = {};
                _.each(cols, function (n, i) {
                    resetColumns[i] = {
                        code: "code" + i,
                        hidden: true,
                        value: null,
                        items: []
                    };
                });
                var bujian = current.bujian.record;
                var bujianId = current.bujian.value;
                //写入buweiId
                current.set('buwei', bujian.buweiId);

                //获取before的field
                var fieldSql = "select * from diseaseField where bujianId = ? and position = 'before' order by ix";
                DataBaseService.query(fieldSql, [bujianId])
                    .then(function (items) {
                        if (items.length == 0) {
                            defer.resolve(resetColumns);
                            return defer.promise;
                        }
                        resetColumns[cols.length - 1] = {
                            name: "评价",
                            code: "diseaseEvaluate",
                            hidden: false
                        };
                        var currentFields = items;
                        //加入病害类型,定性描述
                        currentFields = currentFields.concat([
                            {name: "病害类型", code: "diseaseCategory", width: 120, items: [], value: null},
                            {name: "定性描述", code: "diseaseQualitative", width: 120, items: [], value: null}
                            //{name:"评价" , code:"diseaseEvaluate"}
                        ]);
                        currentFields = me.getFieldItemDataByType(currentFields);

                        var changes = {};

                        //promise Functions
                        var fns = {};
                        _.each(currentFields, function (n, i) {
                            n.hidden = false;
                            switch (n.code) {
                                case "formal":
                                    fns[i] = function (field) {
                                        return DataBaseService
                                            .query(
                                            "select * from goujian where bujianId = ? order by id",
                                            [current.bujian.value]
                                        ).then(function (items) {
                                                field.items = _.map(items, function (n) {
                                                    return _.extend(n, {name: n.name, value: n.id});
                                                });
                                                return field;
                                            });
                                    }(n);
                                    /*
                                     n.items = _.map(_.filter(jsdb.goujians, "bujianId", current.bujian.value), function (n) {
                                     return _.extend(n, {name: n.name, value: n.id});
                                     });
                                     */
                                    break;
                            }
                            changes[i] = n;
                        });
                        $q.all(fns).then(function (rs) {
                            _.each(rs, function (n, key) {
                                changes[key] = n;
                            });
                            changes = _.extend(resetColumns, changes);
                            defer.resolve(changes);
                        });
                    });
                return defer.promise;
                /*
                 var currentFields = _.map(
                 _.filter(jsdb.diseaseFields, {bujianId: bujianId, position: "before"}),
                 function (n) {
                 n.items = [];
                 n.value = null;
                 return n;
                 }
                 );
                 if (currentFields.length == 0) return resetColumns;
                 resetColumns[cols.length - 1] = {
                 name: "评价",
                 code: "diseaseEvaluate",
                 hidden: false
                 };
                 //加入病害类型,定性描述
                 currentFields = currentFields.concat([
                 {name: "病害类型", code: "diseaseCategory", width: 120, items: [], value: null},
                 {name: "定性描述", code: "diseaseQualitative", width: 120, items: [], value: null}
                 //{name:"评价" , code:"diseaseEvaluate"}
                 ]);
                 currentFields = this.getFieldItemDataByType(currentFields);
                 var fn = this["get" + bujian.code + "ColumnsByBujian"];
                 if (fn) {
                 currentFields = fn.call(this, currentFields);
                 }
                 var changes = {};
                 _.each(currentFields, function (n, i) {
                 switch (n.code) {
                 case "formal":
                 n.items = _.map(_.filter(jsdb.goujians, "bujianId", current.bujian.value), function (n) {
                 return _.extend(n, {name: n.name, value: n.id});
                 });
                 break;
                 }
                 changes[i] = n;
                 n.hidden = false;
                 });
                 changes = _.extend(resetColumns, changes);

                 return changes;
                 */
            },
            getSSmainColumnsByBujian: function (columns) {
                return columns;
            },
            //根据部件号获取列changes
            getColumnsByBujianSn: function (cols) {
                var defer = $q.defer();
                if (!cols) return defer.promise;
                if (!current.bujianSn.record || !current.bujian.record) return defer.promise;
                var bujian = current.bujian.record;
                var bujianSn = current.bujianSn.record;
                var changes = {};
                switch (bujian.code) {
                    case "SSmain":
                        //梁号 , 孔中梁数遍历
                        var liangIndex = _.findIndex(cols, "code", "liang");
                        changes[liangIndex] = {};
                        changes[liangIndex].items = [{
                            name: "整梁",
                            value: "整梁"
                        }].concat(_.map(_.range(1, bujianSn.liangCount + 1), function (n) {
                                return {name: n + "#", value: n};
                            }));
                        //距离墩 , 孔号-1 , 孔好
                        var dunIndex = _.findIndex(cols, "code", "dun");
                        changes[dunIndex] = {};
                        changes[dunIndex].items = [
                            {
                                name: "距" + (bujianSn.sn - 1) + "#" + (bujianSn.sn == 1 ? "桥台" : "桥墩"),
                                value: bujianSn.sn - 1
                            },
                            {name: "距" + bujianSn.sn + "#" + (bujianSn.isLast == 1 ? "桥台" : "桥墩"), value: bujianSn.sn}
                        ];
                        break;
                    case "SSnormal":
                        //梁号 , 孔中梁数遍历
                        var liangIndex = _.findIndex(cols, "code", "liang");
                        changes[liangIndex] = {};
                        changes[liangIndex].items = _.map(_.range(1, bujianSn.liangCount + 1), function (n) {
                            return {name: n + "#", value: n};
                        });
                        break;
                }
                defer.resolve(changes);
                return defer.promise;
            },

            //根据某一列变化获取changes
            getColumnsByPick: function (cols, code) {
                if (!cols) return;
                var me = this,
                    defer = $q.defer(),
                    changes = {},
                    promiseFns = {};
                switch (code) {
                    case "formal":
                        var goujianId = current.formal.value;
                        //获取对应构件的病害类型 , 通过 形式(构件) 获取对应的分类
                        var categoryIndex = _.findIndex(cols, "code", "diseaseCategory");
                        //promise
                        promiseFns[categoryIndex] = function () {
                            var sql = "select * from DiseaseCategory where id in ( select categoryId from GoujianCategoryRelation where goujianId = ?)";
                            return DataBaseService.query(sql, [goujianId]).
                                then(function (items) {
                                    var changeItem = {};
                                    changeItem.items = _.map(items, function (n) {
                                        return _.extend(n, {name: n.name, value: n.id});
                                    });
                                    return changeItem;
                                })
                        }();
                        break;
                    case "diseaseCategory":
                        var bujian = current.bujian.record,
                            bujianSn = current.bujianSn.record,
                            bujianId = current.bujian.value,
                            goujianId = current.formal.value,
                            categoryId = current.diseaseCategory.value;
                        //获取病害定性描述列表
                        var qualitativeIndex = _.findIndex(cols, "code", "diseaseQualitative");
                        //promise
                        promiseFns[qualitativeIndex] = function () {
                            var sql = "select * from DiseaseQualitative where categoryId  = ?";
                            return DataBaseService.query(sql, [categoryId]).
                                then(function (items) {
                                    var changeItem = {};
                                    items.unshift({name:"完好" , value: 0});
                                    changeItem.items = _.map(items, function (n) {
                                        return _.extend(n, {name: n.name, value: n.id});
                                    });
                                    return changeItem;
                                })
                        }();

                        //reset after
                        var resetColumns = {};
                        for (var i = qualitativeIndex + 1; i < cols.length - 1; i++) {
                            var n = cols[i];
                            resetColumns[i] = {
                                code: "code" + i,
                                hidden: true,
                                value: null,
                                items: []
                            };
                        }

                        //获取after fields
                        //promise
                        promiseFns['aaa'] = function (index) {
                            var sql = "select * from DiseaseField where bujianId  = ? and categoryId = ? and position = 'after'";
                            return DataBaseService.query(sql, [bujianId , categoryId]).
                                then(function (items) {
                                    _.map(items , function(n){
                                        n.items = [];
                                        n.value = null;
                                    });
                                    items = _.groupBy(items , 'goujianId');
                                    var currentFields = items[goujianId] || items[0];
                                    currentFields = me.getFieldItemDataByType(currentFields);
                                    _.each(currentFields, function (n, i) {
                                        n.hidden = false;
                                        changes[i + index + 1] = n;
                                    });
                                    changes = _.extend(resetColumns, changes);
                                })
                        }(qualitativeIndex);
                        /*
                        var categoryFields = _.groupBy(_.filter(
                            jsdb.diseaseFields,
                            {bujianId: bujianId, categoryId: categoryId}
                        ), function (n) {
                            return n.goujianId;
                        });
                        _.map(categoryFields, function (n) {
                            n.items = [];
                            n.value = null;
                            return;
                        });
                        var currentFields = categoryFields[goujianId] || categoryFields[0];
                        currentFields = this.getFieldItemDataByType(currentFields);
                        var fn = this["get" + bujian.code + "ColumnsByCategory"];
                        if (fn) {
                            currentFields = fn.call(this, currentFields, code);
                        }
                        _.each(currentFields, function (n, i) {
                            n.hidden = false;
                            changes[i + qualitativeIndex + 1] = n;
                        });
                        changes = _.extend(resetColumns, changes);
                        */
                        break;
                    case "diseaseQualitative":
                        //通过定性描述获取评价
                        var qualitativeId = current.diseaseQualitative.value;
                        //if (!qualitativeId) return;
                        var evaluateIndex = _.findIndex(cols, "code", "diseaseEvaluate");
                        //promise
                        promiseFns[evaluateIndex] = function () {
                            var sql = "select * from DiseaseEvaluate where id in ( select evaluateId from qualitativeEvaluateRelation where qualitativeId = ?)";
                            return DataBaseService.query(sql, [qualitativeId])
                                .then(function (items) {
                                    var changeItem = {};
                                    changeItem.items = _.map(items, function (n) {
                                        return _.extend(n, {name: n.sn, value: n.id , text: n.name});
                                    });
                                    return changeItem;
                                })
                        }();
                        /*
                        items = _.map(_.range(1, _.random(4, 6)), function (n) {
                            return {name: n, value: n};
                        });
                        changes[evaluateIndex] = {};
                        changes[evaluateIndex].items = items;
                        */
                }
                if (!_.isEmpty(promiseFns)) {
                    $q.all(promiseFns).then(function (rs) {
                        _.each(rs, function (n, key) {
                            changes[key] = n;
                        });
                        defer.resolve(changes);
                    });
                }else{
                    defer.resolve();
                }
                return defer.promise;
            },
            getSSmainColumnsByCategorys: function (fields) {
                return fields;
            },

            //获取病害描述
            getContent: function () {
                var sql = "select * from DiseaseTemplate where bujianId = ? and goujianId = ? and categoryId = ?";
                return DataBaseService
                    .single(sql , [current.bujian.value , current.formal.value , current.diseaseCategory.value])
                    .then(function(item){
                        var template = item.template;
                        if (!template) return "";
                        template = _.template(template);
                        return template(current);
                    } , function(){
                        return "";
                    });
            },

            //通过filed type description 获取字段的itemdata
            getFieldItemDataByType: function (fields) {
                //fieldItemDatas
                _.each(fields, function (n) {
                    var type = n.type;
                    if (!type) return;
                    var items = [];
                    var description = n.description;
                    if (this.fieldItemDatas[type][description]) {
                        items = this.fieldItemDatas[type][description];
                    } else {
                        var fn = this["get" + _.capitalize(type) + "Data"];
                        if (fn) {
                            items = fn.call(this, n);
                        }
                    }
                    n.items = items;
                }, this);
                return fields;
            },
            //获取数字选项
            getRangeData: function (field) {
                var items = [];
                var description = field.description;
                if (_.isEmpty(description)) return items;
                try {
                    var desc = angular.fromJson(description);
                } catch (e) {
                    console.log(e)
                }
                if (!desc) return items;
                var getStep = function (step, number) {
                    if (_.isString(step)) step = parseFloat(step);
                    if (_.isArray(step)) {
                        var curStep = _.find(step, function (n) {
                            return n.min <= number && number < n.max;
                        });
                        step = curStep ? curStep.step : 1;
                    }
                    if (!step) step = 1;
                    return step;
                };
                var numbers = [];
                var step = getStep(desc.step, desc.min);
                for (var i = desc.min; i <= desc.max; i = (i * 10000000000000 + step * 10000000000000) / 10000000000000) {
                    step = getStep(desc.step, i);
                    numbers.push(i);
                }
                items = _.map(numbers, function (n) {
                    return {name: n, value: n};
                });
                this.fieldItemDatas.range[description] = items;
                return items;
            },
            //获取文本选项,逗号分隔
            getSelectData: function (field) {
                var items = [];
                var description = field.description;
                items = _.map(description.split(","), function (n) {
                    return {name: n, value: n};
                });
                return items;
            },

            //获取值
            getValues: function () {
                var values = {};
                var columns = this.baseColumns;
                var columnCodes = [];
                _.each(columns, function (n) {
                    if (n.hidden != true) {
                        columnCodes.push(n.code);
                    }
                });
                _.each(current, function (n) {
                    //这里需要对值进行判断,是否有空值 , 如果有空值,则不能保存
                    if (n.isBase == true || _.indexOf(columnCodes, n.code) > -1) {
                        values[n.mapping] = n.value;
                    }
                });
                return values;
            },

            //保存
            save: function (values) {
                var defer = $q.defer();
                values = values || this.getValues();
                if (!values) {
                    defer.reject("无效的数据,请检查!");
                    return defer.promise;
                }
                if (!values.content){
                    defer.reject("缺少病害描述信息,请检查!");
                    return defer.promise;
                }
                values.sn = [
                    current.road.record.sn, current.bridge.record.sn,
                    current.direction.value, moment().format('YYYYMMDD'),
                    'temp'
                ].join("-");

                //insert into LocalDisease
                var fields = "projectId,sourceId,status,sn,checkUser,checkUserName,checkDay,weather,createAt,roadId,bridgeId,direction,buweiId,bujianSn,bujianId,categoryId,qualitativeId,evaluateId,content,goujianId,formal,liang,dun,zhizuo,distance,position,length,width,height,quantity,extquantity,description".split(",");
                var s = {};
                var saveValues = _.map(fields , function(n){
                    var v = values[n] || "";
                    switch (n){
                        case "createAt":
                            v = moment().format('YYYY-MM-DD HH:mm:ss');
                            break;
                        case "checkDay":
                            v = moment(v).format('YYYY-MM-DD HH:mm:ss');
                            break;
                    }
                    s[n] = v;
                    return "'"+v+"'";
                });
                var sql = "insert into LocalDisease ( id , " + fields +" ) ";
                sql += "select case when max(id) is null then 1 else max(id)+1 end ,  "+saveValues+" from LocalDisease ";
                DataBaseService.execute(sql , [])
                    .then(function(){
                        defer.resolve();
                    });

                /*
                var diseases = StorageService.get("diseases") || [];
                diseases.push(values);
                StorageService.set('diseases', diseases);

                defer.resolve();
                */
                return defer.promise;
            } ,

            //删除
            deleteDisease: function(disease){
                var sql  = [
                    "delete from LocalDisease where id = "+disease.id ,
                    "delete from LocalDiseaseMedia where diseaseId = "+disease.id
                ];
                alert("before delete")
                return DataBaseService.run(sql);
            } ,

            getDiseases: function () {
                var template = [
                    "select * from Disease where projectId = {{projectId}} " ,
                    "and roadId = {{roadId}} " ,
                    "and bridgeId = {{bridgeId}} " ,
                    "and direction = '{{direction}}'"
                ].join(" ");
                template = _.template(template);
                var sql = template({
                    projectId: current.project.value ,
                    roadId: current.road.value ,
                    bridgeId: current.bridge.value ,
                    direction: current.direction.value ,
                    buweiId: current.buwei.value ,
                    bujianSn: current.bujianSn.value
                });
                sql += " union "+ sql.replace("Disease" , "LocalDisease");
                sql += "order by checkDay desc";
                return DataBaseService.query(sql);

                var defer = $q.defer();

                $timeout(function () {
                    var allDiseases = StorageService.get("diseases") || [];
                    var disease = _.filter(allDiseases, function (n) {
                        return n.bujianSn == current.bujianSn.value
                            && n.bujianId == current.bujian.value;
                    });
                    defer.resolve(disease);
                }, 500);
                return defer.promise;
            }

        }
    });
