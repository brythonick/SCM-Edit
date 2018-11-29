"use strict";
exports.__esModule = true;
var draw_1 = require("./draw");
var layer_1 = require("./layer");
var Selection = (function () {
    function Selection() {
        this.layer = undefined;
        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
        this.remove = this.remove.bind(this);
    }
    Selection.prototype.select = function (id) {
        if (!id.includes("layer")) {
            return;
        }
        this.layer = layer_1.layerStack.get(id);
        try {
            $(".selected").removeClass("selected");
        }
        catch (e) { }
        draw_1.drawAtFront(this.layer.id);
        $("#" + id).addClass("selected");
        $("#remove-layer").prop("disabled", false);
        upperBoundary.val(this.layer.upperBoundary.type).attr("disabled");
    };
    Selection.prototype.deselect = function () {
        if (this.layer !== undefined) {
            try {
                $(".selected").removeClass("selected");
            }
            catch (e) { }
            $("#remove-layer").prop("disabled", true);
        }
        this.layer = undefined;
        upperBoundary.val("-").attr("disabled");
        draw_1.drawAtFront("x-scale");
        draw_1.drawAtFront("y-scale");
    };
    Selection.prototype.remove = function () {
        layer_1.layerStack.remove(this.layer);
        this.deselect();
        this.layer = undefined;
    };
    return Selection;
}());
exports.Selection = Selection;
exports.selection = new Selection();
var upperBoundary = $("#upper-boundary");
upperBoundary.on("change", function () { return exports.selection.layer.setUpperBoundary(upperBoundary.val()); });
