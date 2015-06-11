angular.module('bridge.services')
    .factory(
    'UserService',
    function($log, $http , $q, $timeout ,
             StorageService , EnvService) {
        var userDefer = $q.defer();
        var user = {
            loadingPromise: userDefer.promise,
            info: {},
            notis: {},
            favoritesCount: 0
        };

        user.info = StorageService.get("user") || {};



        user.isLogin = function(){
            return !_.isEmpty(user.info.name);
        };

        user.login = function(data) {
            var defer = $q.defer();

            $timeout(function(){
                user.info = data;
                StorageService.set("user" , user.info);
                defer.resolve(user.info);
            } , 1500);
            return defer.promise;

            var loginParams = {
                u_name: userInfo.name ,
                u_pass: userInfo.password
            };
            alert(ENV.api+"authentication/login")
            alert(loginParams)
            window.device && alert(device.version)

            $http
                .post(ENV.api + 'authentication/login', loginParams)
                .success(function(result){
                    if (!result.isok){
                        defer.reject(result.message);
                    }else{
                        user.info = result.data.emp;
                        Storage.set("user" , user.info);
                        defer.resolve(user.info);
                    }
                })
                .error(function(err , status){
                    alert("error")
                    defer.reject(err ? err.error : err, status);
                });
            return defer.promise;
        };

        user.logout = function(){
            var defer = $q.defer();
            $timeout(function(){
                user.info = {};
                StorageService.set("user" , user.info);
                defer.resolve();
            } , 1500);
            return defer.promise;
        };

        return user;
    });
