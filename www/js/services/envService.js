'use strict';
angular.module('bridge.services')
    .factory('EnvService', function ($log, StorageService , defaultSetting , defaultConfig) {
        var configKey = 'config' ,
            configs = StorageService.get(configKey) || defaultConfig ,
            settingKey = 'settings' ,
            settings = StorageService.get(settingKey) || defaultSetting ,
            apiUrl = StorageService.get("apiUrl");
        return {
            api: apiUrl ,
            getApi: function(){
                if (apiUrl) return;

                var apiType = StorageService.get("apiType" , true);
                if (!apiType) apiType = configs.apiType;
                if (ionic.Platform.isWebView() || ionic.Platform.isIOS()){
                    apiType = "internet";
                }
                this.apiType = apiType;
                apiUrl = configs.apiUrls[apiType];
                StorageService.set("apiUrl" , apiUrl);
                this.api = apiUrl;
            } ,
            changeApiUrl: function(url){
                apiUrl = url;
                this.api = url;
                StorageService.set("apiUrl" , url , true);
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
