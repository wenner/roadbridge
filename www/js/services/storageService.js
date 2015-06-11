'use strict';
angular
    .module('bridge.services')
    .factory('StorageService', function ($log) {
        return {
            exists: function(key){
                return !!window.localStorage.getItem(key);
            } ,
            set: function (key, data) {
                return window.localStorage.setItem(key, window.JSON.stringify(data));
            },
            get: function (key) {
                return window.JSON.parse(window.localStorage.getItem(key));
            },
            remove: function (key) {
                return window.localStorage.removeItem(key);
            }
        };
    });

