### `井身结构示意图画图数据`

```json
{ 
  "name": "", // 名称
  "type": 0 , // 类型 0 直井，1 水平井， 2，其它定向井
  "maxVerticalHeight": 3200, // 最大深度（垂深）
  "openTimes": 4, // 开钻次数
  "stratum": [ // 层位
      {
          "minHeight": 0, // 垂深最小值
          "maxHeight": 500, // 垂深最大值
          "name": "蓬莱镇" // 层位名称
      }
      ...
  ],
  "density": [ // 钻井液密度
        {
          "minDensity": 1.15, // 钻井液密度（最小值）
          "maxDensity": 1.25, // 钻井液密度 （最大值）
          "minHeight": 0, // 垂深最小值
          "maxHeight": 500 // 垂深最大值
        }
       ...
    ],
   "pressureCoefficient": [ // 地层空隙压力系数
       {
          "value": 1.2, // 压力系数值
          "minHeight": 0, // 垂深最小值
          "maxHeight": 500 // 垂深最大值
       }
       ...
   ],
  "data": [ // 各个开次相关数据
      {
          "index": 1, // 开次
          "casingOuterDiameter": 339.70, // 套管外径
          "boresize": 444.50, // 井眼尺寸
          "wellDeep": 501, // 井深
          "verticalHeight": 501, // 垂深
          "casingTopDeep": 0, // 套管顶深（井深）
          "casingBottomDeep": 500, // 套管底深（井深）
          "casingTopHeight": 0, // 套管顶深 （垂深）
          "casingBottomHeight": 500, // 套管底深 （垂深）
          "cemmentReturnHeight": 0 // 水泥返高
      }
      ...
  ],
  "keyPoints": [ // 需要标识的关键点
      {
      	"type": 0, // 枚举关键点对应关系（造斜点，靶点）
        "height": 3000, // 垂深 
        "deep": 3500 // 井深
      }
      ...
  ],
}
```

### `水平井`

```json
{
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0,
    wellType: '水平井',
    keypoints: [{ x: 0, y: 0, name: '井口' }], // 关键点
    targets: [
        { x: 0, y: 0, type: '方形靶', topBottom: 20, leftRight: 30, group: '靶区01' },
        { x: 0, y: 0, type: '方形靶', topBottom: 20, leftRight: 30, group: '靶区01' }
    ],
    data: [
        {
            name: '井眼01',
            color: red,
            data: [
                [0, 0],
                [-0.04, 0.23]
            ]
        }
    ]
}
```

### `定向井`

```json
{
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0,
    wellType: '定向井',
    keypoints: [{ x: 0, y: 0, name: '井口' }], // 关键点
    targets: [
        { x: 0, y: 0, type: '圆靶', radius: 20 },
        { x: 0, y: 0, type: '点靶', radius: 20 },
        { x: 0, y: 0, type: '方形靶', topBottom: 20, leftRight: 30 }
    ],
    data: [
        {
            name: '井眼01',
            color: red,
            data: [
                [0, 0],
                [-0.04, 0.23]
            ]
        }
    ]
}
```

