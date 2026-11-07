---
---
# SlashyOS

A personal, **multi-host** NixOS configuration spanning an AMD desktop and a Framework laptop. It's built with [`flake-parts`](https://flake.parts/) and [`import-tree`](https://github.com/vic/import-tree), so every `.nix` file under `modules/` is auto-imported — no manual wiring, just drop a file in and it's part of the flake.

Both machines run **[niri](https://github.com/YaLTeR/niri)** (a scrollable-tiling Wayland compositor) with the **[Noctalia](https://github.com/noctalia-dev/noctalia-shell)** shell. niri, Noctalia, kitty, btop, git and fastfetch are wrapped declaratively via [`nix-wrapper-modules`](https://github.com/BirdeeHub/nix-wrapper-modules) instead of imperative dotfiles, and everything is themed by **[Stylix](https://github.com/nix-community/stylix)** from a single per-host wallpaper — from the boot splash and login screen to the shell and every app.

Shared configuration is written **once**: a `slashyos` base bundle pulls in everything common (system *and* home-manager level), and each host adds only its hardware, bootloader, and a handful of per-host values. Adding an app to both machines is a one-line change.

!!! info "Repository"
    Source lives at [GitLab](https://gitlab.com/nixos-projects/slashyos) · wallpapers at [nixos-projects/wallpapers](https://gitlab.com/nixos-projects/wallpapers) · NixOS 26.05 · 2 hosts

## Flake structure

```
SlashyOS/
├── flake.nix                     # inputs + flake-parts entrypoint
├── .gitlab-ci.yml                # CI: `nix flake check` + formatting on every push
├── modules/
│   ├── parts.nix                 # systems, `flake.variables` option, nix fmt formatter
│   ├── checks.nix                # flake checks: deadnix, statix
│   ├── devshells/
│   │   └── devshells.nix         # `devShells` outputs (python, frontendServer, docs, zola, cisco)
│   ├── features/                 # reusable modules, grouped by concern
│   │   ├── appearance/           # stylix, ly, plymouth
│   │   ├── desktop/              # niri, noctalia (+ noctalia.json)
│   │   └── system/               # base bundle, vars, common, common-home, common-hardware,
│   │                             # lockdown, shell, starship, ssh, nvf, yazi, ntfy, virtualisation
│   ├── wrappedPrograms/          # 🛠️ kitty, btop, git, fastfetch
│   └── hosts/
│       ├── pallidus/             # 🖥️ AMD desktop
│       │   ├── default.nix       # nixosSystem definition
│       │   ├── pallidus.nix      # host config: imports + `slashyos.vars` + bootloader
│       │   ├── hardware.nix      # generated hardware scan
│       │   ├── desktop-hardware.nix  # desktop-only hardware (LACT, NTFS)
│       │   ├── lanzaboote.nix    # 🔐 Secure Boot
│       │   ├── sunshine.nix      # game streaming (available, not enabled)
│       │   ├── home.nix          # host-only home-manager extras
│       │   └── variables.nix     # this host's values
│       └── theseus/              # 💻 Framework AMD laptop
│           ├── default.nix
│           ├── theseus.nix
│           ├── hardware.nix
│           ├── laptop-hardware.nix   # laptop-only hardware (fans, fingerprint, power)
│           ├── grub.nix          # GRUB theme
│           ├── home.nix
│           └── variables.nix
└── config/
    ├── ssh/                      # public keys per host
    ├── banner.svg                # README banner
    └── pfp.png                   # profile picture (Noctalia)
```

Anything under `modules/` is auto-imported regardless of subfolder — the folders are purely for humans. A module only becomes active on a host when that host's config imports it by name.

## Module layers

Deduplication works in layers:

| Layer               | Module                                     | Contains |
| ------------------- | ------------------------------------------ | -------- |
| **Base bundle**     | `slashyos` (`features/system/default.nix`) | Imports everything every machine gets: `vars`, `commonHardware`, `common`, `commonHome`, kitty, btop, git, ssh, niri, ly, stylix, lockdown, shell, starship, fastfetch, plymouth, ntfy, nvf, yazi, virtualisation |
| **Shared hardware** | `commonHardware`                           | Both machines are AMD: firmware, microcode, amdgpu in initrd, `amd_pstate`, latest kernel, graphics (+32-bit), Bluetooth, Wooting, zram, fstrim, fwupd |
| **Shared system**   | `common`                                   | NixOS-level config both hosts share: nix settings, locale, keyboard, pipewire, portals, Steam, Thunar, LocalSend, Tailscale, printing, users |
| **Shared home**     | `commonHome`                               | Home-manager config both hosts share: user dirs, packages, Flatpaks, Zen Browser, VSCodium, Obsidian |

A host file then reads as *"the OS, plus this hardware, plus this bootloader"*, and hands its values to the shared modules with one line:

```nix
# modules/hosts/theseus/theseus.nix
imports = [
  self.nixosModules.slashyos
  self.nixosModules.theseusHome
  self.nixosModules.theseusHardware
  self.nixosModules.laptopHardware
  self.nixosModules.grub
];

slashyos.vars = self.variables.theseus;
```

**Where does a change go?**

- App / setting for **both machines** → `common.nix` (system) or `common-home.nix` (user); hardware for both → `common-hardware.nix`
- App for **one machine** → that host's `home.nix`
- New feature for both → new file under `features/`, add one line to the `slashyos` bundle
- New machine → copy the closest host folder — see [Usage](#usage)

## Tags

| Tag | Meaning                                         |
| --- | ----------------------------------------------- |
| 🟢  | Enabled / active                                |
| 🛠️ | Declaratively wrapped via `nix-wrapper-modules` |
| 🔐  | Security-related (Secure Boot, etc.)        # SlashyOS

A personal, **multi-host** NixOS configuration spanning an AMD desktop and a Framework laptop. It's built with `[flake-parts](https://flake.parts/)` and `[import-tree](https://github.com/vic/import-tree)`, so every `.nix` file under `modules/` is auto-imported — no manual wiring, just drop a file in and it's part of the flake.

Both machines run **[niri](https://github.com/YaLTeR/niri)** (a scrollable-tiling Wayland compositor) with the **[Noctalia](https://github.com/noctalia-dev/noctalia-shell)** shell, both wrapped declaratively via `[nix-wrapper-modules](https://github.com/BirdeeHub/nix-wrapper-modules)` instead of imperative dotfiles, and are themed system-wide by **[Stylix](https://github.com/nix-community/stylix)** — from the boot splash to the TTY to every app.

Shared configuration is written **once**: a `slashyos` base bundle pulls in everything common (system *and* home-manager level), and each host adds only its hardware, bootloader, and a handful of per-host values. Adding an app to both machines is a one-line change.

!!! info "Repository"
    Source lives at [Gitlab](https://gitlab.com/nixos-projects/slashyos) · NixOS 26.05 · 2 hosts

## Flake structure

```
SlashyOS/
├── flake.nix                     # inputs + flake-parts entrypoint
├── modules/
│   ├── parts.nix                 # systems, `flake.variables` option, nix fmt formatter
│   ├── devshells/
│   │   └── devshells.nix         # `devShells` outputs (python, frontendServer)
│   ├── features/                 # reusable modules, grouped by concern
│   │   ├── appearance/           # stylix, sddm, plymouth, fastfetch
│   │   ├── desktop/              # niri, noctalia (+ noctalia.json)
│   │   ├── system/               # base bundle, common, common-home, shell, nvf, yazi, ntfy, virtualisation
│   │   ├── pallidus/             # host-exclusive: lanzaboote, sunshine
│   │   └── theseus/              # host-exclusive: grub
│   └── hosts/
│       ├── pallidus/             # 🖥️ AMD desktop
│       │   ├── default.nix       # nixosSystem definition
│       │   ├── pallidus.nix      # host config: imports + hostname + bootloader
│       │   ├── hardware.nix      # generated hardware scan
│       │   ├── desktop-hardware.nix
│       │   ├── home.nix          # host-only home-manager extras
│       │   └── variables.nix     # this host's values
│       └── theseus/              # 💻 Framework AMD laptop
│           ├── default.nix
│           ├── theseus.nix
│           ├── hardware.nix
│           ├── laptop-hardware.nix
│           ├── home.nix
│           └── variables.nix
└── config/
    ├── Wallpapers/               # wallpaper collection (+ greyscale/)
    └── fastfetch/image/          # fastfetch logos
```

Anything under `modules/` is auto-imported regardless of subfolder — the folders are purely for humans. A module only becomes active on a host when that host's config imports it by name.

## Module layers

Deduplication works in three layers:


| Layer | Module | Contains |
| ----------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Base bundle** | `slashyos` (`features/system/default.nix`) | Imports everything every machine gets: `common`, `commonHome`, niri, sddm, stylix, shell, fastfetch, plymouth, ntfy, nvf, yazi, virtualisation |
| **Shared system** | `common` | NixOS-level config both hosts share: nix settings, locale, pipewire, portals, Steam, users, firewall, … |
| **Shared home** | `commonHome` | Home-manager config both hosts share: user dirs, packages, kitty, VSCodium, git, btop, mangohud |


A host file then reads as *"the OS, plus this hardware, plus this bootloader"*:

```nix
# modules/hosts/theseus/theseus.nix
imports = [
  self.nixosModules.slashyos
  self.nixosModules.theseusHome
  self.nixosModules.theseusHardware
  self.nixosModules.laptopHardware
  self.nixosModules.grub
];
```

**Where does a change go?**

- App / setting for **both machines** → `common.nix` (system) or `common-home.nix` (user)
- App for **one machine** → that host's `home.nix`
- New feature for both → new file under `features/`, add one line to the `slashyos` bundle
- New machine → copy the closest host folder (~5 short files) — see [Usage](#usage)

## Tags


| Tag | Meaning |
| --- | ----------------------------------------------- |
| 🟢 | Enabled / active |
| 🛠️ | Declaratively wrapped via `nix-wrapper-modules` |
| 🔐 | Security-related (Secure Boot, etc.) |
| 🖥️ | Desktop-only (`pallidus`) |
| 💻 | Laptop-only (`theseus`) |


## Hosts


| Host | Platform | Machine | Bootloader | Keyboard | Notes |
| ---------- | -------------- | ------------------------- | ------------------------------ | -------- | ------------------------------------------------------- |
| `pallidus` | `x86_64-linux` | 🖥️ AMD desktop | `systemd-boot` + 🔐 Lanzaboote | `gb,fr` | Dual-boots Windows 11 |
| `theseus` | `x86_64-linux` | 💻 Framework AMD (AI 300) | GRUB | `us,fr` | Tuned via `nixos-hardware`, zram, power-profiles-daemon |


Each host is a separate entry in `flake.nixosConfigurations`. You build the one matching the machine — see [Usage](#usage).

## Per-host variables

Values that differ between machines (hostname, wallpaper, login background, fastfetch logo, username, keyboard layout) live in each host's `variables.nix` under `flake.variables.<host>`:

```nix
# modules/hosts/theseus/variables.nix
flake.variables.theseus = {
  username = "dias";
  hostname = "theseus";
  kbLayout = "us,fr";
  wallpaper = "${self}/config/Wallpapers/japan.png";
  # ...
};
```

The `flake.variables` output is declared as an option in `parts.nix`, which is what lets each host contribute its own set without collisions. Shared modules that need a host-specific value look it up by the machine's hostname:

```nix
image = self.variables.${config.networking.hostName}.wallpaper;
```

So a single `stylix.nix` themes both hosts, each with its own wallpaper. To add a value, add the key to every host's `variables.nix`.

## Desktop environment

### niri

- 🟢🛠️ Scrollable-tiling Wayland compositor, wrapped declaratively (`programs.niri` + `wrapper-modules`).
- `phinger-cursors-dark` cursor theme, size 32, throughout the stack.
- Rounded window corners (12px), blur, 8px gaps, focus ring in Stylix accent colors.
- Keyboard layout is per-host, ++alt+shift++ to toggle.
- 💻 The Framework's built-in panel (`eDP-1`) runs at fractional scale `1.2`; Electron apps go native Wayland (`NIXOS_OZONE_WL`) so they stay crisp, and Steam's UI is scaled to match.

**Keybinds** *(shared across hosts; `Mod` = ++super++)*


| Bind | Action |
| ------------------------------------ | ------------------------------------ |
| ++super+shift+return++ | Toggle Noctalia launcher |
| ++super+return++ | Open `kitty` |
| ++super+d++ | Open `vesktop` (Discord) |
| ++super+t++ | Open `thunar` |
| ++super+w++ | Open `brave` |
| ++super+shift+b++ | Open `emote` (emoji picker) |
| ++super+ctrl+s++ / ++super+shift+s++ | Screenshot full / region → clipboard |
| ++super+q++ | Close window |
| ++super+shift+e++ | Quit niri |
| ++super+shift+escape++ | Show hotkey overlay |
| ++super+tab++ | Toggle overview |


### Noctalia

- 🟢🛠️ Shell / bar / launcher for niri, wrapped as a package and toggled via niri keybinds (launcher, settings, wallpaper, session menu). Themed via `noctalia.json`.

### Theming (Stylix)

- 🟢 **[Stylix](https://github.com/nix-community/stylix)** drives system-wide theming — colors, fonts, and icons — from each host's wallpaper (`polarity = "dark"`).
- Covers **everything**: apps, `btop`, the Plymouth boot splash, and the TTY console, so the whole boot-to-desktop journey shares one palette per host.
- Papirus icon theme (dark), 80% terminal/application opacity.

## Boot & security

**Shared**

- 🟢 **Plymouth** — Stylix-generated boot splash (wallpaper-derived background, logo, spinner) with silent boot: quiet kernel params, hidden initrd logs.
- 🟢 **SDDM** — Wayland session via the `kwin` compositor, `sddm-astronaut-theme` (left-aligned form, per-host greyscale background, `Electroharmonix` font).

**pallidus** 🖥️

- 🟢🔐 **[Lanzaboote](https://github.com/nix-community/lanzaboote)** — Secure Boot with a signed kernel/bootloader; `sbctl` included for key management (keys live on the machine, not in the repo).
- `systemd-boot`, 5 generations kept, EFI variables writable, dedicated Windows 11 boot entry.

**theseus** 💻

- 🟢 **GRUB** (EFI, `device = nodev`) with the `grub-of-tsushima` theme; Stylix's GRUB target disabled so the theme applies.

## Shell & CLI

- **fish** — default shell, fastfetch greeting.
- **starship** — prompt, with username/hostname disabled.
- **[nh](https://github.com/nix-community/nh)** — pretty `nixos-rebuild` wrapper, pointed at the repo, with weekly auto-clean (see [Maintenance](#maintenance)).
- **direnv + nix-direnv** — per-project [dev shells](#dev-shells) that auto-activate on `cd`.
- **[comma](https://github.com/nix-community/comma)** — `, anything` runs a nixpkgs program without installing it.
- **fastfetch** — custom system-info fetch with a per-host logo (`kitty-direct`).
- **nvf** — declaratively configured Neovim. **yazi** — terminal file manager.
- **ntfy** — a user service subscribes to [ntfy](https://ntfy.sh) and relays to desktop notifications (reads `~/.config/ntfy/client.yml`, deliberately unmanaged so credentials stay out of the repo).

**Aliases**


| Alias | Expands to |
| ----- | ---------------------------------- |
| `fr` | `nh os switch` |
| `fu` | `nix flake update` (on this flake) |


**Formatting** — the flake exposes `nixfmt-tree` as its formatter; `nix fmt` from the repo root formats the whole tree.

## Dev shells

Defined in `modules/devshells/devshells.nix` as flake outputs, pinned to the same `nixpkgs` as the system:


| Shell | Provides |
| ---------------- | -------------------------------------------------------------------------------------- |
| `python` | Python 3 with numpy, pandas, matplotlib, pillow, jupyter, pytest, pip/setuptools/wheel |
| `frontendServer` | Node.js 24 |


```fish
# one-off
nix develop ~/SlashyOS#python

# per project — auto-activates on cd, and creates a GC root
echo "use flake ~/SlashyOS#python" > .envrc && direnv allow
```

## Maintenance

Garbage collection is automated **without ever nuking dev shells**:

- `nh clean` runs **weekly**: keeps the last 5 generations and anything newer than 3 days, and runs with `--no-gcroots` so direnv's dev-shell roots are never removed.
- `nix.settings` sets `keep-outputs` + `keep-derivations`, so build-time dependencies of rooted shells survive GC — nothing gets re-downloaded after a clean.
- `auto-optimise-store` hardlinks duplicate store files to claw disk back.
- The [nix-community cache](https://nix-community.cachix.org) is added as an extra substituter (covers lanzaboote and friends).

## Applications

Shared apps live in `commonHome`; host-only extras in that host's `home.nix` (pallidus adds `r2modman` and `pandora-launcher`).


| App | Purpose |
| -------------------------------------------------------------------- | ---------------------------------------- |
| [Brave](https://brave.com/) | Browser |
| [Thunar](https://docs.xfce.org/xfce/thunar/start) | File manager |
| [VSCodium](https://vscodium.com/) | Code editor (curated extension set) |
| [Vesktop](https://github.com/Vencord/Vesktop) | Discord client |
| [Element](https://element.io/) | Matrix client |
| [Proton Pass](https://proton.me/pass) | Password manager |
| [Proton Mail](https://proton.me/mail) | Email client |
| [Wootility](https://wooting.io/wootility) | Wooting keyboard configurator |
| [kitty](https://sw.kovidgoyal.net/kitty/) | Terminal (custom config, fade tab bar) |
| [Emote](https://github.com/tom-james-watson/Emote) | Emoji picker (++super+shift+b++) |
| [VLC](https://www.videolan.org/) · [imv](https://sr.ht/~exec64/imv/) | Media / image viewing |
| [LocalSend](https://localsend.org/) | LAN file sharing (firewall ports opened) |


Plus: `btop` (Stylix-themed via home-manager), `micro`, `git`, Steam (Gamescope session, Proton-GE, GameMode), MangoHud.

## Wallpapers

The wallpaper collection lives in `config/Wallpapers/`, including a `greyscale/` subset — one of which (`ship-greyscale.jpg`) is used as the SDDM login background. Each host picks its own desktop wallpaper in its `variables.nix`, and Stylix derives the whole color scheme from it — desktop, apps, boot splash, and console alike.

## Usage

Each machine builds its own host. From the repo root:

```fish
# On the machine itself — hostname is inferred:
fr                    # == nh os switch  (builds the host matching this machine)

# Or be explicit about which host:
sudo nixos-rebuild switch --flake .#pallidus
sudo nixos-rebuild switch --flake .#theseus

# Update flake inputs:
fu                    # == nix flake update (on this flake)

# Format the tree:
nix fmt
```

**Build without switching** (safe eval/compile check, e.g. testing the laptop's config from the desktop):

```fish
nixos-rebuild build --flake .#theseus     # drops ./result, changes nothing
```

!!! tip "Adding a new host"
    To add a machine (e.g. `orion`): copy the closest existing host folder (`pallidus` for a desktop, `theseus` for a laptop), rename its per-host module attributes (`<old>Configuration/Home/Hardware` → `<new>…`), set `flake.variables.<new>`, drop in the machine's real `hardware.nix`, `git add` the new files, then `sudo nixos-rebuild switch --flake .#<new>` on that machine. Thanks to the `slashyos` bundle, the new host file is ~20 lines.

## Inputs & credits


| Input | Used for |
| ------------------------------------------------------------------------------- | ------------------------------------ |
| [nixpkgs](https://github.com/nixos/nixpkgs) (`nixos-26.05`) | Package set |
| [flake-parts](https://github.com/hercules-ci/flake-parts) | Modular flake composition |
| [import-tree](https://github.com/vic/import-tree) | Auto-import of `modules/` |
| [nix-wrapper-modules](https://github.com/BirdeeHub/nix-wrapper-modules) | Declarative niri & Noctalia wrapping |
| [nixos-hardware](https://github.com/NixOS/nixos-hardware) | Framework laptop tuning (`theseus`) |
| [lanzaboote](https://github.com/nix-community/lanzaboote) | Secure Boot (`pallidus`) |
| [stylix](https://github.com/nix-community/stylix) (`release-26.05`) | System-wide theming |
| [home-manager](https://github.com/nix-community/home-manager) (`release-26.05`) | User-level config |
| [nvf](https://github.com/notashelf/nvf) | Declarative Neovim |


    |
| 🖥️ | Desktop-only (`pallidus`)                       |
| 💻  | Laptop-only (`theseus`)                         |

## Hosts

| Host       | Platform       | Machine                   | Bootloader                     | Keyboard | Notes |
| ---------- | -------------- | ------------------------- | ------------------------------ | -------- | ----- |
| `pallidus` | `x86_64-linux` | 🖥️ AMD desktop           | `systemd-boot` + 🔐 Lanzaboote | `gb,fr`  | Dual-boots Windows 11, LACT for GPU tuning |
| `theseus`  | `x86_64-linux` | 💻 Framework AMD (AI 300) | GRUB                           | `us,fr`  | Tuned via `nixos-hardware`, fingerprint reader, fan control, power-profiles-daemon |

Each host is a separate entry in `flake.nixosConfigurations`. You build the one matching the machine — see [Usage](#usage).

## Per-host variables

Values that differ between machines (username, hostname, SSH key, keyboard layout, wallpaper) live in each host's `variables.nix` under `flake.variables.<host>`:

```nix
# modules/hosts/theseus/variables.nix
flake.variables.theseus = {
  username = "dias";
  hostname = "theseus";
  sshKey = "framework";
  kbLayout = "us,fr";
  wallpaper = "${inputs.wallpapers}/japan.jpg";
};
```

The `flake.variables` output is declared as an option in `parts.nix`, which is what lets each host contribute its own set without collisions. Each host then passes its set into the NixOS config through the typed `slashyos.vars` option from `vars.nix`:

```nix
# modules/hosts/theseus/theseus.nix
slashyos.vars = self.variables.theseus;
```

Shared modules read it from `config`, and `vars.nix` also sets `networking.hostName` from it:

```nix
image = config.slashyos.vars.wallpaper;
```

So a single `stylix.nix` themes both hosts, each with its own wallpaper. Because the option is typed, a missing or misspelled key fails the build with a clear error. To add a value, declare it in `vars.nix` and add it to every host's `variables.nix`.

## Desktop environment

### niri

- 🟢🛠️ Scrollable-tiling Wayland compositor, wrapped declaratively (`programs.niri` + `wrapper-modules`). The base config is a flake package; each host layers its Stylix colors, cursor and keyboard layout on top.
- Rounded window corners (12px), background blur, 8px gaps, focus ring in Stylix colors.
- `phinger-cursors-dark` cursor, size 32. Flat mouse acceleration.
- Keyboard layout is per-host, ++alt+shift++ to toggle. Workspace keys work on both QWERTY and AZERTY.
- Electron apps run natively on Wayland (`NIXOS_OZONE_WL`); X11 apps go through `xwayland-satellite`.
- 💻 Closing the laptop lid locks the screen.

**Keybinds** *(shared across hosts; `Mod` = ++super++)*

| Bind | Action |
| ---- | ------ |
| ++super+shift+enter++ | Toggle Noctalia launcher |
| ++super+shift+i++ / ++super+shift+w++ / ++super+shift+q++ | Noctalia settings / wallpaper selector / session menu |
| ++super+enter++ | Open `kitty` |
| ++super+w++ | Open Zen Browser |
| ++super+d++ | Open `vesktop` (Discord) |
| ++super+t++ | Open `thunar` |
| ++super+shift+b++ | Open `emote` (emoji picker) |
| ++super+1++ … ++super+0++ / ++super+shift+1++ … ++super+shift+0++ | Go to / move column to workspace |
| ++super+h++ ++super+j++ ++super+k++ ++super+l++ or arrows | Move focus |
| ++super+shift+h++ ++super+shift+j++ ++super+shift+k++ ++super+shift+l++ | Move the window or column |
| ++super+ctrl+h++ ++super+ctrl+j++ ++super+ctrl+k++ ++super+ctrl+l++ | Resize column width / window height |
| ++super+shift+s++ | Screenshot region (++space++ saves + copies, ++ctrl+c++ copies) |
| ++super+ctrl+s++ | Screenshot whole screen → clipboard |
| ++super+q++ | Close window |
| ++super+f++ / ++super+shift+f++ | Fullscreen / toggle floating |
| ++super+g++ / ++super+c++ / ++super+r++ | Maximize / center / cycle preset width of column |
| ++super+tab++ | Toggle overview |
| ++super+alt+l++ | Toggle [lockdown mode](#boot-security) |
| ++super+shift+escape++ | Show hotkey overlay |
| ++super+shift+e++ | Quit niri |

Media, volume and brightness keys work everywhere, including the lock screen.

### Noctalia

- 🟢🛠️ Shell / bar / launcher / notifications / lock screen for niri, wrapped as a package and toggled via niri keybinds.
- Settings come from `noctalia.json` (an export from Noctalia's settings window), with a few overrides in `noctalia.nix` so a fresh export can't undo them: colors from Stylix instead of the wallpaper, the avatar from `config/pfp.png`, and the wallpaper picker pointed at the `wallpapers` input.
- Colors come from Stylix through a "Stylix" color scheme written by `stylix.nix`: `base00` for the background, a 25% mix of `base00` and `base01` for boxes and cards, `base0D` as the accent. They're re-applied on every rebuild and boot.
- Idle handling: screen off after 10 minutes, lock after 11, suspend after 30; locks on suspend.

### Theming (Stylix)

- 🟢 **[Stylix](https://github.com/nix-community/stylix)** generates the color palette from each host's wallpaper (`polarity = "dark"`) and themes the whole system with it.
- Covers GTK and Qt apps, Zen Browser, the Plymouth boot splash, the TTY console and the Ly login screen. The wrapped kitty, btop and niri read their colors from Stylix too, and Noctalia gets a mapped version of the palette.
- `JetBrainsMono Nerd Font` as the monospace font, Papirus-Dark icons, `phinger-cursors-dark` cursor, 80% terminal/application opacity.
- View the current palette with `xdg-open /etc/stylix/palette.html` (or `cat /etc/stylix/palette.json`).

## Boot & security

**Shared**

- 🟢 **Plymouth** — Stylix-themed boot splash with silent boot: quiet kernel params, hidden initrd logs.
- 🟢 **Ly** — TUI login manager with the `colormix` animation in Stylix colors and a big clock. Logging in unlocks GNOME Keyring; fingerprint login is disabled so the keyring always gets your password.
- 🟢🔐 **SSH** — GNOME Keyring is the SSH agent, so keys unlock at login. Hosts that shouldn't be public live in `~/.ssh/config.d/` on each machine, outside the repo.
- 🟢🔐 **Lockdown mode** — `lockdown` (or ++super+alt+l++) for when you step away somewhere you don't trust. While on, it locks the screen now and after 1 minute idle, blocks newly plugged-in USB devices ([USBGuard](https://usbguard.github.io/); built-in devices keep working), turns off Wi-Fi and Bluetooth, mutes the mic, clears the clipboard and forgets the cached `sudo` password. Turning it off restores Wi-Fi, Bluetooth and the mic to how they were, and tells you about any USB device that was blocked (replug it to use it).

    | Command               | Does |
    | --------------------- | ---- |
    | `lockdown`            | Toggle |
    | `lockdown on` / `off` | Turn on / off |
    | `lockdown status`     | `on`, `off`, or `off (restore pending)` after a reboot during lockdown — `lockdown off` (or ++super+alt+l++) puts things back |

**pallidus** 🖥️

- 🟢🔐 **[Lanzaboote](https://github.com/nix-community/lanzaboote)** — Secure Boot with a signed kernel/bootloader; `sbctl` included for key management (keys live on the machine, not in the repo).
- `systemd-boot`, 5 generations kept, EFI variables writable, Windows 11 boot entry.

**theseus** 💻

- 🟢 **GRUB** (EFI, `device = nodev`) with the `grub-of-tsushima` theme; Stylix's GRUB target disabled so the theme applies.
- 🟢🔐 **Fingerprint reader** (`fprintd`) for `sudo` and other PAM prompts.

## Shell & CLI

- **fish** — default shell, fastfetch greeting.
- **starship** — two-line prompt in the style of [nix-prompt](https://github.com/nix-tricks/nix-prompt), in Stylix colors: a badge with the repo name inside git (`user@host` over SSH or as root, the hostname otherwise; the icon blinks after a failed command), the path, and a git badge with branch, state and `__git_ps1`-style markers (`*` modified, `+` staged, `%` untracked, plus commits ahead/behind).
- **[nh](https://github.com/nix-community/nh)** — pretty `nixos-rebuild` wrapper, pointed at the repo, with weekly auto-clean (see [Maintenance](#maintenance)).
- **direnv + nix-direnv** — per-project [dev shells](#dev-shells) that auto-activate on `cd`.
- **zoxide** — replaces `cd` with a smarter version that remembers directories. **fzf** — fuzzy search keybindings and completion.
- **[comma](https://github.com/nix-community/comma)** — `, anything` runs a nixpkgs program without installing it.
- 🛠️ **fastfetch** — custom system-info fetch with an ASCII ringed-planet logo, `SlashyOS 1.0` as the OS, and the install's age in days.
- 🛠️ **git** — wrapped with name, email and defaults.
- **nvf** — declaratively configured Neovim (LSP, Telescope, Treesitter; Nix and Python). **yazi** — terminal file manager. **micro** — default `$EDITOR`.
- **ntfy** — a user service subscribes to the `priority-ntfy` topic on the [ntfy](https://ntfy.sh) server and relays messages to desktop notifications with a sound. The client config is generated by Nix; the access token never touches the repo — [secretspec](https://secretspec.dev) reads it from the GNOME keyring and passes it in as `$NTFY_TOKEN`.

**Aliases**

| Alias     | Expands to |
| --------- | ---------- |
| `fr`      | `nh os switch` |
| `fu`      | `nix flake update` (on this flake) |
| `gc`      | `sudo nh clean all --keep 2 --no-gcroots` |
| `lint`    | `deadnix` + `statix check` on the repo |
| `lintfix` | `deadnix -e` + `statix fix`, then shows a `git diff --stat` |

**Formatting** — the flake exposes `nixfmt-tree` as its formatter; `nix fmt` from the repo root formats the whole tree.

## Dev shells

Defined in `modules/devshells/devshells.nix` as flake outputs, pinned to the same `nixpkgs` as the system:

| Shell            | Provides |
| ---------------- | -------- |
| `python`         | Python 3 with numpy, pandas, matplotlib, pillow, jupyter, pytest, dbus-python (need a PyPI-only package? `python -m venv .venv` in the project) |
| `frontendServer` | Node.js 24, prints the Node and npm versions on entry (frontend dev servers, React) |
| `docs`           | `uv` + Python 3 for [Zensical](https://zensical.org) (`uvx zensical serve`) |
| `zola`           | [Zola](https://www.getzola.org) static site generator |
| `cisco`          | Networking tools: PuTTY, minicom, `bind`, `tcpdump`, `nmap` (Wireshark is installed system-wide on `theseus`) |

```fish
# one-off
nix develop ~/SlashyOS#python

# per project — auto-activates on cd, and creates a GC root
echo "use flake ~/SlashyOS#python" > .envrc && direnv allow
```

## Maintenance

Garbage collection is automated **without ever nuking dev shells**:

- `nh clean` runs **weekly**: keeps the last 5 generations and anything newer than 3 days, and runs with `--no-gcroots` so direnv's dev-shell roots are never removed.
- `gc` cleans by hand, down to the last 2 generations.
- `nix.settings` sets `keep-outputs` + `keep-derivations`, so build-time dependencies of rooted shells survive GC — nothing gets re-downloaded after a clean.
- `auto-optimise-store` hardlinks duplicate store files to claw disk back.
- `lint` / `lintfix` find and remove dead code ([deadnix](https://github.com/astro/deadnix)) and anti-patterns ([statix](https://github.com/oppiliappan/statix)).

**Checks & CI**

- `nix flake check` evaluates both hosts (nothing is built) and runs the deadnix and statix checks from `checks.nix`. Run it before pushing to catch a broken config for the machine you're not on.
- `.gitlab-ci.yml` runs the same `nix flake check`, plus a formatting check (`nix fmt` must leave no diff), on every push that touches Nix code.

## Applications

Shared apps live in `commonHome` and `common`; host-only extras in that host's `home.nix`.

| App | Purpose |
| --- | ------- |
| [Zen Browser](https://zen-browser.app/) | Browser (Firefox-based, declarative profile: containers, SearXNG search, extensions, bookmarks, wipe on close) |
| [Brave](https://brave.com/) | Second browser |
| [Thunar](https://docs.xfce.org/xfce/thunar/start) | File manager (archive and removable-drive plugins) |
| [VSCodium](https://vscodium.com/) | Code editor (curated extension set and formatters) |
| [Obsidian](https://obsidian.md/) | Notes (vault in `~/Documents/Obsidian`) |
| [Vesktop](https://github.com/Vencord/Vesktop) | Discord client |
| [Element](https://element.io/) | Matrix client |
| [Thunderbird](https://www.thunderbird.net/) | Email client |
| [Proton Pass](https://proton.me/pass) · [Mail](https://proton.me/mail) · [VPN](https://protonvpn.com/) | Password manager, email, VPN |
| [Super Productivity](https://super-productivity.com/) | To-do list and time tracking |
| [Feishin](https://github.com/jeffvli/feishin) | Music player |
| [VLC](https://www.videolan.org/) · [imv](https://sr.ht/~exec64/imv/) | Media / image viewing |
| [Grayjay](https://grayjay.app/) | Video app (Flatpak) |
| 🛠️ [kitty](https://sw.kovidgoyal.net/kitty/) | Terminal (Stylix colors, fade tab bar) |
| 🛠️ [btop](https://github.com/aristocratos/btop) | System monitor (Stylix theme) |
| [Emote](https://github.com/tom-james-watson/Emote) | Emoji picker (++super+shift+b++) |
| [LocalSend](https://localsend.org/) | LAN file sharing (firewall ports opened) |
| [Wootility](https://wooting.io/wootility) | Wooting keyboard configurator |
| [virt-manager](https://virt-manager.org/) | Virtual machines (libvirt + QEMU/KVM, TPM, USB redirection) |
| Steam | Gamescope session, Proton-GE, GameMode |
| [Beyond All Reason](https://www.beyondallreason.info/) | RTS game |

**Host extras**

- **pallidus** 🖥️ — `r2modman`, Pandora Launcher.
- **theseus** 💻 — Pandora Launcher, Cisco Packet Tracer 9, ONLYOFFICE, Wireshark (the `wireshark` group lets you capture without `sudo`; `dialout` gives access to USB-to-serial adapters).

Flatpaks are managed declaratively with [nix-flatpak](https://github.com/gmodena/nix-flatpak): unmanaged ones are removed, and the rest update on rebuild and weekly.

## Wallpapers

The wallpaper collection lives in its own repo, [`nixos-projects/wallpapers`](https://gitlab.com/nixos-projects/wallpapers) (including a `greyscale/` subset), pulled in as the `wallpapers` flake input with `flake = false`. Keeping the images out of the main repo keeps clones small and stops every rebuild from copying 40 MB into the Nix store. Each host picks its own wallpaper in its `variables.nix` (`"${inputs.wallpapers}/japan.jpg"`), and Stylix derives the whole color scheme from it — desktop, apps, shell, login screen, boot splash, and console alike.

Noctalia's wallpaper selector (++super+shift+w++) browses the same collection. Picking a wallpaper there changes only the picture; to change the colors as well, set `wallpaper` in `variables.nix` and rebuild.

!!! tip "Adding a wallpaper"
    Commit it to the wallpapers repo and push, then in SlashyOS run `nix flake update wallpapers` and `fr`, and commit the updated `flake.lock`.

## Usage

Each machine builds its own host. From the repo root:

```fish
# On the machine itself — hostname is inferred:
fr                    # == nh os switch  (builds the host matching this machine)

# Or be explicit about which host:
sudo nixos-rebuild switch --flake .#pallidus
sudo nixos-rebuild switch --flake .#theseus

# Update flake inputs:
fu                    # == nix flake update (on this flake)

# Format, lint and check the tree:
nix fmt
lint
nix flake check
```

**Build without switching** (safe eval/compile check, e.g. testing the laptop's config from the desktop):

```fish
nixos-rebuild build --flake .#theseus     # drops ./result, changes nothing
```

!!! note "Files that stay out of the repo"
    Create these by hand on each machine:

    - `~/.ssh/config.d/*` — private SSH hosts (addresses, ports, users). `chmod 600` them.
    - ntfy access token — stored in the GNOME keyring through secretspec (run `secretspec set NTFY_TOKEN --provider keyring` in `~/.config/ntfy`).
    - `/var/lib/sbctl` — Secure Boot keys (`pallidus`, created with `sbctl`).

!!! tip "Adding a new host"
    To add a machine (e.g. `orion`): copy the closest existing host folder (`pallidus` for a desktop, `theseus` for a laptop), rename its per-host module attributes (`<old>Configuration/Home/Hardware` → `<new>…`), set `flake.variables.<new>` and `slashyos.vars = self.variables.<new>;` in the host file, drop in the machine's real `hardware.nix`, `git add` the new files, then `sudo nixos-rebuild switch --flake .#<new>` on that machine. Thanks to the `slashyos` bundle, the new host file is ~20 lines. The bundle includes `commonHardware`, which assumes an AMD machine — for anything else, move that import into the AMD hosts.

## Inputs & credits

| Input | Used for |
| ----- | -------- |
| [nixpkgs](https://github.com/nixos/nixpkgs) (`nixos-26.05`) | Package set |
| [flake-parts](https://github.com/hercules-ci/flake-parts) | Modular flake composition |
| [import-tree](https://github.com/vic/import-tree) | Auto-import of `modules/` |
| [nix-wrapper-modules](https://github.com/BirdeeHub/nix-wrapper-modules) | Declarative wrapping of niri, Noctalia, kitty, btop, git and fastfetch |
| [nixos-hardware](https://github.com/NixOS/nixos-hardware) | Framework laptop tuning (`theseus`) |
| [lanzaboote](https://github.com/nix-community/lanzaboote) | Secure Boot (`pallidus`) |
| [stylix](https://github.com/nix-community/stylix) (`release-26.05`) | System-wide theming |
| [home-manager](https://github.com/nix-community/home-manager) (`release-26.05`) | User-level config |
| [nvf](https://github.com/notashelf/nvf) | Declarative Neovim |
| [nix-flatpak](https://github.com/gmodena/nix-flatpak) | Declarative Flatpaks |
| [zen-browser-flake](https://github.com/0xc000022070/zen-browser-flake) | Zen Browser (not yet in nixpkgs) |
| [rycee/firefox-addons](https://nur.nix-community.org/repos/rycee/) | Store-pinned browser extensions |
| [wallpapers](https://gitlab.com/nixos-projects/wallpapers) | Wallpaper collection (`flake = false`) |
