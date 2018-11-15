class Draw {
    constructor() {
        this.margin = 25;
        this.canvas = $("svg");
        this.d3Canvas = d3.select("svg");
        this.canvasWidth = this.canvas.width() - this.margin * 2;
        $(window).resize(() => {this.canvasWidth = this.canvas.width() - this.margin * 2; this.stack()});
    }

    coords(lyr) {
        let totalThickness = this.margin + lyr.thickness;
        lyr.below.forEach((l) => {totalThickness += l.thickness});
        return {"x": this.margin, "y": 500 - totalThickness};
    }

    layer(lyr) {
        const coords = this.coords(lyr);
        const combined = lyr.upperBoundary
            .data(coords.x, coords.y, this.canvasWidth)
            .concat(lyr.lowerBoundary.data(coords.x, coords.y + lyr.thickness, this.canvasWidth).reverse());
        this.d3Canvas.append("path")
            .attr("d", BoundaryData.toLine(combined) + "Z")
            .attr("class", "layer " + lyr.type)
            .attr("id", lyr.id)
            .attr("pointer-events", "visibleFill");
    }

    erase(lyr) {
        this.d3Canvas.select("#" + lyr.id).remove();
    }

    stack() {
        selection.deselect();
        layerStack.layers.forEach((l) => {
            this.erase(l);
            this.layer(l);
        });
    }

    static toFront(id) {
        const element = $("#" + id);
        element.parent().append(element);
    }

}
const drawObject = new Draw();


class BoundaryData {
    static flat(x, y, canvasWidth) {
        return [
            {"x": x, "y": y},
            {"x": x + canvasWidth, "y": y}
        ];
    }

    static zigzag(x, y, canvasWidth) {
        const segmentWidth = 50;
        const numSegments = Math.floor(canvasWidth / segmentWidth);
        const remainder = (((canvasWidth / segmentWidth) - numSegments) / numSegments) * segmentWidth;
        let lineData = [];
        for (let i = 0; i <= numSegments; i += 1) {
            let zigzagY = (i % 2 === 0 ? y + 10 : y - 10);
            lineData.push({"x": x + i * (segmentWidth + remainder), "y": zigzagY});
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

    data(x, y, canvasWidth) {
        switch (this.type) {
            case "Flat":
                return BoundaryData.flat(x, y, canvasWidth);
            case "Zigzag":
                return BoundaryData.zigzag(x, y, canvasWidth);
        }
    }
}


class Layer {
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


class LayerStack {
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
let layerStack = new LayerStack();


class Selection {
    constructor() {
        this.layer = undefined;
        this.select = this.select.bind(this);
        this.deselect = this.deselect.bind(this);
        this.remove = this.remove.bind(this);
    }

    select(id) {
        this.layer = layerStack.get(id);
        if (this.layer === undefined) {
            return;
        }
        try {
            $(".selected").removeClass("selected");
        } catch (e) {}
        Draw.toFront(this.layer.id);
        $("#" + id).addClass("selected");
        $("#remove-layer").prop("disabled", false);
        upperBoundary.val(this.layer.upperBoundary.type);
    }

    deselect() {
        if (this.layer !== undefined) {
            try {
                $(".selected").removeClass("selected");
            } catch (e) {}
            $("#remove-layer").prop("disabled", true);
        }
        this.layer = undefined;
    }

    remove() {
        layerStack.remove(this.layer);
        this.deselect();
        this.layer = undefined;
    }
}
const selection = new Selection();

$("#canvas").click((e) => selection.select(e.target.id));
$("#new-limestone").click(() => layerStack.new("limestone"));
$("#new-shale").click(() => layerStack.new("shale"));
$("#remove-layer").click(selection.remove);
const upperBoundary = $("#upper-boundary");
upperBoundary.change(() => selection.layer.setUpperBoundary(upperBoundary.val()));

$(document).keyup((b) => {
    if (b.key === "Escape") {
        selection.deselect();
    }
});