import axios from 'axios';

const getWeather = async (lat, lng) => {
  return await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max&daily=weathercode&daily=precipitation_probability_mean&daily=precipitation_probability_mean&timezone=GMT&forecast_days=5&current_weather=true&hourly=relativehumidity_2m`
  );
};

export default getWeather;
