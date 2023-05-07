import './index.html';
import './index.scss';
import leaflet from '../node_modules/leaflet/dist/leaflet.js';
import _ from 'lodash';
import Notiflix from 'notiflix';
import dashedline from './modules/dashedline';
import switchColor from './modules/swithColor';
import '../node_modules/leaflet/dist/leaflet.css';
import getLocality from './modules/fetchLocality';
import getWeather from './modules/fetchWeather';
import makeIconWeather from './modules/makeIconWeather';
import getNearestCities from './modules/fetchNearestCities';
import descriptionWeather from './modules/descriptionWeather';

// References

const refs = {
  humidityList: document.querySelector('.js-humidity-list'),
  sidebar: document.querySelector('.js-sidebar'),
  mapTitle: document.querySelector('.js-title'),
  backdrop: document.querySelector('.js-backdrop'),
  modalform: document.querySelector('.js-form'),
  searchList: document.querySelector('.js-search-list'),
  daysList: document.querySelector('.js-days-list'),
  citiesList: document.querySelector('.js-cities-list'),
  statsList: document.querySelector('.js-stats-list'),
};

// Constants

const APIkey = '2c51583c12e4bfc17c3e270ff322ae2f';

const date = new Date();
const daysOfWeek = [
  'Неділя',
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  `П\'ятниця`,
  'Субота',
];

const options = {
  enableHighAccuracy: true,
  maximumAge: 30000,
  timeout: 15000,
};

// Calculating the day of the week

const sortDays = arr => {
  for (let i = 0; i < date.getDay(); i += 1) {
    arr.push(arr[0]);
    arr.splice(0, 1);
  }
};

sortDays(daysOfWeek);

// СSS decoration

[...refs.humidityList.children].forEach(el => el.append(dashedline(18)));

/**
  |============================
  | GLOBAL MAP
  |============================
*/

