# schmoppodoro - A CLI Pomodoro timer for integration with i3-bar or waybar

Also adds a little menu for instant usage via rofi in `rofi-pomodoro.sh`.

## Dependencies

* [npm](https://www.npmjs.com/) and [Node.js](https://nodejs.org/en) (the script itself)
* [davatorium/rofi: Rofi](https://github.com/davatorium/rofi) (the menu)
* [GNOME / libnotify](https://gitlab.gnome.org/GNOME/libnotify) (desktop notifications for timer alerts)
* [PulseAudio](https://www.freedesktop.org/wiki/Software/PulseAudio/) (audio for timer alerts)

## Installation

```
git clone git@github.com:schmop/schmoppodoro.git
cd schmoppodoro
npm ci
```
### integration with i3-bar or waybar
Add a custom block to `.config/waybar/config`
```json
{
  "custom/pomodoro": {
    "exec": "<install-directory>/schmoppodoro/cli.ts status",
    "interval": 1
  }
}
```

### Sway hotkeys for the rofi menu

```
# .config/sway/config
set $pomodoro "<install-directory>/schmoppodoro/rofi-pomodoro.sh"
bindsym $mod+Shift+t exec "$pomodoro"
```

## Usage

```
# node ./cli.ts --help

Usage: schmoppodoro [options] <action>
Actions:
  start            Start a new Pomodoro (default action)
  stop             Stop the current Pomodoro
  pause            Pause the current Pomodoro
  resume           Resume after taking a break with "pause"
  status           Show the state how much time is left or how long the break is
Options:
  -h, --help       Show this help message
  -f, --file       Input file (default: "/tmp/pomodoro.json")
  -d, --duration   Pomodoro duration in minutes (default: 25)
  -m, --muted      Mute sound notifications (default: false)
```

Or using the rofi menu:
```
# ./rofi-pomodoro.sh
```
