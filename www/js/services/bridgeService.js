'use strict';
angular.module('bridge.services')
    .factory(
    'BridgeService',
    function ($log, $q, $timeout , BaseData) {

        return {
            query: function(condition){
                var defer = $q.defer();
                $timeout(function(){
                    var bridges = _.filter(BaseData.bridges , function(n){
                       return (condition && condition.road) ? n.road == condition.road : true;
                    });
                    defer.resolve(bridges);
                } , 300)
                return defer.promise;
            } ,

            getBridgeBySn: function(sn){
                var defer = $q.defer();
                $timeout(function(){
                    var bridge = _.find(BaseData.bridges , function(n){
                        return n.sn == sn;
                    })
                    defer.resolve(bridge);
                } , 500)
                return defer.promise;
            }
        }
    }
);
