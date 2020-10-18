import React from 'react';
import Square from "./Square";
import {useRecoilState, useRecoilValue} from "recoil";
import {boardHeight, boardState, boardWidth, Facing, facingState} from "./App";

const Board = () => {
	const boardMap = useRecoilValue(boardState);

	const renderSquare = (i: number) => {
		return <Square index={i} key={i} type={boardMap[i]}/>;
	}

	const board = [];
	for(let y = 0; y < boardHeight; y++){
		const row = [];
		for(let x = 0; x < boardWidth; x++){
			const index = y * boardWidth + x;
			row.push(renderSquare(index));
		}
		board.push(
			<div className="board-row" key={y}>
				{row}
			</div>
		)
	}

	return (
		<div>
			{board}
		</div>
	);
};

export default Board;