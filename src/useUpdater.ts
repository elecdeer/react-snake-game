import {useEffect, useRef, useState} from "react";

/**
 * interval時間ごとにcallbackを呼び出す
 * @param callback
 * @param initialInterval
 */
export const useUpdater = (callback: () => void, initialInterval: number) => {
	const [intervalMs, setIntervalMs] = useState(initialInterval);
	const savedCallback = useRef<Function>(() => {});

	useEffect(() => {
		savedCallback.current = callback;
	})

	useEffect(() => {
		const timer = setInterval(() => savedCallback.current(), intervalMs);
		return () => clearInterval(timer);
	}, [intervalMs]);

	return setIntervalMs;
}