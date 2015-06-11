var s = {name:"病害类别" , code:"leibie" , nextstep:"binghai" , template:"commonselector" , nodeKey:"bujian" ,
    nodes:{
    "上部主要承重构件": {nodeKey:"bridge.上部主要承重构件" ,nodes:{
        "default": {items:[
            {name:"蜂窝,麻面" , value:"" , memo:"3级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"剥落,掉角" , value:"" , memo:"4级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"空洞,孔洞" , value:"" , memo:"4级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"保护层厚度" , value:"" , memo:"规程5级标准4级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"钢筋锈蚀" , value:"" , memo:"5级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"混凝土碳化" , value:"" , memo:"4级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"混凝土强度" , value:"" , memo:"5级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"跨中挠度" , value:"" , memo:"5级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"结构变位" , value:"" , memo:"5级" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"预应力构件损伤" , value:"" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"简支桥,钢架桥裂缝" , value:"" , bujian:"上部主要承重构件" , bujian_value:"default"} ,
            {name:"连续结构及钢构桥裂缝" , value:"" , bujian:"上部主要承重构件" , bujian_value:"default"}
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
    "上部一般承重构件": {items:[
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
}