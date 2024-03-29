import './index.html';
import './index.scss';
import leaflet from '../node_modules/leaflet/dist/leaflet.js';
import '../node_modules/leaflet/dist/leaflet.css';
import _ from 'lodash';
import Notiflix from 'notiflix';
import translate from './modules/translate';
import Scrollbar from 'smooth-scrollbar';
import Chart from 'chart.js/auto';
import dashedline from './modules/utils/dashedline';
import switchColor from './modules/swithColor';
import getLocality from './modules/fetchLocality';
import getWeather from './modules/fetchWeather';
import getForSaveLocality from './modules/fetchForSaveLocality';
import getNearestCities from './modules/fetchNearestCities';
import getDetailTemp from './modules/fetchDetailTemp';
import descriptionWeather from './modules/descriptionWeather';
import getDetailWeather from './modules/fetchDetailWeather';
import getDetailWeatherTomorrow from './modules/fetchDetailWeatherTomorrow';
import logo from './img/logo.png';
import {
  daysOfWeek,
  renderCurrentDay,
  renderDaysForecast,
  renderDetailWeather,
  renderGeoLang,
  renderItemCity,
  renderSearch,
  renderStatistic,
  todayCodeWeather,
  tomorrowCodeWeather,
} from './modules/renders/renders';

// classes

class CurrentBtn {
  constructor(btnSelector) {
    this.btn = document.querySelector(`.${btnSelector}`);
  }
}

// References

export const refs = {
  body: document.body,
  humidityList: document.querySelector('.js-humidity-list'),
  sidebar: document.querySelector('.js-sidebar'),
  mapTitle: document.querySelector('.js-title'),
  backdrop: document.querySelector('.js-backdrop'),
  modalform: document.querySelector('.js-form'),
  searchList: document.querySelector('.js-search-list'),
  daysList: document.querySelector('.js-days-list'),
  selecterBox: document.querySelector('.js-selecter-box'),
  citiesList: document.querySelector('.js-cities-list'),
  statsList: document.querySelector('.js-stats-list'),
  themes: document.querySelector('.js-themes'),
  geoLang: document.querySelector('.js-geolang-list'),
  chart: document.querySelector('.js-chart'),
  moreCities: document.querySelector('.js-more-wrapper'),
  showAllBtn: document.querySelector('.btn-show-all'),
  today: document.querySelector('.current-weather-box'),
  tomorrow: document.querySelector('.tomorrow-weather-box'),
  contentDaysArr: [...document.querySelectorAll('[data-content]')],
};

// Constants

const APIkey = '2c51583c12e4bfc17c3e270ff322ae2f';

export const date = new Date();

const optionsGeo = {
  enableHighAccuracy: true,
  maximumAge: 30000,
  timeout: 15000,
};

// Variables

let positionY = 0;

// Calculating the day of the week

const sortDays = arr => {
  for (let i = 0; i < date.getDay(); i += 1) {
    arr.push(arr[0]);
    arr.splice(0, 1);
  }
};

sortDays(daysOfWeek);

/**
  |============================
  | MediaQuery
  |============================
*/

const mediaQuery = window.matchMedia('(max-width: 1279px)');

const onScrollPageHideTitleHandler = () => {
  if (window.pageYOffset > positionY) refs.mapTitle.style.display = 'none';
  else refs.mapTitle.style.display = 'block';
  positionY = window.pageYOffset;
};

const handleMediaQueryChange = mediaQuery => {
  [...refs.humidityList.children].forEach(el => {
    if (el.firstElementChild && el.firstElementChild.tagName === 'UL')
      el.firstElementChild.remove();
  });
  if (mediaQuery.matches) {
    [...refs.humidityList.children].forEach(el => el.append(dashedline(12)));
    window.addEventListener(
      'scroll',
      _.throttle(onScrollPageHideTitleHandler, 300)
    );
  } else {
    [...refs.humidityList.children].forEach(el => el.append(dashedline(18)));
    window.removeEventListener(
      'scroll',
      _.throttle(onScrollPageHideTitleHandler, 300)
    );
  }
};

