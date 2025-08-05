#!/usr/bin/node

import { exec } from "node:child_process";
import {
    type Action,
    isAction,
    type Options,
    type PartialBy,
    pause,
    type Pomodoro,
    resume,
    start,
    stop
} from "./pomodoro.ts";
import { DEFAULT_POMODORO_FILE, readPomodoroFile, savePomodoroFile } from "./filesystem.ts";


function usage(): void {
    console.log('Usage: schmoppodoro [options] <action>');
    console.log('Actions:');
    console.log('  start            Start a new Pomodoro (default action)');
    console.log('  stop             Stop the current Pomodoro');
    console.log('  pause            Pause the current Pomodoro');
    console.log('  resume           Resume after taking a break with "pause"');
    console.log('  status           Show the state how much time is left or how long the break is');
    console.log('Options:');
    console.log('  -h, --help       Show this help message');
    console.log('  -f, --file       Input file (default: "/tmp/pomodoro.json")');
    console.log('  -d, --duration   Pomodoro duration in minutes (default: 25)');
    console.log('  -m, --muted      Mute sound notifications (default: false)');
    process.exit(1);
}


function parseArgs(args: string[]): Options {
    const options: PartialBy<Options, 'action'> = {
        file: DEFAULT_POMODORO_FILE,
        duration: 25,
        muted: false,
    };
    let action: Action|null = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '-h':
            case '--help':
                usage();
                break;
            case '-f':
            case '--file':
                options.file = args[++i];
                break;
            case '-d':
            case '--duration':
                options.duration = parseInt(args[++i], 10);
                if (isNaN(options.duration) || options.duration <= 0) {
                    console.error('Invalid duration specified.');
                    process.exit(1);
                }
                break;
            case '-m':
            case '--muted':
                options.muted = true;
                break;
            default:
                if (isAction(arg)) {
                    action = arg;
                } else {
                    console.error(`Unknown argument: ${arg}`);
                    usage();
                }
        }
    }
    if (!action) {
        usage();
    }
    return {...options, action};
}

function playSound() {
    return exec("paplay '" + import.meta.dirname + "/pop.mp3'");
}

function showDesktopNotification(title: string, text: string) {
    return exec(`notify-send "${title}" "${text}"`);
}

function alert() {
    playSound();
    showDesktopNotification('Pomodoro finished', 'Time to take a break!');
}

function durationString(duration: number): string {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function status(options: Options, pomodoro: Pomodoro) {
    switch (pomodoro.state) {
        case 'running':
            const elapsed = Date.now() - pomodoro.startTime;
            const remaining = Math.max(0, pomodoro.duration - elapsed);
            if (remaining <= 0) {
                console.log('🍅');
                pomodoro.state = 'stopped';
                savePomodoroFile(options.file, pomodoro);
                if (!options.muted) {
                    alert();
                }
                return;
            }

            console.log(durationString(remaining));
            break;
        case 'paused':
            const elapsedPaused = Date.now() - pomodoro.startTime;
            console.log(durationString(elapsedPaused) + ' ⏸');
            break;
        case 'stopped':
            console.log('🍅');
            break;
        default:
            console.log('Error');
            return;
    }
}

function selectAction(options: Options, pomodoro: Pomodoro): void {
    const actionCallbacks: Record<Action, (options: Options, pomodoro: Pomodoro) => void> = {
        start,
        stop,
        pause,
        resume,
        status,
    };
    actionCallbacks[options.action](options, pomodoro);
}

const options = parseArgs(process.argv.slice(2));
selectAction(options, readPomodoroFile(options.file));