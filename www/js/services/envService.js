'use strict';
angular.module('bridge.services')
    .factory('EnvService', function ($log, StorageService , defaultSetting , defaultConfig) {
        var configKey = 'config' ,
            s = StorageService.remove(configKey) ,
            configs = StorageService.get(configKey) || defaultConfig ,
            settingKey = 'settings' ,
            settings = StorageService.get(settingKey) || defaultSetting ,
            apiUrl;
        return {
            api: apiUrl ,
            getApi: function(){
                var apiType = StorageService.get("apiType" , true);
                if (!apiType) apiType = configs.apiType;
                if (ionic.Platform.isWebView() || ionic.Platform.isIOS()){
                    apiType = "internet";
                }
                this.apiType = apiType;
                apiUrl = configs.apiUrls[apiType];
                this.api = apiUrl;
            } ,
            changeApiType: function(type){
                StorageService.set("apiType" , type , true);
                this.getApi();
            } ,
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
