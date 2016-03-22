'use strict';
angular.module('bridge.services')
    .factory('BaseInfoService', function (
        $q, $http, $log, $util ,
        EnvService , DataBaseService
    ) {
        var db = DataBaseService.db;
        return {
            isCreated: false,
            isUpdated: false,
            updateList: [],

            //检查创建信息
            checkCreated: function () {
                var me = this;
                var defer = $q.defer();
                db.transaction(function (tx) {
                    var sql = "select count(*) as count from sqlite_master where type='table' and name='BaseInfoVersion'";
                    tx.executeSql(sql, [], function (tx, results) {
                        var count = results.rows.item(0).count;
                        if (count == 1) {
                            me.isCreated = true;
                            defer.resolve();
                        } else {
                            defer.reject();
                        }
                    }, function (tx, error) {
                        defer.reject(error.message);
                    });
                });
                return defer.promise;
            },
            createDataBase: function () {
                var me = this;
                var defer = $q.defer();
                var sqlPath = EnvService.api+"docs/db.txt";
                $http.get(sqlPath , {timeout:10000})
                    .success(function (d) {
                        var items = me.parseSql(d);
                        db.transaction(function (tx) {
                            _.each(items , function(item){
                                var complete = true;
                                _.each(item.sqls , function(sql){
                                    tx.executeSql(sql, [], function (tx, results) {
                                        //console.log(results);
                                    }, function (tx, error) {
                                        item.error.push(error.message);
                                        item.complete = false;
                                        //console.log(1 , item.tableName , complete)
                                    });
                                });
                                item.complete = complete;
                            });
                        });
                        defer.resolve(items);
                    })
                    .error(function(e){
                        defer.reject("获取脚本失败!");
                    });
                return defer.promise;
            },
            parseSql: function(sqlText){
                var items = {};
                _.each(sqlText.split(";") , function(n){
                    if (_.isEmpty(n)) return;
                    var names = n.match(/table([\s\S]*?)\(/);
                    var sql = n.replace("identity(1,1)" , "");
                    console.log(sql)
                    var name = names.length > 1 ? names[1] : "";
                    name = name.replace(/ /ig , "");
                    items[name] = {
                        tableName: name ,
                        complete: false ,
                        error:[] ,
                        sqls: []
                    };
                    if (name) items[name].sqls.push("DROP Table IF EXISTS "+name);
                    items[name].sqls.push(sql);
                    if (name == "Disease" || name == "DiseaseMedia"){
                        items["Local"+name] = {
                            tableName: "Local"+name ,
                            complete: false ,
                            error: [] ,
                            sqls: []
                        };
                        items["Local"+name].sqls.push("DROP Table IF EXISTS Local"+name);
                        items["Local"+name].sqls.push(sql.replace("table "+name , "table Local"+name));
                    }
                });
                return items;
            } ,
            //获取当前sqllite的表
            getTables: function(){
                var defer = $q.defer();
                var sql = "select * from sqlite_master where type='table'";
                var items = {};
                db.transaction(function (tx) {
                    tx.executeSql(sql, [], function (tx, results) {
                        for(var i = 0 ; i<results.rows.length ; i++){
                            var row = results.rows.item(i);
                            items[row.name] = {
                                tableName: row.name ,
                                complete: true
                            };
                        }
                        defer.resolve(items);
                    }, function (tx, error) {
                        defer.reject(error.message);
                    });
                });
                return defer.promise;
            } ,

            //检查update
            checkUpdated: function () {
                var me = this,
                    defer = $q.defer(),
                    isChanged = false;
                $q.all({
                    remote: me.getRemoteVersion() ,
                    local: me.getLocalVersion()
                }).then(function(data){
                    var remotes = data.remote.data;
                    var locals = data.local;
                    if (!remotes){
                        defer.reject("aaaaa");
                        return defer.promise;
                    }
                    var os = {};
                    _.each(remotes , function(remoteRecord){
                        var tableName = remoteRecord.tableName,
                            tableChanged = false;
                        var localRecord = _.find(locals , 'tableName' , tableName);
                        if (localRecord){
                            if (remoteRecord.version > localRecord.version) tableChanged = true;
                        }else{
                            tableChanged = true;
                        }
                        if (tableChanged) isChanged = true;
                        os[tableName] = {
                            tableName: tableName ,
                            remote: remoteRecord ,
                            local: localRecord ,
                            isChanged: tableChanged ,
                            status: tableChanged ? "change" : "ok"
                        };
                    });
                    defer.resolve({
                        isChanged: isChanged ,
                        items: os
                    });
                } , function(e){
                    defer.reject();
                });
                return defer.promise;
            } ,
            getLocalVersion: function(){
                var defer = $q.defer(),
                    sql = "select * from baseinfoversion where isdefault = 1";
                db.transaction(function (tx) {
                    tx.executeSql(sql, [], function (tx, results) {
                        var rs = [];
                        for(var i = 0 ; i<results.rows.length ; i++){
                            var row = results.rows.item(i);
                            rs.push(row);
                        }
                        defer.resolve(rs);
                    }, function (tx, error) {
                        defer.reject(error.message);
                    });
                });
                return defer.promise;
            } ,
            getRemoteVersion: function(){
                return $http.get(
                    EnvService.api + "baseinfo/version" ,
                    {timeout:10000}
                );
            } ,
            updateTable: function(table){
                var me = this,
                    defer = $q.defer(),
                    sql = [],
                    fields = [];
                defer.notify("load");
                $http.get(EnvService.api + "baseinfo/"+table.tableName)
                    .success(function(data){
                        defer.notify("parse");
                        if (data.length > 0){
                            _.each(data[0] , function(n , key){
                                if (key.indexOf("$") == -1) fields.push(key);
                            });
                        }
                        _.each(data , function(n , i){
                            var values = _.map(fields , function(field){
                                return "'"+n[field]+"'";
                            });
                            sql.push(values.join(" , "));
                        });
                        sql = "select "+sql.join(" union  select ");
                        sql = "insert into "+table.tableName+" ("+fields.join(" , ")+") "+sql;
                        defer.notify("insert");
                        db.transaction(function (tx) {
                            tx.executeSql("delete from "+table.tableName , [] , function(){
                                tx.executeSql(sql, [], function (tx, results) {
                                    var count = results.rowsAffected;
                                    sql = "delete from baseinfoversion where tableName = '"+table.tableName+"'";
                                    tx.executeSql(sql , [] , function(){

                                    } , function(tr , err){
                                        defer.reject(err.message);
                                    });
                                    var item = table.remote;
                                    sql = ["insert into baseinfoversion " ,
                                        " (id , tableName , modifyAt , version , isDefault) " ,
                                        " values " ,
                                        " ( "+item.id+" , '"+item.tableName+"' , '"+item.modifyAt+"' , "+item.version+" , 1)"].join("");
                                    tx.executeSql(sql, [], function (tx, results) {
                                        defer.resolve(count);
                                    }, function (tx, error) {
                                        defer.reject(error.message);
                                    });
                                }, function (tx, error) {
                                    defer.reject(error.message);
                                });
                            } , function(tx , error){
                                defer.reject(error.message);
                            });

                        });

                    });
                return defer.promise;
            }
        };
    });
