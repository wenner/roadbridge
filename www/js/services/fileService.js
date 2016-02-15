'use strict';
angular.module('bridge.services')
    .factory('FileService' , function($q , $cordovaFileTransfer ,EnvService){
        return {
            upload:function(cfg){
                var file = cfg.file ,
                    callback = cfg.callback ,
                    success = cfg.success ,
                    failure = cfg.failure ,
                    options = cfg.options;

                if(!file) return;
                var win=function(response){
                    response.response = angular.fromJson(response.response);
                    console.log("Code = "+response.responseCode);
                    console.log("Response = "+response.response);
                    console.log("Sent = "+response.bytesSent);
                    if (_.isFunction(callback)){
                        callback(true , response);
                    }
                    if (_.isFunction(success)){
                        success(response);
                    }
                };

                var fail=function(error){
                    console.log("An error has occurred: Code = "+error.code);
                    console.log("upload error source "+error.source);
                    console.log("upload error target "+error.target);
                    if (_.isFunction(callback)){
                        callback(false , error);
                    }
                    if (_.isFunction(failure)){
                        failure(error);
                    }
                };

                var uploadOptions =new FileUploadOptions();
                uploadOptions.fileKey="file";
                uploadOptions.fileName=file.substr(file.lastIndexOf('/')+1);
                uploadOptions.mimeType="text/plain";
                /*
                _.each(options , function(value , key){
                    uploadOptions[key] = value;
                });
                */
                var ft=new FileTransfer();
                ft.upload(
                    file ,
                    encodeURI(EnvService.api+"file/upload") ,
                    win , fail , uploadOptions);

            }
        }
    }
);
