import axios from 'axios';

const getNearestCities = (lat, lon, APIkey) => {
  return axios.get(
    `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&appid=${APIkey}`
  );
};

export default getNearestCities;
