'use strict';
angular.module('bridge.services')
    .factory('DataBaseService', function (
        $q, $http, $log, $util ,
        EnvService
    ) {
        var db = window.openDatabase("bridge", 1.1, 'bridge', 30000);
        return {
            db: db,
            //db
            query: function(sql , params){
                var defer = $q.defer();
                db.transaction(function (tx) {
                    tx.executeSql(sql , params || [] , function(tx , rs){
                        var items = $util.db2json(rs);
                        defer.resolve(items);
                    } , function(tx , error){
                        console.log(error.message);
                        defer.reject(error.message);
                    });
                });
                return defer.promise;
            } ,
            single: function(sql , params){
                var defer = $q.defer();
                this.query(sql , params).then(function(items){
                    if (items.length == 0){
                        defer.reject("0 rows");
                    }else{
                        defer.resolve(items[0]);
                    }
                } , function(tx , error){
                    defer.reject(error.message);
                });
                return defer.promise;
            } ,
            execute: function(sql , params){
                var defer = $q.defer();
                db.transaction(function (tx) {
                    tx.executeSql(sql , params || [] , function(tx , rs){
                        var items = $util.db2json(rs);
                        defer.resolve(items);
                    } , function(tx , error){
                        console.log(error.message);
                        defer.reject(error.message);
                    });
                });
                return defer.promise;
            } ,
            run: function(sqls){
                var defer = $q.defer();
                var errors = [];
                db.transaction(function (tx) {
                    _.each(sqls , function(sql , i){
                        tx.executeSql(sql , [] , function(){
                            if (i == sqls.length -1) defer.resolve();
                        } , function(tx , error){
                            defer.reject(error.message);
                            console.log(error)
                        });
                    });
                });
                return defer.promise;
            }
        };
    });
