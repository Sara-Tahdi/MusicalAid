document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('.sidebar-link');
    const strips = document.querySelectorAll('.strip');
  
    links.forEach(link => {
      link.addEventListener('mouseover', function () {
        const targetId = this.getAttribute('data-target');
        strips.forEach(strip => {
          strip.style.display = strip.id === targetId ? 'flex' : 'none'; // Updated to 'flex'
        });
      });
    });
  });
  
  function moveStrips(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const strips = document.querySelector('.strips');
  
    strips.style.width = mouseX - 250 + 'px'; // Adjust the value based on your layout
  }
         