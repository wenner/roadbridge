'use strict';
angular.module('bridge.services')
.factory(
    'DiseaseService',
    function($log , $q , $timeout , StorageService , BaseData , CheckListService) {

        return {
            query: function(condition){
                condition = condition || {};
                var defer = $q.defer();
                $timeout(function(){
                    var allDiseases = StorageService.get("diseases") || [];
                    var disease = _.filter(allDiseases , function(n){
                        var flag = true;
                        if (condition.road){
                            if (condition.bridge){
                                flag = n.bridge == condition.bridge;
                            }else{
                                flag = n.road == condition.road;
                            }
                        }
                        return flag;
                    });
                    defer.resolve(disease);
                } , 500);
                return defer.promise;
            } ,
            getDiseaseBySn: function(sn){
                var defer = $q.defer();
                $timeout(function(){
                    var allDiseases = StorageService.get("diseases") || [];
                    var disease = _.find(allDiseases , function(n){
                        return n.sn == sn;
                    });

                    var result = [] , current = {};
                    _.forEach(BaseData.steps, function (n) {
                        if (disease[n.code]) {
                            var item = {
                                code: n.code ,
                                value:disease[n.code] ,
                                item_name: n.name
                            };
                            current[n.code] = item;
                            result.push(item);
                        }
                    });
                    _.forEach(result, function (n) {
                        if (n.inited) return;
                        n.sourceData = CheckListService.getSourceData(n , current);
                        n.inited = true;
                    });
                    var data = {
                        disease: disease ,
                        result: result ,
                        current: current
                    };
                    defer.resolve(data);
                } , 500)
                return defer.promise;
            }
        };
    });
