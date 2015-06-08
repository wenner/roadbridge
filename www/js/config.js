angular.module("bridge.config", [])
    .constant("BaseData", {
        roads: [
            //{name:"京哈高速" , id:"G1"} ,
            //{name:"荣乌高速" , id:"G18"} ,
            //{name:"京沪高速" , id:"G2"} ,
            //{name:"长深高速" , id:"G25"} ,
            {name:"滨保高速" , id:"G2501"} ,
            {name:"津蓟高速" , id:"S1"} ,
            {name:"海滨高速" , id:"S11"} ,
            {name:"津宁高速" , id:"S2"} ,
            //{name:"塘承高速" , id:"S21"} ,
            {name:"津滨高速" , id:"S3"} ,
            {name:"京津高速" , id:"S30"} ,
            {name:"津港高速" , id:"S4"} ,
            //{name:"京津塘高速" , id:"S40"} ,
            //{name:"津晋高速" , id:"S50"} ,
            //{name:"津沧高速" , id:"S6"} ,
            //{name:"滨石高速" , id:"S60"} ,
            {name:"津保高速" , id:"S7"}
        ] ,
        bridges: [
            {name:"桥梁1 - 预制板梁/湿接缝/钢支座/沥青砼桥面" , road:"s1" , '上部主要承重构件':'预制板梁' , '上部一般构件':'湿接缝' ,
                '支座': '钢支座' , '桥面铺装': '沥青砼桥面'} ,
            {name:"桥梁2 - 悬臂梁桥/铰缝/橡胶支座/水泥混凝土" , road:"s1" , '上部主要承重构件':'悬臂梁桥' , '上部一般构件':'铰缝' ,
                '支座': '橡胶支座' , '桥面铺装': '水泥混凝土'} ,
            {name:"桥梁3 - 整体箱梁/横隔板/砼摆式支座/沥青砼桥面" , road:"s1" , '上部主要承重构件':'整体箱梁' , '上部一般构件':'横隔板' ,
                '支座': '砼摆式支座' , '桥面铺装': '沥青砼桥面'} ,
            {name:"桥梁4 - 钢梁桥/横隔板/砼摆式支座/水泥混凝土" , road:"s1" , '上部主要承重构件':'钢梁桥' , '上部一般构件':'横隔板' ,
                '支座': '砼摆式支座' , '桥面铺装': '水泥混凝土'}
        ] ,
        steps:[
            {name:'桥梁' , code:'bridge' , nextstep:"buwei" , items:"bridges" ,
                template:"commonselector"} ,

            {name:"部位" , code:'buwei' , template:"commonselector" , items:[
                {name:"上部/下部结构" , value:"上部/下部结构" , nextstep:"kong"} ,
                //{name:"下部结构" , value:"下部结构" , nextstep:"kong"} ,
                {name:"桥面系" , value:"桥面系" , nextstep:"lian" , nextstep:"lian"}
            ]} ,
            {name:"孔数" , code:"kong" , template:"commonselector" , nextstep:"bujian" , items:{
                type:'ranger' , min:1 , max:20 , step:1 , unit:'孔' , template:""
            }} ,
            {name:"联" , code:"lian" , template:"commonselector" , nextstep:"bujian" , items:{
                type:'ranger' , min:1 , max:20 , step:1 , unit:'联' , template:""
            }} ,
            {name:"部件" , code:'bujian' , template:"commonselector" , nodeKey:"buwei" ,
                nodes:{
                    "上部/下部结构" : {items:[
                        {name:"上部主要承重构件" , nextstep:function(current , stepInfo){
                            var ns =  "goujian";
                            switch(current.bridge["上部主要承重构件"]){
                                case "整体箱梁":
                                    ns = "leibie";
                                    break;
                                case "悬臂梁桥":
                                case "钢梁桥":
                                    ns = "goujian";
                                    break;
                            }
                            console.log(ns)
                            return ns;
                        }} ,
                        {name:"上部一般构件" , nextstep:"leibie"} ,
                        {name:"支座" , nextstep:"leibie"} ,
                        {name:"翼墙/耳墙" , nextstep:"leibie"} ,
                        {name:"锥坡/护坡" , nextstep:"leibie"} ,
                        {name:"桥墩" , nextstep:"leibie"} ,
                        {name:"桥台" , nextstep:"leibie"} ,
                        {name:"墩台基础" , nextstep:"leibie"} ,
                        {name:"河床" , nextstep:"leibie"} ,
                        {name:"调治构造物" , nextstep:"leibie"}
                    ]} ,
                    "桥面系": {items:[
                        {name:"桥面铺装" , nextstep:"leibie"} ,
                        {name:"伸缩缝装置" , nextstep:"leibie"} ,
                        {name:"人行道" , nextstep:"leibie"} ,
                        {name:"栏杆护栏" , nextstep:"leibie"} ,
                        {name:"排水系统" , nextstep:"leibie"} ,
                        {name:"照明/标志" , nextstep:"leibie"}
                    ]}
                }
            } ,
            {name:"构件" , code:'goujian' , title1:"填写构件信息" , nextstep:"leibie" ,
                items:{
                    type:'ranger' , min:1 , max:5 , step:1 , unit:'梁' , template:"第{{index}}号梁"
                } ,
                template: function(current , currentStep , result){
                    var url = "";
                    var bridge = current.bridge;
                    var bujian = current.bujian.value;
                    if (bridge && bujian && bridge[bujian]){
                        switch(current.bridge["上部主要承重构件"]){
                            case "悬臂梁桥":
                            case "钢梁桥":
                                url = "goujian-select";
                                break;
                            default:
                                url = "commonselector";
                                break;
                        }
                    }
                    return url;
                }
            } ,
            {name:"病害类别" , code:"leibie" , template:"commonselector" , nodeKey:"bujian" ,
                nodes:{
                    "上部主要承重构件": {nodeKey:"bridge.上部主要承重构件" ,nodes:{
                        "default": {items:[
                            {name:"蜂窝,麻面" , value:"" , memo:"3级"} ,
                            {name:"剥落,掉角" , value:"" , memo:"4级"} ,
                            {name:"空洞,孔洞" , value:"" , memo:"4级"} ,
                            {name:"保护层厚度" , value:"" , memo:"规程5级标准4级"} ,
                            {name:"钢筋锈蚀" , value:"" , memo:"5级"} ,
                            {name:"混凝土碳化" , value:"" , memo:"4级"} ,
                            {name:"混凝土强度" , value:"" , memo:"5级"} ,
                            {name:"跨中挠度" , value:"" , memo:"5级"} ,
                            {name:"结构变位" , value:"" , memo:"5级"} ,
                            {name:"预应力构件损伤" , value:""} ,
                            {name:"简支桥,钢架桥裂缝" , value:""} ,
                            {name:"连续结构及钢构桥裂缝" , value:""}
                        ]} ,
                        "钢梁桥": {items:[
                            {name:"涂层劣化"} ,
                            {name:"锈蚀"} ,
                            {name:"焊接开缝"} ,
                            {name:"铆钉(螺栓)损失"} ,
                            {name:"构件变形"} ,
                            {name:"跨中挠度"} ,
                            {name:"结构变位"} ,
                            {name:"构件裂缝"}
                        ]}
                    }} ,
                    "上部一般构件": {items:[
                        {name:"蜂窝,麻面" , value:"" , memo:"3级"} ,
                        {name:"剥落,掉角" , value:"" , memo:"4级"} ,
                        {name:"空洞,孔洞" , value:"" , memo:"4级"} ,
                        {name:"保护层厚度" , value:"" , memo:"规程5级标准4级"} ,
                        {name:"钢筋锈蚀" , value:"" , memo:"5级"} ,
                        {name:"混凝土碳化" , value:"" , memo:"4级"} ,
                        {name:"混凝土强度" , value:"" , memo:"5级"} ,
                        {name:"跨中挠度" , value:"" , memo:"5级"} ,
                        {name:"结构变位" , value:"" , memo:"5级"} ,
                        {name:"预应力构件损伤" , value:""} ,
                        {name:"简支桥,钢架桥裂缝" , value:""}
                    ]} ,
                    "支座": {nodeKey:"bridge.支座" , nodes:{
                        "橡胶支座": {items:[
                            {name:"板式支座老化,开裂" , memo:"5级"} ,
                            {name:"板式支座缺陷" , memo:"4级"} ,
                            {name:"板式支座串动,脱空,剪切变形"} ,
                            {name:"盆式支座组件损坏" , memo:"5级"} ,
                            {name:"盆式支座转交位移超限" , memo:"4级"} ,
                            {name:"聚四氟乙烯滑板磨损" , memo:"4级"}
                        ]} ,
                        "钢支座": {items:[
                            {name:"钢支座组件或功能缺陷" , memo:"4级"} ,
                            {name:"钢支座位移,转角超限" , memo:"4级"} ,
                            {name:"钢支座部件磨损裂缝" , memo:"5级"}
                        ]} ,
                        "砼摆式支座": {items:[
                            {name:"混凝土缺陷" , memo:"4级"} ,
                            {name:"活动支座滑动面不平整,生锈" , memo:"4级"} ,
                            {name:"轴承有裂缝,切口或偏移"}
                        ]}
                    }} ,
                    "翼墙|耳墙": {items:[
                        {name:"破损" , memo:"4级"} ,
                        {name:"位移,鼓肚砌体松动" , memo:"4级,4级"} ,
                        {name:"裂缝" , memo:"4级"}
                    ]} ,
                    "锥坡/护坡": {items:[
                        {name:"破损" , memo:"4级"} ,
                        {name:"位移,鼓肚砌体松动" , memo:"4级,4级"} ,
                        {name:"裂缝" , memo:"4级"}
                    ]} ,
                    "桥墩": {items:[
                        {name:"蜂窝,麻面" , value:"" , memo:"3级"} ,
                        {name:"剥落,掉角" , value:"" , memo:"4级"} ,
                        {name:"空洞,孔洞" , value:"" , memo:"4级"} ,
                        {name:"钢筋锈蚀" , value:"" , memo:"5级"} ,
                        {name:"混凝土碳化,腐蚀" , memo:"4级"} ,
                        {name:"混凝土磨损" , memo:"4级"} ,
                        {name:"圬工砌体缺陷" , memo:"4级"} ,
                        {name:"抗震挡开裂"} ,
                        {name:"墩身移位" , memo:"5级"} ,
                        {name:"裂缝"}
                    ]} ,
                    "桥台": {items:[
                        {name:"剥落" , memo:"4级"} ,
                        {name:"空洞,孔洞" , memo:"4级"} ,
                        {name:"台身磨损,台帽破损" , memo:"3级,4级"} ,
                        {name:"砼碳化,腐蚀" , memo:"3级"} ,
                        {name:"圬工砌体缺陷"} ,
                        {name:"桥头跳车" , memo:"4级"} ,
                        {name:"台背排水状况"} ,
                        {name:"位移" , memo:"5级"} ,
                        {name:"裂缝" , memo:"台身5级,台帽4级"}
                    ]} ,
                    "墩台基础": {items:[
                        {name:"基础冲刷,淘空" , memo:"5级"} ,
                        {name:"剥落露筋" , memo:"5级"} ,
                        {name:"沉降,冲蚀" , memo:"5级,4级"} ,
                        {name:"滑移倾斜" , memo:"5级"} ,
                        {name:"河底铺砌损坏" , memo:"4级"} ,
                        {name:"裂缝" , memo:"5级"}
                    ]} ,
                    "河床": {items:[
                        {name:"河床堵塞"} ,
                        {name:"冲刷"} ,
                        {name:"河床变浅"}
                    ]} ,
                    "调治构造物": {items:[
                        {name:"损坏"} ,
                        {name:"冲刷变形"}
                    ]} ,
                    "桥面铺装": {nodeKey:"bridge.桥面铺装" , nodes:{
                        "沥青砼桥面": {items:[
                            {name:"变形" , memo:"4级"} ,
                            {name:"泛油" , memo:"4级"} ,
                            {name:"破损" , memo:"4级"} ,
                            {name:"裂缝" , memo:"4级"} ,
                            {name:"桥头与路堤连接处"}
                        ]} ,
                        "水泥混凝土": {items:[
                            {name:"磨光,脱皮,露骨" , memo:"4级"} ,
                            {name:"坑洞" , memo:"4级"} ,
                            {name:"剥落" , memo:"4级"} ,
                            {name:"接缝处拱起,错台" , memo:"4级,4级"} ,
                            {name:"接缝料损坏" , memo:"4级"} ,
                            {name:"裂缝" , memo:"4级"}
                        ]}
                    }},
                    "伸缩缝装置": {items:[
                        {name:"凹凸不平(错台)" , memo:"4级"} ,
                        {name:"锚固区缺陷" , memo:"4级"} ,
                        {name:"破损,失效" , memo:"4级,4级"}
                    ]} ,
                    "人行道":{items:[
                        {name:"破损,缺失" , memo:"4级,4级"}
                    ]} ,
                    "栏杆护栏":{items:[
                        {name:"撞坏缺失,破损" , memo:"4级,4级"}
                    ]} ,
                    "排水系统":{items:[
                        {name:"排水不畅" , memo:"4级"} ,
                        {name:"泄水管饮水槽缺陷" , memo:"3级"}
                    ]} ,
                    "照明/标志":{items:[

                    ]}
                }
            } ,
            {name:"病害信息" , code:"binghai" , nextstep:"pingjia" ,
                template: function(current , currentStep , result){
                    var url = "";
                    var bridge = current.bridge;
                    var bujian = current.bujian.value;
                    var leibie = current.leibie.value;
                    var s = [];
                    if (bujian) s.push(bujian);
                    if (bridge[bujian]) s.push(bridge[bujian]);
                    if (leibie) s.push(leibie);
                    return s.join("-");
                } ,
                controller: "BinghaiCtrl"
            } ,
            {name:"评价" , code:"pingjia" , template:"commonselector" , items:[
                {name:"完好,无蜂窝麻面"} ,
                {name:"较大面积蜂窝麻面"} ,
                {name:"大面积蜂窝麻面"}
            ]}
        ]
    });