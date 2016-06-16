'use strict';
angular.module('bridge.services')
    .factory('columnByPickService',
    function ($q, $http, $log, $util,
        EnvService, DataBaseService,
        columnUtilService) {

        var current, cols, promiseFns, changes, resetColumns, currentCode;

        var promiseFunctions = {
            //on formal picked
            formal: function () {
                var categoryIndex = getCodeIndex("diseaseCategory");
                promiseFns[categoryIndex] = getCategoryByFormal();
            },
            //on diseaseCategory picked
            diseaseCategory: function () {
                var qualitativeIndex = getCodeIndex("diseaseQualitative");
                promiseFns[qualitativeIndex] = getQualitativeByCategory();
                //getColumnsAfterQualitative();
            },
            //on diseaseQualitative picked
            diseaseQualitative: function () {
                var evaluateIndex = getCodeIndex("diseaseEvaluate");
                promiseFns[evaluateIndex] = getEvaluateByQualitative();
                promiseFns["after"] = getColumnsAfterQualitative();
            }
        };

        return {
            getChanges: function (c, cs, code) {
                current = c;
                cols = cs;
                currentCode = code;
                changes = {};
                promiseFns = {};

                var defer = $q.defer();
                var fn = promiseFunctions[code];
                if (fn) fn();
                //console.log(promiseFns)
                if (_.isEmpty(promiseFns)) {
                    defer.resolve();
                } else {
                    $q.all(promiseFns).then(function (rs) {
                        _.each(rs, function (n, key) {
                            changes[key] = _.extend(changes[key] || {}, n);
                        });
                        defer.resolve(changes);
                    });
                }
                return defer.promise;
            }
        };
        //获取某个代码在cols中的index
        function getCodeIndex(code) {
            return _.findIndex(cols, "code", code);
        }
        //通过构建获取对应的病害类型
        function getCategoryByFormal() {
            var goujianId = current.formal.value;
            var sql = [
                "select * from DiseaseCategory ",
                "where id in ( ",
                "   select categoryId from GoujianCategoryRelation where goujianId = ?",
                ")  order by ix"
            ].join(" ");
            return DataBaseService
                .query(sql, [goujianId])
                .then(function (items) {
                    var changeItem = {};
                    changeItem.items = _.map(items, function (n) {
                        return _.extend(n, { name: n.name, value: n.id });
                    });
                    return changeItem;
                });
        }
        //通过病害类型获取定性描述
        function getQualitativeByCategory() {
            var categoryId = current.diseaseCategory.value;
            var sql = "select * from DiseaseQualitative where categoryId  = ? and uStatus = 'able'";
            return DataBaseService
                .query(sql, [categoryId])
                .then(function (items) {
                    var changeItem = {};
                    //items.unshift({name:"完好" , id: 0});
                    changeItem.items = _.map(items, function (n) {
                        return _.extend(n, { name: n.name, value: n.id });
                    });
                    return changeItem;
                });
        }
        //通过定性描述获取标度
        function getEvaluateByQualitative() {
            var qualitativeId = current.diseaseQualitative.value;
            if (qualitativeId == 0) {
                return {
                    items: [
                        { name: 1, value: 0 }
                    ]
                };
            }
            var diseaseQualitativeRecord = current.diseaseQualitative.record,
                evaluateGroup = diseaseQualitativeRecord ? diseaseQualitativeRecord.evaluateGroup : "";

            var sql = [
                "select id , sn from DiseaseEvaluate where groupId = ? order by sn"
            ].join(" ");
            return DataBaseService
                .query(sql, [evaluateGroup])
                .then(function (items) {
                    //console.log(items)
                    var changeItem = {};
                    changeItem.items = _.map(items, function (n) {
                        return _.extend(n, { name: n.sn, value: n.id });
                    });
                    return changeItem;
                });
        }
        //获取定性描述后的列
        function getColumnsAfterQualitative() {
            var bujianId = current.bujian.value,
                goujianId = current.formal.value,
                categoryId = current.diseaseCategory.value,
                qualitativeIndex = getCodeIndex("diseaseQualitative");
            //var qualitativeId = current.diseaseQualitative.value;

            resetColumns = {};
            for (var i = qualitativeIndex + 1; i < cols.length - 1; i++) {
                //var col = cols[i];
                resetColumns[i] = {
                    code: "code" + i,
                    hidden: true,
                    value: null,
                    type: "",
                    description: "",
                    width: 0,
                    items: []
                };
            }
            /*
            if (qualitativeId == 0) {
                changes = _.extend(resetColumns, changes);
                return false;
            }
            */

            return getColumnsByBujian()
                .then(getColumnsByBujianAndCategory)
                .then(getColumnsByBujianAndCategoryAndQualitative)
                .then(function (items) {
                    _.map(items, function (n) {
                        n.items = [];
                        n.value = null;
                    });
                    items = _.groupBy(items, 'goujianId');
                    var currentFields = items[goujianId] || items[0];
                    currentFields = columnUtilService.getFieldItemDataByType(currentFields);
                    _.each(currentFields, function (n, i) {
                        n.hidden = false;
                        changes[i + qualitativeIndex + 1] = n;
                    });
                    changes = _.extend(resetColumns, changes);
                })
                //获取aftercolumn后再次处理
                .then(function(){
                    //暂时先这样处理
                    var bujian = current.bujian.record;
                    var bujianSn = current.bujianSn.record;
                    switch(bujian.code){
                        case "SSmain":
                            _.each(changes , function(n , key){
                                if (n.code == "dun" && n.items.length == 0){
                                    //距离墩 , 孔号-1 , 孔好
                                    var dun = parseInt(bujianSn.value || "0");
                                    var positions =[
                                        "距"+(dun-1)+"#"+(dun == 1 ? "台" : "墩")+"侧" ,
                                        "距"+dun+"#"+(bujianSn.isLast==1 ? "台" : "墩")+"侧" ,
                                        (dun-1)+"#"+(dun == 1 ? "台" : "墩")+"支点处" ,
                                        dun+"#"+(bujianSn.isLast==1 ? "台" : "墩")+"支点处" ,
                                        "悬臂根"
                                    ]; 
                                    n.items =  _.map(positions, function (it) {
                                        return {name: it , value:it};
                                    });
                                }    
                            });
                            break;
                    }                   
                })
        }

        //通过部件 , 构件 , 病害类别 , 定性描述获取后面的列
        //只通过部件获取
        function getColumnsByBujian() {
            var params = [current.bujian.value, 0, 0];
            return getQueryResult(params, []);
        }
        //通过部件 , 病害类别 获取
        function getColumnsByBujianAndCategory(items) {
            var params = [current.bujian.value, current.diseaseCategory.value, 0];
            return getQueryResult(params, items);
        }
        //通过部件 , 病害类别 , 定性描述 获取
        function getColumnsByBujianAndCategoryAndQualitative(items) {
            var params = [
                current.bujian.value,
                current.diseaseCategory.value,
                current.diseaseQualitative.value
            ];
            return getQueryResult(params, items);
        }
        function getQueryResult(params, items) {
            var defer = $q.defer();
            var sql = [
                "select * from DiseaseField",
                "where position = 'after' and uStatus = 'able' and ",
                "bujianId  = ? and categoryId = ? and qualitativeId = ?",
                "order by ix "
            ].join(" ");
            return DataBaseService
                .query(sql, params)
                .then(function (rs) {
                    if (rs.length > 0) items = rs;
                    return items;
                });
        }

    });