mediaQuery.addListener(handleMediaQueryChange);

handleMediaQueryChange(mediaQuery);

// Scrollbar

Scrollbar.init(document.querySelector('.cities-list-wrapper'));

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

// Chart

const ctx = document.getElementById('myChart').getContext('2d');
let myChart;

// Get Foo

const getDataOnSubmit = async place => {
  clearInput();
  clearCitiesList();
  clearMoreCitiesList();
  removeActiveClass();
  clearSearchList();
  await setMapTitleVal(place);
  appointMainBtnCurrent();
  removeSaveLocalitySetting();
  await setSaveLocality(
    ...Object.values(place.dataset),
    refs.mapTitle.textContent
  );
  getSaveLocalityForSettings();
  fetchPromises(...Object.values(place.dataset));
  refs.daysList.addEventListener('click', onClickBtnOpenChartHandler);
};

const fetchPromises = async (lat, lng) => {
  map.setView([lat, lng], 13);
  await makeWeatherDays(lat, lng);
  makeDetailCurrentDayWeather(lat, lng);
  makeDetailWeatherTomorrow(lat, lng);
  makeNearestCities(lat, lng, APIkey);
  makeAllNearestCities(lat, lng, APIkey);
  weatherNotify();
};

const getSaveLocalityForSettings = () => {
  const saveLocality = localStorage.getItem('locality');
  if (saveLocality) {
    const locality = JSON.parse(saveLocality);
    refs.geoLang.firstElementChild.insertAdjacentHTML(
      'beforeend',
      renderGeoLang(locality.country)
    );
    refs.geoLang.lastElementChild.insertAdjacentHTML(
      'beforeend',
      renderGeoLang(locality.city)
    );
  } else {
    refs.geoLang.firstElementChild.insertAdjacentHTML(
      'beforeend',
      renderGeoLang('Україна')
    );
    refs.geoLang.lastElementChild.insertAdjacentHTML(
      'beforeend',
      renderGeoLang('Київ')
    );
  }
};

const getSaveLocalityForBaseFetch = async () => {
  const saveLocality = localStorage.getItem('locality');
  if (saveLocality) {
    const locality = JSON.parse(saveLocality);
    refs.mapTitle.innerHTML = locality.city;
    fetchPromises(locality.lat, locality.lon);
  } else {
    refs.mapTitle.innerHTML = 'Київ';
    fetchPromises(50.45, 30.53);
    await setSaveLocality(50.45, 30.53, 'Київ');
  }
  refs.daysList.addEventListener('click', onClickBtnOpenChartHandler);
};

const getWeatherChart = async ({ city, lat, lon }) => {
  const res = await getDetailTemp(lat, lon);

  Chart.defaults.backgroundColor = makeChartColor();
  Chart.defaults.color = makeChartColor();

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: res.data.hourly.time.map(parseDayTimeChart),
      datasets: [
        {
          label: `${city}. Погодинна температура`,
          data: res.data.hourly.temperature_2m,
          backgroundColor: makeChartColor(),
          borderColor: makeChartColor(),
          borderWidth: 2,
          pointRadius: 1,
        },
      ],
    },
  });

  refs.chart.addEventListener('click', onClickCloseChartHandler);
};

// Makers

const makeCorrectWeather = code => {
  const res = descriptionWeather(code[1]);
  if (res === 'Ясно') return 'ясна погода';
  else if (res === 'Хмарно') return 'хмарна погода';
  else return res.toLowerCase();
};

const activeContent = name => {
  refs.contentDaysArr.forEach(el => changeClassOnNode(el, name));
};

const changeClassOnNode = (el, name) => {
  el.dataset.content === name
    ? el.classList.add('current-content')
    : el.classList.remove('current-content');
};