var map = L.map('map').setView([50.45, 30.53], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// Makers

const fetchPromises = (lat, lon) => {
  map.setView([lat, lon], 13);
  getWeather(lat, lon).then(makeDays);
  getNearestCities(lat, lon, APIkey).then(makeCities);
};

const getDataOnSubmit = place => {
  clearInput();
  clearCitiesList();
  removeActiveClass();
  clearSearchList();
  setMapTitleVal(place);
  appointMainBtnCurrent();
  fetchPromises(...Object.values(place.dataset));
};

const makeCitiesByInpuValue = async input => {
  try {
    const response = await getLocality(input, APIkey);
    if (!response.data.length)
      return Notiflix.Notify.warning(
        'На ваш запит немає відповідного результату. Будь ласка, спробуйте ще раз'
      );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const makeCities = res => {
  res.data.list.forEach(async (el, i) => {
    const res = await getWeather(...Object.values(el.coord));
    makeItemCity(
      res.data.latitude,
      res.data.longitude,
      el.name,
      res.data.current_weather.weathercode,
      res.data.current_weather.temperature
    );
  });
};

const makeItemCity = (lat, lon, city, weathercode, temp) => {
  if (
    refs.citiesList.childElementCount > 2 ||
    city === refs.mapTitle.textContent
  )
    return;
  return refs.citiesList.insertAdjacentHTML(
    'beforeend',
    renderItemCity(lat, lon, city, weathercode, temp)
  );
};

const makeDays = res => {
  renderCurrentDay(res);
  renderDaysForecast(res);
  renderStatistic(res);
};

// Checks

const checkCurrentBtnClass = evt => {
  if (document.querySelector('.currentBtn')) {
    document.querySelector('.currentBtn').classList.remove('currentBtn');
    evt.target.closest('.side-btn').classList.add('currentBtn');
  }
};

/**
  |============================
  | Handlers
  |============================
*/

const onClickBtnSidebarHandler = evt => {
  if (!evt.target.closest('.side-btn')) return;
  removeActiveClass();
  const target = Object.keys(evt.target.closest('.side-btn').dataset);
  checkCurrentBtnClass(evt);
  if (target.includes('search')) {
    refs.backdrop.classList.add('active');
    refs.searchList.addEventListener(
      'click',
      onClickItemCityFetchWeatherDataHandler
    );
    refs.modalform.addEventListener('submit', evt => {
      evt.preventDefault();
      if (refs.searchList.children.length) {
        getDataOnSubmit(refs.searchList.children[0]);
      }
    });
  } else if (target.includes('location')) {
    navigator.geolocation.getCurrentPosition(success, error, options);
  } else {
    refs.searchList.removeEventListener(
      'click',
      onClickItemCityFetchWeatherDataHandler
    );
  }
};

const inputCityHandler = async evt => {
  const val = evt.target.value.toLowerCase().trim();
  if (!val) return (refs.searchList.innerHTML = '');

  try {
    const locality = await makeCitiesByInpuValue(val);
    refs.searchList.innerHTML = await locality.map(renderSearch).join('');
  } catch (error) {
    console.log(error);
  }
};

const onClickItemCityFetchWeatherDataHandler = evt => {
  if (evt.target.classList.contains('search-item')) {
    getDataOnSubmit(evt.target);
  }
};

/**
  |============================
  | Renders
  |============================
*/

const renderCurrentDay = res => {
  refs.daysList.firstElementChild.innerHTML = `
           <div class="day-time-wrapper">
                <h2 class="day">${daysOfWeek[0]}</h2>
                  <time class="day-time" datetime="${getCurrentTime()}">${getCurrentTime()}</time>
                </div>
                <div class="first-day-content">
                  <div class="temperature-wrapper">
                  <p class="temperature js-current-temp">${Math.round(
                    res.data.current_weather.temperature
                  )}</p>
                  <svg class="icon-weather" width="117" height="95">
                    <use href="./assets/icons.svg#${makeIconWeather(
                      res.data.current_weather.weathercode
                    )}"></use>
                  </svg>
                </div>
                <ul class="weather-info-list">
                  <li class="weather-info-item">
                    Швидкість вітру
                    <span class="weather-val">${
                      res.data.current_weather.windspeed
                    }</span>
                    <span class="unit">км&sol;ч</span>
                  </li>
                  <li class="weather-info-item">
                    Напрям вітру <span class="weather-val">${
                      res.data.current_weather.winddirection
                    }</span>
                    <span class="unit">&deg;</span>
                  </li>
                  <li class="weather-info-item">
                    Вологість <span class="weather-val">${getHumidity(
                      res
                    )}</span>
                    <span class="unit">&percnt;</span>
                  </li>
                </ul>
                <button class="btn-more" type="button">Детальніше</button>
            </div>`;
};

const renderDaysForecast = res => {
  [...refs.daysList.children].forEach((el, i) => {
    if (i > 0) {
      el.innerHTML = `<h2 class="day">${daysOfWeek[i].slice(0, 3)}</h2>
          <svg class="icon-weather" width="64" height="64">
            <use href="./assets/icons.svg#${makeIconWeather(
              res.data.daily.weathercode[i]
            )}"></use>
          </svg>
          <p class="temperature">${Math.round(
            res.data.daily.temperature_2m_max[i]
          )}</p>`;
    }
  });
};

const renderItemCity = (lat, lon, city, weathercode, temp) => {
  return `<li class="cities-item" data-lat="${lat}" data-lon="${lon}">
      <div class="city-info-wrapper">
        <h3 class="city">${city}</h3>
        <p class="info">${descriptionWeather(weathercode)}</p>
        <button class="btn-see" type="button">
          Дивитися
        </button>
      </div>
      <div class="city-stats">
        <svg class="icon-weather" width="64" height="64">
          <use href="./assets/icons.svg#${makeIconWeather(weathercode)}"></use>
        </svg>
        <p class="temperature">${Math.round(temp)}</p>
      </div>
    </li>`;
};

const renderSearch = ({ lat, lon, display_name }) => {
  return `<li class="search-item" data-lat="${lat}" data-lng="${lon}">${optimiseLocalityName(
    display_name
  )}</li>`;
};

const renderStatistic = res => {
  [...refs.statsList.children].forEach((el, i) => {
    el.innerHTML = `<p class="stats-day">${daysOfWeek[i].slice(0, 3)}</p>
          <span class="mark js-mark"></span>`;
    animatedStatsMark(res.data.daily.precipitation_probability_mean, i);
  });
};

// Utils

const getCurrentTime = () => {
  return `${date.getHours().toString(10).padStart(2, '0')}:${date
    .getMinutes()
    .toString(10)
    .padStart(2, '0')}`;
};

const getHumidity = res => {
  return Math.round(
    res.data.hourly.relativehumidity_2m
      .splice(0, 23)
      .reduce((acc, el) => acc + el, 0) / 24
  );
};

const removeActiveClass = () => {
  if (document.querySelector('.active')) {
    document.querySelector('.active').classList.remove('active');
  }
};

const animatedStatsMark = (value, i) => {
  const marksArr = document.querySelectorAll('.js-mark');
  setTimeout(() => {
    marksArr[i].style.height = `${value[i]}0%`;
  }, 1000);
};

const optimiseLocalityName = localityName => {
  return localityName
    .split(',')
    .filter(el => !isNumeric(el.trim()))
    .join(',');
};

const clearInput = () => {
  document.getElementsByName('search')[0].value = '';
};

const clearSearchList = () => {
  refs.searchList.innerHTML = '';
};

const clearCitiesList = () => {
  refs.citiesList.innerHTML = '';
};

const setMapTitleVal = el => {
  refs.mapTitle.textContent = el.textContent.split(',').slice(0, 1).join('');
};

const isNumeric = n => n.split('').some(el => Number(el));

const appointMainBtnCurrent = () => {
  if (document.querySelector('.currentBtn')) {
    document.querySelector('.currentBtn').classList.remove('currentBtn');
    document.querySelector('.side-btn').classList.add('currentBtn');
  }
};

// Base Locality

refs.mapTitle.innerHTML = 'Київ';
fetchPromises(50.45, 30.53);

// Listeners

refs.sidebar.addEventListener('click', onClickBtnSidebarHandler);

refs.modalform.addEventListener('input', _.debounce(inputCityHandler, 500));

async function success(position) {
  switchColor(5000);
  clearCitiesList();
  const pos = [position.coords.latitude, position.coords.longitude];
  const res = await getNearestCities(...pos, APIkey);
  refs.mapTitle.textContent = res.data.list[0].name;
  fetchPromises(...pos);
}

function error(error) {
  Notiflix.Notify.info('Не вдалось отримати геодані');
  console.log(error);
}
