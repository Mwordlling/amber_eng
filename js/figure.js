function figure() {
    let gridString, image, img_center, grid, imageOffsetPc = {x: 0, y: 0},
        figureSize = { x: 3, y: 3 }, designBlockSize = 128, tileDesignSize = 500, storage = {};

    function my(selection) {
        selection.each(function() {
            const backgroundSize_pc = tileDesignSize / (designBlockSize * figureSize.x);
            const container = d3.select(this);

            container.append("div")
                .attr("class", "grid-wrapper")
                .style("background-image", `url('${image}')`)
                .style("background-position", `${inpercents(imageOffsetPc.x)} ${inpercents(imageOffsetPc.y)}`)
                .style("background-size", inpercents(backgroundSize_pc))
                .selectAll("div.elementary-block")
                .data(grid)
                .enter()
                .append("div")
                .attr("class", "elementary-block")
                .classed("opaque", d => d)
                .classed("transparent", d => !d)
                .style("width", inpercents(1 / figureSize.x))
                .style("padding-bottom", inpercents(1 / figureSize.x))
                .attr("title", "Клікніть щоб дивитись карту");

            container.selectAll(".elementary-block.transparent")
                .on("click", () => storage._onClick());

            my.getBackgroundSize_pc = () => backgroundSize_pc;
        });
    }

    my.image = value => value === undefined ? image : (setImage(value), my);
    my.imageOffsetPc = value => value === undefined ? imageOffsetPc : (imageOffsetPc = value, my);
    my.gridString = value => value === undefined ? gridString : (setGridString(value), my);
    my.figureSize = value => value === undefined ? figureSize : (figureSize = value, my);
    my.onClick = value => value === undefined ? storage._onClick : (storage._onClick = value, my);

    function setImage(value) {
        image = value;
        img_center = image.split(/[/\\]/).pop().split("_").slice(0, 2).map(Number);
    }

    function setGridString(value) {
        gridString = value;
        grid = gridString.replace(/\s/g, "").split("").slice(0, figureSize.x * figureSize.y).map(Number);
    }

    const inpercents = value => `${value * 100}%`;

    return my;
}
