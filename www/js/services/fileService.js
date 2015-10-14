'use strict';
angular.module('bridge.services')
    .factory(
    'FileService',
    function ($q) {
        return {
            upload: function(){

                var win = function (r) {
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                }

                var fail = function (error) {
                    alert("An error has occurred: Code = " + error.code);
                    console.log("upload error source " + error.source);
                    console.log("upload error target " + error.target);
                }

                var options = new FileUploadOptions();
                options.fileKey = "file";
                options.fileName = file.substr(file.lastIndexOf('/') + 1);
                options.mimeType = "text/plain";

                var params = {};
                params.value1 = "test";
                params.value2 = "param";

                options.params = params;

                var ft = new FileTransfer();
                alert(encodeURI(EnvService.api + "file/upload"))
                ft.upload(file, encodeURI(EnvService.api + "file/upload"), win, fail, options);

            }
        }
    }
);
