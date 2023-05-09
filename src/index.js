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
  body: document.body,
  humidityList: document.querySelector('.js-humidity-list'),
  sidebar: document.querySelector('.js-sidebar'),
  mapTitle: document.querySelector('.js-title'),
  backdrop: document.querySelector('.js-backdrop'),
  modalform: document.querySelector('.js-form'),
  searchList: document.querySelector('.js-search-list'),
  daysList: document.querySelector('.js-days-list'),
  citiesList: document.querySelector('.js-cities-list'),
  statsList: document.querySelector('.js-stats-list'),
  themes: document.querySelector('.js-themes'),
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

const checkGeolocation = () => {
  if (navigator.permissions) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then(function (result) {
        if (result.state === 'granted') {
          return navigator.geolocation.getCurrentPosition(
            success,
            error,
            options
          );
        } else if (result.state === 'prompt') {
          // Пользователь должен разрешить доступ к геопозиции
        } else {
          Notiflix.Notify.warning('Доступ до геоданих заборонений');
        }
      });
  } else {
    Notiflix.Notify.warning(
      'На жаль браузер не підтримує відстеження геоданих'
    );
  }
  refs.mapTitle.innerHTML = 'Київ';
  fetchPromises(50.45, 30.53);
};

/**
  |============================
  | Handlers
  |============================
*/

const onClickBtnSidebarHandler = evt => {
  if (!evt.target.closest('.side-btn')) return;
  const target = Object.keys(evt.target.closest('.side-btn').dataset);
  if (
    target.join('') ===
    Object.keys(document.querySelector('.current-btn').dataset).join('')
  )
    return;
  removeActiveClass();
  appointCurrentBtn(evt, 'current-btn', 'side-btn');
  if (target.includes('search')) {
    addActiveClass(0);
    refs.searchList.addEventListener(
      'click',
      onClickItemCityFetchWeatherDataHandler
    );
    refs.modalform.addEventListener('submit', onSubmitFormHandler);
  } else if (target.includes('location')) {
    navigator.geolocation.getCurrentPosition(success, error, options);
  } else if (target.includes('settings')) {
    addActiveClass(1);
    refs.themes.addEventListener('click', onClickBtnSwichThemeHandler);
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

const onSubmitFormHandler = evt => {
  evt.preventDefault();
  if (refs.searchList.children.length) {
    getDataOnSubmit(refs.searchList.children[0]);
  }
};

const onClickItemCityFetchWeatherDataHandler = evt => {
  if (evt.target.classList.contains('search-item')) {
    getDataOnSubmit(evt.target);
  }
};

const onClickBtnSwichThemeHandler = evt => {
  if (!evt.target.closest('.theme-btn')) return;
  appointCurrentBtn(evt, 'current-theme', 'theme-btn');
  removeTheme();
  if (evt.target.closest('.theme-btn').name === 'btn-white') return;
  if (evt.target.closest('.theme-btn').name === 'btn-dark')
    document.body.classList.add('dark');
  if (evt.target.closest('.theme-btn').name === 'btn-paleblue')
    document.body.classList.add('paleblue');
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
  const activeClassEls = document.querySelectorAll('.active');
  if (activeClassEls.length) {
    activeClassEls.forEach(el => el.classList.remove('active'));
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

const removeTheme = () => {
  document.body.classList.remove('dark');
  document.body.classList.remove('paleblue');
};

const setMapTitleVal = el => {
  refs.mapTitle.textContent = el.textContent.split(',').slice(0, 1).join('');
};

const isNumeric = n => n.split('').some(el => Number(el));

const appointMainBtnCurrent = () => {
  if (document.querySelector('.current-btn')) {
    document.querySelector('.current-btn').classList.remove('current-btn');
    document.querySelector('.side-btn').classList.add('current-btn');
  }
};

const addActiveClass = num => {
  refs.backdrop.classList.add('active');
  refs.backdrop.children[num].classList.add('active');
};

const appointCurrentBtn = (evt, prevEl, currentEl) => {
  if (document.querySelector(`.${prevEl}`)) {
    document.querySelector(`.${prevEl}`).classList.remove(prevEl);
    evt.target.closest(`.${currentEl}`).classList.add(prevEl);
  }
};

// Geo Foo

const success = async position => {
  Notiflix.Notify.success(
    'Доступ до геоданих отримано. Відстежуємо геопозицію'
  );
  if (
    Object.keys(document.querySelector('.current-btn').dataset).includes(
      'location'
    )
  )
    switchColor(5000);
  clearCitiesList();
  const pos = [position.coords.latitude, position.coords.longitude];
  const res = await getNearestCities(...pos, APIkey);
  refs.mapTitle.textContent = res.data.list[0].name;
  fetchPromises(...pos);
};

const error = error => {
  Notiflix.Notify.info('Не вдалось отримати геодані');
  console.log(error);
};

// Base Locality

checkGeolocation();

// Listeners

refs.sidebar.addEventListener('click', onClickBtnSidebarHandler);

refs.modalform.addEventListener('input', _.debounce(inputCityHandler, 500));
