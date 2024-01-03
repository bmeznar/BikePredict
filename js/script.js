let locations_circles = [];
let location_text = [];

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

getContent();
console.log("test");
$.ajax({
    type: "GET",
    url: "saveToJson.php",
    data: {},
    success: function () {
        console.log("data loaded");
        getContent();
    },
});

// P R E D V A J A N J E   P O D A T K O V
function getContent() {
    fetch("getContent.php")
        .then((response) => response.json())
        .then((data) => {
            // console.log(data["numberOfTimestamps"]);
            // console.log(data);
            // const timestamps = data["timestamps"];

            const dataSlider = document.getElementById("myRange");
            const timeDisplay = document.getElementById("time_data");
            const dateDisplay = document.getElementById("date_data");
            const jsonData = data["stations_info"]["timestamps"];
            const playBtn = document.getElementById("playBtn");
            const pauseBtn = document.getElementById("pauseBtn");
            const stationName = document.getElementById("loc_name");
            const predictions = data["predictions"];

            let isPlaying = false;
            let currentIndex = 0;
            let intervalId;
            let activeStation;
            let currentZoom = map.getZoom();

            let weatherrIconDiv = document.getElementById("weather_icon");
            let weatherTempDiv = document.getElementById("weather_temperature");

            // nastavimo stevilo korakov sliderja
            dataSlider.max = data["numberOfTimestamps"];

            //inicializiramo markerje lokacij in narisane kroge
            const locations = jsonData[0].stations;
            locations.forEach((element) => {
                if (!activeStation) {
                    activeStation = element.id;
                }

                // markerji lokacij
                let marker = L.marker([element.latitude, element.longitude], {
                    interactive: true,
                })
                    .addTo(map)
                    .on("click", function (e) {
                        changeActiveStation(this, element.id);
                    });

                if (element.id == activeStation) {
                    L.DomUtil.addClass(marker._icon, "activeMarker");
                }

                // napis št. prostih koles
                var myIcon = L.divIcon({
                    className: "my-div-icon",
                    html:
                        '<div class="circle_num_of_bikes hidden">' +
                        element.numberOfFreeBikes +
                        "/" +
                        element.numberOfLocks +
                        "</div>",
                });
                let text = L.marker(
                    [element.latitude - 0.0002, element.longitude - 0.0001],
                    {
                        icon: myIcon,
                    }
                ).addTo(heatmap);
                location_text.push(text);

                //krogi
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
                updateWeather(selectedData.weather, 0);
                for (let i = 0; i < selectedData.stations.length; i++) {
                    locations_circles[i].setRadius(
                        selectedData.stations[i].numberOfBikes * currentZoom * 2
                    );

                    var updatedIcon;
                    if (currentZoom < 15) {
                        updatedIcon = L.divIcon({
                            className: "my-div-icon",
                            html:
                                '<div class="circle_num_of_bikes hidden">' +
                                selectedData.stations[i].numberOfBikes +
                                "/" +
                                selectedData.stations[i].numberOfLocks +
                                "</div>",
                        });
                    } else {
                        updatedIcon = L.divIcon({
                            className: "my-div-icon",
                            html:
                                '<div class="circle_num_of_bikes">' +
                                selectedData.stations[i].numberOfBikes +
                                "/" +
                                selectedData.stations[i].numberOfLocks +
                                "</div>",
                        });
                    }
                    location_text[i].setIcon(updatedIcon);

                    if (selectedData.stations[i].id == activeStation) {
                        updateGraphs(selectedData.stations[i], predictions);
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
                updateGraphs(selectedData.stations[index], predictions);
                stationName.innerHTML = selectedData.stations[index].name;
                $(".leaflet-marker-icon.activeMarker").removeClass(
                    "activeMarker"
                );
                context._icon.classList.add("activeMarker");
            }

            function updateWeather(weathercode, temperature) {
                console.log(weathercode);
                switch (weathercode) {
                    case 0:
                        weatherrIconDiv.innerHTML =
                            "<i class='fa-solid fa-sun'></i>";
                        break;
                    case 1:
                    case 2:
                    case 3:
                        weatherrIconDiv.innerHTML =
                            "<i class='fa-solid fa-cloud-sun'></i>";
                        break;
                    case 45:
                    case 48:
                        weatherrIconDiv.innerHTML =
                            "<i class='fa-solid fa-smog'></i>";
                        break;
                    case 51:
                    case 53:
                    case 55:
                    case 81:
                    case 83:
                    case 85:
                        weatherrIconDiv.innerHTML =
                            "<i class='fa-solid fa-cloud-rain'></i>";
                        break;
                    case 56:
                    case 57:
                        weatherrIconDiv.innerHTML = "freezing drizzle";
                        break;
                    case 61:
                    case 63:
                    case 65:
                    case 56:
                    case 57:
                        weatherrIconDiv.innerHTML =
                            "<i class='fa-solid fa-cloud-showers-heavy'></i>";
                        break;
                    case 71:
                    case 73:
                    case 75:
                    case 77:
                    case 85:
                    case 86:
                        weatherrIconDiv.innerHTML =
                            "<i class='fa-solid fa-snowflake'></i></i>";
                        break;
                    case 95:
                    case 96:
                    case 99:
                        weatherrIconDiv.innerHTML =
                            "<i class='fa-solid fa-cloud-bolt'></i>";
                        break;
                    default:
                        weatherrIconDiv.innerHTML =
                            "<i class='fa-solid fa-exclamation'></i>";
                        break;
                }

                // weatherrIconDiv.innerHTML =
                //     "<i class='fa-solid fa-cloud-sun-rain'></i>";
            }

            // funkcija spreminjanja ob zoomu
            map.on("zoomend", function () {
                currentZoom = map.getZoom();
                // console.log(currentZoom);
                updateDataDisplay(currentIndex);
                if (currentZoom < 15) {
                    $(".circle_num_of_bikes").each(function () {
                        $(this).addClass("hidden");
                    });
                    console.log("hide");
                } else {
                    $(".circle_num_of_bikes").each(function () {
                        console.log($(this));
                        $(this).removeClass("hidden");
                    });
                }
            });
        })
        .catch((error) => {
            console.error("Error fetching JSON:", error);
        });
}

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
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
        ],
    },
    options: {
        legend: {
            display: true,
            position: "right",
        },
        plugins: {
            labels: {
                render: "value",
                fontColor: "white",
            },
        },
    },
});

