
console.log('Loading renderer.js')

var fileDropElement = document.getElementById('drag-file');

console.log('Adding event listener');
fileDropElement.addEventListener('drop', (e) => {
    e.preventDefault();

    for (let f of e.dataTransfer.files) {
        console.log('Files you dragged here: ', f.path)
    }
})