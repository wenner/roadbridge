// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('bridge', [
	'ionic' ,
    'ion-sticky' ,
    //'oc.lazyLoad' ,
	'bridge.config' ,
	'bridge.controllers' ,
	'bridge.services'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

	// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {

    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

	$stateProvider
		//welcome
        /*
		.state('welcome', {
			url: '/welcome',
			templateUrl: 'views/welcome.html'
		})
        */
        //tabs
        .state('tab', {
            url: "",
            abstract: true,
            templateUrl: "views/tabs.html"
        })
		//disease
		.state('tab.disease' , {
			url:'/disease' , 
			views:{
				'tabDisease': {
					templateUrl: 'views/disease.html' , 
					controller: 'DiseaseCtrl'
				}			
			}
		})
        //检查
        .state('check', {
            url: "",
            abstract: true,
            templateUrl: "views/check/main.html" ,
            controller: "CheckMainCtrl"
        })
        .state('check.content' , {
            url: "/check?&{url:string}&{code:string}" ,
            views:{
                'selector': {
                    templateUrl: function($stateParams){
                        var pa = $stateParams;
                        //console.log(pa)
                        return 'views/check/'+(pa.url || 'empty')+'.html'
                    },
                    controllerProvider: function($stateParams , CheckService){
                        var controller = "CheckSelectorCtrl";
                        var stepInfo = CheckService.stepInfo;
                        if (stepInfo && stepInfo.currentStep && stepInfo.currentStep.controller){
                            controller = stepInfo.currentStep.controller;
                        }
                        return controller;
                    }
                }
            } ,
            resolve1: {
                loadMyCtrl: function($state , $stateParams , CheckService , $ocLazyLoad) {
                    console.log(2222)
                    /*
                    var stepInfo = CheckService.stepInfo;
                    if (stepInfo && stepInfo.currentStep && stepInfo.currentStep.controller){
                        alert(2222222)

                        return $ocLazyLoad.load('js/controllers/check/form/'+stepInfo.currentStep.controller+'.js');
                    }
                    */

                }
            }
        })
		//桥梁选择
		.state('bridgeselector' , {
			url: '/bridgeselector' , 
			templateUrl: 'views/bridgeselector.html'
		})
		$urlRouterProvider.otherwise('/disease');
});

angular.module('bridge.controllers', [
    'bridge.services' ,
    'bridge.config'
]);
angular.module('bridge.services', [
    'bridge.config'
]);

