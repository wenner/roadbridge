'use strict';
angular.module('bridge.services')
.factory('columnByPickService' ,
    function($q , $http , $log , $util ,
        EnvService , DataBaseService ,
        columnUtilService){

        var current , cols , promiseFns , changes , resetColumns , currentCode;

        var promiseFunctions={
            //on formal picked
            formal:function(){
                var categoryIndex = getCodeIndex("diseaseCategory");
                promiseFns[categoryIndex] = getCategoryByFormal();
            } ,
            //on diseaseCategory picked
            diseaseCategory: function(){
                var qualitativeIndex = getCodeIndex("diseaseQualitative");
                promiseFns[qualitativeIndex] = getQualitativeByCategory();
                //getColumnsAfterQualitative();
            } ,
            //on diseaseQualitative picked
            diseaseQualitative: function(){
                var evaluateIndex = getCodeIndex("diseaseEvaluate");
                promiseFns[evaluateIndex] = getEvaluateByQualitative();
                promiseFns["after"] = getColumnsAfterQualitative();
            }
        };

        return {
            getChanges:function(c , cs , code){
                current=c;
                cols=cs;
                currentCode = code;
                changes={};
                promiseFns = {};

                var defer=$q.defer();
                var fn = promiseFunctions[code];
                if(fn) fn();
                //console.log(promiseFns)
                if (_.isEmpty(promiseFns)) {
                    defer.resolve();
                }else{
                    $q.all(promiseFns).then(function(rs){
                        _.each(rs , function(n , key){
                            changes[key] = _.extend(changes[key] || {} , n);
                        });
                        defer.resolve(changes);
                    });
                }
                return defer.promise;
            }
        };
        //获取某个代码在cols中的index
        function getCodeIndex(code){
            return _.findIndex(cols, "code", code);
        }
        //通过构建获取对应的病害类型
        function getCategoryByFormal(){
            var goujianId = current.formal.value;
            var sql = [
                "select * from DiseaseCategory " ,
                "where id in ( " ,
                "   select categoryId from GoujianCategoryRelation where goujianId = ?" ,
                ")  order by ix"
            ].join(" ");
            return DataBaseService
                .query(sql, [goujianId])
                .then(function (items) {
                    var changeItem = {};
                    changeItem.items = _.map(items, function (n) {
                        return _.extend(n, {name: n.name, value: n.id});
                    });
                    return changeItem;
                });
        }
        //通过病害类型获取定性描述
        function getQualitativeByCategory() {
            var categoryId = current.diseaseCategory.value;
            var sql = "select * from DiseaseQualitative where categoryId  = ?";
            return DataBaseService
                .query(sql, [categoryId])
                .then(function (items) {
                    var changeItem = {};
                    items.unshift({name:"完好" , id: 0});
                    changeItem.items = _.map(items, function (n) {
                        return _.extend(n, {name: n.name, value: n.id});
                    });
                    return changeItem;
                });
        }
        //通过定性描述获取标度
        function getEvaluateByQualitative(){
            var qualitativeId = current.diseaseQualitative.value;
            var diseaseQualitativeRecord = current.diseaseQualitative.record ,
                evaluateCount =_.random(3 , 5);
            evaluateCount = diseaseQualitativeRecord ? (diseaseQualitativeRecord.evaluateCount || evaluateCount) : evaluateCount;
            return {
                items: _.map(_.range(1 , evaluateCount+1), function (n) {
                    return {name: n, value: n , text: n , qId:qualitativeId};
                })
            };

            var sql = [
                "select * from DiseaseEvaluate" ,
                "where id in ( " ,
                "   select evaluateId from qualitativeEvaluateRelation where qualitativeId = ?" ,
                ")"
            ].join(" ");
            return DataBaseService
                .query(sql, [qualitativeId])
                .then(function (items) {
                    var changeItem = {};
                    changeItem.items = _.map(items, function (n) {
                        return _.extend(n, {name: n.sn, value: n.id , text: n.name});
                    });
                    return changeItem;
                });
        }
        //获取定性描述后的列
        function getColumnsAfterQualitative(){
            var bujianId = current.bujian.value,
                goujianId = current.formal.value ,
                categoryId = current.diseaseCategory.value ,
                qualitativeIndex = getCodeIndex("diseaseQualitative");
            var qualitativeId = current.diseaseQualitative.value;

            resetColumns = {};
            for (var i = qualitativeIndex + 1; i < cols.length-1; i++) {
                //var col = cols[i];
                resetColumns[i] = {
                    code: "code" + i,
                    hidden: true,
                    value: null,
                    items: []
                };
            }

            if (qualitativeId == 0){
                changes = _.extend(resetColumns, changes);
                return false;
            }

            return getColumnsByBujian()
                .then(getColumnsByBujianAndCategory)
                .then(getColumnsByBujianAndCategoryAndQualitative)
                .then(function (items) {
                    _.map(items , function(n){
                        n.items = [];
                        n.value = null;
                    });
                    items = _.groupBy(items , 'goujianId');
                    var currentFields = items[goujianId] || items[0];
                    currentFields = columnUtilService.getFieldItemDataByType(currentFields);
                    _.each(currentFields, function (n, i) {
                        n.hidden = false;
                        changes[i + qualitativeIndex + 1] = n;
                    });
                    changes = _.extend(resetColumns, changes);
                });
        }

        //通过部件 , 构件 , 病害类别 , 定性描述获取后面的列
        //只通过部件获取
        function getColumnsByBujian(){
            var params = [current.bujian.value , 0 , 0];
            return getQueryResult(params , []);
        }
        //通过部件 , 病害类别 获取
        function getColumnsByBujianAndCategory(items){
            var params = [current.bujian.value , current.diseaseCategory.value , 0];
            return getQueryResult(params , items);
        }
        //通过部件 , 病害类别 , 定性描述 获取
        function getColumnsByBujianAndCategoryAndQualitative(items){
            var params = [
                current.bujian.value ,
                current.diseaseCategory.value ,
                current.diseaseQualitative.value
            ];
            return getQueryResult(params , items);
        }
        function getQueryResult(params , items){
            var defer = $q.defer();
            var sql = [
                "select * from DiseaseField" ,
                "where position = 'after' and uStatus = 'able' and " ,
                "bujianId  = ? and categoryId = ? and qualitativeId = ?" ,
                "order by ix "
            ].join(" ");
            return DataBaseService
                .query(sql, params)
                .then(function(rs){
                    if (rs.length > 0) items = rs;
                    return items;
                });
        }

    });