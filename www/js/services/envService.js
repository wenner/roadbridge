'use strict';
angular.module('bridge.services')
    .factory('EnvService', function ($log, StorageService) {
        var configKey = 'config' ,
            configs = StorageService.set(configKey) || {} ,
            settingKey = 'settings' ,
            settings = StorageService.get(settingKey) || {};
        return {
            api: configs.api ,
            getSettings: function () {
                $log.debug('get settings', settings);
                return settings;
            },
            saveSetting: function () {
                StorageService.set(settingKey, settings);
            } ,
            getConfig: function(){
                $log.debug('get configs', configs);
                return configs;
            } ,
            saveConfig: function(){
                StorageService.set(configKey , configs);
            } ,

            getRemoteStorage: function(){

            }
        };
    });
