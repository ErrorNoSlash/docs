# SlashyOS

A personal, **multi-host** NixOS configuration spanning an AMD desktop and a Framework laptop. It's built with [`flake-parts`](https://flake.parts/) and [`import-tree`](https://github.com/vic/import-tree), so every `.nix` file under `modules/` is auto-imported — no manual wiring, just drop a file in and it's part of the flake.

Both machines run [**niri**](https://github.com/YaLTeR/niri) (a scrollable-tiling Wayland compositor) with the [**Noctalia**](https://github.com/noctalia-dev/noctalia-shell) shell, both wrapped declaratively via [`nix-wrapper-modules`](https://github.com/BirdeeHub/nix-wrapper-modules) instead of imperative dotfiles, and are themed system-wide by [**Stylix**](https://github.com/nix-community/stylix) — from the boot splash to the TTY to every app.

Shared configuration is written **once**: a `slashyos` base bundle pulls in everything common (system *and* home-manager level), and each host adds only its hardware, bootloader, and a handful of per-host values. Adding an app to both machines is a one-line change.

!!! info "Repository"
    Source lives at [REPO_URL](REPO_URL) · NixOS 26.05 · 2 hosts

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
|-|-|-|
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
|:-:|-|
| 🟢 | Enabled / active |
| 🛠️ | Declaratively wrapped via `nix-wrapper-modules` |
| 🔐 | Security-related (Secure Boot, etc.) |
| 🖥️ | Desktop-only (`pallidus`) |
| 💻 | Laptop-only (`theseus`) |

## Hosts

| Host | Platform | Machine | Bootloader | Keyboard | Notes |
|-|:-:|-|-|:-:|-|
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
|-|-|
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

- 🟢 [**Stylix**](https://github.com/nix-community/stylix) drives system-wide theming — colors, fonts, and icons — from each host's wallpaper (`polarity = "dark"`).
- Covers **everything**: apps, `btop`, the Plymouth boot splash, and the TTY console, so the whole boot-to-desktop journey shares one palette per host.
- Papirus icon theme (dark), 80% terminal/application opacity.

## Boot & security

**Shared**

- 🟢 **Plymouth** — Stylix-generated boot splash (wallpaper-derived background, logo, spinner) with silent boot: quiet kernel params, hidden initrd logs.
- 🟢 **SDDM** — Wayland session via the `kwin` compositor, `sddm-astronaut-theme` (left-aligned form, per-host greyscale background, `Electroharmonix` font).

**pallidus** 🖥️

- 🟢🔐 [**Lanzaboote**](https://github.com/nix-community/lanzaboote) — Secure Boot with a signed kernel/bootloader; `sbctl` included for key management (keys live on the machine, not in the repo).
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
|-|-|
| `fr` | `nh os switch` |
| `fu` | `nix flake update` (on this flake) |

**Formatting** — the flake exposes `nixfmt-tree` as its formatter; `nix fmt` from the repo root formats the whole tree.

## Dev shells

Defined in `modules/devshells/devshells.nix` as flake outputs, pinned to the same `nixpkgs` as the system:

| Shell | Provides |
|-|-|
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
|-|-|
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
|-|-|
| [nixpkgs](https://github.com/nixos/nixpkgs) (`nixos-26.05`) | Package set |
| [flake-parts](https://github.com/hercules-ci/flake-parts) | Modular flake composition |
| [import-tree](https://github.com/vic/import-tree) | Auto-import of `modules/` |
| [nix-wrapper-modules](https://github.com/BirdeeHub/nix-wrapper-modules) | Declarative niri & Noctalia wrapping |
| [nixos-hardware](https://github.com/NixOS/nixos-hardware) | Framework laptop tuning (`theseus`) |
| [lanzaboote](https://github.com/nix-community/lanzaboote) | Secure Boot (`pallidus`) |
| [stylix](https://github.com/nix-community/stylix) (`release-26.05`) | System-wide theming |
| [home-manager](https://github.com/nix-community/home-manager) (`release-26.05`) | User-level config |
| [nvf](https://github.com/notashelf/nvf) | Declarative Neovim |
