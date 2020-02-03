window.addEventListener('load', setup, false);

let gameWidth = 500;
let gameHeight = 500;

let app;
let points = [];
let segments = [];

function setup() {
    app = new PIXI.Application({
        width: gameWidth,
        height: gameHeight,
        antialias: true
    });
    app.renderer.backgroundColor = 0x6E6378;

    document.body.appendChild(app.view);

    /////////////////
    /////////////////
    //setup

    for (let i = 0; i < 4; i++) {
        points.push(point(app));
    }

    for (let i = 0; i < points.length; i++) {
        points.forEach(p => {

            if (points[i] != p) {
                let found = segments.find(s => {
                    if ((points[i] == s.cParent && p == s.cPartner) ||
                        (points[i] == s.cPartner && p == s.cParent)) {
                        return true;
                    } else {
                        return false;
                    }
                });

                if (!found) {
                    segments.push(segment(app, points[i], p));
                }
            }

        });
    }


    //Set the game state
    state = play;

    //Start the game loop 
    app.ticker.add(delta => gameLoop(delta));




    // console.log(segments.length);
    // console.log("ONEONEONEONEONEONEONE");
    // console.log(segments[0].currentPath.points);
    // console.log("TWOTWOTWOTWOTWOTWOTWO");
    // console.log(segments[1].currentPath.points);
    // console.log(findPOI(segments[0].currentPath.points, segments[1].currentPath.points));

    // 191, 484 -> 118, 198 index.js:74:29
    // 86, 453 -> 407, 415
}

function gameLoop(delta) {

    //Update the current game state:
    state(delta);
}

function play(delta) {

    //re-render line segments
    segments.forEach(s => {
        s.cReRender();
    });
    // // console.log(segments.length);


    for (let o = 0; o < segments.length; o++) {
        for (let i = 0; i < segments.length; i++) {
            if (segments[o] != segments[i]) {
                if (findPOI(segments[o], segments[i])) {
                    segments[o].cReRender(0x4B4B4B);
                    break;
                } else {
                    segments[o].cReRender();
                }
            }
        }
    }
}

function getRndInRng(lower, upper) {
    return Math.floor((Math.random() * upper) + lower);
}

function findPOI(a, b) {
    let p1 = new PIXI.Point(a.cParent.x, a.cParent.y);
    let p2 = new PIXI.Point(a.cPartner.x, a.cPartner.y);
    let p3 = new PIXI.Point(b.cParent.x, b.cParent.y);
    let p4 = new PIXI.Point(b.cPartner.x, b.cPartner.y);

    // if (((p1.x != p3.x) && (p1.y != p3.y)) && ((p2.x != p4.x) && p2.y != p4.y)) {
    if (p1.equals(p3) || p2.equals(p4)) {

        let num1 = (p2.x * p1.y - p1.x * p2.y);
        let num2 = (p4.x * p3.y - p3.x * p4.y);

        let deno = ((p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y));

        let x = ((num1 * (p4.x - p3.x) - num2 * (p2.x - p1.x)) / deno);

        let y = ((num1 * (p4.y - p3.y) - num2 * (p2.y - p1.y)) / deno);

        let p = new PIXI.Point(x, y);

        if (a.containsPoint(p) || b.containsPoint(p)) {
            //console.log(p.x, p.y);
            return true;
        }
    }

    return false;
}

function point(app) {
    let circle = new PIXI.Graphics();
    circle.beginFill(0xFFFFFF);
    circle.drawCircle(0, 0, 10);
    circle.endFill();
    circle.x = getRndInRng(0, gameWidth);
    circle.y = getRndInRng(0, gameHeight);

    //code to enable moue interaction
    circle.interactive = true;
    circle.cMove = false;
    circle.on('mousedown', e => {
        circle.cMove = true;
    });
    circle.on('mousemove', e => {
        if (circle.cMove) {
            circle.x = e.data.global.x;
            circle.y = e.data.global.y;
        }
    });
    circle.on('mouseup', e => {
        circle.cMove = false;
    });



    app.stage.addChild(circle);
    return circle;
}

function segment(app, p1, p2) {
    let line = new PIXI.Graphics();
    line.lineStyle(4, 0xFFFFFF, 1);
    line.moveTo(p1.x, p1.y);
    line.lineTo(p2.x, p2.y);
    line.x = 0;
    line.y = 0;
    app.stage.addChild(line);

    //custom
    line.cParent = p1;
    line.cPartner = p2;

    line.cReRender = function (color = 0xF7F0FD) {
        line.clear();
        line.lineStyle(2, color, 1);
        line.moveTo(line.cParent.x, line.cParent.y);
        line.lineTo(line.cPartner.x, line.cPartner.y);
    };

    return line;
}