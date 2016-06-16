'use strict';
angular.module('bridge.services')
.factory('checkSwipeContentService' ,
    function($q , $http , $log , $util ,
        EnvService , DataBaseService){
        var current;
        return {
            getContent:function(c){
                current = c;
                return getTemplateByBujian()
                    .then(getTemplateByBujianAndCategory)
                    .then(getTemplateByBujianAndGoujianAndCategory)
                    .then(getTemplateByBujianAndCategoryAndQualitative)
                    .then(getTemplateByBujianAndGoujianAndCategoryAndQualitative)
                    .then(function(item){
                        var template = item.template;
                        if (!template) return "";
                        //这里需要引入一个js引擎
                        template = _.template(template);
                        return template(current);
                    } , function(){
                        return "";
                    });

            }
        };

        //通过部件 , 构件 , 病害类别 , 定性描述获取后面的列
        //只通过部件获取
        function getTemplateByBujian(){
            var params = [
                current.bujian.value ,
                0 ,
                0 ,
                0
            ];
            return getQueryResult(params , []);
        }
        //通过部件 , 病害类别 获取
        function getTemplateByBujianAndCategory(item){
            var params = [
                current.bujian.value ,
                0 ,
                current.diseaseCategory.value || 0 ,
                0
            ];
            return getQueryResult(params , item);
        }
        //通过部件 , 构件 , 病害类别 获取
        function getTemplateByBujianAndGoujianAndCategory(item){
            return getQueryResult([
                current.bujian.value ,
                current.formal.value ,
                current.diseaseCategory.value ,
                0
            ] , item);
        }
        //通过部件 , 病害类别 , 定性描述 获取
        function getTemplateByBujianAndCategoryAndQualitative(item){
            return getQueryResult([
                current.bujian.value ,
                0 ,
                current.diseaseCategory.value , 
                current.diseaseQualitative.value
            ] , item);
        }
        //通过部件 , 构件 , 病害类别 , 定性描述 获取
        function getTemplateByBujianAndGoujianAndCategoryAndQualitative(item){
            return getQueryResult([
                current.bujian.value ,
                current.formal.value ,
                current.diseaseCategory.value , 
                current.diseaseQualitative.value
            ] , item);
        }
        //bujianId = ? and goujianId = ? and categoryId = ?"
        function getQueryResult(params , item){
            var defer = $q.defer();
            var sql = [
                "select * from DiseaseTemplate" ,
                "where isDefault = 1 and " ,
                "bujianId  = ? and goujianId = ? and categoryId = ? and qualitativeId = ?"
            ].join(" ");
            DataBaseService
                .single(sql, params)
                .then(function(rs){
                    defer.resolve(rs || item);
                })
                .catch(function(rs){
                    defer.resolve(item);
                });
            return defer.promise;
        }

    });