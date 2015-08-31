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
                    mapping: "roadid",
                    getDisplay: function (current, code) {
                        var record = current.road.record;
                        return record.sn + " " + record.name;
                    }
                },
                bridge: {
                    mapping: "bridgeid",
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
                direction: {},
                buwei: {},
                bujianType: {},
                bujianGroup: {},

                bujianSn: {
                    getDisplay: function (current, code) {
                        if (current.bujianSn.record) return current.bujianSn.record.name;
                    }
                }, //孔,联
                bujian: {
                    getDisplay: function (current, code) {
                        return current.bujian.record.name;
                    }
                },
                goujian: {},
                diseaseCategory: {mapping: "categoryId"},
                diseaseQualitative: {mapping: "qualitativeId"},
                diseaseEvaluate: {mapping: "evaluateId"}
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
                item.display = (value.record ? value.record.name : null) || item.name || item.display || item.value;
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
            current: current,
            fieldItemDatas: {
                range: {},
                select: {}
            },
            distances: _.map((function () {
                var step = 0.1,
                    rs = [];
                for (var i = 0.1; i < 50; i = (i * 10000000000000 + step * 10000000000000) / 10000000000000) {
                    step = i < 1 ? 0.1 : 1;
                    rs.push(i);
                }
                return rs;
            })(), function (n) {
                return {name: n, value: n};
            }),
            getRoads: function () {
                return db.roads;
            },
            getRoadById: function (id) {
                return _.find(db.roads, function (road) {
                    return road.id == id;
                });
            },
            getBridges: function () {
                return db.bridges;
            },
            getBridgeById: function (id) {
                return _.find(db.bridges, function (bridge) {
                    return bridge.id == id;
                });
            },
            getDirections: function (road, bridge) {
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
                return directions;
            },
            getWeathers: function () {
                return db.weathers;
            },
            getBuweis: function () {
                var buweis = db.buweis;
                var s = _.uniq(buweis, 'bujianGroup');
                return s;
            },
            //获取孔,联号
            getBujianSns: function () {
                var buwei = _.find(db.buweis, "bujianGroup", current.bujianGroup.value);
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
            },
            getKongs: function () {
                var kongs = _.filter(db.kongs, function (n) {
                    return n.direction == current.direction.value && n.bridgeId == current.bridge.value;
                });
                return _.map(kongs, function (n) {
                    return _.extend(n, {name: "第" + n.sn + "孔", value: n.sn});
                });
            },
            getLians: function () {
                var jointCount = current.bridge.record.jointCount;
                return _.map(_.range(1, jointCount + 1), function (n) {
                    return {name: "第" + n + "联", value: n};
                })
            },
            //获取部件
            getBujians: function () {
                var buweiIds = _.pluck(_.filter(db.buweis, 'bujianGroup', current.bujianGroup.value), 'id');
                var bujians = _.filter(db.bujians, function (n) {
                    return _.indexOf(buweiIds, n.buweiId) > -1;
                });
                return _.map(bujians, function (n) {
                    return _.extend(n, {name: n.name, value: n.id});
                });
            },
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
            getColumnsByBujian: function (cols) {
                //reset , 将所有的都隐藏
                var resetColumns = {};
                _.each(cols, function (n, i) {
                    resetColumns[i] = {
                        code: "code" + i,
                        hidden: true,
                        value: null ,
                        items: []
                    };
                });
                var bujian = current.bujian.record;
                var bujianId = current.bujian.value;

                //获取before的field
                var currentFields = _.map(
                    _.filter(db.diseaseFields, {bujianId: bujianId, position: "before"}) ,
                    function(n){
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
                    {name: "病害类型", code: "diseaseCategory", width: 120 , items:[] , value:null},
                    {name: "定性描述", code: "diseaseQualitative", width: 120 , items:[] , value:null}
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
                            n.items = _.map(_.filter(db.goujians, "bujianId", current.bujian.value), function (n) {
                                return _.extend(n, {name: n.name, value: n.id});
                            });
                            break;
                    }
                    changes[i] = n;
                    n.hidden = false;
                });
                changes = _.extend(resetColumns, changes);
                console.log(changes);
                return changes;
            },
            getSSmainColumnsByBujian: function (columns) {
                return columns;
            },

            getColumnsByBujianSn: function (cols) {
                if (!cols) return;
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
                return changes;
            },

            getColumnsByPick: function (cols, code) {
                if (!cols) return;
                var changes = {};
                switch (code) {
                    case "formal":
                        var goujianId = current.formal.value;
                        //获取对应构件的病害类型 , 通过 形式(构件) 获取对应的分类
                        var categoryIndex = _.findIndex(cols, "code", "diseaseCategory");
                        var categoryIds = _.pluck(
                            _.filter(db.goujianCategoryRelation, "goujianId", goujianId),
                            'categoryId');
                        var items = _.map(
                            _.filter(db.diseaseCategorys, function (n) {
                                return categoryIds.indexOf(n.id) > -1;
                            }),
                            function (n) {
                                return _.extend(n, {name: n.name, value: n.id});
                            }
                        );
                        changes[categoryIndex] = {};
                        changes[categoryIndex].items = items;
                        break;
                    case "diseaseCategory":
                        var bujian = current.bujian.record,
                            bujianSn = current.bujianSn.record,
                            bujianId = current.bujian.value,
                            goujianId = current.formal.value,
                            categoryId = current.diseaseCategory.value;
                        var qualitativeIndex = _.findIndex(cols, "code", "diseaseQualitative");
                        var items = _.map(
                            _.filter(db.diseaseQualitatives, "categoryId", categoryId),
                            function (n) {
                                return _.extend(n, {name: n.name, value: n.id});
                            }
                        );
                        items = [{name:"完好" , value:0}].concat(items);
                        changes[qualitativeIndex] = {};
                        changes[qualitativeIndex].items = items;

                        //reset after
                        var resetColumns = {};
                        for (var i = qualitativeIndex + 1; i < cols.length - 1; i++) {
                            var n = cols[i];
                            resetColumns[i] = {
                                code: "code" + i,
                                hidden: true,
                                value: null ,
                                items: []
                            };
                        }
                        //获取after fields
                        var categoryFields = _.groupBy(_.filter(
                            db.diseaseFields,
                            {bujianId: bujianId, categoryId: categoryId}
                        ), function (n) {
                            return n.goujianId;
                        });
                        _.map(categoryFields , function(n){
                            n.items = [];
                            n.value = null;
                            return ;
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
                        break;
                    case "diseaseQualitative":
                        //通过定性描述获取评价
                        var qualitativeId = current.diseaseQualitative.value;
                        if (!qualitativeId) return;
                        var evaluateIndex = _.findIndex(cols, "code", "diseaseEvaluate");
                        var evaluateIds = _.pluck(
                            _.filter(db.qualitativeEvaluateRelation, "qualitativeId", qualitativeId),
                            'evaluateId');
                        var items = _.map(
                            _.filter(db.diseaseEvaluates, function (n) {
                                return evaluateIds.indexOf(n.id) > -1;
                            }),
                            function (n) {
                                return _.extend(n, {name: n.sn, value: n.id, text: n.name});
                            }
                        );
                        changes[evaluateIndex] = {};
                        changes[evaluateIndex].items = items;
                }
                return changes;
            },
            getSSmainColumnsByCategorys: function (fields) {
                return fields;
            },

            getFieldItemDataByType: function (fields) {
                //fieldItemDatas
                _.each(fields, function (n) {
                    var type = n.type;
                    if (!type) return;
                    var items = [];
                    var description = n.description;
                    if (this.fieldItemDatas[type][description]) {
                        items =  this.fieldItemDatas[type][description];
                    }else{
                        var fn = this["get" + _.capitalize(type) + "Data"];
                        if (fn) {
                            items = fn.call(this, n);
                        }
                    }
                    n.items = items;
                }, this);
                return fields;
            },
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
                        var curStep = _.find(step , function(n){
                            return n.min <= number && number < n.max;
                        });
                        step = curStep ? curStep.step : 1;
                    }
                    if (!step) step = 1;
                    return step;
                };
                var numbers = [];
                var step = getStep(desc.step, desc.min);
                for (var i = desc.min ; i <= desc.max; i = (i * 10000000000000 + step * 10000000000000) / 10000000000000) {
                    step = getStep(desc.step , i);
                    numbers.push(i);
                }
                items = _.map(numbers, function (n) {
                    return {name: n, value: n};
                });
                this.fieldItemDatas.range[description] = items;
                return items;
            },
            getSelectData: function (field) {
                var items = [];
                var description = field.description;
                items = _.map(description.split(","), function (n) {
                    return {name: n, value: n};
                });
                return items;
            }

        }
    });
