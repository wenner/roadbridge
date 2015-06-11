angular.module("bridge.config", [])
    .constant("BaseData", {
        roads: [
            //{name:"京哈高速" , id:"G1"} ,
            {name:"荣乌高速" , id:"G18" , startcity:"当城" , endcity:"塘沽"} ,
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
            {name:"津静公路桥" , road:"G18" , sn:"093" ,
                zhuanghao: "K759+061" , //桩号
                '上部主要承重构件':'预制板梁' ,
                '上部一般承重构件':'湿接缝' ,
                '支座': '钢支座' ,
                '桥面铺装': '沥青砼桥面' ,
                kongs:[
                    {numbers:"1-5" , //孔号 , 1-4,5,6-9
                        liang: 13, //主梁数
                        cailiao:"C50混凝土" , //材料
                        kuajing:"5×20" , //跨径 ,
                        xingshi: "先张预应力混凝土空心板梁" ,  //形式
                        type:"预制板梁"
                    }
                ] ,
                duns: [
                    {numbers:"1-4" , xingshi:"Φ1.2m圆形墩柱" , cailiao:"C30混凝土" ,
                        jichuxingshi:"Φ1.5m钻孔灌注桩埋置肋板式桥台"} ,
                    {numbers:"0,5" , xingshi:"埋置肋板式桥台" , cailiao:"C30混凝土" ,
                        jichuxingshi:"钻孔灌注桩基础，钢筋混凝土承台"}
                ] ,
                f1:'G18' ,
                f2:'荣乌高速公路' ,
                f3:'高速公路' ,
                f4:'093' ,
                f5:'津静公路桥' ,
                f6:'K759+061' ,
                f7:'汽车-超20，挂车-120' ,
                f8:'55t' ,
                f9:'正交' ,
                f10:'4cm厚细粒式沥青混凝土+6cm厚中粒式沥青混凝土+10cm防水水泥混凝土' ,
                f11:'天津高速公路集团有限公司运营事业部养护一分中心' ,
                f12:'2005.12' ,
                f13:'100' ,
                f14:'14.5' ,
                f15:'11.25' ,
                f16:'' ,
                f17:'' ,
                f27:'GQF-MZL80' ,
                f28:'2' ,
                f29:'板式橡胶' ,
                f30:'浆砌片石' ,
                f31:'结构技术数据为单幅桥数据。0#桥台采用桩直接顶边盖梁形式，66#桥台采用埋置肋板式桥台，钻孔灌注桩基础，钢筋混凝土承台。（第3孔跨渠；第34孔跨铁路；第45、52、63孔跨路；第64、65孔跨河）跨径组合：（28×25）[预应力混凝土小箱梁]+（15+20+15）[钢筋混凝土箱梁]+（33+2×38+31）[预应力混凝土板梁]+（15+20+15）[钢筋混凝土箱梁]+（11×25）[预应力混凝土小箱梁]+（20+25+44+32）[预应力混凝土箱梁]+（6×25）[预应力混凝土小箱梁]+（15+20+15）[钢筋混凝土箱梁]+（4×20）[预应力混凝土板梁]' ,
                f32:'093-32.jpg' ,
                f33:'093-33.jpg'
            } ,
            {name:"津浦铁路桥" , road:"G18" , sn:"090" ,
                zhuanghao:"K757+311" , //桩号
                '上部主要承重构件':'悬臂梁桥' ,
                '上部一般承重构件':'铰缝' ,
                '支座': '橡胶支座' ,
                '桥面铺装': '水泥混凝土' ,
                kongs:[
                    {numbers:"63-66" , type:"预制板梁" , liang:13 , cailiao:"C50混凝土" , xingshi:"20m简支先张预应力混凝土空心板梁，梁高0.9m" ,
                        kuajing:"（28×25+15+20+15+33+2×38+31+15+20+15+11×25+20+25+44+32+6×25+15+20+15+4×20）m"} ,
                    {numbers:"60-62,36-38,29-31" , type:"整体箱梁" , liang:1 , cailiao:"C30凝土" , xingshi:"钢筋混凝土连续箱梁，梁高1.3m" ,
                        kuajing:"（28×25+15+20+15+33+2×38+31+15+20+15+11×25+20+25+44+32+6×25+15+20+15+4×20）m"} ,
                    {numbers:"1-28,39-49,54-59" , type:"小箱梁" , liang:5 , cailiao:"C50凝土" , xingshi:"25m简支变连续小箱梁，梁高1.4m" ,
                        kuajing:"（28×25+15+20+15+33+2×38+31+15+20+15+11×25+20+25+44+32+6×25+15+20+15+4×20）m"} ,
                    {numbers:"32-35" , type:"预制板梁" , liang:9 , cailiao:"C50凝土" , xingshi:"35m简支后张预应力混凝土空心板梁" ,
                        kuajing:"（28×25+15+20+15+33+2×38+31+15+20+15+11×25+20+25+44+32+6×25+15+20+15+4×20）m"} ,
                    {numbers:"50-53" , type:"整体箱梁" , liang:1 , cailiao:"C50凝土" , xingshi:"预应力混凝土连续箱梁，梁高2.0m" ,
                        kuajing:"（28×25+15+20+15+33+2×38+31+15+20+15+11×25+20+25+44+32+6×25+15+20+15+4×20）m"}
                ] ,
                duns: [
                    {numbers:"1-12,17-31,35-65" , xingshi:"Φ1.2m圆形墩柱" , cailiao:"C30混凝土" ,
                        jichuxingshi:"Φ1.5m钻孔灌注桩"} ,
                    {numbers:"13,16" , xingshi:"Φ1.2m圆形墩柱" , cailiao:"C30混凝土" ,
                        jichuxingshi:"Φ1.5m钻孔灌注桩"} ,
                    {numbers:"14,15" , xingshi:"Φ1.5m圆形墩柱" , cailiao:"C30混凝土" ,
                        jichuxingshi:"Φ1.5m钻孔灌注桩"} ,
                    {numbers:"32-34,66" , xingshi:"Φ1.5m圆形墩柱" , cailiao:"C30混凝土" ,
                        jichuxingshi:"Φ1.8m钻孔灌注桩"}
                ] ,
                f1:'G18' ,
                f2:'荣乌高速公路' ,
                f3:'高速公路' ,
                f4:'090' ,
                f5:'津浦铁路桥' ,
                f6:'K757+311' ,
                f7:'汽车-超20，挂车-120' ,
                f8:'55t' ,
                f9:'正交' ,
                f10:'4cm厚细粒式沥青混凝土+6cm厚中粒式沥青混凝土+10cm防水水泥混凝土' ,
                f11:'天津高速公路集团有限公司运营事业部养护一分中心' ,
                f12:'2005.12' ,
                f13:'1616' ,
                f14:'14.5' ,
                f15:'11.25' ,
                f16:'' ,
                f17:'' ,
                f27:'GQF-MZL80' ,
                f28:'15' ,
                f29:'板式橡胶' ,
                f30:'浆砌片石' ,
                f31:'结构技术数据为单幅桥数据。0#桥台采用桩直接顶边盖梁形式，66#桥台采用埋置肋板式桥台，钻孔灌注桩基础，钢筋混凝土承台。（第3孔跨渠；第34孔跨铁路；第45、52、63孔跨路；第64、65孔跨河）跨径组合：（28×25）[预应力混凝土小箱梁]+（15+20+15）[钢筋混凝土箱梁]+（33+2×38+31）[预应力混凝土板梁]+（15+20+15）[钢筋混凝土箱梁]+（11×25）[预应力混凝土小箱梁]+（20+25+44+32）[预应力混凝土箱梁]+（6×25）[预应力混凝土小箱梁]+（15+20+15）[钢筋混凝土箱梁]+（4×20）[预应力混凝土板梁]' ,
                f32:'090-32.jpg' ,
                f33:'090-33.jpg'
            } ,
            {name:"桥梁3" , road:"s1" ,
                '上部主要承重构件':'整体箱梁' ,
                '上部一般承重构件':'横隔板' ,
                '支座': '砼摆式支座' ,
                '桥面铺装': '沥青砼桥面'
            } ,
            {name:"桥梁4" , road:"s1" ,
                '上部主要承重构件':'钢梁桥' ,
                '上部一般承重构件':'横隔板' ,
                '支座': '砼摆式支座' ,
                '桥面铺装': '水泥混凝土'
            }
        ] ,
        buweis:[
            {name:"上部/下部结构"} ,
            {name:"桥面系"}
        ] ,
        bujians: [
            {name:"上部主要承重构件" , buwei:"上部/下部结构"} ,
            {name:"上部一般承重构件" , buwei:"上部/下部结构"} ,
            {name:"支座" , buwei:"上部/下部结构"} ,
            {name:"翼墙/耳墙" , buwei:"上部/下部结构"} ,
            {name:"锥坡/护坡" , buwei:"上部/下部结构"} ,
            {name:"桥墩" , buwei:"上部/下部结构"} ,
            {name:"桥台" , buwei:"上部/下部结构"} ,
            {name:"墩台基础" , buwei:"上部/下部结构"} ,
            {name:"河床" , buwei:"上部/下部结构"} ,
            {name:"调治构造物" , buwei:"上部/下部结构"} ,
            {name:"桥面铺装" , buwei:"桥面系"} ,
            {name:"伸缩缝装置" , buwei:"桥面系"} ,
            {name:"人行道" , buwei:"桥面系"} ,
            {name:"栏杆护栏" , buwei:"桥面系"} ,
            {name:"排水系统" , buwei:"桥面系"} ,
            {name:"照明/标志" , buwei:"桥面系"}
        ] ,
        leibies: [
            //上部主要承重构件-default ,
            {"name":"蜂窝,麻面","value":"","memo":"3级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"剥落,掉角","value":"","memo":"4级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"空洞,孔洞","value":"","memo":"4级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"保护层厚度","value":"","memo":"规程5级标准4级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"钢筋锈蚀","value":"","memo":"5级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"混凝土碳化","value":"","memo":"4级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"混凝土强度","value":"","memo":"5级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"跨中挠度","value":"","memo":"5级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"结构变位","value":"","memo":"5级","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"预应力构件损伤","value":"","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"简支桥,钢架桥裂缝","value":"","bujian":"上部主要承重构件","bujian_value":"default"} ,
            {"name":"连续结构及钢构桥裂缝","value":"","bujian":"上部主要承重构件","bujian_value":"default"} ,
            //上部主要承重构件-钢梁桥 ,
            {"name":"涂层劣化","bujian":"上部主要承重构件","bujian_value":"钢梁桥"} ,
            {"name":"锈蚀","bujian":"上部主要承重构件","bujian_value":"钢梁桥"} ,
            {"name":"焊接开缝","bujian":"上部主要承重构件","bujian_value":"钢梁桥"} ,
            {"name":"铆钉(螺栓)损失","bujian":"上部主要承重构件","bujian_value":"钢梁桥"} ,
            {"name":"构件变形","bujian":"上部主要承重构件","bujian_value":"钢梁桥"} ,
            {"name":"跨中挠度","bujian":"上部主要承重构件","bujian_value":"钢梁桥"} ,
            {"name":"结构变位","bujian":"上部主要承重构件","bujian_value":"钢梁桥"} ,
            {"name":"构件裂缝","bujian":"上部主要承重构件","bujian_value":"钢梁桥"} ,
            //上部一般承重构件-default ,
            {"name":"蜂窝,麻面","value":"","memo":"3级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"剥落,掉角","value":"","memo":"4级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"空洞,孔洞","value":"","memo":"4级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"保护层厚度","value":"","memo":"规程5级标准4级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"钢筋锈蚀","value":"","memo":"5级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"混凝土碳化","value":"","memo":"4级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"混凝土强度","value":"","memo":"5级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"跨中挠度","value":"","memo":"5级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"结构变位","value":"","memo":"5级","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"预应力构件损伤","value":"","bujian":"上部一般承重构件","bujian_value":"default"} ,
            {"name":"简支桥,钢架桥裂缝","value":"","bujian":"上部一般承重构件","bujian_value":"default"} ,
            //支座-橡胶支座 ,
            {"name":"板式支座老化,开裂","memo":"5级","bujian":"支座","bujian_value":"橡胶支座"} ,
            {"name":"板式支座缺陷","memo":"4级","bujian":"支座","bujian_value":"橡胶支座"} ,
            {"name":"板式支座串动,脱空,剪切变形","bujian":"支座","bujian_value":"橡胶支座"} ,
            {"name":"盆式支座组件损坏","memo":"5级","bujian":"支座","bujian_value":"橡胶支座"} ,
            {"name":"盆式支座转交位移超限","memo":"4级","bujian":"支座","bujian_value":"橡胶支座"} ,
            {"name":"聚四氟乙烯滑板磨损","memo":"4级","bujian":"支座","bujian_value":"橡胶支座"} ,
            //支座-钢支座 ,
            {"name":"钢支座组件或功能缺陷","memo":"4级","bujian":"支座","bujian_value":"钢支座"} ,
            {"name":"钢支座位移,转角超限","memo":"4级","bujian":"支座","bujian_value":"钢支座"} ,
            {"name":"钢支座部件磨损裂缝","memo":"5级","bujian":"支座","bujian_value":"钢支座"} ,
            //支座-砼摆式支座 ,
            {"name":"混凝土缺陷","memo":"4级","bujian":"支座","bujian_value":"砼摆式支座"} ,
            {"name":"活动支座滑动面不平整,生锈","memo":"4级","bujian":"支座","bujian_value":"砼摆式支座"} ,
            {"name":"轴承有裂缝,切口或偏移","bujian":"支座","bujian_value":"砼摆式支座"} ,
            //翼墙|耳墙-default ,
            {"name":"破损","memo":"4级","bujian":"翼墙|耳墙","bujian_value":"default"} ,
            {"name":"位移,鼓肚砌体松动","memo":"4级,4级","bujian":"翼墙|耳墙","bujian_value":"default"} ,
            {"name":"裂缝","memo":"4级","bujian":"翼墙|耳墙","bujian_value":"default"} ,
            //锥坡/护坡-default ,
            {"name":"破损","memo":"4级","bujian":"锥坡/护坡","bujian_value":"default"} ,
            {"name":"位移,鼓肚砌体松动","memo":"4级,4级","bujian":"锥坡/护坡","bujian_value":"default"} ,
            {"name":"裂缝","memo":"4级","bujian":"锥坡/护坡","bujian_value":"default"} ,
            //桥墩-default ,
            {"name":"蜂窝,麻面","value":"","memo":"3级","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"剥落,掉角","value":"","memo":"4级","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"空洞,孔洞","value":"","memo":"4级","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"钢筋锈蚀","value":"","memo":"5级","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"混凝土碳化,腐蚀","memo":"4级","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"混凝土磨损","memo":"4级","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"圬工砌体缺陷","memo":"4级","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"抗震挡开裂","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"墩身移位","memo":"5级","bujian":"桥墩","bujian_value":"default"} ,
            {"name":"裂缝","bujian":"桥墩","bujian_value":"default"} ,
            //桥台-default ,
            {"name":"剥落","memo":"4级","bujian":"桥台","bujian_value":"default"} ,
            {"name":"空洞,孔洞","memo":"4级","bujian":"桥台","bujian_value":"default"} ,
            {"name":"台身磨损,台帽破损","memo":"3级,4级","bujian":"桥台","bujian_value":"default"} ,
            {"name":"砼碳化,腐蚀","memo":"3级","bujian":"桥台","bujian_value":"default"} ,
            {"name":"圬工砌体缺陷","bujian":"桥台","bujian_value":"default"} ,
            {"name":"桥头跳车","memo":"4级","bujian":"桥台","bujian_value":"default"} ,
            {"name":"台背排水状况","bujian":"桥台","bujian_value":"default"} ,
            {"name":"位移","memo":"5级","bujian":"桥台","bujian_value":"default"} ,
            {"name":"裂缝","memo":"台身5级,台帽4级","bujian":"桥台","bujian_value":"default"} ,
            //墩台基础-default ,
            {"name":"基础冲刷,淘空","memo":"5级","bujian":"墩台基础","bujian_value":"default"} ,
            {"name":"剥落露筋","memo":"5级","bujian":"墩台基础","bujian_value":"default"} ,
            {"name":"沉降,冲蚀","memo":"5级,4级","bujian":"墩台基础","bujian_value":"default"} ,
            {"name":"滑移倾斜","memo":"5级","bujian":"墩台基础","bujian_value":"default"} ,
            {"name":"河底铺砌损坏","memo":"4级","bujian":"墩台基础","bujian_value":"default"} ,
            {"name":"裂缝","memo":"5级","bujian":"墩台基础","bujian_value":"default"} ,
            //河床-default ,
            {"name":"河床堵塞","bujian":"河床","bujian_value":"default"} ,
            {"name":"冲刷","bujian":"河床","bujian_value":"default"} ,
            {"name":"河床变浅","bujian":"河床","bujian_value":"default"} ,
            //调治构造物-default ,
            {"name":"损坏","bujian":"调治构造物","bujian_value":"default"} ,
            {"name":"冲刷变形","bujian":"调治构造物","bujian_value":"default"} ,
            //桥面铺装-沥青砼桥面 ,
            {"name":"变形","memo":"4级","bujian":"桥面铺装","bujian_value":"沥青砼桥面"} ,
            {"name":"泛油","memo":"4级","bujian":"桥面铺装","bujian_value":"沥青砼桥面"} ,
            {"name":"破损","memo":"4级","bujian":"桥面铺装","bujian_value":"沥青砼桥面"} ,
            {"name":"裂缝","memo":"4级","bujian":"桥面铺装","bujian_value":"沥青砼桥面"} ,
            {"name":"桥头与路堤连接处","bujian":"桥面铺装","bujian_value":"沥青砼桥面"} ,
            //桥面铺装-水泥混凝土 ,
            {"name":"磨光,脱皮,露骨","memo":"4级","bujian":"桥面铺装","bujian_value":"水泥混凝土"} ,
            {"name":"坑洞","memo":"4级","bujian":"桥面铺装","bujian_value":"水泥混凝土"} ,
            {"name":"剥落","memo":"4级","bujian":"桥面铺装","bujian_value":"水泥混凝土"} ,
            {"name":"接缝处拱起,错台","memo":"4级,4级","bujian":"桥面铺装","bujian_value":"水泥混凝土"} ,
            {"name":"接缝料损坏","memo":"4级","bujian":"桥面铺装","bujian_value":"水泥混凝土"} ,
            {"name":"裂缝","memo":"4级","bujian":"桥面铺装","bujian_value":"水泥混凝土"} ,
            //伸缩缝装置-default ,
            {"name":"凹凸不平(错台)","memo":"4级","bujian":"伸缩缝装置","bujian_value":"default"} ,
            {"name":"锚固区缺陷","memo":"4级","bujian":"伸缩缝装置","bujian_value":"default"} ,
            {"name":"破损,失效","memo":"4级,4级","bujian":"伸缩缝装置","bujian_value":"default"} ,
            //人行道-default ,
            {"name":"破损,缺失","memo":"4级,4级","bujian":"人行道","bujian_value":"default"} ,
            //栏杆护栏-default ,
            {"name":"撞坏缺失,破损","memo":"4级,4级","bujian":"栏杆护栏","bujian_value":"default"} ,
            //排水系统-default ,
            {"name":"排水不畅","memo":"4级","bujian":"排水系统","bujian_value":"default"} ,
            {"name":"泄水管饮水槽缺陷","memo":"3级","bujian":"排水系统","bujian_value":"default"}
            //照明/标志-default

        ] ,


        steps:[
            {name:"路线" , code:"road" , nextstep:"direction" , template:"commonselector"} ,
            {name:"方向" , code:"direction" , nextstep:"bridge" , template:"commonselector"} ,
            {name:'桥梁' , code:'bridge' , nextstep:"buwei" , template:"commonselector"} ,
            {name:"部位" , code:'buwei' , template:"commonselector" , nextstep: function(current){
                return current.buwei.value == "桥面系" ? "lian" : "kong";
            }} ,
            {name:"孔号" , code:"kong" , template:"commonselector" , nextstep:"bujian"} ,
            {name:"联号" , code:"lian" , template:"commonselector" , nextstep:"bujian"} ,
            {name:"部件" , code:'bujian' , template:"commonselector" , nextstep:function(current){
                var ns = "leibie";
                var bujian = current.bujian.value;
                if (bujian == "上部主要承重构件"){
                    ns =  "goujian";
                    switch(current.kong.type){
                        case "整体箱梁":
                            ns = "leibie";
                            break;
                        case "悬臂梁桥":
                        case "钢梁桥":
                            ns = "goujian";
                            break;
                    }
                }
                return ns;
            }} ,
            {name:"构件" , code:'goujian' , nextstep:"leibie" , template: function(current , currentStep , result){
                    var url = "";
                    var kong = current.kong;
                    if (kong){
                        switch(kong.type){
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
            {name:"病害类别" , code:"leibie" , nextstep:"binghai" , template:"commonselector"} ,
            {name:"病害信息" , code:"binghai" , nextstep:"pingjia" , template: function(current , currentStep , result){
                    return "binghai";
                    var url = "";
                    var bridge = current.bridge;
                    var bujian = current.bujian.value;
                    var leibie = current.leibie.value;
                    var s = [];
                    if (bujian) s.push(bujian);
                    if (bridge[bujian]) s.push(bridge[bujian]);
                    if (leibie) s.push(leibie);
                    return s.join("-");
                }
            } ,
            {name:"评价" , code:"pingjia" , isEnd:true , template:"commonselector" , items:[
                {name:"完好,无蜂窝麻面"} ,
                {name:"较大面积蜂窝麻面"} ,
                {name:"大面积蜂窝麻面"}
            ]}
        ]
    });