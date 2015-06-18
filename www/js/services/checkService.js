'use strict';
angular.module('bridge.services')
.factory(
    'CheckService',
    function ($log, $q, $timeout ,
              UserService, StorageService, BaseData ,
              CheckListService , CheckDescriptionService) {
        var current = {};
        var result = [
            //{name:"xxx" , value:"xxx" , nextstep:"xxx"}
        ];
        var medias = [];

        var stepMaps = {};
        _.forEach(BaseData.steps, function (n) {
            stepMaps[n.code] = n;
        });

        //获取nextstep
        var getNextStepCode = function (step) {
            var sc = step.nextstep;
            if (_.isString(sc)) {
                return sc;
            } else if (_.isFunction(sc)) {
                return sc(current, step);
            }
        }

        return {
            current: current,
            result: result,
            medias: medias,
            currentStep: {},
            getCurrentStep: function () {
                var steps = BaseData.steps;
                var currentStep = steps[0];
                //获取当前要操作的节点信息 , 通过检查结果的最后一个
                if (result.length > 0) {
                    var lastResult = _.last(result);
                    var lastStep = _.find(steps, function (item) {
                        return item.code == lastResult.code;
                    });
                    var nextStepCode = getNextStepCode(lastStep);
                    currentStep = _.find(steps, function (item) {
                        return item.code == nextStepCode;
                    })
                }
                currentStep = currentStep || {};
                this.currentStep = currentStep;
                return currentStep;
            },
            getCurrentStateParams: function (step) {
                var stateParams = {} ,
                    template = step.template ,
                    url;
                if (template) {
                    if (_.isFunction(template)) {
                        url = template(current, step, result);
                    } else if (_.isString(template)) {
                        url = template;
                    } else if (_.isObject(template)) {

                    }
                    stateParams = {
                        url: url,
                        code: step.code
                    }
                }
                return stateParams;
            },
            getHistorys: function(){
                var defer = $q.defer();
                $timeout(function(){
                    var allDiseases = StorageService.get("diseases") || [];
                    var disease = _.filter(allDiseases , function(n){
                        return _.every(result , function(m){
                            return n[m.code] == m.value;
                        })
                    });
                    defer.resolve(disease);
                } , 100);
                return defer.promise;
            } ,
            reset: function(data){
                this.remove(0 , true);
                if (!data) return;
                _.forEach(BaseData.steps, function (n) {
                    if (data[n.code]) this.add({
                        code: n.code , value: data[n.code]
                    } , true);
                } , this);
                this.update();
            } ,
            update: function () {
                _.forEach(result, function (n) {
                    if (n.inited) return;
                    n.item_name = stepMaps[n.code].name;
                    n.sourceData = CheckListService.getSourceData(n , current);
                    n.inited = true;
                } , this);
            },
            add: function (data , disableUpdate) {
                current[data.code] = data;
                var item = _.find(result, function (item) {
                    return item.code == data.code
                });
                if (item) {
                    item = _.extend(item, data);
                } else {
                    result.push(data);
                }
                if (true == !disableUpdate) this.update();
            },
            remove: function (item , disableUpdate) {
                var index = -1;
                if (_.isNumber(item)){
                    index = item;
                }else if (_.isObject(item)){
                    index = _.indexOf(result, item)
                }else if (_.isString(item)){
                    index = _.findIndex(result , {code:item});
                }
                if (index == -1) return;
                _.remove(result, function (n, i) {
                    var isChild = i >= index
                    if (isChild) delete current[n.code];
                    return isChild;
                })
                if (true == !disableUpdate) this.update();
            },
            getMedias: function () {
                return medias;
            },
            addMedia: function (media) {
                medias.push(media);
            },
            save: function () {
                var defer = $q.defer();
                //将result中value写入到data
                var rs = {
                    medias: medias
                };
                _.forEach(result, function (n) {
                    rs[n.code] = n.value;
                });
                //生成sn
                var allDiseases = StorageService.get("diseases") || [];
                var lastDisease = _.last(allDiseases);
                var lastSn = lastDisease ? parseInt(_.last(lastDisease.sn.split("-"))) + 1 : 1;
                rs.sn = [
                    rs.road ,
                    rs.bridge+rs.direction ,
                    moment().format('YYYYMMDD') ,
                    _.padLeft(lastSn , 4 , "0")
                ].join("-");
                rs.username = UserService.info.name;
                rs.createtime = moment().format("YYYY-MM-DD HH:mm:ss");
                //生成病害描述
                rs.description = CheckDescriptionService.getDescription(current , rs);
                var diseases = StorageService.get("diseases") || [];
                diseases.push(rs);
                StorageService.set("diseases", diseases);

                defer.resolve();
                return defer.promise;
            }
        };
});
