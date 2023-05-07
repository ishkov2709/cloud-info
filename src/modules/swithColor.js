const switchColor = time => {
  document.querySelector('.currentBtn').classList.add('animated');
  setTimeout(() => {
    document.querySelector('.currentBtn').classList.remove('animated');
  }, time);
};

export default switchColor;
