// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('bridge', [
        'ionic' ,
        'bridge.services' ,
        'bridge.controllers'
    ])
    .run(function ($state , $ionicPlatform , $rootScope , $ionicPopup ,
                   UserService , StorageService ,
                   CheckListService , CheckDescriptionService , BaseData) {
        //初始化disease
        if (!StorageService.exists("diseases")){
            var diseases = initDiseases;
            _.forEach(diseases , function(disease){
                var result = [] , current = {};
                _.forEach(BaseData.steps, function (n) {
                    if (disease[n.code]) {
                        var item = {
                            code: n.code ,
                            value:disease[n.code] ,
                            item_name: n.name
                        };
                        current[n.code] = item;
                        result.push(item);
                    }
                });
                _.forEach(result, function (n) {
                    if (n.inited) return;
                    n.sourceData = CheckListService.getSourceData(n , current);
                    n.inited = true;
                });
                disease.description = CheckDescriptionService.getDescription(current , disease);
            });
            StorageService.set("diseases" , diseases);
        }

        $ionicPlatform.ready(function () {
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
                if (!(toState.authenticated !== true  || UserService.isLogin())) {
                    $state.go("login");
                    event.preventDefault();
                }
                //toState.authenticated !== true || AuthenticationService.isAuthenticated(Me) || ($state.go("welcome"), event.preventDefault())
            });

        });
    })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {

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
                templateUrl: "views/tabs.html"
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
        $urlRouterProvider.otherwise('/welcome');
    });

angular.module('bridge.controllers', [
    'bridge.services'
]);
angular.module('bridge.services', [
]);

