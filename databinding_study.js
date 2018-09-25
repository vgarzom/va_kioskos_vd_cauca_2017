var target = d3.select("#target");

function update(myData) {
    var ps = target.selectAll("p")
        .data(myData);

    // Enter
    ps.enter()
        .append("p")
        .text((d, i) => {
            return i + ". " + d;
        })
        .style("color", "steelblue");

    // Update
    ps
        .text((d, i) => {
            return i + ". " + d;
        })
        .style("color", "darkblue");

    // Exit: things to remove
    ps
        .exit()
        .style("color", "darkred");
}


update([1, 2, 3, 4, 5, 6, 4, 2]);
update(["after"]);