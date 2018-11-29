import {Layer} from './layer';
import {drawAtFront} from "./draw";
import {layerStack} from "./layer";

export class Selection {
    layer: Layer;
    
    constructor() {
        this.layer = undefined;
        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
        this.remove = this.remove.bind(this);
    }

    select(id) {
        if (!id.includes("layer")) {
            return;
        }
        this.layer = layerStack.get(id);
        try {
            $(".selected").removeClass("selected");
        } catch (e) {}
        drawAtFront(this.layer.id);
        $("#" + id).addClass("selected");
        $("#remove-layer").prop("disabled", false);
        upperBoundary.val(this.layer.upperBoundary.type).attr("disabled");
    }

    deselect() {
        if (this.layer !== undefined) {
            try {
                $(".selected").removeClass("selected");
            } catch (e) {}
            $("#remove-layer").prop("disabled", true);
        }
        this.layer = undefined;
        upperBoundary.val("-").attr("disabled");
        drawAtFront("x-scale");
        drawAtFront("y-scale");
    }

    remove() {
        layerStack.remove(this.layer);
        this.deselect();
        this.layer = undefined;
    }
}
export let selection = new Selection();

const upperBoundary = $("#upper-boundary");
upperBoundary.on("change",() => selection.layer.setUpperBoundary(upperBoundary.val()));