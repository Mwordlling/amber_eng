let mapIntance = null;

async function loadMap() {
    if (mapIntance) {
        return;
    }
 
    mapIntance = new maplibregl.Map({
        container: 'map3',
        minZoom: 8,
        maxZoom: 18.5,
        maxBounds: [
            [25.433, 50.965],
            [29.16, 51.83]
        ],
        style: './data/style.json',
        renderWorldCopies: false,
        maxBoundsViscosity: 0.9
    });

    mapIntance.on('load', () => {

        mapIntance.addSource('amberS', {
            type: 'raster',
            url: `pmtiles://https://texty.org.ua/d/maps/pm/amber.pmtiles`,
            tileSize: 256
        });
        mapIntance.addLayer({
            id: 'amber',
            type: 'raster',
            source: 'amberS'
        });

        async function loadGeojsonData() {
            const response9 = await fetch(`./data/data9.geojson`);
            const data9 = await response9.json();

            mapIntance.addSource('file9', {
                type: 'geojson',
                data: data9
            });
            mapIntance.addLayer({
                id: 'polygon9-fill',
                type: 'fill',
                source: 'file9',
                paint: {
                    'fill-color': '#c1e600',
                    'fill-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        9.5, 0.8,
                        10, 0
                    ]
                }
            });

            const response1 = await fetch(`./data/data1.geojson`);
            const data1 = await response1.json();

            mapIntance.addSource('file1', {
                type: 'geojson',
                data: data1
            });
            mapIntance.addLayer({
                id: 'polygon1-fill',
                type: 'fill',
                source: 'file1',
                paint: {
                    'fill-color': '#000000',
                    'fill-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        13, 0.5,
                        14, 0
                    ]
                }
            });
            mapIntance.addLayer({
                id: 'polygon1-outline',
                type: 'line',
                source: 'file1',
                paint: {
                    'line-color': '#98c336',
                    'line-width': 1,
                    'line-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        13, 1,
                        14, 0
                    ]
                }
            });
        }

        loadGeojsonData();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadMap();
});

