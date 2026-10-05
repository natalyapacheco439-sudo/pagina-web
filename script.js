// Menú para celulares
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});

nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Año actual en el pie de página
document.getElementById("year").textContent = new Date().getFullYear();

// Aparición suave de las secciones al hacer scroll
const revealables = document.querySelectorAll(".section__head, .card, .quote, .split > *, .gallery__item");
revealables.forEach((el) => el.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }),
  { threshold: 0.15 }
);
revealables.forEach((el) => observer.observe(el));

// Formulario: abre el correo del visitante con el mensaje ya escrito
const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");
const EMAIL_DESTINO = "hola@amarahome.com";

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const asunto = encodeURIComponent(`Mensaje de ${data.get("nombre")}`);
  const cuerpo = encodeURIComponent(`${data.get("mensaje")}\n\nResponder a: ${data.get("correo")}`);
  window.location.href = `mailto:${EMAIL_DESTINO}?subject=${asunto}&body=${cuerpo}`;
  note.textContent = "¡Gracias! Se abrirá tu aplicación de correo para enviar el mensaje.";
  form.reset();
});