const makeDetailCurrentDayWeather = async (lat, lon) => {
  const res = await getDetailWeather(lat, lon, APIkey);
  refs.today.innerHTML = renderDetailWeather(
    res.data,
    todayCodeWeather,
    daysOfWeek[0]
  );
};

const makeDetailWeatherTomorrow = async (lat, lon) => {
  const res = await getDetailWeatherTomorrow(lat, lon, APIkey);
  refs.tomorrow.innerHTML = renderDetailWeather(
    res.data.list[1],
    tomorrowCodeWeather,
    daysOfWeek[1]
  );
};

const makeCityWeather = async target => {
  if (target.closest('.btn-see')) {
    const placeInfo = target.closest('.cities-item').dataset;
    refs.mapTitle.textContent = placeInfo.city;
    clearCitiesList();
    clearMoreCitiesList();
    onClickCloseChartHandler();
    removeSaveLocalitySetting();
    await setSaveLocality(placeInfo.lat, placeInfo.lon, placeInfo.city);
    getSaveLocalityForSettings();
    fetchPromises(placeInfo.lat, placeInfo.lon);
  }
};

const makeChartColor = () => {
  const body = document.body;
  if (body.classList.contains('dark')) {
    return '#FFFFFF';
  } else {
    return '#000000';
  }
};

const setSaveLocality = async (lat, lon, place) => {
  try {
    const res = await getForSaveLocality(lat, lon, 'uk');
    const locality = {
      city: res.data.address.city,
      country: res.data.address.country,
      lat,
      lon,
    };
    if (!res.data.address.city && place) locality.city = place;
    localStorage.setItem('locality', JSON.stringify(locality));
  } catch (error) {
    console.log(error);
  }
};

const addActiveClass = num => {
  refs.body.classList.add('is-hidden');
  refs.backdrop.classList.add('active');
  refs.backdrop.children[num].classList.add('active');
};

const appointThemeBtnCurrentMarker = val => {
  const prevCurrentTheme = new CurrentBtn('current-theme');
  prevCurrentTheme.btn.classList.remove('current-theme');
  const presentCurrentTheme = new CurrentBtn(`theme-btn[name="btn-${val}`);
  presentCurrentTheme.btn.classList.add('current-theme');
};

const appointMainBtnCurrent = () => {
  const prevCurrent = new CurrentBtn('current-btn');
  if (prevCurrent.btn) {
    prevCurrent.btn.classList.remove('current-btn');
    const presentCurrent = new CurrentBtn('side-btn');
    presentCurrent.btn.classList.add('current-btn');
  }
};

const makeNearestCities = async (lat, lon, APIkey) => {
  const res = await getNearestCities(lat, lon, APIkey);
  return makeCities(res);
};

const makeWeatherDays = async (lat, lon) => {
  const res = await getWeather(lat, lon);
  return makeDays(res);
};

const makeCitiesByInpuValue = async input => {
  try {
    const response = await getLocality(input, 'ua', 3);
    if (!response.data.length) throw new Error();
    return response.data;
  } catch (error) {
    Notiflix.Notify.warning(
      'На ваш запит немає відповідного результату. Будь ласка, спробуйте ще раз'
    );
  }
};

const makeCities = res => {
  res.data.list.forEach(async el => {
    const res = await getWeather(...Object.values(el.coord));
    el.name = await translateTxt(el.name);
    makeItemCity(
      res.data.latitude,
      res.data.longitude,
      el.name,
      res.data.current_weather.weathercode,
      res.data.current_weather.temperature
    );
    refs.citiesList.addEventListener(
      'click',
      onClickBtnSeeFetchCityWeatherHandler
    );
  });
};

const makeItemCity = (lat, lon, city, weathercode, temp) => {
  if (
    refs.citiesList.childElementCount > 2 ||
    city === refs.mapTitle.textContent
  ) {
    return;
  } else if (
    refs.citiesList.lastElementChild !== null &&
    [...refs.citiesList.children].some(el => el.dataset.city === city)
  ) {
    return;
  }
  return refs.citiesList.insertAdjacentHTML(
    'beforeend',
    renderItemCity(lat, lon, city, weathercode, temp)
  );
};

