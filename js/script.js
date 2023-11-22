let locations_circles = [];

// $(".loc").on("click", function () {
//     if ($(this).find(".loc_content").hasClass("active")) {
//         return;
//     }
//     //zapiranje odprtega
//     $(".loc_content.active").slideUp("fast", function () {});
//     $(".loc_content.active").removeClass("active");
//     $(".fa-chevron-down.fa-rotate-180").removeClass("fa-rotate-180");

//     //odpiranje kliknjenega
//     $(this)
//         .find(".loc_content")
//         .slideDown("fast", function () {});
//     $(this).find(".loc_content").addClass("active");
//     $(this).find(".fa-chevron-down").addClass("fa-rotate-180");
// });

$("#hideBtn").on("click", function () {
    if ($(this).hasClass("active")) {
        $(this).removeClass("active");
        $(this).find(".fa-chevron-down").addClass("fa-rotate-180");
        $("#media_player").css("bottom", "-165px");
    } else {
        $(this).addClass("active");
        $(this).find(".fa-chevron-down").removeClass("fa-rotate-180");
        $("#media_player").css("bottom", "50px");
    }
});

jQuery.fn.shake = function () {
    this.each(function (i) {
        for (var x = 1; x <= 3; x++) {
            $(this)
                .animate(
                    {
                        right: "-=5",
                    },
                    10
                )
                .animate(
                    {
                        left: 0,
                    },
                    50
                )
                .animate(
                    {
                        right: "    +=5",
                    },
                    10
                )
                .animate(
                    {
                        left: 0,
                    },
                    50
                );
        }
    });
    return this;
};

setInterval(function () {
    if (!$("#hideBtn").hasClass("active")) {
        $("#hideBtn").effect("shake", { times: 4, distance: 3 }, 1000);
    }
}, 8000);

// Z E M L J E V I D
var map = L.map("map").setView([46.303, 14.295], 11);
var Stadia_AlidadeSmoothDark = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}",
    // {
    //     minZoom: 0,
    //     maxZoom: 20,
    //     attribution:
    //         '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    //     ext: "png",
    // }
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
        const timestampDisplay = document.getElementById("timestamp_data");
        const jsonData = data["timestamps"];
        const playBtn = document.getElementById("playBtn");
        const pauseBtn = document.getElementById("pauseBtn");
        const stationName = document.getElementById("loc_name");

        let isPlaying = false;
        let currentIndex = 0;
        let intervalId;
        let activeStation;

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
                radius: element.numberOfBikes * 150,
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
            const formattedDate = dateObject.toLocaleDateString();
            const formattedTime = dateObject.toLocaleTimeString();
            console.log("Date:", formattedDate);
            console.log("Time:", formattedTime);

            timestampDisplay.textContent = `${formattedDate}     ${formattedTime}`;
            for (let i = 0; i < selectedData.stations.length; i++) {
                locations_circles[i].setRadius(
                    selectedData.stations[i].numberOfBikes * 150
                );

                if (selectedData.stations[i].id == activeStation) {
                    // console.log("prikazujem postajo:" + activeStation);
                    // console.log(selectedData.stations[i]);
                    updateGraphs(selectedData.stations[i]);
                    stationName.innerHTML = selectedData.stations[i].name;
                }
            }
        }

        function changeActiveStation(context, stationID) {
            // console.log(stationID);
            activeStation = stationID;
            const selectedData = jsonData[currentIndex];
            let index = selectedData.stations.findIndex(
                (station) => station.id === activeStation
            );
            // console.log(selectedData.stations[index]);
            updateGraphs(selectedData.stations[index]);
            stationName.innerHTML = selectedData.stations[index].name;
            $(".leaflet-marker-icon.activeMarker").removeClass("activeMarker");
            context._icon.classList.add("activeMarker");
            // console.log(context._icon.className);
        }
    })
    .catch((error) => {
        console.error("Error fetching JSON:", error);
    });

// G R A F I
const station_history = document.getElementById("station_history");
const station_prediction = document.getElementById("station_prediction");

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
// TODO: spreminjanje krogov na zemljevidu z zoomanjem
// TODO: spreminjanje prikazane napovedi ob spremembi lokacije
// TODO: prikaz vremena (prikaz vremena za vnaprej?)