//izris grafa za napoved razpoložljivosti
let predictionChart = new Chart(station_prediction, {
    type: "bar",
    data: {
        labels: ["zjutraj", "dopoldne", "popoldne", "zvečer"],
        datasets: [
            {
                label: "Predvidena razpoložljivost koles",
                data: [5, 8, 4, 9],
                tension: 0.4,
                backgroundColor: "#FF6384",
                fill: false,
                borderColor: "#FF6384",
                showTooltips: true,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: true,
            position: "bottom",
            align: "center",
        },
        plugins: {
            title: {
                display: false,
                text: "Napoved razpoložljivosti koles",
            },
        },
        scales: {
            xAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "",
                    },
                },
            ],
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                        max: 10,
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Št. koles",
                    },
                },
            ],
        },
    },
});

function updateGraphs(station, predictions) {
    days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    bikeHistoryChart.data.datasets[0].data = [
        station.numberOfBikes,
        station.numberOfFreeLocks,
        station.numberOfTotalFaulty,
    ];
    // console.log(station.numberOfFreeLocks);
    bikeHistoryChart.update();

    const today = new Date().getDay();
    let day = days[today];
    // console.log(predictions[station.id][day]);
    let todayPrediction = predictions[station.id][day];
    predictionChart.data.datasets[0].data = [
        Math.ceil(todayPrediction["Morning"]),
        Math.ceil(todayPrediction["Evening"]),
        Math.ceil(todayPrediction["Afternoon"]),
        Math.ceil(todayPrediction["Night"]),
    ];
    predictionChart.update();
}
