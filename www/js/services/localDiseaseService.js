'use strict';
angular.module('bridge.services')
    .factory(
    'LocalDiseaseService',
    function ($log, $q, $timeout, $http,
              DataBaseService, EnvService) {
        return {
            check: function () {
                var me = this;
                var sql = "select * from LocalDisease limit 4";
                DataBaseService
                    .query(sql)
                    .then(function (items) {
                        me.batchSave(items);
                    });
            },
            batchSave: function (items) {
                var me = this;
                _.each(items, function (item) {
                    this.save(item);
                }, this);
            },
            save: function (item) {
                var me = this;
                this.getDiseaseAndMedias(item)
                    .then(function(data){
                        return me.post(data);
                    })
                    .then(function(response){
                        var config = response.config,
                            requestData = config.data,
                            requestDisease = requestData.disease,
                            data = response.data;
                        //从数据库删除disease , media
                        DataBaseService.run([
                            "delete from LocalDiseaseMedia where diseaseId = "+requestDisease.id ,
                            "delete from LocalDisease where id = "+requestDisease.id
                        ]);
                    } , function(data){
                        console.log(data)
                    });
            },
            post: function (data) {
                return $http.post(
                    EnvService.api + "disease",
                    data
                );
            },
            getDiseaseAndMedias: function (item) {
                var defer = $q.defer();
                var id = item.id;
                var sql = "select * from LocalDiseaseMedia where diseaseId = " + id;
                DataBaseService.query(sql).then(function (medias) {
                    var data = {
                        disease: item,
                        medias: medias
                    };
                    defer.resolve(data);
                });
                return defer.promise;
            }
        }
    }
);
