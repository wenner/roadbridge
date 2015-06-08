'use strict';
angular.module('bridge.services')
    .factory('BinghaiService', function($log , BaseData) {
        return {
            getDuns: function(num){
                return _.range(1 , num);
            }
        };
    });
