
const API_KEY = '407729ada96e9c55c08ed161f4aa1fda'

const weatherSection = document.querySelector('.weather');
const searchCitySection = document.querySelector('.search-city');
const notFoundSection = document.querySelector('.not-found-city');
const forecastElementsContainer = document.querySelector('.forecast-elements-container');

let userSearch = document.querySelector('.search-input');
let searchButton = document.querySelector('.search-btn');
let citySearched = document.querySelector('.city-searched');
let temperature = document.querySelector('.temp')
let mainWeather = document.querySelector('.main-weather');
let humi = document.querySelector('.humidity-value');
let windSpeed = document.querySelector('.wind-speed-value');
let date = document.querySelector('.date');
let weatherIcon = document.querySelector('.weather-icon');

// Funcion para actualizar la fecha de la aplicacion
const getCurrentDate = () => {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };

    return currentDate.toLocaleDateString('en-US', options)
}

// Funcion para actualizar los iconos del clima
const getCurrentIcon = (id) => {
    if(id <= 232) return 'thunderstorm.svg';
    if(id <= 321) return 'drizzle.svg';
    if(id <= 531) return 'rain.svg';
    if(id <= 622) return 'snow.svg';
    if(id <= 781) return 'atmosphere.svg';
    if(id == 800) return 'clear.svg';
    else return 'clouds.svg';
}

// Se incorpora evento al dar click en el boton buscar
searchButton.addEventListener('click', () => {
    
    // Si el valor de la busqueda no es vacio, se hace la solicitud a la API
    if (userSearch.value.trim() != '') {
        updateWeather(userSearch.value);
        userSearch.value = '';
    }
})


// Se incorpora evento al dar una tecla en la seccion de busqueda
userSearch.addEventListener('keydown', (e) => {

    // Si la tecla es el boton enter y el valor de la busqueda no es vacia, se solicita a la API la informacion
    if (e.key == 'Enter' && userSearch.value.trim() != '') {
        updateWeather(userSearch.value);
        userSearch.value = '';
    }
})


// Se hace el fecth de la data a la API
const fecthData = async (endPoint, search) => {
        const response = await fetch (`https://api.openweathermap.org/data/2.5/${endPoint}?q=${search}&appid=${API_KEY}&units=metric`);
        return response.json()
}


const showSection = (section) => {

    // Se le indica a todas las secciones que no se muestren en pantalla
    [weatherSection, searchCitySection, notFoundSection].forEach(section => {
        section.style.display = 'none';
    })
    
    // Se muestra en pantalla la seccion recibida
    section.style.display ='flex';
}

// Funcion para actualizar el clima con la ciudad ingresada por el usuario
const updateWeather = async (city) => {

    // Se hace la solicitud al fecthData con la ciudad ingresada por el usuario
    const weatherData = await fecthData('weather', city);

    // Si la solicitud es error, se muestra la seccion de no encontrado
    if(weatherData.cod != 200) {
        showSection(notFoundSection)
        return
    };
    
    // Si la solicitud se encuentra, se muestra la seccion del clima
    showSection(weatherSection);

    // Se extrae la informacion necesaria de la DATA
    const {
        name: country,
        main: {temp, humidity},
        weather: [{id, main}],
        wind: { speed },
    } = weatherData


    // Se actualizan la informacion de los elementos
    citySearched.textContent = country;
    temperature.textContent = Math.round(temp) + ' °C';
    mainWeather.textContent = main;
    humi.textContent = humidity + '%';
    windSpeed.textContent = speed + 'M/s';
    date.textContent = getCurrentDate();
    weatherIcon.src = `./assets/img/${getCurrentIcon(id)}`

    updateForecastsInfo(city);
}


// Funcion para actualizar el clima los dias siguientes
const updateForecastsInfo = async (city) => {
    const forecastData = await fecthData('forecast', city);     // Se obtiene la información de la API para el pronostico
    const timeTaken = '12:00:00';                               // Se define la hora en la que sera tomada
    const todayDate = new Date().toISOString().split('T')[0];   // Se obtiene la fecha de dia

    // Se limpia el contenedor de los elementos forecast
    forecastElementsContainer.innerHTML = '';

    // De cada una de la lista encontrada, se verifica que sean de las 12:00 y que no incluya la fecha del dia actual
    forecastData.list.forEach(forecastWeatherDay => {
        if(forecastWeatherDay.dt_txt.includes(timeTaken) && !forecastWeatherDay.dt_txt.includes(todayDate)) {
            updateForecastElements(forecastWeatherDay)  // Se ejecuta la funcion que incorpora los elementos de cada uno de los dias obtenidos
        }
    })

}

// Funcion para crear los elementos con las predicciones del clima

const updateForecastElements = (forecastData) => {
    
    // Se extrae la informacion obtenida de la API forecast
    const {
        dt_txt: date,
        main: {temp},
        weather: [{id}]
    } = forecastData

    // Se crea el formato de la fecha
    const takenDate = new Date(date)
    const dateOptions = {
        day: '2-digit',
        month: 'short'
    }
    const forecastDate = takenDate.toLocaleDateString('en-US', dateOptions)

    // Se crea el HTML que se insertara con la informacion de cada uno de los dias del forecast
    const forecastElement = `
        <div class="forecast-element">
            <h3 class="forecast-date">${forecastDate}</h3>
            <img src="./assets/img/${getCurrentIcon(id)}" alt="weather-icon" />
            <h3 class="forecast-temperature">${Math.round(temp)}°C</h3>
        </div>`;

    // Se incorporan los elementos del forecast en el elemento contenedor 
    forecastElementsContainer.insertAdjacentHTML('beforeend', forecastElement);
}
