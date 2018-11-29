"use strict";
exports.__esModule = true;
var draw_1 = require("./draw");
var boundary_1 = require("./boundary");
var Layer = (function () {
    function Layer(id, type, layersBelow) {
        this.id = id;
        this.type = type;
        this.below = layersBelow;
        this.thickness = 50;
        this.upperBoundary = new boundary_1.Boundary("Flat");
        this.lowerBoundary = this.below[this.below.length - 1].upperBoundary;
        this.setLowerBoundary = this.setLowerBoundary.bind(this);
        this.refreshLowerBoundary = this.refreshLowerBoundary.bind(this);
    }
    Layer.prototype.setUpperBoundary = function (type) {
        this.upperBoundary = new boundary_1.Boundary(type);
        exports.layerStack.setSharedBoundary(this);
        draw_1.drawObject.stack();
    };
    Layer.prototype.setLowerBoundary = function (type) {
        this.lowerBoundary = new boundary_1.Boundary(type);
    };
    Layer.prototype.refreshLowerBoundary = function () {
        this.lowerBoundary = this.below[this.below.length - 1].upperBoundary;
    };
    return Layer;
}());
exports.Layer = Layer;
var LayerStack = (function () {
    function LayerStack() {
        this.layers = [];
        this.get = this.get.bind(this);
        this["new"] = this["new"].bind(this);
        this.remove = this.remove.bind(this);
        this.setSharedBoundary = this.setSharedBoundary.bind(this);
        this.updateBelow = this.updateBelow.bind(this);
    }
    LayerStack.prototype.get = function (id) {
        return this.layers.filter(function (l) { return l.id === id; })[0];
    };
    LayerStack.prototype["new"] = function (type) {
        var below = [];
        if (this.layers.length === 0) {
            below = [{ "upperBoundary": new boundary_1.Boundary("Flat"), "thickness": 0 }];
        }
        else {
            this.layers.forEach(function (l) { below.push({ "upperBoundary": l.upperBoundary, "thickness": l.thickness }); });
        }
        var newLayer = new Layer("layer" + this.layers.length, type, below);
        draw_1.drawObject.layer(newLayer);
        this.layers.push(newLayer);
    };
    LayerStack.prototype.remove = function (lyr) {
        var _this = this;
        draw_1.drawObject.erase(lyr);
        this.layers.splice(this.layers.indexOf(lyr), 1);
        this.layers.forEach(function (l) {
            draw_1.drawObject.erase(l);
            l.id = "layer" + _this.layers.indexOf(l);
            _this.updateBelow(l);
            draw_1.drawObject.layer(l);
        });
    };
    LayerStack.prototype.updateBelow = function (lyr) {
        lyr.below = [];
        if (this.layers.indexOf(lyr) === 0) {
            lyr.below.push({ "upperBoundary": new boundary_1.Boundary("Flat"), "thickness": 0 });
        }
        else {
            this.layers.slice(0, this.layers.indexOf(lyr)).forEach(function (l) {
                lyr.below.push({ "upperBoundary": l.upperBoundary, "thickness": l.thickness });
            });
        }
        lyr.refreshLowerBoundary();
    };
    LayerStack.prototype.setSharedBoundary = function (lyr) {
        var lowerIndex = this.layers.indexOf(lyr);
        if (lowerIndex < this.layers.length - 1) {
            var layerAbove = this.get("layer" + (lowerIndex + 1));
            layerAbove.setLowerBoundary(lyr.upperBoundary.type);
        }
    };
    return LayerStack;
}());
exports.LayerStack = LayerStack;
exports.layerStack = new LayerStack();
