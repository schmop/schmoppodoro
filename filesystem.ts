import { readFileSync, writeFileSync } from "fs";
import { isPomodoro, type Pomodoro } from "./pomodoro.ts";

export const DEFAULT_POMODORO_FILE = '/tmp/pomodoro.json';

export function readPomodoroFile(path: string): Pomodoro {
    let data: NonSharedBuffer;
    try {
        data = readFileSync(path);
    } catch (error) {
        return { muted: false, startTime: Date.now(), duration: 25, state: 'stopped' };
    }
    const pomodoro = JSON.parse(data.toString());
    if (!isPomodoro(pomodoro)) {
        throw new Error('Invalid Pomodoro data');
    }

    return pomodoro;
}

export function savePomodoroFile(path: string, pomodoro: Pomodoro): void {
    try {
        writeFileSync(path, JSON.stringify(pomodoro, null, 2));
    } catch (error) {
        console.error(`Error writing Pomodoro file: ${error.message}`);
    }
}