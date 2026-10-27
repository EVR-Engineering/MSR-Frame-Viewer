# MSR Frame Deflection Viewer — GitHub Pages

A browser-only conversion of the existing Streamlit-based Frame Deflection Viewer. **No Python or Streamlit server** runs on GitHub Pages. The existing Plotly 3D renderer, smooth beam interpolation, fixed grey reference geometry, X/Y/Z/total colour modes, scale factor, camera controls and PNG export have been retained.

## Publish

1. Create a GitHub repository, for example `msr-frame-viewer`.
2. Upload **all files in this folder** to the root of the repository (including `plotly.min.js`, `viewer-template.html`, `app.js`, `index.html`, and `demo-data.json`).
3. In **Settings → Pages**, set **Build and deployment → Deploy from a branch**, branch **main**, folder **/(root)**, then save.
4. Open `https://YOUR-USERNAME.github.io/msr-frame-viewer/` after GitHub Pages publishes it.

Use a public repository unless your GitHub account/organization supports Pages publishing from private repositories. **A Pages site may be publicly accessible even when its repository is private**: do not publish confidential measurement data as bundled demo data.

## Uploading workbooks

- `Point_Coordinates`: point IDs in column A, X/Y/Z in columns B/C/D, starting row 2.
- `Beam_Connections`: beam ID, start/end point IDs, Axis (X/Y/Z) in columns A/B/C/D, starting row 2.
- State worksheet: A1 = `Deployment State`, C1 = state label, IDs in A3 downward, **ΔX in E, ΔY in I, ΔZ in M**.
- `State_Deflection_Template` is excluded.
- Excel formulas are **not evaluated** by the browser reader; it reads the cached result last saved by Excel. **Recalculate and save** in Excel before uploading.

Workbook data is processed locally in the browser and is **not uploaded to GitHub or a server**. External SheetJS script is loaded from cdnjs; an internet connection is needed for Excel upload unless you vendor that JavaScript library locally. `plotly.min.js` is bundled locally.

For comparisons across scenarios, turn **Auto colours** off and choose the **same Range** (maximum displacement, mm) on every screenshot. Use the same *Colour* component, camera orientation and deformation factor too.

## Local development

Because `fetch` is used, open through a local static server instead of double-clicking `index.html`:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000/ . Python is needed **only for this optional local development server**, not for GitHub Pages visitors.

## Technical notes

- Original JS renderer extracted from the existing Windows build's embedded Streamlit HTML component.
- Browser-side workbook parsing reproduces the columns/validation of the Python `excel_loader.py`.
- The original Streamlit editable data tables are not included; edit the master workbook in Excel and reload it.
- The external SheetJS CDN script should be pinned/hosted locally if offline use or long-term dependency stability is essential.
- GitHub Pages is a static public-facing host, not an authentication/authorization system.
