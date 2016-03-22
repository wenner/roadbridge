/**
 * 同步本地数据库内容
 * 0. 判断当前是否运行中 , 运行中则返回等待
 * 1. 判断网络状态 -> a. 是否有网络 b. 是否是wifi+仅在wifi下上传
 * 2. 取第一条数据 , 判断是否有本地数据 databaseservice.single
 * 3. 通过数据获取媒体信息 from localdiseasemedia
 * 4. 判断是否有照片 , 有的话上传 , 上传后将返回的照片信息写入JSON中
 * 5. 上传数据到服务器端
 * -->服务器端:
 *      1. 保存数据
 *      2. 根据规则 , 将照片信息从temp文件夹保存到对应的文件夹中
 *      3. 返回信息 , 完整的disease+medias
 * 6.1. 删除本地的localdisease , localdiseasemedia
 * 6.2. 将返回的信息写入到Disease , DiseaseMedia中
 * 7.1. 发送通知 , 通知其他地方进行处理(比如病害记录列表,刷新一下或者unshift一下)
 * 7.2. 设置isRunning = false
 * 7.3. 设置currentRecord = null
 * 7.4. 重新执行 sync
 */
'use strict';
angular.module('bridge.services')
    .factory(
    'LocalDiseaseService',
    function ($log, $q, $timeout, $http,
              DataBaseService, EnvService , FileService) {
        var processes = {length:0},
            maxProcessLength = 1;
        return {
            sync: function () {
                for(var i = 0 ;i<maxProcessLength ; i++){
                    this.run();
                }
            },
            //开始运行
            run: function(){
                if (!this.allowRun()) return;
                var me = this;
                //加一个线程
                processes.length++;
                //开始运行
                this.getDisease() //获取一条记录
                    .then(this.getDiseaseMedias) //获取照片信息
                    .then(this.uploadDiseaseMedia) //上传照片
                    .then(this.saveDisease) //保存
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
                    })
                    .catch(function(reSync , type , msg){
                        //processes.length--;
                        console.log("reject:"+type)
                        if (reSync) {
                            me.sync();
                        }
                    })
                    .finally(function(){
                        processes.length--;
                    });
                /*
                var sql = "select * from LocalDisease limit 1";
                DataBaseService
                    .single(sql)
                    .then(function (items) {
                        me.batchSave(items);
                    });
                */
            } ,
            //是否可以运行
            allowRun:function(){
                var isAllowed = true;
                //判断当前的线程,是否可以加入
                if (processes.length >= maxProcessLength){
                    isAllowed = false;
                }
                //判断网络状态 , 和是否wifi环境下上传
                /*
                 if (navigator.connection.type){
                 }else{
                 }
                 */
                return isAllowed;
            } ,

            //获取最后一条记录
            getDisease: function(){
                var defer = $q.defer(),
                    sql = "select * from LocalDisease limit 1";
                DataBaseService
                    .single(sql)
                    .then(function(disease){
                        if (!processes[disease.id]){
                            console.log("resolve: getDisease" , disease);
                            defer.resolve(disease);
                        }else{
                            defer.reject(true);
                        }
                    } , function(errorMsg){
                        console.log("reject: getDisease" , errorMsg);
                        defer.reject(false , "getDisease" , errorMsg);
                    });
                return defer.promise;
            } ,
            //获取disease记录对应的媒体diseasemedia记录
            getDiseaseMedias: function(disease){
                var defer = $q.defer();
                var diseaseId = disease.id;
                var sql = "select * from LocalDiseaseMedia where diseaseId = " + diseaseId+" order by id";
                DataBaseService
                    .query(sql)
                    .then(function (medias) {
                        //console.log(medias);
                        console.log("get medias: "+ medias.length)
                        var data = {
                            disease: disease,
                            medias: medias
                        };
                        defer.resolve(data);
                    } , function(){
                        defer.reject(true);
                    });
                return defer.promise;
            } ,
            //上传
            uploadDiseaseMedia: function(data){
                var defer = $q.defer(),
                    disease = data.disease,
                    medias = data.medias;
                if (medias.length == 0){
                    console.log("media length : 0" , data)
                    defer.resolve(data);
                    return defer.promise;
                }
                var newMedias = [];
                var upload = function(medias){
                    if (medias.length == 0){
                        data.medias = newMedias;
                        console.log("resolve upload");
                        defer.resolve(data);
                    }else{
                        var media = medias.shift();
                        FileService.upload({
                            file: media.path ,
                            success: function(response){
                                var rs = response.response;
                                delete rs.$id;
                                newMedias.push(rs);
                                upload(medias);
                            } ,
                            failure: function(error){
                                defer.reject(true , error);
                            }
                        });
                    }
                };
                upload(medias);
                return defer.promise;
            } ,
            //保存
            saveDisease: function(data){
                console.log("save to server")
                console.log(data)
                return $http.post(
                    EnvService.api + "disease",
                    data
                );
            } ,
            post: function (data) {
                return $http.post(
                    EnvService.api + "disease",
                    data
                );
            } ,


            batchSave: function (items) {
                var me = this;
                _.each(items, function (item) {
                    this.save(item);
                }, this);
            },
            save: function (item) {
                console.log(item)
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
