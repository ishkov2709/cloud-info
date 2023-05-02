const dashedline = quantity => {
  const dashedlLine = document.createElement('ul');
  dashedlLine.classList.add('js-dashed-line');
  dashedlLine.style.display = 'inline-flex';
  dashedlLine.style.gap = '4px';
  dashedlLine.style.marginLeft = 'auto';

  for (let i = 0; i < quantity; i += 1) {
    const dashedItem = document.createElement('li');
    dashedItem.classList.add('js-dashed-item');
    dashedItem.style.display = 'inline-block';
    dashedItem.style.width = '12px';
    dashedItem.style.height = '5px';
    dashedItem.style.backgroundColor = '#878787';
    dashedItem.style.borderRadius = '20px';
    dashedlLine.append(dashedItem);
  }
  return dashedlLine;
};

export default dashedline;
