const form = document.querySelector('form')

form.addEventListener('submit', e => {
    e.preventDefault()
    
    const input = form[0]

    //creo un FormData vacío
    let data = new FormData()
    
    //Cargo la información del archivo en ese formdata en forma manual
    data.append('archivo', input.files[0])

    //Envío el FormData al servidor
    enviarFormDataAjax('/upload',data, url => {
        //console.log(url)
        //input.value = ''

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', url.replace('/conv/',''));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        location.href = '/clear?file=' + url
    })
})

/* ----------------------------------------------------------- */
/*    Envío de información al servidor contenida en FormData   */
/* ----------------------------------------------------------- */
function enviarFormDataAjax(url, data, cb) {
    const xhr = new XMLHttpRequest()
    xhr.open('post',url)
    xhr.addEventListener('load', () => {
        if(xhr.status == 200) {
            //console.log(xhr.response)
            const { url } = JSON.parse(xhr.response)
            cb(url)
        }
        else {
            console.error('Error el enviar los datos', xhr.status)
        }
    })
    xhr.addEventListener('error', e => {
        console.error('Error en la comunicación ajax', e)
    })
    xhr.send(data)
}
