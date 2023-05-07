const makeIconWeather = weathercode => {
  if (weathercode === 0) return 'clear_day';
  if (weathercode >= 1 && weathercode <= 3) return 'mostly_clear_day';
  if (weathercode >= 45 && weathercode <= 48) return 'fog';
  if (weathercode >= 51 && weathercode <= 55) return 'rain_light';
  if (weathercode === 56 || weathercode === 57) return 'freezing_rain';
  if (weathercode >= 61 && weathercode <= 65) return 'rain';
  if (weathercode === 66 || weathercode === 67) return 'freezing_rain_heavy';
  if (weathercode >= 71 && weathercode <= 75) return 'snow_light';
  if (weathercode === 77) return 'snow_heavy';
  if (weathercode >= 80 && weathercode <= 82) return 'rain_heavy';
  if (weathercode === 85 || weathercode === 86) return 'snow';
  if (weathercode >= 95 && weathercode <= 99) return 'tstorm';
  return;
};

export default makeIconWeather;
