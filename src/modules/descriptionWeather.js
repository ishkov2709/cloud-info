const descriptionWeather = weathercode => {
  if (weathercode === 0) return 'Ясно';
  if (weathercode >= 1 && weathercode <= 3) return 'Хмарно';
  if (weathercode >= 45 && weathercode <= 48) return 'Туман';
  if (weathercode >= 51 && weathercode <= 55) return 'Невеликий дощ';
  if (weathercode === 56 || weathercode === 57) return 'Крижаний дощ';
  if (weathercode >= 61 && weathercode <= 65) return 'Дощ';
  if (weathercode === 66 || weathercode === 67) return 'Сильний крижаний дощ';
  if (weathercode >= 71 && weathercode <= 75) return 'Невеликий сніг';
  if (weathercode === 77) return 'Сильний сніг';
  if (weathercode >= 80 && weathercode <= 82) return 'Сильний дощ';
  if (weathercode === 85 || weathercode === 86) return 'Сніг';
  if (weathercode >= 95 && weathercode <= 99) return 'Гроза';
  return;
};

export default descriptionWeather;
