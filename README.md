<div align="center">

# 📚 docs

**Personal documentation hub** — live at **[docs.errornoslash.be](https://docs.errornoslash.be)**

Project write-ups that outgrow their READMEs end up here.

</div>

---

## What's inside

| Section | Description |
|-|-|
| [Welcome](https://docs.errornoslash.be) | Landing page and project index |
| [SlashyOS](https://docs.errornoslash.be/slashyos/) | My multi-host NixOS flake configuration |

More sections land here as projects mature.

## Stack

- [**Zensical**](https://zensical.org) — static site generator from the Material for MkDocs team
- **GitHub Actions** → **GitHub Pages** — every push to `main` rebuilds and deploys automatically
- **Cloudflare DNS** — `docs.errornoslash.be` → GitHub Pages

## Working locally

Content is markdown in [`docs/`](docs/), configuration in [`zensical.toml`](zensical.toml).

```fish
# dev shell (uv + python) comes from my SlashyOS flake
nix develop ~/SlashyOS#docs

# live preview at http://localhost:8000
uvx zensical serve
```

Edit, check the preview, commit, push — the site updates itself.

## Structure

```
├── zensical.toml              # site config, theme, palette
├── .github/workflows/docs.yml # build & deploy pipeline
└── docs/
    ├── index.md               # welcome page
    ├── slashyos.md            # SlashyOS documentation
    └── assets/                # logo, favicon
```
