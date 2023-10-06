const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Engine, World, Bodies, Composite, Constraint, Body, Events} = require('matter-js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 3080;

const engine = Engine.create({
    enableSleeping: false, // 連続衝突検出を有効にする場合は、enableSleepingを無効にする必要がある場合があります
    positionIterations: 5, // より高い値を設定すると連続衝突検出が向上します
    velocityIterations: 5, // より高い値を設定すると連続衝突検出が向上します
});


// 重力を追加
engine.world.gravity.y = 10

// 壁を作成
const wallOptions = {
  isStatic: true, // 壁は静的
  friction: 0,    // 壁の摩擦を0に設定
};

//const leftWall = Bodies.rectangle(0, engine.world.bounds.height / 2, 10, engine.world.bounds.height, wallOptions);
//const rightWall = Bodies.rectangle(engine.world.bounds.width, engine.world.bounds.height / 2, 10, engine.world.bounds.height, wallOptions);

// 壁をワールドに追加
//World.add(engine.world, [leftWall, rightWall]);

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

const cylinder = Body.create( {
    parts: [
        Bodies.rectangle(60, 595, 100, 800),
        Bodies.rectangle(400, 1000, 600, 100),
        Bodies.rectangle(740, 595, 100, 800),
    ],
    isStatic: true,
})
World.add(engine.world, cylinder)

Events.on(engine, 'collisionStart', (event) => {
    //console.log(event)
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
            //console.log(bodyA.label)
            //console.log(bodyA.label)
            //console.log(enn[count + 1][1])

            World.remove(engine.world, bodyA);
            World.remove(engine.world, bodyB);
            // 合体した円をワールドに追加
            World.add(engine.world, newCircle);
            //console.log((count + 1).toString())

        }
        count++;
        }
    });
});


app.use(express.json());

wss.on('connection', (ws) => {
  console.log('Client connected');

  function sendWorldState() {
    const bodies = engine.world.bodies.map((body) => ({
      position: body.position,
      radius: body.circleRadius || null,
    }));
    ws.send(JSON.stringify(bodies));
  }

  const syncInterval = setInterval(sendWorldState, 10); // 10ミリ秒ごとに同期

  ws.on('message', (message) => {
    //try {
      const newBodies = JSON.parse(message);

      if (!Array.isArray(newBodies)) {
        console.error('Received data is not an array:', newBodies);
        return;
      }

      // // すべての物体を削除

      newBodies.forEach((bodyData) => {
        if (bodyData.radius) {
            t = Math.floor(Math.random() * 3)
            console.log(t)
            const circle = Bodies.circle(bodyData.x, bodyData.y, enn[t][0], {
                render: {
                    fillStyle: enn[t][1] // 円の塗りつぶし色
                },
                label: t.toString(),
            });
          World.add(engine.world, circle)
          //console.log("tuika")
        }
      });

      sendWorldState();
    //} catch (error) {
    //  console.error('Failed to parse message:', message);
    //}
  });

  ws.on('close', () => {
    clearInterval(syncInterval);
    console.log('Client disconnected');
  });
});

app.get('/reset', (req, res) =>{
  engine.world.bodies = []
  const cylinder = Body.create( {
    parts: [
        Bodies.rectangle(60, 595, 100, 800),
        Bodies.rectangle(400, 1000, 600, 100),
        Bodies.rectangle(740, 595, 100, 800),
    ],
    isStatic: true,
  })
  World.add(engine.world, cylinder)
  res.send('ok');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


//setInterval(() => {
//    Engine.update(engine, 10); // Matter.jsの物理シミュレーションを更新
//  }, 10);
Engine.run(engine)
app.use(express.static('public'));
