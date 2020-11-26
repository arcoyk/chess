const B_SIZE = 50;
var focus, bd, pies, cands, side, auto;

function init_params() {
    bd = [];
    pies = [];
    cands = [];
    side = 0;
    auto = false;
    auto_fps = 1;
    focus = null;
}

function setup() {
    createCanvas(600, 600);
    background(100, 100, 100);
}

function draw() {
    frameRate(auto ? auto_fps : 30);
    turn();
    background(100, 100, 100);
    draw_bd();
    draw_pies();
    draw_cands();
    draw_dums();
}

var dums = [];

function init_dums() {
    var kinds = ["Q", "R", "B", "N"];
    for (var i in kinds) {
        dum = {x: int(i), y: 10, kind: kinds[i], posi: posi};
        dums.push(dum);
    }
}

function draw_dums() {
    for (var dum of dums) {
        noStroke();
        fill(255);
        var posi = dum.posi();
        text(dum.kind, posi.x, posi.y);
    }
}

function focus_by_mouse(my_pies) {
    if (!mouseIsPressed) return focus;
    for (var pie of my_pies) {
        var posi = pie.posi();
        if (near(mouseX, mouseY, posi.x, posi.y)) return pie;
    }
    return focus;
}

function hand_by_mouse(cands) {
    if (!mouseIsPressed) return null;
    for (var cand of cands) {
        var posi = cand.posi();
        if (near(mouseX, mouseY, posi.x, posi.y)) return cand;
    }
    return null;
}

function gameover() {
    // no cands from my side
    var my_pies = pies.filter(pie => pie.side == side);
    my_cands = my_pies.reduce((a, _) => {return a.concat(_.get_cands())}, []);
    if (my_cands.length == 0) return true;
    // kind taken
    if (my_pies.filter(pie => pie.kind == "K").length == 0) return true;
    // show must go on
    return false;
}

function promotion(pie, kind) {
    ({x: 7, y: 8, side: 0, kind:"N", name: "N2", move: move, get_cands: get_cands, posi: posi, take: take});
    pie.kind = kind;
    var n = {"P": 9, "K": 2, "Q": 2, "R": 3, "B": 3, "N": 3};
    pie.name = kind + n[kind];
}

function promotion_by_mouse(promo) {

}

function promo_by_mouse(pie) {
    if (!mouseIsPressed) return null;
    for (var dum of dums) {
        var posi = dum.posi();
        if (near(mouseX, mouseY, posi.x, posi.y)) return dum.kind;
    }
}

var state = "start"; // "hand", "judge", "dialog", "next";
function turn() {
    if (state == "start") {
        init_params();
        init_bd();
        init_pies();
        init_dums();
        state = "choice";
    }

    if (state == "choice") {
        my_pies = pies.filter(pie => pie.side == side);
        if (auto) {
            focus = _.sample(my_pies);
        } else {
            focus = focus_by_mouse(my_pies);
        }
        if (focus) state = "hand";
    }

    if (state == "hand") {
        cands = focus.get_cands();
        cands = rm_impossible(cands, focus);
        if (cands) {
            if (auto) {
                hand = _.sample(cands);
            } else {
                hand = hand_by_mouse(cands)
            }
            if (!hand) return;
            if (hand.pie != null) focus.take(hand.pie);
            focus.move(hand.x, hand.y);
            state = "judge"
        }
    }

    if (state == "judge") {
        if (gameover()) state = "start";
        state = "dialog";
    }

    if (state == "dialog") {
        // promotion
        var last_line = [1, 8][focus.side];
        if (focus.kind == "P" && last_line) {
            var kind = null;
            if (auto) {
                kind = "Q"
            } else {
                kind = promo_by_mouse(focus);
            }
            if (!kind) return;
            promotion(focus, kind);
        }
        state = "next";
    }

    if (state == "next") {
        focus = null;
        cands = [];
        side = side == 1 ? 0 : 1;
        state = "choice";
    }

}