function map() {
    let hullString, hull, image, img_center;
    let imageOffsetPc = { x: 0, y: 0 };
    let backgroundSize_pc;
    let tooltipText = "";
    const tileOriginalSize = 1000, tileOriginalZoom = 17;
    let format = d3.format(".4f")

    function my(selection) {
        selection.each(function() {
            const container = d3.select(this);

            my.showMap = async function() {

                // Переміщення
                const rect = container.node().getBoundingClientRect();
                const imgsize = rect.width * backgroundSize_pc;
                const zoomLevel = tileOriginalZoom + Math.log2(imgsize / tileOriginalSize);

                mapIntance.setZoom(zoomLevel);

                const half_img = coord_diff(
                    mapIntance.unproject([imgsize / 2, imgsize / 2]),
                    mapIntance.unproject([0, 0])
                );
                const imageOffset = {
                    x: imageOffsetPc.x * (rect.width - imgsize),
                    y: imageOffsetPc.y * (rect.height - imgsize),
                };

                const newx = img_center[1] + ($(window).width() / 2 - (rect.left + imgsize / 2 + imageOffset.x)) / imgsize * (half_img.lng * 2);
                const newy = img_center[0] + ($(window).height() / 2 - (rect.top + imgsize / 2 + imageOffset.y)) / imgsize * (half_img.lat * 2);

                mapIntance.jumpTo({ center: [newx, newy]});

                //
                // Обведення
                const one_px_lng = half_img.lng / (imgsize / 2);
                const one_px_lat = half_img.lat / (imgsize / 2);
                const fig_corner_c = {
                    lng: (imageOffset.x + imgsize / 2) * one_px_lng,
                    lat: (imageOffset.y + imgsize / 2) * one_px_lat,
                };

                const blocksize = container.select('.elementary-block').node().getBoundingClientRect().width;
                const geojson_data = geojsonHull(
                    img_center[1] - fig_corner_c.lng,
                    img_center[0] - fig_corner_c.lat,
                    blocksize * one_px_lng,
                    blocksize * one_px_lat
                );

                mapIntance.addSource('hullSource', {
                    type: 'geojson',
                    data: geojson_data
                });
                mapIntance.addLayer({
                    id: 'polygonne',
                    type: 'line',
                    source: 'hullSource',
                    paint: {
                        'line-color': 'yellow',
                        'line-width': 1
                    }
                });
                // Костиль, треба буде щось з цим зробити
                setTimeout(() => {
                    mapIntance.moveLayer('polygonne');
                }, 3000);
                
                //
                // Попап
                const bounds = turf.bbox(geojson_data);
                const tooltip_coordinates = [bounds[0], bounds[1]];

                const popup = new maplibregl.Popup({
                    offset: [0, -30],
                    anchor: 'bottom',
                    closeButton: false,
                    closeOnClick: false
                })
                .setLngLat(tooltip_coordinates)
                .setHTML(`<div class='tooltip-wrapper'><span>${tooltipText}<br/>${format(img_center[0])}, ${format(img_center[1])}</span></div>`)
                .addTo(mapIntance);

                let popupVisible = true;

                function updatePopupVisibility(zoomLevel) {
                    if (zoomLevel <= 13.5 && popupVisible) {
                        popup.remove();
                        popupVisible = false;
                    } else if (zoomLevel > 13.5 && !popupVisible) {
                        popup.addTo(mapIntance);
                        popupVisible = true;
                    }
                }

                mapIntance.on('zoom', () => {
                    const zoomLevel = mapIntance.getZoom();
                    updatePopupVisibility(zoomLevel);
                });
                //
                // Закриття мапи
                const mapDiv = document.querySelector('#map3');
                const mapBack = document.querySelector('.mapBackground');
                const closeButton = document.querySelector('.close');

                function toggleMap(show) {
                    mapDiv.classList.toggle('hidden2', !show);
                    mapBack.classList.toggle('hidden2', !show);

                    if (!show) {
                        if (mapIntance.getLayer('polygonne')) mapIntance.removeLayer('polygonne');
                        if (mapIntance.getSource('hullSource')) mapIntance.removeSource('hullSource');
                        if (popup) popup.remove();
                    }
                }

                toggleMap(!!mapIntance);

                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') toggleMap(false);
                });

                closeButton.addEventListener('click', () => toggleMap(false));
            };
        });
    }

    my.image = function (value) {
        if (!arguments.length) return image;
        setImage(value);
        return my;
    };

    function setImage(value) {
        image = value;
        img_center = image.replace(/^.*[\\\/]/, '').split("_").slice(0, 2).map(toNumber);
        return my;
    }

    my.imageOffsetPc = function (value) {
        if (!arguments.length) return imageOffsetPc;
        imageOffsetPc = value;
        return my;
    };

    my.backgroundSize_pc = function (value) {
        if (!arguments.length) return backgroundSize_pc;
        backgroundSize_pc = value;
        return my;
    };

    my.tooltipText = function (value) {
        if (!arguments.length) return tooltipText;
        tooltipText = value;
        return my;
    };

    my.hullString = function (value) {
        if (!arguments.length) return hullString;
        setHullString(value);
        return my;
    };

    function setHullString(value) {
        hullString = value;
        hull = hullString.split(/\s+/).map(pair => {
            const [x, y] = pair.split(",");
            return { x: +x, y: +y };
        });
    }

    function coord_diff(c1, c2) {
        return { lat: c1.lat - c2.lat, lng: c1.lng - c2.lng };
    }

    function geojsonHull(left, top, block_w, block_h) {
        const points = hull.map(p => [left + block_w * p.x, top + block_h * p.y]);
        return {
            type: "Feature",
            geometry: { type: "MultiPolygon", coordinates: [[points]] },
        };
    }

    function toNumber(v) {
        return +v;
    }

    return my;
}