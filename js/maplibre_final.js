let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

map2 = new maplibregl.Map({
    container: 'map2',
    zoom: 8,
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

// Зум
map2.scrollZoom.disable();

const navigation = new maplibregl.NavigationControl({
    showCompass: false,
    visualizePitch: false
});
map2.addControl(navigation, 'top-right');

// Можна змінювати зум кнопками + та - ; ctrl / command
document.addEventListener('keydown', (e) => {
    if (e.key === '+') {
        map2.zoomIn({ duration: 300 });
    } else if (e.key === '-') {
        map2.zoomOut({ duration: 300 });
    }
});
document.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
            map2.zoomIn({ duration: 300 });
        } else {
            map2.zoomOut({ duration: 300 });
        }
    }
}, { passive: false });
//

map2.on('load', () => {

    map2.addSource('amberS', {
        type: 'raster',
        url: `pmtiles://https://texty.org.ua/d/maps/pm/amber.pmtiles`,
        tileSize: 256
    });
    map2.addLayer({
        id: 'amber',
        type: 'raster',
        source: 'amberS'
    });

    async function loadGeojsonData() {
        const response9 = await fetch(`./data/data9.geojson`);
        const data9 = await response9.json();
    
        map2.addSource('file9', {
            type: 'geojson',
            data: data9
        });
        map2.addLayer({
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
    
        map2.addSource('file1', {
            type: 'geojson',
            data: data1
        });
        map2.addLayer({
            id: 'polygon1-fill',
            type: 'fill',
            source: 'file1',
            paint: {
                'fill-color': '#000000',
                'fill-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14, 0.5,
                    15, 0
                ]
            }
        });
        map2.addLayer({
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
                    14, 1,
                    15, 0
                ]
            }
        });
    }

    loadGeojsonData();

});
