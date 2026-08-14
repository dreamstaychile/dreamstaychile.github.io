document.getElementById("leadForm").addEventListener("submit",function(e){
 e.preventDefault();
 const name=document.getElementById("name").value.trim();
 const location=document.getElementById("location").value.trim();
 const text=encodeURIComponent(`Hola Dream Stay Chile. Soy ${name}. Quiero evaluar una propiedad ubicada en ${location} para administración de renta corta.`);
 // REEMPLAZAR por el WhatsApp comercial real, sin + ni espacios.
 const whatsapp="56929542998";
 window.open(`https://wa.me/${whatsapp}?text=${text}`,"_blank","noopener");
});