var kindc = {"P":P, "K": K, "Q": Q, "R": R, "B": B, "N": N};

function N(p) {
    return [
        {x: p.x + 2, y: p.y + 1, posi: posi},
        {x: p.x + 1, y: p.y + 2, posi: posi},
        {x: p.x + 2, y: p.y - 1, posi: posi},
        {x: p.x + 1, y: p.y - 2, posi: posi},
        {x: p.x - 2, y: p.y + 1, posi: posi},
        {x: p.x - 1, y: p.y + 2, posi: posi},
        {x: p.x - 2, y: p.y - 1, posi: posi},
        {x: p.x - 1, y: p.y - 2, posi: posi},
    ];
}

function B(p) {
    return d_all(p);
}

function R(p) {
    return v_all(p).concat(h_all(p));
}

function Q(p) {
    // bug?: make it unique and rm my position
    return v_all(p).concat(h_all(p)).concat(d_all(p));
}

function v_all(p) {
    rs = [];
    for (var i of [1, -1]) {
        for (var yy = 1; yy <= 8; yy++) {
            var cand = {x: p.x, y: p.y - yy * i, posi: posi};
            rs.push(cand);
            if (collided_pie(cand)) break;
        }
    }
    return rs;
}

function h_all(p) {
    rs = [];
    for (var i of [1, -1]) {
        for (var xx = 1; xx <= 8; xx++) {
            var cand = {x: p.x - xx * i, y: p.y, posi: posi};
            rs.push(cand);
            if (collided_pie(cand)) break;
        }
    }
    return rs;
}

function d_all(p) {
    rs = [];
    es = [{xx: 1, yy: 1}, {xx: -1, yy: 1}, {xx: 1, yy: -1}, {xx: -1, yy: -1}];
    for (var e of es) {
        for (var i = 1; i <= 8; i++) {
            var cand = {x: p.x + i * e.xx, y: p.y + i * e.yy, posi: posi};
            rs.push(cand);
            if (collided_pie(cand)) break;
        }
    }
    return rs;
}

function P(p) {
    rs = [];
    var cx = p.x;
    var cy = p.y;
    var factor = [-1, 1][p.side];
    var first = [7, 2][p.side];
    front1 = {x: p.x, y: p.y + 1 * factor, posi: posi};
    front2 = {x: p.x, y: p.y + 2 * factor, posi: posi};
    wingl = {x: p.x + 1, y: p.y + 1 * factor, posi: posi};
    wingr = {x: p.x - 1, y: p.y + 1 * factor, posi: posi};
    front1_collide = collided_pie(front1);
    front2_collide = collided_pie(front2);
    wingl_collide = collided_pie(wingl);
    wingr_collide = collided_pie(wingr);
    if (!front1_collide) {
        rs.push(front1);
        if (p.y == first && !front2_collide) {
            rs.push(front2);
        }
    }
    if (wingl_collide && wingl_collide.side != p.side) rs.push(wingl);
    if (wingr_collide && wingr_collide.side != p.side) rs.push(wingr);
    return rs;
}

function K(p) {
    rs = [];
    rs.push({x: p.x + 1, y: p.y + 1, posi: posi});
    rs.push({x: p.x + 1, y: p.y - 1, posi: posi});
    rs.push({x: p.x - 1, y: p.y - 1, posi: posi});
    rs.push({x: p.x - 1, y: p.y + 1, posi: posi});
    rs.push({x: p.x + 0, y: p.y + 1, posi: posi});
    rs.push({x: p.x + 0, y: p.y - 1, posi: posi});
    rs.push({x: p.x + 1, y: p.y + 0, posi: posi});
    rs.push({x: p.x - 1, y: p.y + 0, posi: posi});
    return rs;
}

function take(opp) {
    pies = pies.filter(pie => pie !== opp);
}

