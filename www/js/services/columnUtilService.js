'use strict';
angular.module('bridge.services')
.factory('columnUtilService', function (
        $q, $http, $log, $util ,
        EnvService , DataBaseService
){
    return {
        fieldItemDatas: {
            range: {},
            select: {}
        },
        //通过filed type description 获取字段的itemdata
        getFieldItemDataByType: function (fields) {
            //fieldItemDatas
            _.each(fields, function (n) {
                var type = n.type;
                if (!type || !this.fieldItemDatas[type]) return;
                var items = [];
                var description = n.description;
                if (this.fieldItemDatas[type][description]) {
                    items = this.fieldItemDatas[type][description];
                } else {
                    var fn = this["get" + _.capitalize(type) + "Data"];
                    if (fn) {
                        items = fn.call(this, n);
                    }
                }
                n.items = items;
            }, this);
            return fields;
        },
        //获取数字选项
        getRangeData: function (field) {
            var items = [];
            var description = field.description;
            if (_.isEmpty(description)) return items;
            try {
                var desc = angular.fromJson(description);
            } catch (e) {
                console.log(e)
            }
            if (!desc) return items;
            var getStep = function (step, number) {
                if (_.isString(step)) step = parseFloat(step);
                if (_.isArray(step)) {
                    var curStep = _.find(step, function (n) {
                        return n.min <= number && number < n.max;
                    });
                    step = curStep ? curStep.step : 1;
                }
                if (!step) step = 1;
                return step;
            };
            var numbers = [];
            var step = getStep(desc.step, desc.min);
            for (var i = desc.min; i <= desc.max; i = (i * 10000000000000 + step * 10000000000000) / 10000000000000) {
                step = getStep(desc.step, i);
                numbers.push(i);
            }
            items = _.map(numbers, function (n) {
                return {name: n, value: n};
            });
            this.fieldItemDatas.range[description] = items;
            return items;
        },
        //获取文本选项,逗号分隔
        getSelectData: function (field) {
            var items = [];
            var description = field.description;
            items = _.map(description.split(","), function (n) {
                return {name: n, value: n};
            });
            return items;
        },

    };
});