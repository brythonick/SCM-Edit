const margin = 25;
const canvas = d3.select("svg");
let canvasSize = $("svg")[0].getBoundingClientRect();

window.addEventListener("resize", () => {canvasSize = $("svg")[0].getBoundingClientRect(); layerStack.redrawAll()}, false);
document.getElementById("canvas").addEventListener("mouseup", (e) => layerStack.select(e.target.id), false);


class BoundaryData {
    static flat(x, y) {
        return [
            {"x": x, "y": y},
            {"x": x + canvasSize.width, "y": y}
        ];
    }

    static zigzag(x, y) {
        const segmentWidth = 50;
        const numSegments = Math.floor(canvasSize.width / segmentWidth);
        const remainder = (((canvasSize.width / segmentWidth) - numSegments) / numSegments) * segmentWidth;
        let lineData = [];
        for (let i = 0; i <= numSegments; i += 1) {
            let zigzagY = (i % 2 === 0 ? y + 10 : y - 10);
            lineData.push({"x": i * (segmentWidth + remainder), "y": zigzagY});
        }
        return lineData;
    }

    static toLine(data) {
        const line =  d3.line()
            .x((d) => {return d.x;})
            .y((d) => {return d.y;});
        return line(data);
    }
}


class Boundary {
    constructor(type) {
        this.type = type;
        this.data = this.data.bind(this);
    }

    data(x, y) {
        switch (this.type) {
            case "Flat":
                return BoundaryData.flat(x, y);
            case "Zigzag":
                return BoundaryData.zigzag(x, y);
        }
    }
}


class Layer {
    constructor(id) {
        this.id = id;
        this.type = "";
        this.upperBoundary = null;
        this.lowerBoundary = null;
        this.x = null;
        this.y = null;
        this.draw = this.draw.bind(this);
    }

    get boundary() {
        return this.upperBoundary;
    }

    draw(type, x, y, upperBoundary, lowerBoundary) {
        this.type = type;
        this.upperBoundary = upperBoundary;
        this.lowerBoundary = lowerBoundary;
        this.x = x;
        this.y = y;
        let combined = upperBoundary.data(x, y).concat(lowerBoundary.data(x, y + 50).reverse());
        canvas.append("path")
            .attr("d", BoundaryData.toLine(combined) + "Z")
            .attr("class", "layer " + this.type)
            .attr("id", this.id)
            .attr("pointer-events", "visibleFill");
    }

    erase() {
        d3.select("#" + this.id).remove();
    }

    setUpperBoundary(type) {
        this.upperBoundary = new Boundary(type);
        layerStack.redrawAll();
    }

    redraw() {
        this.erase();
        this.lowerBoundary = layerStack.getBoundaryBelow(this.id);
        this.draw(this.type, this.x, this.y, this.upperBoundary, this.lowerBoundary);
    }
}


class LayerStack {
    constructor() {
        this.layers = [];
        this.selected = null;
        this.new = this.new.bind(this);
        this.pop = this.pop.bind(this);
        this.select = this.select.bind(this);
    }

    get yCoordinate() {
        return 500 - margin - 50 - this.layers.length * 50;
    }

    get currentTopBoundary() {
        if (this.layers.length === 0) {
            return new Boundary("Flat");
        } else {
            return this.layers[this.layers.length - 1].boundary;
        }
    }

    getBoundaryBelow(id) {
        const upperLayer = this.layers.filter(layer => layer.id === id)[0];
        const index = this.layers.indexOf(upperLayer);
        if (index === 0) {
            return upperLayer.lowerBoundary;
        } else {
            return this.layers[index - 1].boundary;
        }
    }

    new(type) {
        const newLayer = new Layer("layer" + this.layers.length);
        newLayer.draw(
            type,
            0,
            this.yCoordinate,
            new Boundary("Flat"),
            this.currentTopBoundary
        );
        this.layers.push(newLayer);
    }

    pop() {
        if (this.layers.length > 0) {
            const layer = this.layers.pop();
            layer.erase();
        }
    }

    select(id) {
        this.selected = this.layers.filter(layer => layer.id === id)[0];
        document.getElementById("topBoundary").value = this.selected.boundary.type;
    }

    redrawAll() {
        this.layers.forEach((layer) => {layer.redraw()})
    }
}
let layerStack = new LayerStack();
document.getElementById("new-limestone").addEventListener("click", () => layerStack.new("limestone"), false);
document.getElementById("new-shale").addEventListener("click", () => layerStack.new("shale"), false);
document.getElementById("pop-layer").addEventListener("click", layerStack.pop, false);

document.getElementById("topBoundary").addEventListener("change", () => layerStack.selected.setUpperBoundary(document.getElementById("topBoundary").value), false);