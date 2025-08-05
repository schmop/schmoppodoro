import { savePomodoroFile } from "./filesystem.ts";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const actions = ['start', 'stop', 'pause', 'resume', 'status'] as const;
export type Action = typeof actions[number];

export const states = ['running', 'paused', 'stopped'] as const;
export type State = typeof states[number];

export type Options = {
    action: Action;
    file: string;
    duration: number;
    muted: boolean;
}

export type Pomodoro = {
    startTime: number;
    duration: number;
    state: State;
    muted: boolean;
}

export function isAction(action: string): action is Action {
    return (actions as readonly string[]).includes(action);
}

export function isPomodoro(obj: any): obj is Pomodoro {
    return obj &&
        typeof obj === 'object' &&
        typeof obj.startTime === 'number' &&
        typeof obj.duration === 'number' &&
        typeof obj.muted === 'boolean' &&
        typeof obj.state === 'string' &&
        states.includes(obj.state);
}

export function start(options: Options, pomodoro: Pomodoro) {
    if (pomodoro.state === 'running') {
        console.log('Pomodoro is already running.');
        return;
    }

    pomodoro.startTime = Date.now();
    pomodoro.duration = options.duration * 60 * 1000; // Convert minutes to milliseconds
    pomodoro.state = 'running';
    savePomodoroFile(options.file, pomodoro);
    console.log(`Pomodoro started for ${options.duration} minutes.`);
}

export function stop(options: Options, pomodoro: Pomodoro) {
    if (pomodoro.state === 'running' || pomodoro.state === 'paused') {
        pomodoro.state = 'stopped';
        savePomodoroFile(options.file, pomodoro);
        console.log('Pomodoro stopped.');
    } else {
        console.log('No running or paused Pomodoro to stop.');
    }
}

export function pause(options: Options, pomodoro: Pomodoro) {
    if (pomodoro.state === 'running') {
        pomodoro.state = 'paused';
        // Save time left
        pomodoro.duration = Math.max(0, pomodoro.duration - (Date.now() - pomodoro.startTime));
        // Save start of break
        pomodoro.startTime = Date.now();
        savePomodoroFile(options.file, pomodoro);
        console.log('Pomodoro paused.');
    } else {
        console.log('No running Pomodoro to pause.');
    }
}

export function resume(options: Options, pomodoro: Pomodoro) {
    if (pomodoro.state === 'paused') {
        pomodoro.startTime = Date.now();
        pomodoro.state = 'running';
        savePomodoroFile(options.file, pomodoro);
        console.log('Pomodoro resumed.');
    } else {
        console.log('No paused Pomodoro to resume.');
    }
}
