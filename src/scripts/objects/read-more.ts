
document.querySelectorAll('[data-read-more-container]')
.forEach(readMoreContainer => {

  const toggleButtons = readMoreContainer.querySelectorAll('[data-read-more-toggle]');

  toggleButtons.forEach(button => {
    button.addEventListener('click', toggleExpandText);
  })

  let contentExpanded = false;

  function toggleExpandText(){
    const CLASS_IS_EXPANDED = 'is-expanded';
    contentExpanded = !contentExpanded;
    contentExpanded ? 
      readMoreContainer.classList.add(CLASS_IS_EXPANDED) :
      readMoreContainer.classList.remove(CLASS_IS_EXPANDED);
  }
});


