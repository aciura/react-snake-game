let GAME_UPDATE_SPEED_IN_MS = 200;
const MAX_SCREEN_WIDTH = 400;
const MAX_SCREEN_HEIGHT = 400;
const DEBUG = false;

const Buttons = (props) => {
    return (
        <div>
            <i style={{ 'font-size': '0.67em' }}>Use Arrow keys to move the snake</i>
            <div>
                <button style={{position:'absolute', top: MAX_SCREEN_HEIGHT+10}} id='pause-btn' onClick={props.pauseGame}>Pause</button>
            </div>
        </div>
    )
}

const Bounty = (props) => {
    const { x, y } = props.position
    return (
        <div>
            <i className="fas fa-dove"
                style={{ position: 'absolute', left: x, top: y }} >
                {DEBUG ? <small>({x},{y})</small> : ''}
            </i>
        </div>
    )
}

class Snake extends React.Component {
    render() {
        const { x, y } = this.props.position
        return (
            <div>
                <i id='snake-head' className="fas fa-bug"
                    style={{ position: 'absolute', left: x, top: y }}>
                    {DEBUG ? <small>({x},{y})</small> : ''}
                </i>
                {this.props.history.map(h => (
                    <i className="snake-body fas fa-star"
                        style={{ position: 'absolute', left: h.x, top: h.y }}>
                    </i>
                ))}
            </div>
        )
    }
}

const isNear = (point1, point2, maxDistance) => {
    const xDiff = +point2.x - +point1.x;
    const yDiff = +point2.y - +point1.y;
    const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);    
    //console.log(dist)
    
    if (dist < maxDistance) return true;
    return false;
}

const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
}


class Game extends React.Component {

    constructor() {
        super();

        this.state = {
            snake: { x: 150, y: 103 },
            snakeSpeed: 20,
            vel: { dx: 0, dy: 0 },
            bounty: { x: 200, y: 200 },
            score: 0,
            history: [],
            isPaused: false,
            gameOver: false,
        }

        // This binding is necessary to make `this` work in the callback
        // this.snakeMoveLeft = this.snakeMoveLeft.bind(this);      
        setInterval(this.gameUpdate, GAME_UPDATE_SPEED_IN_MS /*ms*/);
    }

    handleKeyDown = (event) => {
        switch (event.keyCode) {
            case 37: // Left
                this.move(-1, 0)
                break;
            case 38: // Up
                this.move(0, -1)
                break;
            case 39: // Right
                this.move(+1, 0)
                break;
            case 40: // Down
                this.move(0, +1)
                break;
        }
    }

    componentWillMount() {
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    gameUpdate = () => {
        if (this.state.gameOver || this.state.isPaused) {
            return;
        }
        
        const collisionDistance = this.state.snakeSpeed - 5;
                
        if(this.checkIfPlayerHitSnakeTail(collisionDistance)) {
    				this.gameOver()    
        }
        
        if (isNear(this.state.snake, this.state.bounty, collisionDistance)) {
            this.eatBounty(this.state.bounty);
        }
        
        this.updatePlayer();
    }
    
    checkIfPlayerHitSnakeTail = (collisionDistance) => {
    	this.state.history.map(tail => {
      	if (isNear(this.state.snake, tail, +collisionDistance)) {
        	this.setState({ gameOver: true});
        }
      })
    }
    
    gameOver = () => {
    	this.setState(prev => ({
      	isPaused: true,
        gameOver: true,
      }))    
    }

    eatBounty = () => {
        this.setState((prev) => ({
            history: prev.history.concat([prev.snake]),
            bounty: { x: getRandomInt(400), y: getRandomInt(400) },
            score: prev.score + 1,
            snakeSpeed: prev.snakeSpeed + 1,
        }));
    }

    updatePlayer = () => {
        this.setState((prev) => {
            const { x, y } = prev.snake
            const { dx, dy } = prev.vel

            let newX = (x + dx) % MAX_SCREEN_WIDTH
            let newY = (y + dy) % MAX_SCREEN_HEIGHT

            if (newX <= 0) { newX += MAX_SCREEN_WIDTH }
            if (newY <= 0) { newY += MAX_SCREEN_HEIGHT }

            const newHistory = prev.history.concat([prev.snake]).slice(1);            

            return {
                snake: { x: newX, y: newY },
                history: newHistory,
            }
        });
    }

    render() {
        return (
            <div style={{
                width: MAX_SCREEN_WIDTH, height: MAX_SCREEN_HEIGHT,
                'background': 'linear-gradient(to right, rgba(0, 123, 0, 0.7), rgba(0, 123, 0, 0.1))'
            }}>
                Snake Game <br />
                Your Score: {this.state.score}, Speed: {this.state.snakeSpeed}
								
                {this.state.gameOver? 
                	<h1 style={{ size:'200%', color:'red', 
                		position:'absolute', top:'200px', left:'100px', 
                  	transform: 'rotate(20deg)' }}>GAME OVER</h1>
                	: '' }
                  
                <Snake position={this.state.snake} history={this.state.history} />

                <Bounty position={this.state.bounty} />
                
                <Buttons
                    pauseGame={() => this.setState(prev => ({ isPaused: !prev.isPaused }))}
                />

            </div>
        )
    }

    move = (accX, accY) => {
        this.setState((prev) => {            
            return {
                vel: { dx: accX * +this.state.snakeSpeed, dy: accY * +this.state.snakeSpeed }
            }
        });
    }
}

class App extends React.Component {

    render() {
        return (
            <div >
                <Game />
            </div>
        )
    }
}

ReactDOM.render(<App />, mountNode)