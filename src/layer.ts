import {drawObject} from "./draw";
import {Boundary} from "./boundary";

export class Layer {
    id: string;
    type: string;
    below: Layer[];
    thickness: number;
    upperBoundary: Boundary;
    lowerBoundary: Boundary;

    constructor(id, type, layersBelow) {
        this.id = id;
        this.type = type;
        this.below = layersBelow;
        this.thickness = 50;
        this.upperBoundary = new Boundary("Flat");
        this.lowerBoundary = this.below[this.below.length - 1].upperBoundary;
        this.setLowerBoundary = this.setLowerBoundary.bind(this);
        this.refreshLowerBoundary = this.refreshLowerBoundary.bind(this);
    }

    setUpperBoundary(type) {
        this.upperBoundary = new Boundary(type);
        layerStack.setSharedBoundary(this);
        drawObject.stack();
    }

    setLowerBoundary(type) {
        this.lowerBoundary = new Boundary(type);
    }

    refreshLowerBoundary() {
        this.lowerBoundary = this.below[this.below.length - 1].upperBoundary;
    }
}

export class LayerStack {
    layers: Layer[];

    constructor() {
        this.layers = [];
        this.get = this.get.bind(this);
        this.new = this.new.bind(this);
        this.remove = this.remove.bind(this);
        this.setSharedBoundary = this.setSharedBoundary.bind(this);
        this.updateBelow = this.updateBelow.bind(this);
    }

    get(id) {
        return this.layers.filter(l => l.id === id)[0];
    }

    new(type) {
        let below = [];
        if (this.layers.length === 0) {
            below = [{"upperBoundary": new Boundary("Flat"), "thickness": 0}];
        } else {
            this.layers.forEach((l) => {below.push({"upperBoundary": l.upperBoundary, "thickness": l.thickness});});
        }
        const newLayer = new Layer("layer" + this.layers.length, type, below);
        drawObject.layer(newLayer);
        this.layers.push(newLayer);
    }

    remove(lyr) {
        drawObject.erase(lyr);
        this.layers.splice(this.layers.indexOf(lyr), 1);
        this.layers.forEach((l) => {
            drawObject.erase(l);
            l.id = "layer" + this.layers.indexOf(l);
            this.updateBelow(l);
            drawObject.layer(l);
        });
    }

    updateBelow(lyr) {
        lyr.below = [];
        if (this.layers.indexOf(lyr) === 0) {
            lyr.below.push({"upperBoundary": new Boundary("Flat"), "thickness": 0});
        } else {
            this.layers.slice(0, this.layers.indexOf(lyr)).forEach((l) => {
                lyr.below.push({"upperBoundary": l.upperBoundary, "thickness": l.thickness})
            });
        }
        lyr.refreshLowerBoundary();
    }

    setSharedBoundary(lyr) {
        const lowerIndex = this.layers.indexOf(lyr);
        if (lowerIndex < this.layers.length - 1) {
            let layerAbove = this.get("layer" + (lowerIndex + 1));
            layerAbove.setLowerBoundary(lyr.upperBoundary.type);
        }
    }
}

export let layerStack = new LayerStack();