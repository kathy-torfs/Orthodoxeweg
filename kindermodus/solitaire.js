(function (global) {
  'use strict';
  var win = window,
      doc = document,
      body = doc.body;

  // ===== Helper functies =====
  var extend = function (r, t) {
    for (var e = Object(r), n = 1; n < arguments.length; n++) {
      var a = arguments[n];
      if (null != a)
        for (var o in a) Object.prototype.hasOwnProperty.call(a, o) && (e[o] = a[o]);
    }
    return e;
  };
  var on = function (el, e, fn) { el.addEventListener(e, fn, false); };
  var each = function (arr, fn, s) {
    if ("[object Object]" === Object.prototype.toString.call(arr)) {
      for (var d in arr) if (Object.prototype.hasOwnProperty.call(arr, d)) fn.call(s, d, arr[d]);
    } else {
      for (var e = 0, f = arr.length; e < f; e++) fn.call(s, e, arr[e]);
    }
  };
  var rect = function (e) {
    var t = win,
        o = e.getBoundingClientRect(),
        b = doc.documentElement || body.parentNode || body,
        d = void 0 !== t.pageXOffset ? t.pageXOffset : b.scrollLeft,
        n = void 0 !== t.pageYOffset ? t.pageYOffset : b.scrollTop;
    return { left: o.left + d, top: o.top + n, height: Math.round(o.height), width: Math.round(o.width) };
  };

  // ===== Emitter (eventsysteem) =====
  var Emitter = function () {};
  Emitter.prototype = {
    on: function (event, fct) {
      this._events = this._events || {};
      this._events[event] = this._events[event] || [];
      this._events[event].push(fct);
    },
    emit: function (event /* , args... */) {
      this._events = this._events || {};
      if (event in this._events === false) return;
      for (var i = 0; i < this._events[event].length; i++) {
        this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
  };
  Emitter.mixin = function (obj) {
    var props = ['on', 'emit'];
    for (var i = 0; i < props.length; i++) {
      if (typeof obj === 'function') obj.prototype[props[i]] = Emitter.prototype[props[i]];
      else obj[props[i]] = Emitter.prototype[props[i]];
    }
    return obj;
  };

  // ===== Kaarten =====
  function Card(value, suit) {
    this.value = value;
    this.suit = suit;
    this.flipped = false;
    this.picture = this.value > 10;
    this.color = (suit === "hearts" || suit === "diamonds") ? "red" : "black";

    var cards = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];
    var template = [
      "<div class='front'><div class='value'>", cards[this.value - 1],
      "</div><div class='value'>", cards[this.value - 1],
      "</div><div class='middle'>"
    ];
    if (!this.picture) for (var i = 0; i < this.value; i++) template.push("<span></span>");
    template.push("</div></div><div class='rear'></div>");

    var card = doc.createElement("div");
    card.className = `card ${this.suit} card-${this.picture ? cards[this.value - 1] : this.value}`;
    card.innerHTML = template.join("");
    if (this.picture) card.classList.add("picture");
    card.card = true;
    this.el = card;
  }
  Card.prototype.flip = function () {
    this.el.classList.toggle("flipped", !this.flipped);
    this.el.draggable = !this.flipped;
    this.flipped = !this.flipped;
    if (!this.flipped) this.el.style.transform = "";
  };

  // ===== Deck =====
  function Pack() {
    this.cards = [];
    this.suits = ["hearts", "spades", "diamonds", "clubs"];
    var count = 0;
    each(this.suits, function (i, suit) {
      for (var i = 1; i < 14; i++) {
        var card = new Card(i, suit);
        card.el.idx = count;
        this.cards.push(card);
        count++;
      }
    }, this);
  }
  Pack.prototype.shuffle = function () {
    var m = this.cards.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = this.cards[m]; this.cards[m] = this.cards[i]; this.cards[i] = t;
      this.cards[i].el.idx = i; this.cards[m].el.idx = m;
    }
  };

  // ===== Game =====
  function Game(el, options) {
    if (typeof el === "string") el = document.querySelector(el);
    this.el = el;
    this.options = extend({}, options);
    this.score = 0;
    this.pack = new Pack();
    Emitter.mixin(this);
    this.render();
  }

  Game.prototype.render = function () {
    var frag = document.createDocumentFragment();
    this.columns = doc.createElement("div"); this.columns.className = "columns";
    this.stacks = doc.createElement("div"); this.stacks.className = "stacks";

    for (var i = 0; i < 4; i++) {
      var stack = doc.createElement("div"); stack.className = "stack"; this.stacks.appendChild(stack);
    }
    for (var i = 0; i < 7; i++) {
      var column = doc.createElement("div"); column.className = "column"; this.columns.appendChild(column);
    }
    this.dealer = doc.createElement("div"); this.dealer.className = "dealer";
    this.packArea = doc.createElement("div"); this.packArea.className = "pack";
    this.dealArea = doc.createElement("div"); this.dealArea.className = "dealt";
    this.dealer.appendChild(this.packArea); this.dealer.appendChild(this.dealArea);

    frag.appendChild(this.dealer); frag.appendChild(this.stacks); frag.appendChild(this.columns);
    this.el.appendChild(frag);

    on(this.dealer, "click", this.click.bind(this));
    on(doc, "mouseup", this.mouseup.bind(this));
  };

  Game.prototype.click = function (e) {
    if (e.target.classList.contains("pack")) this.deal();
  };

  // ===== Belangrijk: wijziging naar 1 kaart per keer =====
  Game.prototype.deal = function () {
    var frag = document.createDocumentFragment();
    var pack = [].slice.call(this.packArea.children);
    var count = pack.length;

    if (!count) {
      while (this.dealArea.childElementCount) {
        var card = this.pack.cards[this.dealArea.lastElementChild.idx];
        card.flip();
        frag.appendChild(card.el);
      }
      this.packArea.appendChild(frag);
      return;
    }

    var items;
    if (count > 0) {
      items = pack.slice(count - 1); // slechts 1 kaart
    } else {
      items = pack;
    }
    this.dealCount = items.length;

    items.forEach((card) => {
      card = this.pack.cards[card.idx];
      this.dealArea.appendChild(card.el);
      card.flip();
    });
  };

  Game.prototype.start = function () {
    var current = 0, start = 0;
    this.reset();
    this.pack.shuffle();

    for (var i = 0; i < 28; i++) {
      var card = this.pack.cards[i];
      this.columns.children[current].appendChild(card.el);
      if (start === current) card.flip();
      current++;
      if (current === 7) { start++; current = start; }
    }
    for (var i = 28; i < 52; i++) this.packArea.appendChild(this.pack.cards[i].el);
    this.emit("start");
  };

  Game.prototype.reset = function () {
    this.score = 0;
    this.pack.cards.forEach(function (card) { if (card.flipped) card.flip(); card.checked = false; });
  };

  global.Game = Game;
})(this);

// ====== Init spel ======
var controls = document.getElementById("controls"),
    score = document.getElementById("score"),
    game = new Game("#spelcontainer");

game.start();
game.on("start", function(){ score.textContent = "Score: " + this.score; });
