let locations_circles = [];

//prikaz in skritje playerja
$("#hideBtn").on("click", function () {
    if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).find(".fa-chevron-down").addClass("fa-rotate-180");
        $("#media_player").css("bottom", "-220px");
    } else {
        $(this).addClass("active");
        $(this).find(".fa-chevron-down").removeClass("fa-rotate-180");
        $("#media_player").css("bottom", "50px");
    }
});

// shaking gumba za prikaz playerja
setInterval(function () {
    if (!$("#hideBtn").hasClass("active")) {
        $("#hideBtn").effect("shake", { times: 4, distance: 3 }, 1000);
    }
}, 8000);

// Z E M L J E V I D
var map = L.map("map").setView([46.303, 14.295], 11);
var Stadia_AlidadeSmoothDark = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}",
    {
        minZoom: 0,
        maxZoom: 20,
        ext: "png",
    }
);
map.addLayer(Stadia_AlidadeSmoothDark);

var heatmap = L.layerGroup();

// P R E D V A J A N J E   P O D A T K O V
fetch("getContent.php")
    .then((response) => response.json())
    .then((data) => {
        // console.log(data["numberOfTimestamps"]);
        // console.log(data);
        const timestamps = data["timestamps"];

        const dataSlider = document.getElementById("myRange");
        const timeDisplay = document.getElementById("time_data");
        const dateDisplay = document.getElementById("date_data");
        const jsonData = data["timestamps"];
        const playBtn = document.getElementById("playBtn");
        const pauseBtn = document.getElementById("pauseBtn");
        const stationName = document.getElementById("loc_name");

        let isPlaying = false;
        let currentIndex = 0;
        let intervalId;
        let activeStation;
        let currentZoom = map.getZoom();

        // nastavimo stevilo korakov sliderja
        dataSlider.max = data["numberOfTimestamps"];

        //inicializiramo markerje lokacij in narisane kroge
        const locations = jsonData[0].stations;
        locations.forEach((element) => {
            if (!activeStation) {
                activeStation = element.id;
            }

            let marker = L.marker(
                [element.latitude, element.longitude],
                (interactive = true)
            )
                .addTo(map)
                .on("click", function (e) {
                    changeActiveStation(this, element.id);
                });

            if (element.id == activeStation) {
                L.DomUtil.addClass(marker._icon, "activeMarker");
            }

            let circle = L.circle([element.latitude, element.longitude], {
                color: "transparent",
                fillColor: "#f03",
                fillOpacity: 0.5,
                radius: element.numberOfBikes * currentZoom,
            }).addTo(heatmap);
            locations_circles.push(circle);
        });
        heatmap.addTo(map);

        //inicializacija prikaza podatkov na zemljevidu
        updateDataDisplay(currentIndex);

        // premikanje sliderja
        dataSlider.addEventListener("input", function () {
            updateDataDisplay(this.value);
            currentIndex = parseInt(this.value);
        });

        // play gumb
        playBtn.addEventListener("click", function () {
            if (!isPlaying) {
                playSlider();
                isPlaying = true;
            }
        });

        // pause gumb
        pauseBtn.addEventListener("click", function () {
            if (isPlaying) {
                clearInterval(intervalId);
                isPlaying = false;
            }
        });

        // predvajanje sliderja
        function playSlider() {
            intervalId = setInterval(function () {
                currentIndex = (currentIndex + 1) % jsonData.length;
                dataSlider.value = currentIndex;
                updateDataDisplay(currentIndex);

                if (currentIndex === 0) {
                    clearInterval(intervalId);
                    isPlaying = false;
                }
            }, 1000); // nastavljanje intervala
        }

        // updatanje prikazanih podatkov pri predvajanju
        function updateDataDisplay(index) {
            const selectedData = jsonData[index];

            const dateObject = new Date(selectedData.timestamp);
            const formattedDate = dateObject.toLocaleDateString("sl-SI", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
            const formattedTime = dateObject.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
            });
            // console.log("Date:", formattedDate);
            // console.log("Time:", formattedTime);

            timeDisplay.textContent = `${formattedTime}`;
            dateDisplay.textContent = `${formattedDate}`;
            for (let i = 0; i < selectedData.stations.length; i++) {
                locations_circles[i].setRadius(
                    selectedData.stations[i].numberOfBikes * currentZoom * 2
                );

                if (selectedData.stations[i].id == activeStation) {
                    updateGraphs(selectedData.stations[i]);
                    stationName.innerHTML = selectedData.stations[i].name;
                }
            }
        }

        function changeActiveStation(context, stationID) {
            activeStation = stationID;
            const selectedData = jsonData[currentIndex];
            let index = selectedData.stations.findIndex(
                (station) => station.id === activeStation
            );
            updateGraphs(selectedData.stations[index]);
            stationName.innerHTML = selectedData.stations[index].name;
            $(".leaflet-marker-icon.activeMarker").removeClass("activeMarker");
            context._icon.classList.add("activeMarker");
        }

        // funkcija spreminjanja ob zoomu
        map.on("zoomend", function () {
            currentZoom = map.getZoom();
            updateDataDisplay(currentIndex);
        });
    })
    .catch((error) => {
        console.error("Error fetching JSON:", error);
    });

// G R A F I
const station_history = document.getElementById("station_history");
const station_prediction = document.getElementById("station_prediction");

// izris grafa za zgodovino postaj
let bikeHistoryChart = new Chart(station_history, {
    type: "doughnut",
    data: {
        labels: ["Prosta kolesa", "Prazne ključavnice", "Pokvarjena kolesa"],
        datasets: [
            {
                label: "Na postaji",
                data: [12, 3, 5],
                borderWidth: 1,
            },
        ],
    },
    options: {
        plugins: {
            legend: {
                display: true,
                position: "right",
            },
        },
    },
});

//izris grafa za napoved razpoložljivosti
let predictionChart = new Chart(station_prediction, {
    type: "line",
    data: {
        labels: ["zjutraj", "dopoldne", "popoldne", "zvečer"],
        datasets: [
            {
                label: "Predvidena razpoložljivost koles",
                data: [5, 8, 4, 9],
                tension: 0.4,
            },
            {
                label: "Predvidena razpoložljivost el. koles",
                data: [3, 2, 1, 5],
                tension: 0.4,
            },
        ],
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: false,
                text: "Napoved razpoložljivosti koles",
            },
            legend: {
                display: true,
                position: "bottom",
            },
        },
        interaction: {
            intersect: false,
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: "Št. koles",
                },
                suggestedMin: 0,
                suggestedMax: 10,
            },
        },
    },
});

function updateGraphs(station) {
    bikeHistoryChart.data.datasets[0].data = [
        station.numberOfBikes,
        station.numberOfFreeLocks,
        station.numberOfTotalFaulty,
    ];
    // console.log(station.numberOfFreeLocks);
    bikeHistoryChart.update();
}

// TODO: hover na markerju izpiše št. koles
// TODO: spreminjanje prikazane napovedi ob spremembi lokacije
// TODO: prikaz vremena (prikaz vremena za vnaprej?)
// TODO: poenotene barve v grafih

// TODO: spremenit kolk velki so krogi - fine tuning?
