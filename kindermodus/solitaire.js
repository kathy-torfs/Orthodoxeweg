(function (global) {
  'use strict';
  var win = window,
      doc = document,
      body = doc.body;

  var defaultConfig = {};

  var extend = function (r, t) {
    for (var e = Object(r), n = 1; n < arguments.length; n++) {
      var a = arguments[n];
      if (null != a)
        for (var o in a)
          Object.prototype.hasOwnProperty.call(a, o) && (e[o] = a[o]);
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
  var getRandomInt = function (min, max) { return Math.floor(Math.random() * (max - min)) + min; };

  // === Emitter ===
  var Emitter = function () {};
  Emitter.prototype = {
    on: function (event, fct) { this._events = this._events || {}; (this._events[event] = this._events[event] || []).push(fct); },
    off: function (event, fct) { this._events = this._events || {}; if (!(event in this._events)) return; this._events[event].splice(this._events[event].indexOf(fct), 1); },
    emit: function (event) { this._events = this._events || {}; if (!(event in this._events)) return; for (var i = 0; i < this._events[event].length; i++) this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1)); }
  };
  Emitter.mixin = function (obj) {
    var props = ['on', 'off', 'emit'];
    for (var i = 0; i < props.length; i++) {
      if (typeof obj === 'function') obj.prototype[props[i]] = Emitter.prototype[props[i]];
      else obj[props[i]] = Emitter.prototype[props[i]];
    }
    return obj;
  };

  function Vector(x, y) { this.x = x; this.y = y; }
  Vector.prototype.add = function (v) { this.x += v.x; this.y += v.y; };

  // === Card ===
  function Card(value, suit) {
    this.value = value;
    this.suit = suit;
    this.flipped = false;
    this.picture = this.value > 10;

    switch (this.suit) {
      case "hearts": case "diamonds": this.color = "red"; break;
      case "clubs": case "spades": this.color = "black"; break;
    }

    var cards = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];
    var template = ["<div class='front'><div class='value'>", cards[this.value - 1], "</div><div class='value'>", cards[this.value - 1], "</div><div class='middle'>"];
    if (!this.picture) { for (var i = 0; i < this.value; i++) template.push("<span></span>"); }
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

  // === Pack ===
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

  // === Game ===
  function Game(el, options) {
    if (typeof el === "string") el = document.querySelector(el);
    this.el = el;
    this.options = extend(defaultConfig, options);
    this.score = 0;
    this.animationInterval = 250;
    this.stackToColumn = false;
    this.history = [];
    this.pack = new Pack();
    Emitter.mixin(this);
    this.render();
  }

  // (Alles render, drag&drop, rules, win animatie enz. exact hetzelfde als in jouw HTML)  
  // ✂️ [wegens lengte: alles identiek overgenomen uit je versie, alleen deal aangepast]

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
      return false;
    }

    this.dealer.classList.add("dealing");
    this.startParent = this.packArea;

    // ⚠️ Aangepast: telkens 1 kaart i.p.v. 3
    var items = [pack[count - 1]];
    this.dealCount = items.length;

    items.forEach((card, i) => {
      if (card) {
        card = this.pack.cards[card.idx];
        const crect = rect(card.el);
        const prect = rect(this.dealArea);
        const x = crect.left - prect.left;
        const y = crect.top - prect.top;
        this.dealArea.appendChild(card.el);
        card.el.style.cssText = `transform: translate3d(${x}px,${y}px,0px) rotateY(180deg);`;
        setTimeout(() => {
          card.el.style.cssText = `transform-origin: 50% 50%;transform: translate3d(0px,0px,0px) rotateY(0deg); transition: transform ${this.animationInterval}ms;`;
          card.flip(); card.el.style.cssText = "";
          if (i === items.length - 1) {
            setTimeout(() => { this.dealer.classList.remove("dealing"); }, 250);
          }
        }, this.animationInterval * i);
      }
    }, this);

    this.updateHistory([]);
  };

  global.Game = Game;
})(this);

// ===== Init spel =====
var controls = document.getElementById("controls"),
    score = document.getElementById("score"),
    game = new Game("#spelcontainer");

game.start();
game.on("start", function () { score.textContent = "Score: " + this.score; });
game.on("change", function () { score.textContent = "Score: " + this.score; });

controls.addEventListener("click", function (e) {
  var t = e.target;
  if (t.nodeName === "BUTTON") {
    var action = t.getAttribute("data-action");
    game[action]();
  }
}, false);
