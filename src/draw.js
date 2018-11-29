"use strict";
exports.__esModule = true;
var $ = require("jquery");
var d3_selection_1 = require("d3-selection");
var d3_line_1 = require("d3-line");
var boundary_1 = require("./boundary");
var layer_1 = require("./layer");
var selection_1 = require("./selection");
var Draw = (function () {
    function Draw() {
        var _this = this;
        this.margin = 25;
        this.canvas = $("svg");
        this.d3Canvas = d3_selection_1.select("svg");
        this.canvasWidth = this.canvas.width() - this.margin * 2;
        $(window).on("resize", function () { _this.canvasWidth = _this.canvas.width() - _this.margin * 2; _this.stack(); _this.scale(); });
        this.scale();
    }
    Draw.prototype.coords = function (lyr) {
        var totalThickness = this.margin + lyr.thickness;
        lyr.below.forEach(function (l) { totalThickness += l.thickness; });
        return { "x": this.margin, "y": 500 - totalThickness };
    };
    Draw.prototype.layer = function (lyr) {
        var coords = this.coords(lyr);
        var combined = lyr.upperBoundary
            .data(coords.x, coords.y, this.canvasWidth)
            .concat(lyr.lowerBoundary.data(coords.x, coords.y + lyr.thickness, this.canvasWidth).reverse());
        this.d3Canvas.append("path")
            .attr("d", boundary_1.BoundaryData.toLine(combined) + "Z")
            .attr("class", "layer " + lyr.type)
            .attr("id", lyr.id)
            .attr("pointer-events", "visibleFill");
        drawAtFront("x-scale");
        drawAtFront("y-scale");
    };
    Draw.prototype.scale = function () {
        this.d3Canvas.select("#x-scale").remove();
        this.d3Canvas.selectAll("#x-scale-tick").remove();
        this.d3Canvas.select("#y-scale").remove();
        this.d3Canvas.selectAll("#y-scale-tick").remove();
        var xTickSep = this.canvasWidth / 10;
        var yTickNum = Math.floor(425 / xTickSep);
        this.d3Canvas.append("path")
            .attr("d", this.xScaleLine())
            .attr("class", "scale")
            .attr("id", "x-scale");
        this.d3Canvas.append("path")
            .attr("d", this.yScaleLine(xTickSep * yTickNum))
            .attr("class", "scale")
            .attr("id", "y-scale");
        for (var i = 0; i <= 10; i += 1) {
            this.d3Canvas.append("path")
                .attr("d", this.xTickLine(i * xTickSep))
                .attr("class", "scale")
                .attr("id", "x-scale-tick");
        }
        for (var i = 475; i > this.margin * 2; i -= xTickSep) {
            this.d3Canvas.append("path")
                .attr("d", this.yTickLine(i))
                .attr("class", "scale")
                .attr("id", "y-scale-tick");
        }
    };
    Draw.prototype.xScaleLine = function () {
        var data = [
            { "x": this.margin, "y": 475 },
            { "x": this.canvasWidth + this.margin, "y": 475 },
        ];
        var xLine = d3_line_1.line
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
        return xLine(data);
    };
    Draw.prototype.xTickLine = function (x) {
        var data = [
            { "x": this.margin + x, "y": 475 },
            { "x": this.margin + x, "y": 480 },
        ];
        var xTickLine = d3_line_1.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
        return xTickLine(data);
    };
    Draw.prototype.yScaleLine = function (length) {
        var data = [
            { "x": this.margin, "y": 475 },
            { "x": this.margin, "y": 475 - length },
        ];
        var yLine = d3_line_1.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
        return yLine(data);
    };
    Draw.prototype.yTickLine = function (y) {
        var data = [
            { "x": this.margin, "y": y },
            { "x": this.margin - 5, "y": y },
        ];
        var yTickLine = d3_line_1.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
        return yTickLine(data);
    };
    Draw.prototype.erase = function (lyr) {
        this.d3Canvas.select("#" + lyr.id).remove();
    };
    Draw.prototype.stack = function () {
        var _this = this;
        var selectedId = undefined;
        layer_1.layerStack.layers.forEach(function (l) {
            _this.erase(l);
            _this.layer(l);
            if (l === selection_1.selection.layer) {
                selection_1.selection.select(l.id);
                selectedId = l.id;
            }
        });
        drawAtFront(selectedId);
    };
    return Draw;
}());
exports.drawObject = new Draw();
function drawAtFront(id) {
    var element = $("#" + id);
    element.parent().append(element);
}
exports.drawAtFront = drawAtFront;