const makeAllNearestCities = async (lat, lon, APIkey) => {
  const res = await getNearestCities(lat, lon, APIkey);
  return makeAllCities(res);
};

const makeAllCities = res => {
  res.data.list.forEach(async el => {
    const res = await getWeather(...Object.values(el.coord));
    el.name = await translateTxt(el.name);
    makeItemAllCities(
      res.data.latitude,
      res.data.longitude,
      el.name,
      res.data.current_weather.weathercode,
      res.data.current_weather.temperature
    );
  });
};

const makeItemAllCities = (lat, lon, city, weathercode, temp) => {
  const moreCitiesList = refs.moreCities.lastElementChild.firstElementChild;
  if (city === refs.mapTitle.textContent) {
    return;
  } else if (
    moreCitiesList.lastElementChild !== null &&
    [...moreCitiesList.children].some(el => el.dataset.city === city)
  ) {
    return;
  }
  return moreCitiesList.insertAdjacentHTML(
    'beforeend',
    renderItemCity(lat, lon, city, weathercode, temp)
  );
};

const makeDays = res => {
  renderCurrentDay(res);
  renderDaysForecast(res);
  renderStatistic(res);
};

const setTheme = val => {
  setThemeOnBody(val);

  const settings = {
    theme: val,
  };

  localStorage.setItem('settings', JSON.stringify(settings));
};

// Checks

const checkHasSavedTheme = () => {
  if (!localStorage.getItem('settings')) return;
  else {
    const { theme } = JSON.parse(localStorage.getItem('settings'));
    setThemeOnBody(theme);
    appointThemeBtnCurrentMarker(theme);
  }
};

const checkGeolocation = () => {
  if (navigator.permissions) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then(function (result) {
        if (result.state === 'granted') {
          return navigator.geolocation.getCurrentPosition(
            success,
            error,
            optionsGeo
          );
        } else if (result.state === 'prompt') {
          // Ще не підтвердили
        } else {
          Notiflix.Notify.warning('Доступ до геоданих заборонений');
        }
        getSaveLocalityForSettings();
        getSaveLocalityForBaseFetch();
        addRejectLight();
      });
  } else {
    Notiflix.Notify.warning(
      'На жаль браузер не підтримує відстеження геоданих'
    );
    getSaveLocalityForBaseFetch();
    addRejectLight();
  }
};

const detectBtn = btn => {
  if (btn.includes('search')) {
    refs.sidebar.classList.remove('open');
    addActiveClass(0);
    refs.searchList.addEventListener(
      'click',
      onClickItemCityFetchWeatherDataHandler
    );
    refs.modalform.addEventListener('submit', onSubmitFormHandler);
  } else if (btn.includes('location')) {
    navigator.geolocation.getCurrentPosition(success, error, optionsGeo);
  } else if (btn.includes('settings')) {
    addActiveClass(1);
    refs.sidebar.classList.remove('open');
    refs.themes.addEventListener('click', onClickBtnSwichThemeHandler);
  } else if (btn.includes('notify')) {
    weatherNotify();
  } else if (btn.includes('arrow')) {
    refs.sidebar.classList.toggle('open');
    refs.backdrop.addEventListener('click', onClickCloseBackdropHandler);
  }
  refs.showAllBtn.addEventListener('click', onClickShowAllCitiesHandler);
};

/**
  |============================
  | Handlers
  |============================
*/

const onClickBtnSidebarHandler = evt => {
  if (!evt.target.closest('.side-btn')) return;
  const targetBtnData = Object.keys(evt.target.closest('.side-btn').dataset);
  const current = new CurrentBtn('current-btn');
  if (
    targetBtnData.join('') === Object.keys(current.btn.dataset).join('') &&
    !targetBtnData.includes('arrow')
  )
    return;
  removeAllListeners();
  removeActiveClass();
  appointCurrentBtn(evt, 'current-btn', 'side-btn');
  detectBtn(targetBtnData);
};

