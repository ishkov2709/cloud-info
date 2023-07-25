import {
  abbreviatedDaysOfWeek,
  animatedStatsMark,
  getCurrentTime,
  getHumidity,
  getTime,
  optimiseLocalityName,
} from '../utils/utils';
import makeIconWeather from '../makeIconWeather';
import { refs } from '../..';
import descriptionWeather from '../descriptionWeather';

export let todayCodeWeather;
export let tomorrowCodeWeather;

export const daysOfWeek = [
  'Неділя',
  'Понеділок',
  'Вівторок',
  'Середа',
  'Четвер',
  `П\'ятниця`,
  'Субота',
];

export const renderCurrentDay = res => {
  const { temperature, weathercode, windspeed, winddirection } =
    res.data.current_weather;
  todayCodeWeather = weathercode;
  refs.daysList.firstElementChild.innerHTML = `
           <div class="day-time-wrapper">
                <h2 class="day">${daysOfWeek[0]}</h2>
                  <time class="day-time" datetime="${getCurrentTime()}">${getCurrentTime()}</time>
                </div>
                <div class="first-day-content">
                  <div class="temperature-wrapper">
                  <p class="temperature js-current-temp">${Math.round(
                    temperature
                  )}</p>
                  <svg class="icon-weather" width="117" height="95">
                    <use href="./assets/icons.svg#${makeIconWeather(
                      weathercode
                    )}"></use>
                  </svg>
                </div>
                <ul class="weather-info-list">
                  <li class="weather-info-item">
                    Швидкість вітру
                    <span class="weather-val">${windspeed}</span>
                    <span class="unit">м&sol;с</span>
                  </li>
                  <li class="weather-info-item">
                    Напрям вітру <span class="weather-val">${winddirection}</span>
                    <span class="unit">&deg;</span>
                  </li>
                  <li class="weather-info-item">
                    Вологість <span class="weather-val">${getHumidity(
                      res
                    )}</span>
                    <span class="unit">&percnt;</span>
                  </li>
                </ul>
                <button class="btn-more" type="button" name="detail">Детальніше</button>
            </div>`;
};

export const renderDaysForecast = res => {
  [...refs.daysList.children].forEach((el, i) => {
    if (i > 0) {
      el.innerHTML = `<h2 class="day">${abbreviatedDaysOfWeek(
        daysOfWeek[i]
      )}</h2>
          <svg class="icon-weather" width="64" height="64">
            <use href="./assets/icons.svg#${makeIconWeather(
              res.data.daily.weathercode[i]
            )}"></use>
          </svg>
          <p class="temperature">${Math.round(
            res.data.daily.temperature_2m_max[i]
          )}</p>`;
    }
    if (i === 1) {
      tomorrowCodeWeather = res.data.daily.weathercode[i];
    }
  });
};

export const renderItemCity = (lat, lon, city, weathercode, temp) => {
  return `<li class="cities-item" data-city="${city}" data-lat="${lat}" data-lon="${lon}">
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

export const renderSearch = ({ lat, lon, display_name }) => {
  return `<li class="search-item" data-lat="${lat}" data-lng="${lon}">${optimiseLocalityName(
    display_name
  )}</li>`;
};

export const renderStatistic = res => {
  [...refs.statsList.children].forEach((el, i) => {
    el.innerHTML = `<p class="stats-day">${abbreviatedDaysOfWeek(
      daysOfWeek[i]
    )}</p>
          <span class="mark js-mark"></span>`;
    animatedStatsMark(res.data.daily.precipitation_probability_mean, i);
  });
};

export const renderGeoLang = placeName => {
  return `<h3 class="set-title title" data-place="${placeName}">${placeName}</h3>`;
};

export const renderDetailWeather = (data, weathercode, day) => {
  let gustMerkup = `<li class="indic-item">
          Порив
          <span class="indic-val">${data.wind.gust}</span>
          <span class="unit">м&sol;с</span>
        </li>`;

  let timeSet = `<time class="day-time" datetime="${getCurrentTime()}">
        ${getCurrentTime()}
      </time>
      <div class="sunrise-sunset-box">
      <p class="sunrise">
        Cхід
        <time class="sun-val" datetime="${getTime(data.sys.sunrise)}">
          ${getTime(data.sys.sunrise)}
        </time>
      </p>
      <p class="sunset">
        Захід
        <time class="sun-val" datetime="${getTime(data.sys.sunset)}">
          ${getTime(data.sys.sunset)}
        </time>
      </p>
      </div>`;
  if (!data.wind.gust) {
    gustMerkup = '';
  }
  if (!data.sys.sunrise || !data.sys.sunrise) {
    timeSet = '';
  }
  return `
    <div class="base-day-info">
      <h2 class="weekday">${day}</h2>
      ${timeSet}
    </div>
    <div class="detail-weather">
      <div class="temperature-wrapper">
        <p class="temperature js-current-temp">${Math.round(data.main.temp)}</p>
        <svg class="icon-weather" width="116" height="116">
          <use href="./assets/icons.svg#${makeIconWeather(weathercode)}"></use>
        </svg>
      </div>
      <ul class="indic-list">
        <li class="indic-item">
          Відчувається
          <span class="indic-val">${Math.round(data.main.feels_like)}</span>
          <span class="unit">&deg;</span>
        </li>
        <li class="indic-item">
          Тиск
          <span class="indic-val">${data.main.pressure}</span>
          <span class="unit">мм рт. ст.</span>
        </li>
        <li class="indic-item">
          Вологість
          <span class="indic-val">${data.main.humidity}</span>
          <span class="unit">&percnt;</span>
        </li>
        <li class="indic-item">
          Швидкість вітру
          <span class="indic-val">${data.wind.speed}</span>
          <span class="unit">м&sol;с</span>
        </li>
        ${gustMerkup}
        <li class="indic-item">
          Напрям вітру
          <span class="indic-val">${data.wind.deg}</span>
          <span class="unit">&deg;</span>
        </li>
      </ul>
    </div>`;
};
