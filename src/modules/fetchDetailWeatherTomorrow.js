import axios from 'axios';

const getDetailWeatherTomorrow = (lat, lon, APIkey) => {
  return axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=15&appid=${APIkey}&units=metric`
  );
};

export default getDetailWeatherTomorrow;
