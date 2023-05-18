import axios from 'axios';

const getDetailWeather = (lat, lon, APIkey) => {
  return axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric`
  );
};

export default getDetailWeather;
