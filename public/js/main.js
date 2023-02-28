const form = document.querySelector('form')

const progressUpload = document.querySelectorAll('progress')[0]
const progressDownload = document.querySelectorAll('progress')[1]

const infoUpload = document.querySelectorAll('span')[0]
const infoDownload = document.querySelectorAll('span')[1]

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
        let porcentaje = 0
        progressDownload.value = porcentaje
        infoDownload.innerText = porcentaje + '%'

        const xhr = new XMLHttpRequest()
        xhr.open('get', url)
        xhr.responseType = 'blob'
        xhr.addEventListener('load', () => {
            if(xhr.status == 200) {
                const imgBlob = xhr.response
                let imgUrl = URL.createObjectURL(imgBlob)

                const link = document.createElement('a');
                link.href = imgUrl;
                link.setAttribute('download', url.replace('/conv/',''));
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
        
                setTimeout(() => {
                    location.href = '/clear?file=' + url
                },1500)
            }
        })
        xhr.addEventListener('error', e => {
            console.error('Error en la comunicación download ajax', e)
        })
        xhr.addEventListener('progress', e => {
            if(e.lengthComputable) {
                porcentaje = parseInt((e.loaded * 100) / e.total)
                console.warn(porcentaje + '%')
    
                progressDownload.value = porcentaje
                infoDownload.innerText = porcentaje + '%'
            }
        })
        xhr.send()
    })
})

/* ----------------------------------------------------------- */
/*    Envío de información al servidor contenida en FormData   */
/* ----------------------------------------------------------- */
function enviarFormDataAjax(url, data, cb) {
    let porcentaje = 0
    progressUpload.value = porcentaje
    infoUpload.innerText = porcentaje + '%'

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
        console.error('Error en la comunicación upload ajax', e)
    })
    xhr.upload.addEventListener('progress', e => {
        if(e.lengthComputable) {
            porcentaje = parseInt((e.loaded * 100) / e.total)
            console.warn(porcentaje + '%')

            progressUpload.value = porcentaje
            infoUpload.innerText = porcentaje + '%'
            //progress.value = porcentaje
            //span.innerText = porcentaje + '%'
        }
    })
    xhr.send(data)
}
