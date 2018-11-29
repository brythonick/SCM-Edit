"use strict";
exports.__esModule = true;
var d3_line_1 = require("d3-line");
var BoundaryData = (function () {
    function BoundaryData() {
    }
    BoundaryData.flat = function (x, y, canvasWidth) {
        return [
            { "x": x, "y": y },
            { "x": x + canvasWidth, "y": y }
        ];
    };
    BoundaryData.zigzag = function (x, y, canvasWidth) {
        var segmentWidth = 50;
        var numSegments = Math.floor(canvasWidth / segmentWidth);
        var remainder = (((canvasWidth / segmentWidth) - numSegments) / numSegments) * segmentWidth;
        var lineData = [];
        for (var i = 0; i <= numSegments; i += 1) {
            var zigzagY = (i % 2 === 0 ? y + 10 : y - 10);
            lineData.push({ "x": x + i * (segmentWidth + remainder), "y": zigzagY });
        }
        return lineData;
    };
    BoundaryData.toLine = function (data) {
        var lineFunc = d3_line_1.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; });
        return lineFunc(data);
    };
    return BoundaryData;
}());
exports.BoundaryData = BoundaryData;
var Boundary = (function () {
    function Boundary(type) {
        this.type = type;
        this.data = this.data.bind(this);
    }
    Boundary.prototype.data = function (x, y, canvasWidth) {
        switch (this.type) {
            case "Flat":
                return BoundaryData.flat(x, y, canvasWidth);
            case "Zigzag":
                return BoundaryData.zigzag(x, y, canvasWidth);
        }
    };
    return Boundary;
}());
exports.Boundary = Boundary;
