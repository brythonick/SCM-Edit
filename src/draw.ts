import * as $ from 'jquery';
import {select} from 'd3-selection';
import {line} from 'd3-line';
import {BoundaryData} from './boundary';
import {layerStack} from "./layer";
import {selection} from "./selection";

class Draw {
    canvas: JQuery;
    d3Canvas: any;
    margin: number;
    canvasWidth: number;

    constructor() {
        this.margin = 25;
        this.canvas = $("svg");
        this.d3Canvas = select("svg");
        this.canvasWidth = this.canvas.width() - this.margin * 2;
        $(window).on("resize", () => {this.canvasWidth = this.canvas.width() - this.margin * 2; this.stack(); this.scale()});
        this.scale();
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
        drawAtFront("x-scale");
        drawAtFront("y-scale");
    }

    scale() {
        this.d3Canvas.select("#x-scale").remove();
        this.d3Canvas.selectAll("#x-scale-tick").remove();
        this.d3Canvas.select("#y-scale").remove();
        this.d3Canvas.selectAll("#y-scale-tick").remove();
        const xTickSep = this.canvasWidth / 10;
        const yTickNum = Math.floor(425 / xTickSep);
        this.d3Canvas.append("path")
            .attr("d", this.xScaleLine())
            .attr("class", "scale")
            .attr("id", "x-scale");
        this.d3Canvas.append("path")
            .attr("d", this.yScaleLine(xTickSep * yTickNum))
            .attr("class", "scale")
            .attr("id", "y-scale");
        for (let i = 0; i <= 10; i += 1) {
            this.d3Canvas.append("path")
                .attr("d", this.xTickLine(i * xTickSep))
                .attr("class", "scale")
                .attr("id", "x-scale-tick");
        }
        for (let i = 475; i > this.margin * 2; i -= xTickSep) {
            this.d3Canvas.append("path")
                .attr("d", this.yTickLine(i))
                .attr("class", "scale")
                .attr("id", "y-scale-tick");
        }
    }

    xScaleLine() {
        const data = [
            {"x": this.margin, "y": 475},
            {"x": this.canvasWidth + this.margin, "y": 475},
        ];
        const xLine = line
            .x((d) => {return d.x;})
            .y((d) => {return d.y;});
        return xLine(data);
    }

    xTickLine(x) {
        const data = [
            {"x": this.margin + x, "y": 475},
            {"x": this.margin + x, "y": 480},
        ];
        const xTickLine = line()
            .x((d) => {return d.x;})
            .y((d) => {return d.y;});
        return xTickLine(data);
    }

    yScaleLine(length) {
        const data = [
            {"x": this.margin, "y": 475},
            {"x": this.margin, "y": 475 - length},
        ];
        const yLine = line()
            .x((d) => {return d.x;})
            .y((d) => {return d.y;});
        return yLine(data);
    }

    yTickLine(y) {
        const data = [
            {"x": this.margin, "y": y},
            {"x": this.margin - 5, "y": y},
        ];
        const yTickLine = line()
            .x((d) => {return d.x;})
            .y((d) => {return d.y;});
        return yTickLine(data);
    }

    erase(lyr) {
        this.d3Canvas.select("#" + lyr.id).remove();
    }

    stack() {
        let selectedId = undefined;
        layerStack.layers.forEach((l) => {
            this.erase(l);
            this.layer(l);
            if (l === selection.layer) {
                selection.select(l.id);
                selectedId = l.id;
            }
        });
        drawAtFront(selectedId);
    }
}
export let drawObject = new Draw();

export function drawAtFront(id: string) {
    const element = $("#" + id);
    element.parent().append(element);
}