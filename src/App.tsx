import React, {useEffect} from 'react';
import './App.scss';
import Board from "./Board";
import {atom, useRecoilState, useResetRecoilState} from "recoil";
import {useKey} from "react-use";
import {useUpdater} from "./useUpdater";

export const boardWidth = 12;
export const boardHeight = 12;

const coordToIndex = (x: number, y: number) => y * boardWidth + x;
const posToIndex = (pos: Pos) => pos.y * boardWidth + pos.x;

export const SquareState = {
  Empty: "empty",
  SnakeHead: "snake-head",
  SnakeBody: "snake-body",
  Feed: "feed",
  Wall: "wall",
}
export type SquareState = typeof SquareState[keyof typeof SquareState];


type Pos = {
  x: number,
  y: number
}

export const Facing = {
  Top: {dx: 0, dy: -1, text:"↑"},
  Bottom: {dx: 0, dy: 1, text:"↓"},
  Right: {dx: 1, dy: 0, text:"→"},
  Left: {dx: -1, dy: 0, text:"←"},
}
export type Facing = typeof Facing[keyof typeof Facing];


export type GameState = "WaitStart" | "Playing" | "GameOver"


export const facingState = atom<Facing>({
  key: "snakeFacing",
  default: Facing.Top
})


const initialBoardState: SquareState[] = (() => {
  const size = boardWidth * boardHeight;
  const arr = new Array(size).fill(SquareState.Empty);

  for(let i = 0; i < arr.length; i++){
    if(i < boardWidth || size - boardWidth < i || i%boardHeight === 0 || i%boardHeight === boardWidth-1){
      arr[i] = SquareState.Wall;
    }
  }
  return arr;
})();

export const boardState = atom<SquareState[]>({
  key: "boardState",
  default: initialBoardState
})

export const lengthState = atom<number>({
  key: "lengthState",
  default: 4,
})

export const snakeBodyState = atom<Pos[]>({
  key: "snakeBodyState",
  default: [{
    x: Math.round(boardWidth/2), y: Math.round(boardHeight/2)
  }]
})

export const feedPosState = atom<Pos>({
  key: "feedPosState",
  default: {
    x: 1,
    y: 1
  }
})

export const gameState = atom<GameState>({
  key: "gameState",
  default: "WaitStart"
})




function App() {
  const [facing, setFacing] = useRecoilState(facingState);
  const [snakeLength, setSnakeLength] = useRecoilState(lengthState);
  const [snakeBody, setSnakeBody] = useRecoilState(snakeBodyState);
  const headPos = snakeBody[0];

  const [feedPos, setFeedPos] = useRecoilState(feedPosState);

  const [board, setBoard] = useRecoilState(boardState);
  const [game, setGameState] = useRecoilState(gameState);


  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }


  const spawnFeed = () => {
    while(true){
      const x = getRandomInt(1, boardWidth - 2);
      const y = getRandomInt(1, boardHeight - 2);
      console.log("try", x, y);
      const index = coordToIndex(x, y);
      console.log(board[index]);
      if(board[index] === SquareState.Empty){
        setFeedPos({x, y});
        break;
      }
    }
  }



  const goAhead = () => {
    const toX = headPos.x + facing.dx;
    const toY = headPos.y + facing.dy;

    const toState = board[coordToIndex(toX, toY)];

    const checkBanned = () => {
      if(toState === SquareState.Wall) return true;

      //次進むのがしっぽの位置でない
      const snakeTail = snakeBody[snakeBody.length - 1];
      if(toState === SquareState.SnakeBody && ! (snakeTail.x === toX && snakeTail.y === toY)){
        return true;
      }
      return false;
    }

    if(checkBanned()){
      console.log("gameover")
      setGameState("GameOver");
      return;
    }

    if(toState === SquareState.Feed){
      setSnakeLength(currVal => currVal + 1);
      spawnFeed();
    }

    const pos: Pos = {x: toX, y: toY}

    const pushed = [pos].concat(snakeBody);
    const leave = pushed.slice(0, snakeLength);
    // const del = pushed.slice(snakeLength);

    setSnakeBody(leave);

    console.log(leave);

  }

  const trySetFacing = (facingTo: Facing) => {
    if(facing.dx !== 0 && facing.dx === -facingTo.dx){
      return;
    }
    if(facing.dy !== 0 && facing.dy === -facingTo.dy){
      return;
    }
    setFacing(facingTo);
  }


  useEffect(() => {
    setBoard(currBoard => {
      const nextBoard = initialBoardState.slice();

      snakeBody.slice(1).forEach(p => {
        nextBoard[posToIndex(p)] = SquareState.SnakeBody;
      })
      nextBoard[posToIndex(snakeBody[0])] = SquareState.SnakeHead;

      nextBoard[posToIndex(feedPos)] = SquareState.Feed;

      return nextBoard;
    });
  }, [feedPos, headPos, snakeBody, setBoard])


  useKey("s", () => {
    trySetFacing(Facing.Bottom);
  }, {}, [headPos]);
  useKey("w", () => {
    trySetFacing(Facing.Top);
  }, {}, [headPos]);
  useKey("a", () => {
    trySetFacing(Facing.Left);
  }, {}, [headPos]);
  useKey("d", () => {
    trySetFacing(Facing.Right);
  }, {}, [headPos]);




  const setIntervalMs = useUpdater(() => {
    console.log("update", game);
    if(game !== "Playing"){
      return;
    }
    goAhead();
  }, 1000);

  useEffect(() => {
    setIntervalMs(1000 - snakeLength*30);
  }, [snakeLength, setIntervalMs])


  useKey(" ", () => {
    console.log(headPos);
    console.log(board);
  }, {}, [headPos, board]);

  const buttonHandler = () => {
    setGameState("Playing");
    resetBoard();
  }

  const resetBoardState = useResetRecoilState(boardState);
  const resetLengthState = useResetRecoilState(lengthState);
  const resetBodyState = useResetRecoilState(snakeBodyState);

  const resetBoard = () => {
    resetBoardState();
    resetLengthState();
    resetBodyState();
    spawnFeed();
  }

  const renderStateDiv = () => {
    switch(game){
      case "WaitStart":
        return <div>
          <p>Push to Start</p>
          <button onClick={buttonHandler}>Start</button>
        </div>
      case "Playing":
        return <div>
          <p>Score:{snakeLength}</p>
          <button onClick={buttonHandler} disabled={true}>Start</button>
        </div>
      case "GameOver":
        return <div>
          <p>GameOver Score:{snakeLength}</p>
          <button onClick={buttonHandler}>Restart</button>
        </div>
    }
  }

  return (
    <div className="App">
      <h2>Snake Game</h2>
      <p>WASDで操作</p>
      {renderStateDiv()}
      <div className="game-board">
        <Board/>
      </div>
    </div>
  );
}

export default App;
