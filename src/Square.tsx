import React from 'react';
import {boardState, Facing, facingState, gameState, SquareState} from "./App";
import {useRecoilValue} from "recoil";

type Props = {
	index: number;
	type: SquareState
}

const Square : React.FC<Props> = ({index, type}) => {
	const innerClass = type;

	const facing = useRecoilValue(facingState);
	const game = useRecoilValue(gameState);

	let content = <></>;
	if(innerClass === SquareState.SnakeHead){

		const getDeg = (f: Facing) => {
			switch(facing){
				case Facing.Top: return -90;
				case Facing.Bottom: return 90;
				case Facing.Right: return 0;
				case Facing.Left: return 180;
			}
		}

		const divStyle = {
			transform: `rotate(${getDeg(facing)}deg)`
		}

		let eyeIcon = "："
		if(game === "GameOver"){
			eyeIcon = "X"
		}

		content = <div className="snake-eye" style={divStyle}>
			{eyeIcon}
		</div>
	}

	return (
		<div className="square">
			<div className={innerClass + " square-inner"}>
				{content}
			</div>
		</div>
	);
};

export default Square;