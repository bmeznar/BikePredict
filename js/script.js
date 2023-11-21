let locations_circles = [];

$(".loc").on("click", function () {
    if ($(this).find(".loc_content").hasClass("active")) {
        return;
    }
    //zapiranje odprtega
    $(".loc_content.active").slideUp("fast", function () {});
    $(".loc_content.active").removeClass("active");
    $(".fa-chevron-down.fa-rotate-180").removeClass("fa-rotate-180");

    //odpiranje kliknjenega
    $(this)
        .find(".loc_content")
        .slideDown("fast", function () {});
    $(this).find(".loc_content").addClass("active");
    $(this).find(".fa-chevron-down").addClass("fa-rotate-180");
});

// Z E M L J E V I D
var map = L.map("map").setView([46.318, 14.275], 11);
var Stadia_AlidadeSmoothDark = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}",
    {
        minZoom: 0,
        maxZoom: 20,
        attribution:
            '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: "png",
    }
);
map.addLayer(Stadia_AlidadeSmoothDark);

var heatmap = L.layerGroup();

// P R E D V A J A N J E   P O D A T K O V
fetch("getContent.php")
    .then((response) => response.json())
    .then((data) => {
        console.log(data["numberOfTimestamps"]);
        console.log(data);
        const timestamps = data["timestamps"];

        const dataSlider = document.getElementById("myRange");
        const timestampDisplay = document.getElementById("timestamp_data");
        const jsonData = data["timestamps"];
        const playBtn = document.getElementById("playBtn");
        const pauseBtn = document.getElementById("pauseBtn");

        let isPlaying = false;
        let currentIndex = 0;
        let intervalId;

        // nastavimo stevilo korakov sliderja
        dataSlider.max = data["numberOfTimestamps"];

        //dodamo markerje lokacij
        const locations = jsonData[0].stations;
        locations.forEach((element) => {
            L.marker([element.latitude, element.longitude]).addTo(map);
            let circle = L.circle([element.latitude, element.longitude], {
                color: "transparent",
                fillColor: "#f03",
                fillOpacity: 0.5,
                radius: element.numberOfBikes * 150,
            }).addTo(heatmap);
            locations_circles.push(circle);
        });
        heatmap.addTo(map);

        // Initial data display
        updateDataDisplay(currentIndex);

        // Slider change event
        dataSlider.addEventListener("input", function () {
            updateDataDisplay(this.value);
            currentIndex = parseInt(this.value);
        });

        // Play button click event
        playBtn.addEventListener("click", function () {
            if (!isPlaying) {
                playSlider();
                isPlaying = true;
            }
        });

        // Pause button click event
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
            }, 1000); // Adjust the interval as needed
        }

        // updatanje prikazanih podatkov pri predvajanju
        function updateDataDisplay(index) {
            const selectedData = jsonData[index];
            timestampDisplay.textContent = `${selectedData.timestamp}`;
            for (let i = 0; i < selectedData.stations.length; i++) {
                locations_circles[i].setRadius(
                    selectedData.stations[i].numberOfBikes * 150
                );
            }
        }
    })
    .catch((error) => {
        console.error("Error fetching JSON:", error);
    });

// G R A F I
const ctx1 = document.getElementById("myChart1");
const ctx2 = document.getElementById("myChart2");
const ctx3 = document.getElementById("myChart3");

new Chart(ctx1, {
    type: "doughnut",
    data: {
        labels: [
            "Prosta kolesa",
            "Prosta el. kolesa",
            "Prazne ključavnice",
            "Pokvarjena kolesa",
        ],
        datasets: [
            {
                label: "# of Votes",
                data: [12, 19, 3, 5],
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

new Chart(ctx2, {
    type: "doughnut",
    data: {
        labels: [
            "Prosta kolesa",
            "Prosta el. kolesa",
            "Prazne ključavnice",
            "Pokvarjena kolesa",
        ],
        datasets: [
            {
                label: "# of Votes",
                data: [12, 19, 3, 5],
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

new Chart(ctx3, {
    type: "doughnut",
    data: {
        labels: [
            "Prosta kolesa",
            "Prosta el. kolesa",
            "Prazne ključavnice",
            "Pokvarjena kolesa",
        ],
        datasets: [
            {
                label: "# of Votes",
                data: [12, 19, 3, 5],
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