const inputCityHandler = async evt => {
  const val = evt.target.value.toLowerCase().trim();
  if (!val) return;
  refs.searchList.innerHTML = '';

  const locality = await makeCitiesByInpuValue(val);
  if (locality) refs.searchList.innerHTML = locality.map(renderSearch).join('');
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
  const themeBtn = evt.target.closest('.theme-btn');
  if (!themeBtn) return;
  appointCurrentBtn(evt, 'current-theme', 'theme-btn');
  removeTheme();
  if (themeBtn.name === 'btn-white') return;
  if (themeBtn.name === 'btn-dark') {
    setTheme('dark');
  }
  if (themeBtn.name === 'btn-paleblue') {
    setTheme('paleblue');
  }
};

const onClickBtnSeeFetchCityWeatherHandler = async ({ target }) => {
  makeCityWeather(target);
};

const onClickBtnOpenChartHandler = evt => {
  if (evt.target.name === 'detail') {
    evt.currentTarget.classList.add('hidden');
    getWeatherChart(JSON.parse(localStorage.getItem('locality')));
    return;
  }
};

const onClickCloseChartHandler = () => {
  refs.daysList.classList.remove('hidden');
  refs.chart.removeEventListener('click', onClickCloseChartHandler);
  if (myChart) myChart.destroy();
};

const onClickShowAllCitiesHandler = () => {
  refs.moreCities.classList.add('active');
  refs.showAllBtn.removeEventListener('click', onClickShowAllCitiesHandler);
  refs.moreCities.addEventListener('click', onClickMoreCitiesWrapperHandler);
};

const onClickMoreCitiesWrapperHandler = ({ target }) => {
  if (target.closest('.close-more-btn')) {
    refs.moreCities.classList.remove('active');
    refs.moreCities.removeEventListener(
      'click',
      onClickMoreCitiesWrapperHandler
    );
    refs.showAllBtn.addEventListener('click', onClickShowAllCitiesHandler);
  }

  if (target.closest('.btn-see')) {
    makeCityWeather(target);
  }
};

const onClickBtnSelectDaysHandler = ({ target }) => {
  if (target.tagName !== 'BUTTON') return;
  else {
    const prevCurrent = new CurrentBtn('btn-select.current');
    prevCurrent.btn.classList.remove('current');
    target.classList.add('current');
    activeContent(target.name);
  }
};

const onClickCloseBackdropHandler = evt => {
  if (evt.currentTarget === evt.target) {
    removeActiveClass();
    refs.backdrop.removeEventListener('click', onClickCloseBackdropHandler);
  }
};

// Utils

const smoothScroll = event => {
  document.documentElement.scrollIntoView({
    behavior: 'smooth',
  });
};

const weatherNotify = async () => {
  try {
    const local = JSON.parse(localStorage.getItem('locality'));
    const res = await getWeather(local.lat, local.lon);

    let title = `Погода ${local.city}`;
    const options = {
      body: `Завтра очікується ${makeCorrectWeather(
        res.data.daily.weathercode
      )} з температурою близько ${Math.round(
        res.data.daily.temperature_2m_max[1]
      )}°C.`,
      icon: logo,
    };
    sendNotification(title, options);
  } catch (error) {
    console.log(error);
  }
};

const sendNotification = (title, options) => {
  if (!('Notification' in window)) {
    Notiflix.Notify.failure('Сповіщення не підтримуються в цьому браузері');
    return;
  }
  if (Notification.permission === 'granted') {
    setInterval(() => {
      const notification = new Notification(title, options);
    }, 6 * 60 * 60 * 1000);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function (permission) {
      if (permission === 'granted') {
        setInterval(() => {
          const notification = new Notification(title, options);
        }, 6 * 60 * 60 * 1000);
      }
    });
  }
};

