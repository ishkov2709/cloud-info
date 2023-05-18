import axios from 'axios';

const getDetailTemp = (lat, lon) => {
  return axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`
  );
};

export default getDetailTemp;
