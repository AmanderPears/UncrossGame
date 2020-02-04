window.addEventListener('load', setup, false);

let gameWidth = 500;
let gameHeight = 500;

let app;
let points = [];
let segments = [];

let oldTime = null, winTime = null;

function setup() {
    app = new PIXI.Application({
        width: gameWidth,
        height: gameHeight,
        antialias: true
    });
    app.renderer.backgroundColor = 0x6E6378;
    app.stage.sortableChildren = true;

    document.body.appendChild(app.view);

    /////////////////
    /////////////////
    //setup

    // for (let i = 0; i < 6; i++) {
    //     points.push(point(app));
    // }

    // //connect all
    // for (let i = 0; i < points.length; i++) {
    //     points.forEach(p => {

    //         if (points[i] != p) {
    //             let found = segments.find(s => {
    //                 if ((points[i] == s.cParent && p == s.cPartner) ||
    //                     (points[i] == s.cPartner && p == s.cParent)) {
    //                     return true;
    //                 } else {
    //                     return false;
    //                 }
    //             });

    //             if (!found) {
    //                 segments.push(segment(app, points[i], p));
    //             }
    //         }

    //     });
    // }

    test();

    //Set the game state
    state = play;

    //Start the game loop 
    app.ticker.add(delta => gameLoop(delta));
}

function test() {
    // test1();
    test2();
}

function test1() {


    for (let i = 0; i < points.length; i++) {
        let s;
        if (i == (points.length - 1)) {
            s = segment(app, points[i], points[0]);
        } else {
            s = segment(app, points[i], points[i + 1]);
        }
        segments.push(s);
    }

    let index = 0;
    for (let i = (points.length - 3); i > 0; i--) {
        for (let j = 0; j < (points.length - 3) - index; j++) {
            console.log(index);
            console.log(index + 2 + j);
            if ((index + 3 + j) >= points.length) {
                break;
            }
            segments.push(segment(app, points[index], points[index + 2 + j]));
        }
        index++;
    }
}

function test2() {
    //create points
    for (let i = 0; i < 3; i++)
        points.push(point(app));

    //connect points
    for (let i = 0; i < points.length; i++) {
        let s;
        if (i == (points.length - 1)) {
            s = segment(app, points[i], points[0]);
        } else {
            s = segment(app, points[i], points[i + 1]);
        }
        segments.push(s);
    }

    let addmore = 5;

    let used = new Set();
    for (let i = 0; i < addmore; i++) {
        let exclude = new Set();
        //create new point
        points.push(point(app));
        //get current index
        let curIndex = points.length - 1;
        //exclude index
        exclude.add(curIndex);
        used.add(curIndex);

        let getNewIndex = function (iSet, cI) {
            let ind = cI;
            while (iSet.has(ind))
                ind = getRndInRng(0, points.length - 1);
            iSet.add(ind);
            used.add(ind);
            return ind;
        };

        for (let j = 0; j < (points.length - 3); j++) {
            //new index
            let index = getNewIndex(exclude, curIndex);
            //add segment
            segments.push(segment(app, points[curIndex], points[index]));
        }

    }

    // let findUnUsed = function (usedSet) {
    //     let unUsed = new Set();
    //     for (let i = 0; i < points.length; i++) {
    //         if (!usedSet.has(i)) {
    //             unUsed.add(i);
    //         }
    //     }

    //     return unUsed;
    // };

    // let unUsed = Array.from(findUnUsed(used));

    // console.log("size " + unUsed.size);
    // unUsed.forEach(s => console.log(s));

    // for (let i = 0; i < unUsed.length - 1; i++) {
    //     let s;
    //     s = segment(app, points[unUsed[i]], points[unUsed[i + 1]])

    //     segments.push(s);
    // }

    console.log(segments.length);
}

function gameLoop(delta) {

    //Update the current game state:
    state(delta);
}

function play(delta) {

    //re-render line segments
    // segments.forEach(s => {
    //     s.cReRender();
    // });
    // // console.log(segments.length);


    for (let o = 0; o < segments.length; o++) {
        for (let i = 0; i < segments.length; i++) {
            if (segments[o] != segments[i]) {
                if (findPOI(segments[o], segments[i])) {
                    segments[o].cReRender(0x4B4B4B);
                    segments[o].cCrossed = true;
                    break;
                } else {
                    segments[o].cReRender();
                    segments[o].cCrossed = false;
                }
            }
        }
    }

    if (segments.every(s => { return !s.cCrossed })) {

        if (winTime == null) {
            winTime = (new Date()).getTime();
        } else {
            if (((new Date()).getTime() - winTime) > 2000) {
                alert("win");
                state = function () {
                    points.forEach(p => {
                        p.interactive = false;
                    });
                };
            }
        }

    }
}


function getRndInRng(lower, upper) {
    return getRandomIntInclusive(lower, upper)
}
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function findPOI(a, b) {
    let p1 = new PIXI.Point(a.cParent.x, a.cParent.y);
    let p2 = new PIXI.Point(a.cPartner.x, a.cPartner.y);
    let p3 = new PIXI.Point(b.cParent.x, b.cParent.y);
    let p4 = new PIXI.Point(b.cPartner.x, b.cPartner.y);

    // if (((p1.x != p3.x) && (p1.y != p3.y)) && ((p2.x != p4.x) && p2.y != p4.y)) {
    if (!p1.equals(p3) || !p2.equals(p4)) {

        let num1 = (p2.x * p1.y - p1.x * p2.y);
        let num2 = (p4.x * p3.y - p3.x * p4.y);

        let deno = ((p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y));

        let x = ((num1 * (p4.x - p3.x) - num2 * (p2.x - p1.x)) / deno);

        let y = ((num1 * (p4.y - p3.y) - num2 * (p2.y - p1.y)) / deno);

        let isOnSeg = function (upper, lower, value) {
            if (upper < lower) {
                let temp = upper;
                upper = lower;
                lower = temp;
            }

            return upper > value && value > lower;
        };

        if (isOnSeg(p1.x, p2.x, x) && isOnSeg(p1.y, p2.y, y) &&
            isOnSeg(p3.x, p4.x, x) && isOnSeg(p3.y, p4.y, y)) {
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
    circle.zIndex = 3;
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
    line.zIndex = 0;
    app.stage.addChild(line);

    //custom
    line.cParent = p1;
    line.cPartner = p2;
    line.cCrossed = true;

    line.cReRender = function (color = 0xF7F0FD) {
        line.clear();
        line.lineStyle(2, color, 1);
        line.moveTo(line.cParent.x, line.cParent.y);
        line.lineTo(line.cPartner.x, line.cPartner.y);
    };

    return line;
}