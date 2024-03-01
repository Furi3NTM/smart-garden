// Fonction pour mettre à jour l'état de la lumière
function updateLightState(isOn) {
    var lightBulb = document.getElementById('light-bulb');
    var bulb = lightBulb.getElementById('bulb'); // Remplacez 'bulb' par l'ID de l'élément correspondant à l'ampoule dans votre SVG
    if (isOn) {
        bulb.style.fill = '#4cbb17'; // Vert
    } else {
        bulb.style.fill = '#9e9e9e'; // Gris
    }
}

// Exemple d'utilisation
updateLightState(true); // Allumer la lumière
