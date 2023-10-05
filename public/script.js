const { Engine, Render, World, Bodies, Events, Body, Constraint, Mouse, MouseConstraint,} = Matter;
const engine = Engine.create({
    enableSleeping: false, // 連続衝突検出を有効にする場合は、enableSleepingを無効にする必要がある場合があります
    positionIterations: 50, // より高い値を設定すると連続衝突検出が向上します
    velocityIterations: 50, // より高い値を設定すると連続衝突検出が向上します
});
const world = engine.world;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,  // キャンバスの幅
        height: 1200, // キャンバスの高さ
        wireframes: false // ワイヤーフレーム表示を無効にする
    }
})

enn = [
    [20,"#FFFFFF"],
    [30,"#EEEEEE"],
    [40,"#DDDDDD"],
    [50,"#DDDDDD"],
    [60,"#CCCCCC"],
    [70,"#BBBBBB"],
    [80,"#AAAAAA"],
]
iro = enn.map((item) => item[1]);

engine.world.gravity.y = 1 

// シリンダーを追加
const cylinder = Body.create( {
    parts: [
        Bodies.rectangle(60, 595, 100, 800),
        Bodies.rectangle(400, 1000, 600, 10),
        Bodies.rectangle(740, 595, 100, 800),
    ],
    isStatic: true,
})
World.add(engine.world, cylinder)

const elem = document.body
const circles = [];
elem.addEventListener('click',function(){
  // クリックイベントの処理を記述
  var mouseX = event.clientX
  otosu(mouseX,0)
});


function otosu(x,t){
    // クリックイベントの処理を記述
    y = 50
  
    // クリックした位置に円を追加
    const circle = Bodies.circle(x, y, enn[0][0], {
        render: {
            fillStyle: enn[t][1] // 円の塗りつぶし色
        },
        label: t.toString(),
    });
    circles.push(circle);
  
  
    World.add(engine.world, circle);
}



// 物体が移動したときに発生するイベントにリスナーを追加


elem.onclick = function(){
  // クリックイベントの処理を記述
};

Events.on(engine, 'collisionStart', (event) => {
    console.log(event)
    const pairs = event.pairs;
    pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // 衝突した2つの円を1つに合体する
        let count = 0
        while (count < enn.length - 1) {
        st = count.toString()
        //console.log(st)
        if (bodyA.label === st && bodyB.label === st) {
            const newCircle = Bodies.circle(
                (bodyA.position.x + bodyB.position.x) / 2,
                (bodyA.position.y + bodyB.position.y) / 2,
                enn[count + 1][0],
                {
                    render: {
                        fillStyle: enn[count + 1][1] // 合体後の円の色
                    },
                    label: (count + 1).toString()
                }
            );
            console.log(bodyA.label)
            console.log(bodyA.label)
            console.log(enn[count + 1][1])

            World.remove(engine.world, bodyA);
            World.remove(engine.world, bodyB);
            // 合体した円をワールドに追加
            World.add(engine.world, newCircle);
            console.log((count + 1).toString())

        }
        count++;
        }
    });
});

function update() {
    const bodies = world.bodies;

    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const position = body.position;

        // 画面外に出た場合に警告
        if (position.x < 0 || position.x > render.options.width || position.y < 0 || position.y > render.options.height) {
            console.log('警告: オブジェクトが画面外に移動しました');
            World.remove(world, body);
        }
    }

    requestAnimationFrame(update);
}

Engine.run(engine)
Render.run(render)
update();