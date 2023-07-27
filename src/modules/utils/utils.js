import { date } from '../..';

export const getCurrentTime = () => {
  return `${date.getHours().toString(10).padStart(2, '0')}:${date
    .getMinutes()
    .toString(10)
    .padStart(2, '0')}`;
};

export const getHumidity = res => {
  return Math.round(
    res.data.hourly.relativehumidity_2m
      .splice(0, 23)
      .reduce((acc, el) => acc + el, 0) / 24
  );
};

export const abbreviatedDaysOfWeek = val => {
  if (val === 'Неділя') return 'Нд';
  if (val === 'Понеділок') return 'Пн';
  if (val === 'Вівторок') return 'Вт';
  if (val === 'Середа') return 'Ср';
  if (val === 'Четвер') return 'Чт';
  if (val === "П'ятниця") return 'Пт';
  if (val === 'Субота') return 'Сб';
};

export const optimiseLocalityName = localityName => {
  return localityName
    .split(',')
    .filter(el => !isNumeric(el.trim()))
    .join(',');
};

export const animatedStatsMark = (value, i) => {
  const marksArr = document.querySelectorAll('.js-mark');
  setTimeout(() => {
    marksArr[i].style.height = `${value[i]}0%`;
  }, 1000);
};

export const getTime = time => {
  const hours = new Date(time * 1000).getHours().toString(10).padStart(2, '0');
  const minutes = new Date(time * 1000)
    .getMinutes()
    .toString(10)
    .padStart(2, '0');
  return `${hours}:${minutes}`;
};

const isNumeric = n => n.split('').some(el => Number(el));