const parseDayTimeChart = daytime => {
  const date = new Date(daytime);

  const options = {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  return date.toLocaleString('uk-UA', options);
};

const addRejectLight = () => {
  const current = new CurrentBtn('current-btn');
  const data = Object.keys(current.btn.dataset).join('');
  if (data === 'location')
    document.querySelector('.current-btn').classList.add('reject');
};

const translateTxt = async txt => {
  const baseTxt = txt;
  try {
    const res = await translate('en', 'uk', txt);
    return res.data[0][0][0];
  } catch (error) {
    return baseTxt;
  }
};

const setThemeOnBody = theme => {
  document.body.classList.add(theme);
};

const appointCurrentBtn = (evt, prevEl, currentEl) => {
  if (document.querySelector(`.${prevEl}`)) {
    document.querySelector(`.${prevEl}`).classList.remove(prevEl);
    evt.target.closest(`.${currentEl}`).classList.add(prevEl);
  }
};

// Calc Foo

const setMapTitleVal = async el => {
  const place = await translateTxt(
    el.textContent.split(',').slice(0, 1).join('')
  );

  refs.mapTitle.textContent = place;
};

// Cleaners

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
  removeThemeInStorage();
  document.body.classList.remove('dark');
  document.body.classList.remove('paleblue');
};

const removeActiveClass = () => {
  refs.body.classList.remove('is-hidden');
  const activeClassEls = document.querySelectorAll('.active');
  if (activeClassEls.length) {
    activeClassEls.forEach(el => el.classList.remove('active'));
  }
};

const removeThemeInStorage = () => {
  localStorage.removeItem('settings');
};

const removeAllListeners = () => {
  refs.searchList.removeEventListener(
    'click',
    onClickItemCityFetchWeatherDataHandler
  );
  refs.modalform.removeEventListener('submit', onSubmitFormHandler);
  refs.themes.removeEventListener('click', onClickBtnSwichThemeHandler);
  onClickCloseChartHandler();
};

const removeSaveLocalitySetting = () => {
  [...refs.geoLang.firstElementChild.children].forEach(el => {
    if (el.dataset.place) {
      el.remove();
    }
  });
  [...refs.geoLang.lastElementChild.children].forEach(el => {
    if (el.dataset.place) {
      el.remove();
    }
  });
};

const clearMoreCitiesList = () => {
  const scrollContent = refs.moreCities.querySelector('.scroll-content');
  [...scrollContent.children].forEach(removeElItem);
};

const removeElItem = el => {
  if (el.tagName === 'LI') el.remove();
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
  ) {
    switchColor(5000);
  }
  clearCitiesList();
  clearMoreCitiesList();
  const pos = [position.coords.latitude, position.coords.longitude];
  const res = await getNearestCities(...pos, APIkey);
  refs.mapTitle.textContent = await translateTxt(res.data.list[0].name);
  fetchPromises(...pos);
  removeSaveLocalitySetting();
  await setSaveLocality(...pos);
  getSaveLocalityForSettings();
  refs.daysList.addEventListener('click', onClickBtnOpenChartHandler);
};

const error = error => {
  addRejectLight();
  removeSaveLocalitySetting();
  getSaveLocalityForSettings();
  getSaveLocalityForBaseFetch();
  Notiflix.Notify.failure('Не вдалось отримати геодані');
  console.log(error);
};

// Start Page

checkHasSavedTheme();
checkGeolocation();

// Listeners

refs.sidebar.addEventListener('click', onClickBtnSidebarHandler);

refs.modalform.addEventListener('input', _.debounce(inputCityHandler, 500));

refs.showAllBtn.addEventListener('click', onClickShowAllCitiesHandler);

refs.selecterBox.addEventListener('click', onClickBtnSelectDaysHandler);

window.addEventListener('scroll', smoothScroll);
