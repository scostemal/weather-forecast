// This function will get the value of cityName and construct a url to retrieve data from the api and extract latitude and longitude and store in local storage. It also appends those searches on the page for call back.

function searchCity() {
    var cityName = titleCase($("#cityName")[0].value.trim());

    var apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=71311474f5b26fb7bbfa0bc1985b90cd";

    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {

                $("#city-name")[0].textContent = cityName + " (" + moment().format('M/D/YYYY') + ")";

                $("#city-search-list").append('<button type="button" class="list-group-item list-group-item-light list-group-item-action city-name">' + cityName);

                var lat = data.coord.lat;
                var lon = data.coord.lon;

                var latLonPair = lat.toString() + " " + lon.toString();

                localStorage.setItem(cityName, latLonPair);
                console.log(cityName)
                console.log(latLonPair)

                apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=71311474f5b26fb7bbfa0bc1985b90cd";

                fetch(apiURL).then(function (newResponse) {
                    if (newResponse.ok) {
                        newResponse.json().then(function (newData) {
                            getCurrentWeather(newData);
                        })
                    }
                })
            })
        } else {
            alert("Cannot find city!");
        }
    })
}

// This function retreives weather data for coordinates.

function getListCity(coordinates) {
    apiURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + coordinates[0] + "&lon=" + coordinates[1] + "&exclude=minutely,hourly&units=imperial&appid=a767954b67503e646c0379088695d623";

    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                getCurrentWeather(data);
            })
        }
    })
}

// this function extract and display the data on the page for current weather it also adjust the uv-index dynamically based on the current rating using colors via classes and CSS

function getCurrentWeather(data) {
    $(".current-weather").addClass("visible");

    $("#currentIcon")[0].src = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
    $("#temperature")[0].textContent = "Temperature: " + data.current.temp.toFixed(1) + " \u2109";
    $("#humidity")[0].textContent = "Humidity: " + data.current.humidity + "% ";
    $("#wind-speed")[0].textContent = "Wind Speed: " + data.current.wind_speed.toFixed(1) + " MPH";
    $("#uv-index")[0].textContent = "  " + data.current.uvi;

    if (data.current.uvi < 3) {
        $("#uv-index").removeClass("moderate severe");
        $("#uv-index").addClass("favorable");
    } else if (data.current.uvi < 6) {
        $("#uv-index").removeClass("favorable severe");
        $("#uv-index").addClass("moderate");
    } else {
        $("#uv-index").removeClass("favorable moderate");
        $("#uv-index").addClass("severe");
    }

    getFutureWeather(data);
}

// This function will extract and display the forecast data for the next 5 days. It uses a for loop to iterate. "futureWeather" was created to hold date, temp, humidity and an associated weather icon. There is also a separate function here that converts unix time to a human-readable format.

function getFutureWeather(data) {
    for (var i = 0; i < 5; i++) {
        var futureWeather = {

            // this converts the time to human-readable format using the function on line

            date: convertUnixTime(data, i),

            // this is an icon to represent the current weather for the day

            icon: "http://openweathermap.org/img/wn/" + data.daily[i + 1].weather[0].icon + "@2x.png",

            // this is the current temperature for the day

            temp: data.daily[i + 1].temp.day.toFixed(1),

            // this is the current humidity for the day

            humidity: data.daily[i + 1].humidity
        }

        // This section takes the data and writes it to the page using jquery

        var currentSelector = "#day-" + i;
        $(currentSelector)[0].textContent = futureWeather.date;
        currentSelector = "#img-" + i;
        $(currentSelector)[0].src = futureWeather.icon;
        currentSelector = "#temp-" + i;
        $(currentSelector)[0].textContent = "Temp: " + futureWeather.temp + " \u2109";
        currentSelector = "#hum-" + i;
        $(currentSelector)[0].textContent = "Humidity: " + futureWeather.humidity + "%";
    }
}

// This section will take the user city input and capitilize the first letter of each word of the city ex: new york -> New York.

function titleCase(city) {
    var updatedCity = city.toLowerCase().split(" ");
    var returnedCity = "";
    for (var i = 0; i < updatedCity.length; i++) {
        updatedCity[i] = updatedCity[i][0].toUpperCase() + updatedCity[i].slice(1);
        returnedCity += " " + updatedCity[i];
    }
    return returnedCity;
}

// This converts the UNIX time that is received from the server.
function convertUnixTime(data, index) {
    const dateObject = new Date(data.daily[index + 1].dt * 1000);

    return (dateObject.toLocaleDateString());
}

// This calls the find city function when the user clicks the search button and resets the form for additional submissions

$("#search-button").on("click", function (e) {
    e.preventDefault();

    searchCity();

    $("form")[0].reset();
})

$(".city-search").on("click", ".city-name", function () {

    var coordinates = (localStorage.getItem($(this)[0].textContent)).split(" ");
    coordinates[0] = parseFloat(coordinates[0]);
    coordinates[1] = parseFloat(coordinates[1]);

    $("#city-name")[0].textContent = $(this)[0].textContent + " (" + moment().format('M/D/YYYY') + ")";

    getListCity(coordinates);
})