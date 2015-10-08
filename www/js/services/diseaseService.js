'use strict';
angular.module('bridge.services')
.factory(
    'DiseaseService',
    function($log , $q , $timeout , $http ,
             StorageService , BaseData , EnvService) {

        return {
            query: function(condition){
                condition = condition || {};
                var defer = $q.defer();
                return $http.get(
                    EnvService.api + "disease" ,
                    {params: condition}
                );
            } ,
            getDiseaseById: function(id){
                return $http.get(
                    EnvService.api+"disease/"+id
                );
            }
        };
    });
