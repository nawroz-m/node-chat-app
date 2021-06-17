const socket = io()// connect to the server && socket going to allows us to send an event and recive and event from both server and the client

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $SendLocationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')




//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//Auto Scroll function
const autoScroll = ()=> {
    //New Message Element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeigt = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have i Scrolled
    const scrollOffset = $messages.scrollTop + visibleHeigt

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight 
    }


}


socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    //add the html to the document
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('shareLocation', (message)=> {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    //Add the above html into the document
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    //disable submit button
    $messageFormButton.setAttribute('disabled', 'disabled')

    // const message = document.querySelector('input').value
    const message = e.target.elements.message.value // target is represent what we are listening for on in this case it's message-form
    socket.emit('sendMessage', message, (error)=>{

        //renable submit button back
        $messageFormButton.removeAttribute('disabled')

        // Clear the input after it's send
        $messageFormInput.value = ""

        //Make focuse back to the input
        $messageFormInput.focus()
        

        if(error){
            return alert(error)
        }
        console.log("The message has deleverd! ")
    })
})

$SendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not suported by your browser!!')
    }

    // Disable location button untill the location has not shared
    $SendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{

        console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longtitude: position.coords.longitude

        }, ()=>{
            // Enible location button back
            $SendLocationButton.removeAttribute('disabled')
            console.log("Location Shared!")
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href= '/'
    }
})