function finalmap() {

    var
            map
        ,   format = d3.format(".4f")
        ;

    //var BING_KEY = '7iwrppbVdz0lGpikbqd8~xJvG4G_xd7HrgqwcYlBIbA~AtniWbKOD5OuqxuBx-IIWRSI3SNjKx82lcX-YWJlfgKKSdxl_rgRtSdONbogryBN';
    var BING_KEY = 'Avoa4bcMlmXvijg5mTaiem4yjiG8tWIMObPr6LlO58dz7ILOfKChXs1k6A12EboB'
    function my(selection) {

        selection.each(function() {

            var container = d3.select(this);
            
            req .need("squares1")
                .need("squares9")
                .ready(function(err, squares1, squares9){
                    if (err) throw err;

                    map = L.map(container.node(), {
                        minZoom: 6,
                        scrollWheelZoom: false
                    });

                    // BING 11+
                    var bingLayer = L.tileLayer.bing({
                        bingMapsKey: BING_KEY,
                        minZoom: 10,
                        imagerySet: "AerialWithLabels"
                    });
                    bingLayer.addTo(map);


                    // Light raster 6 - 10
                    L.tileLayer('http://{s}.texty.org.ua/maps/amber/{z}/{x}/{y}.png', {
                        maxZoom: 9
                    }).addTo(map);

                    // map.setView([51.081851400000005, 27.3154423], 8, true);
					map.fitBounds([[51.0428, 25.8618], [51.7726, 28.0893]]);

                    // Squares9: 6 -- 10
                    var squares9_layer = L.geoJSON(squares9, {
                        style: {
                            fillColor: "#c1e600" ,
                            color: "red",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8,
                            stroke: 0
                        }
                    });
                    squares9_layer.addTo(map);

                    // Squares1: 10+
                    var squares1_layer = L.geoJSON(squares1, {
                        style: {
                                fillColor: "black" ,
                                color: "#98c336",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.5,
                                stroke: 1
                        }
                    });
                    squares1_layer.addTo(map);

                    // Для всіх НЕ TileLayer треба прописувати minZoom і maxZoom через хаки
                    map.on("zoomend", onZoomEnd);
                    onZoomEnd();

                    map.on("click", function(e){
                        d3
                            .select("#finalmap-container #coordinates")
                            .classed("hidden", false)
                            .text(format(e.latlng.lat) + ", " + format(e.latlng.lng));
                    });

                    function onZoomEnd() {
                        function removeAll() {
                            map.removeLayer(squares1_layer);
                            map.removeLayer(squares9_layer);
                        }

                        var z = map.getZoom();

                        if (z < 16) {
                            squares1_layer.setStyle({fillOpacity: 0.5})
                        } else if (z >= 16 && z < 17) {
                            squares1_layer.setStyle({fillOpacity: 0.3})
                        } else {
                            squares1_layer.setStyle({fillOpacity: 0})
                        }

                        if (z < 10 ) {
                            squares9_layer.addTo(map);
                            squares1_layer.removeFrom(map);
                        } else if (z >= 10 &&  z < 12) {
                            removeAll();
                            squares9_layer.addTo(map);
                            squares1_layer.addTo(map);
                        } else {
                            squares1_layer.addTo(map);
                            squares9_layer.removeFrom(map);
                        }
                    }
            });


        });
    }

    return my;
}

