let playerState = 'idle'
const dropDown = document.getElementById('animations')
dropDown.addEventListener('change', function(e){
    playerState = e.target.value
})
const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d');
console.log(ctx)

const CANVAS_WIDTH = canvas.width = 600
const CANVAS_HEIGHT = canvas.height = 600

const playerImage = new Image()
playerImage.src = './sprites/shadow_dog.png'
const spriteWidth = 575
const spriteHeight = 523


let gameFrame = 0 
const staggerFrames = 5 
const spriteAnimations = []
const animationStates = [
    {
        name: 'idle',
        frames: 7
    },
    {
        name: 'jump',
        frames: 7
    },
    {
        name: 'fall',
        frames: 7
    },
    {
        name: 'run',
        frames: 9
    },
    {
        name: 'dizzy',
        frames: 10
    },
    {
        name: 'sit',
        frames: 5
    },
    {
        name: 'roll',
        frames: 7
    },
    {
        name: 'bite',
        frames: 7
    },
    {
        name: 'ko',
        frames: 12
    },
    {
        name: 'getHit',
        frames: 4
    },
]
animationStates.forEach((state, index) => {
    let frames = {
        loc: [],
    }

    for (let j = 0; j < state.frames ; j++){
    let postionX = j * spriteWidth
    let postionY = index * spriteHeight
    frames.loc.push({x: postionX, y: postionY})
    }
    spriteAnimations[state.name] = frames
})

function animate(){
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    let postion = Math.floor(gameFrame/staggerFrames) % spriteAnimations[playerState].loc.length

    let frameX = spriteWidth * postion
    let frameY = spriteAnimations[playerState].loc[postion].y
    ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight)



    gameFrame++
    requestAnimationFrame(animate)
}

animate()
