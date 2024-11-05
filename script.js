window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1400;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;
    const fullScreenButton = document.getElementById('fullScreenButton')

    /**
     * Handles user input for controlling the player.
     * @class
     */
    class InputHandler {
        constructor() {
            this.keys = [];
            this.touchY = '';
            this.touchThreshold = 30;

            window.addEventListener('keydown', (e) => {
                if (
                    (e.key === 'ArrowUp' ||
                        e.key === 'ArrowDown' ||
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight') &&
                    this.keys.indexOf(e.key) === -1
                ) {
                    this.keys.push(e.key);
                } else if (e.key === 'Enter' && gameOver) restartGame();
            });
            window.addEventListener('keyup', (e) => {
                if (
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'
                ) {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });

            // Touch event listeners
            window.addEventListener('touchstart', (e) => {
                this.touchY = e.changedTouches[0].pageY;
            });

            window.addEventListener('touchmove', (e) => {
                const swipeDistance = e.changedTouches[0].pageY - this.touchY;
                if (
                    swipeDistance < -this.touchThreshold &&
                    this.keys.indexOf('swipe up') === -1
                )
                    this.keys.push('swipe up');
                else if (
                    swipeDistance > this.touchThreshold &&
                    this.keys.indexOf('swipe down') === -1
                ) {
                    this.keys.push('swipe down');
                    if (gameOver) restartGame();
                }
            });

            window.addEventListener('touchend', (e) => {
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1);
            });
        }
    }

    /**
     * Represents the player character in the game.
     * @class
     */
    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 8;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
        }
        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 8;
            this.frameY = 0;
        }
        /**
         * Draws the player character on the canvas.
         * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
         */
        draw(context) {
            context.drawImage(
                this.image,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height,
            );
        }

        /**
         * Updates the player's position and handles animations.
         * @param {InputHandler} input - The input handler instance for capturing user input.
         * @param {number} deltaTime - The time difference between frames.
         * @param {Array<Enemy>} enemies - The list of enemies in the game.
         */
        update(input, deltaTime, enemies) {
            // Collision detection
            enemies.forEach((enemy) => {
                const dx =
                    enemy.x + enemy.width / 2 - (this.x + this.width / 2);
                const dy =
                    enemy.y + enemy.width / 2 - (this.y + this.width / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.width / 2 + this.width / 2) {
                    gameOver = true;
                }
            });
            // Sprite Animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            // controls
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if ((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipe up') > -1) && this.onGround()) {
                this.vy -= 32;
            } else {
                this.speed = 0;
            }
            // Horizontal movement
            this.x += this.speed;
            if (this.x < 0) {
                this.x = 0;
            } else if (this.x > this.gameWidth - this.width) {
                this.x = this.gameWidth - this.width;
            }
            // Vertical movement
            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.y = this.gameHeight - this.height;
                this.maxFrame = 8;
                this.frameY = 0;
            }
        }

        /**
         * Checks if the player is on the ground.
         * @returns {boolean} True if the player is on the ground, false otherwise.
         */
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    /**
     * Represents the scrolling background in the game.
     * @class
     */
    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 7;
        }

        /**
         * Draws the background on the canvas.
         * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
         */
        draw(context) {
            context.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height,
            );
            context.drawImage(
                this.image,
                this.x + this.width - this.speed,
                this.y,
                this.width,
                this.height,
            );
        }

        /**
         * Updates the background's position to create a scrolling effect.
         */
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
        restart() {
            this.x = 0;
        }
    }

    /**
     * Represents an enemy character in the game.
     * @class
     */
    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedForDeletion = false;
        }

        /**
         * Draws the enemy character on the canvas.
         * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
         */
        draw(context) {
            context.drawImage(
                this.image,
                this.frameX * this.width,
                0,
                this.width,
                this.height,
                this.x,
                this.y,
                this.width,
                this.height,
            );
        }

        /**
         * Updates the enemy's position and handles animations.
         * @param {number} deltaTime - The time difference between frames.
         */
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }
    }

    /**
     * Handles the creation and updating of enemies in the game.
     * @param {number} deltaTime - The time difference between frames.
     */
    function handleEnemys(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            randomEnemyInterval = Math.random() * 1900 + 100;
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach((enemy) => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
        enemies = enemies.filter((enemy) => !enemy.markedForDeletion);
    }

    /**
     * Displays the score and game-over text on the canvas.
     * @param {CanvasRenderingContext2D} context - The drawing context for the canvas.
     */
    function displayStatusText(context) {
        context.textAlign = 'left';
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score:' + score, 20, 50);
        context.font = '40px Helvetica';
        context.fillStyle = 'white';
        context.fillText('Score:' + score, 22, 52);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText(
                'GAME OVER! Press Enter or swipe down to restart!',
                canvas.width / 2,
                200,
            );
            context.textAlign = 'center';
            context.fillStyle = 'white';
            context.fillText(
                'GAME OVER! Press Enter or swipe down to restart!',
                canvas.width / 2 + 2,
                202,
            );
        }
    }

    function restartGame() {
        player.restart();
        background.restart();
        enemies = [];
        score = 0;
        gameOver = false;
        animate(0);
    }

    function toggleFullScreen(){
        if(!document.fullscreenElement){
            canvas.requestFullscreen().catch(err => {
                alert(`Error, can't enable full-screen mode: ${err.message}`)
            })
        }else{
            document.exitFullscreen()
        }
    }

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 2000;
    let randomEnemyInterval = Math.random() * 1000 + 500;

    /**
     * The main animation loop for the game.
     * @param {number} timeStamp - The current time of the animation frame.
     */
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        displayStatusText(ctx);
        handleEnemys(deltaTime);
        if (!gameOver) requestAnimationFrame(animate);
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    animate(0);

    // Commented Out Code for Future Use
    // Drawing the player hitbox and visual guides:
    // These lines draw a stroke around the player and an arc to visualize the hitbox.
    // Put this code inside the Player's draw() method if you need it for debugging purposes.
    // context.strokeStyle = 'white';
    // context.strokeRect(this.x, this.y, this.width, this.height);
    // context.beginPath();
    // context.arc(
    //     this.x + this.width / 2,
    //     this.y + this.height / 2,
    //     this.width / 2,
    //     0,
    //     Math.PI * 2,
    // );
    // context.stroke();

    // Drawing the enemy hitbox and visual guides:
    // These lines draw a stroke around the enemy and an arc to visualize the hitbox.
    // Put this code inside the Enemy's draw() method if you need it for debugging purposes.
    // context.strokeStyle = 'white';
    // context.strokeRect(this.x, this.y, this.width, this.height);
    // context.beginPath();
    // context.arc(
    //     this.x + this.width / 2,
    //     this.y + this.height / 2,
    //     this.width / 2,
    //     0,
    //     Math.PI * 2,
    // );
    // context.stroke();
});
