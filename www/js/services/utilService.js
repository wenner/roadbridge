'use strict';
angular
    .module('bridge.services')
    .factory('$util', function ($log) {
        return {
            db2json: function(results){
                var rows = results.rows;
                var rs = _.reduce(rows, function(items, n, i) {
                    items[i] = rows.item(i);
                    return items;
                }, []);
                return rs;
            }
        };
    });

