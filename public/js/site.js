// Kleine Helfer für die Webseite: Handy-Menü und Projekt-Filter (funktioniert auch ohne JavaScript über Links)
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('hauptmenu');
  if (burger && nav) {
    const set = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? burger.dataset.close : burger.dataset.open);
      nav.classList.toggle('open', open);
    };
    burger.addEventListener('click', () => set(burger.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  const chips = document.querySelectorAll('.filters .chip');
  chips.forEach((chip) =>
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle('on', on);
        if (on) c.setAttribute('aria-current', 'true');
        else c.removeAttribute('aria-current');
      });
      document.querySelectorAll('.project-grid .project-card').forEach((card) => { card.hidden = !!cat && card.dataset.cat !== cat; });
      history.replaceState(null, '', cat ? '?bereich=' + encodeURIComponent(cat) : location.pathname);
    })
  );
});