function init_pies() {
    pies = [];
    for (var i = 1; i <= 8; i++) {
        pies.push({x: i, y: 2, side: 1, kind:"P", name: "P" + i, move: move, get_cands: get_cands, posi: posi, take: take});
        pies.push({x: i, y: 7, side: 0, kind:"P", name: "P" + i, move: move, get_cands: get_cands, posi: posi, take: take});
    }
    
    pies.push({x: 1, y: 1, side: 1, kind:"R", name: "R1", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 8, y: 1, side: 1, kind:"R", name: "R8", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 1, y: 8, side: 0, kind:"R", name: "R1", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 8, y: 8, side: 0, kind:"R", name: "R8", move: move, get_cands: get_cands, posi: posi, take: take});

    pies.push({x: 2, y: 1, side: 1, kind:"N", name: "N1", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 7, y: 1, side: 1, kind:"N", name: "N2", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 2, y: 8, side: 0, kind:"N", name: "N1", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 7, y: 8, side: 0, kind:"N", name: "N2", move: move, get_cands: get_cands, posi: posi, take: take});

    pies.push({x: 3, y: 1, side: 1, kind:"B", name: "B1", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 6, y: 1, side: 1, kind:"B", name: "B2", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 3, y: 8, side: 0, kind:"B", name: "B1", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 6, y: 8, side: 0, kind:"B", name: "B2", move: move, get_cands: get_cands, posi: posi, take: take});

    pies.push({x: 4, y: 1, side: 1, kind:"Q", name: "Q1", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 4, y: 8, side: 0, kind:"Q", name: "Q1", move: move, get_cands: get_cands, posi: posi, take: take});

    pies.push({x: 5, y: 1, side: 1, kind:"K", name: "K1", move: move, get_cands: get_cands, posi: posi, take: take});
    pies.push({x: 5, y: 8, side: 0, kind:"K", name: "K1", move: move, get_cands: get_cands, posi: posi, take: take});
}

function init_bd() {
    for (var x = 1; x <= 8; x++) {
        for (var y = 1; y <= 8; y++) {
            var box = {x: x, y: y};
            bd.push(box);
        }
    }
}

function draw_bd() {
    stroke(0, 0, 0);
    fill(255, 255, 255);
    for (var b of bd) {
        rect(b.x * B_SIZE, b.y * B_SIZE, B_SIZE, B_SIZE);
    }
}

function posi() {
    var x = (this.x + 1) * B_SIZE - B_SIZE / 2;
    var y = (this.y + 1) * B_SIZE - B_SIZE / 2;
    return {x: x, y: y};
}

function draw_pies() {
    noStroke();
    for (var pie of pies) {
        noStroke();
        var posi = pie.posi();
        fill(pie.side == 0 ? 255 : 0, 0, 0);
        text(pie.name, posi.x, posi.y);
        if (focus == pie) {
            noFill();
            stroke(0);
            ellipse(posi.x, posi.y, 10, 10);
        }
    }
}

function draw_cands() {
    for (var cand of cands) {
        fill(0);
        var posi = cand.posi();
        rect(posi.x, posi.y, 10, 10);
    }
}

function get_cands() {
    var kind = this.kind;
    return kindc[kind](this);
}

function move(x, y) {
    this.x = x;
    this.y = y;
}

function near(x1, y1, x2, y2) {
    return sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2)) / 10 < 3;
}

function rm_impossible(cands, focus) {
    rst = []
    for (var cand of cands) {
        // out of board
        if (cand.x <= 0 || 9 <= cand.x) continue;
        if (cand.y <= 0 || 9 <= cand.y) continue;
        var pie = collided_pie(cand);
        if (pie && pie.side == focus.side) continue;
        cand.pie = pie;
        rst.push(cand);
    }
    return rst;
}

function collided_pie(cand) {
    for (var pie of pies) {
        collide = pie.x == cand.x && pie.y == cand.y;
        if (collide) return pie;
    }
    return null;
}