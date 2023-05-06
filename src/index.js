import './index.html';
import './index.scss';
import dashedline from './modules/dashedline';
import leaflet from '../node_modules/leaflet/dist/leaflet.js';
import '../node_modules/leaflet/dist/leaflet.css';
import getLocality from './modules/fetchLocality';
import _ from 'lodash';
import getWeather from './modules/fetchWeather';
import makeIconWeather from './modules/makeIconWeather';
import getNearestCities from './modules/fetchNearestCities';
import descriptionWeather from './modules/descriptionWeather';
import Notiflix from 'notiflix';

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

const USERNAME = 'ishanya';

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

const makeCitiesByInpuValue = input => {
  return getLocality(input, USERNAME).then(res => {
    if (!res.data.geonames.length)
      return Notiflix.Notify.info(
        'На ваш запит немає відповідного результату. Будь ласка, спробуйте ще раз'
      );
    return res.data.geonames;
  });
};

const makeCities = res => {
  refs.citiesList.innerHTML = '';
  res.data.geonames.slice(1).forEach((el, i) => {
    if (i < 3) {
      getWeather(el.lat, el.lng).then(res => {
        makeItemCity(
          el.name,
          res.data.current_weather.weathercode,
          res.data.current_weather.temperature
        );
      });
    }
  });
};

const makeItemCity = (city, weathercode, temp) => {
  refs.citiesList.insertAdjacentHTML(
    'beforeend',
    renderItemCity(city, weathercode, temp)
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
    refs.modalform.addEventListener('input', _.debounce(inputCityHandler, 500));
    refs.searchList.addEventListener(
      'click',
      onClickBtnFetchWeatherDataHandler
    );
  } else {
    refs.searchList.removeEventListener(
      'click',
      onClickBtnFetchWeatherDataHandler
    );
  }
};

const inputCityHandler = async evt => {
  const val = evt.target.value.toLowerCase().trim();
  if (!val) return (refs.searchList.innerHTML = '');

  const locality = await makeCitiesByInpuValue(val);
  refs.searchList.innerHTML = locality.map(renderSearch).join('');
};

const onClickBtnFetchWeatherDataHandler = evt => {
  const target = evt.target;
  refs.mapTitle.textContent = target.textContent;
  if (evt.target.classList.contains('search-item')) {
    map.setView([...Object.values(target.dataset)], 13);
    getWeather(...Object.values(target.dataset)).then(makeDays);
    getNearestCities(...Object.values(target.dataset), USERNAME).then(
      makeCities
    );
    removeActiveClass();
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

const renderItemCity = (city, weathercode, temp) => {
  return `<li class="cities-item">
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

const renderSearch = ({ lat, lng, name, countryName }) => {
  return `<li class="search-item" data-lat="${lat}" data-lng="${lng}">${name}, ${countryName}</li>`;
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

// Base GET request

getWeather(50.45, 30.53).then(makeDays);
getNearestCities(50.45, 30.53, USERNAME).then(makeCities);
refs.mapTitle.innerHTML = 'Київ, Україна';

// Listeners

refs.sidebar.addEventListener('click', onClickBtnSidebarHandler);

refs.modalform.addEventListener('submit', evt => {
  evt.preventDefault();
});
