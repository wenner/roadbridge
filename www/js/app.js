// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('bridge', [
        'ionic' ,
		'ngCordova' ,
        'bridge.config' ,
        'bridge.services' ,
        'bridge.controllers'
    ])
    .run(function ($state , $ionicPlatform , $rootScope , $ionicPopup ,$cordovaSQLite ,
                   UserService , StorageService , EnvService , DataBaseService) {
        alert("run")
        try {
            $ionicPlatform.ready(function () {
                EnvService.getApi();
                DataBaseService.checkCreated()
                    .then(function () {
                        alert(33333333)
                        return DataBaseService.checkUpdated();
                    }, function () {
                        alert(555555555)
                        $state.go("baseinfo", {action: "create"});
                        return false;
                    })
                    .then(function (data) {
                        alert(2222222222)
                        if (data && data.isChanged) {
                            if (confirm("检查到新的数据, 是否更新?")) {
                                $state.go("baseinfo", {action: "update"});
                            }
                        }
                    }, function () {
                        if (confirm("检查到新的数据, 是否更新?")) {
                            $state.go("baseinfo", {action: "update"});
                        }
                    });


                // notify
                if (!navigator.notification) {
                    navigator.notification = {
                        alert: function (message, title) {
                            $ionicPopup.alert({template: message, title: title || '信息'});
                        }
                    };
                }

                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
                //event, toState, toParams, fromState, fromParams
                $rootScope.$on("$stateChangeStart", function (event, toState) {
                    //如果页面的authenticated == true , 并且没有登录 , 转到welcome
                    if (!(toState.authenticated !== true || UserService.isLogin())) {
                        $state.go("login");
                        event.preventDefault();
                    }
                    //toState.authenticated !== true || AuthenticationService.isAuthenticated(Me) || ($state.go("welcome"), event.preventDefault())
                });

            });
        }catch(e){
            alert(e.message);
        }
    })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
        alert("config")
        _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

        $stateProvider
            //welcome
             .state('welcome', {
                url: '/welcome',
                templateUrl: 'views/welcome.html'
             })
            //login
            .state('login' , {
                url:'/login' ,
                templateUrl: 'views/login.html' ,
                controller: 'LoginCtrl'
            })
            //tabs
            .state('tab', {
                url: "",
                abstract: true,
                templateUrl: "views/tabs.html" ,
                controller: "TabCtrl"
            })
            //disease
            .state('tab.disease', {
                authenticated: true ,
                url: '/disease',
                views: {
                    'tabDisease': {
                        templateUrl: 'views/disease.html',
                        controller: 'DiseaseCtrl'
                    }
                }
            })
            .state('tab.diseasedetail' , {
                authenticated: true ,
                url: '/disease/{sn:string}',
                views: {
                    'tabDisease': {
                        templateUrl: 'views/diseasedetail.html',
                        controller: 'DiseaseDetailCtrl'
                    }
                }
            })
            //bridge
            .state('tab.bridge', {
                authenticated: true ,
                url: '/bridge',
                views: {
                    'tabBridge': {
                        templateUrl: 'views/bridge.html',
                        controller: 'BridgeCtrl'
                    }
                }
            })
            //bridge detail
            .state('tab.bridgedetail' , {
                authenticated: true ,
                url: '/bridge/{sn:string}',
                views: {
                    'tabBridge': {
                        templateUrl: 'views/bridgedetail.html' ,
                        controller: "BridgeDetailCtrl"
                    }
                }
            })
            .state('bridgedetail' , {
                url: "/bridgedetail/{sn:string}" ,
                templateUrl: 'views/bridgedetail.html' ,
                controller: "BridgeDetailCtrl"
            })
            //setting
            .state( 'tab.setting' , {
                authenticated: true ,
                url: '/setting' ,
                views:{
                    'tabSetting': {
                        templateUrl: 'views/setting.html' ,
                        controller: "SettingCtrl"
                    }
                }
            })
            //database init
            .state('baseinfo' , {
                url: '/baseinfo/{action:string}' ,
                templateUrl: 'views/baseinfo.html' ,
                controller: "BaseInfoCtrl"
            })
            //检查
            .state('check', {
                url: "",
                abstract: true,
                templateUrl: "views/check/main.html",
                controller: "CheckMainCtrl"
            })
            .state('check.content', {
                authenticated:true ,
                url: "/check?&{url:string}&{code:string}",
                views: {
                    'Content': {
                        templateUrl: function ($stateParams) {
							var pa = $stateParams;
							var url = 'views/check/' + (pa.url || 'empty') + '.html';
							//console.log( url)
							//alert(url)
                            //if (pa && !pa.template) console.log("no step template:" , angular.toJson($stateParams));
                            return url;
                        },
                        controllerProvider: function ($stateParams, CheckService) {
                            var controller = "CheckSelectorCtrl";
                            var currentStep = CheckService.currentStep;
                            if (currentStep && currentStep.controller) {
                                controller = currentStep.controller;
                            }
                            return controller;
                        }
                    }
                }
            })
            //滑动版检查
            .state("checkswipe" , {
                url: "/checkswipe" ,
                templateUrl: 'views/checkswipe/main.html' ,
                controller: "CheckSwipeCtrl"
            })
        $urlRouterProvider.otherwise('/welcome');
    });

angular.module('bridge.controllers', [
	'ngCordova' ,
    'bridge.config' ,
    'bridge.services'
]);
angular.module('bridge.services', [
    'bridge.config' ,
]);
alert("app")

