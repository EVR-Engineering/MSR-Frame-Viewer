# MSR Frame Deflection Viewer

An interactive 3D visualization tool for analyzing and comparing geometric displacement measurements of a Mobile Showroom (MSR).

The viewer displays the original frame geometry alongside its measured, deformed configuration. Displacements are visualized using a color gradient, making it easier to identify bending, torsion, and other geometric changes during deployment.

**[Launch the MSR Frame Deflection Viewer](https://whuisman-evr.github.io/MSR-Frame-Viewer/)**

## Features

- Interactive 3D visualization of the MSR frame.
- Comparison between the original and deformed geometry.
- Color-coded displacement magnitude in millimeters.
- Adjustable deformation amplification (1×–200×).
- Selection between different deployment states.
- Smooth visualization of deformation along connected beams.
- Excel workbook import for custom measurements.
- PNG export of the current visualization.
- Runs directly in a web browser without installing software.

## Getting Started

### 1. Open the Viewer

Open the [MSR Frame Deflection Viewer](https://whuisman-evr.github.io/MSR-Frame-Viewer/) in your browser.

The viewer initially loads a demonstration dataset to illustrate its functionality.

### 2. Load Your Own Measurements

To visualize your measurements:

1. Prepare an Excel workbook using the required structure described below.
2. Save the workbook as an `.xlsx` file.
3. Open the viewer and select the option to upload an Excel workbook.
4. Select your workbook from your computer.
5. The viewer loads the frame geometry and available deployment states.

**Data privacy:** Uploaded workbooks are processed locally in your browser and are not sent to a server by the viewer.

### 3. Explore the 3D Model

Use your mouse to rotate and inspect the structure.

Select a deployment state to display its measured deformation relative to the reference geometry.

Adjust the deformation amplification to make small displacements easier to see.

## Excel Workbook Format

The viewer expects an Excel workbook containing the following worksheets.

### `Point_Coordinates`

Defines the original coordinates of the measurement points.

| Column | Content |
|---|---|
| A | Point ID |
| B | X coordinate |
| C | Y coordinate |
| D | Z coordinate |

Headers are located in row 1, with data starting in row 2.

All coordinates must be numeric and use a consistent unit system.

The coordinate convention is:

- **X:** Transverse direction
- **Y:** Vertical direction
- **Z:** Longitudinal direction

### `Beam_Connections`

Defines the structural connections between measurement points.

| Column | Content |
|---|---|
| A | Beam ID |
| B | Start point ID |
| C | End point ID |
| D | Beam axis (X, Y or Z) |

Headers are located in row 1, with data starting in row 2.

Every referenced point must exist in `Point_Coordinates`.

These connections determine which points are joined in the 3D visualization.

### `Reference_Measurements`

Contains the reference laser-distance measurements recorded in the initial configuration.

This worksheet is part of the measurement workbook but is not used directly for rendering the 3D model.

The viewer uses the calculated displacement values stored in the deployment-state worksheets.

### Deployment-State Worksheets

Each deployment state has its own worksheet.

Worksheet names may be chosen freely, provided the following layout is maintained:

| Cell / Column | Content |
|---|---|
| A1 | `Deployment State` |
| C1 | Name of the deployment state |
| A3 downward | Point IDs |
| E3 downward | X displacement (ΔX) |
| I3 downward | Y displacement (ΔY) |
| M3 downward | Z displacement (ΔZ) |

Column headers are located in row 2, with measurement data starting in row 3.

Displacements must be expressed in millimeters and follow the global XYZ coordinate system.

The viewer automatically identifies worksheets marked `Deployment State` in cell A1.

The `State_Deflection_Template` worksheet, if present, is not displayed as a deployment state.

**Important:** If your workbook contains Excel formulas, open and save it in Excel before uploading. The viewer requires calculated numeric results rather than formulas without stored results.

## Understanding the Visualization

### Reference and Deformed Geometry

The visualization displays two configurations:

- **Grey structure:** Original frame geometry from `Point_Coordinates`.
- **Colored structure:** Deformed geometry calculated from the selected deployment state's displacement values.

The position of each deformed measurement point is calculated as:

\[
\mathbf{P}_{\mathrm{deformed}} =
\mathbf{P}_{\mathrm{reference}} +
f\,\Delta\mathbf{u}
\]

Where:

- \(\mathbf{P}_{\mathrm{reference}}\) is the original point position.
- \(\Delta\mathbf{u}\) is the measured displacement vector.
- \(f\) is the user-selected deformation amplification factor.

### Displacement Magnitude

The color gradient represents the total displacement magnitude:

\[
\|\Delta\mathbf{u}\| =
\sqrt{\Delta X^2+\Delta Y^2+\Delta Z^2}
\]

The displacement magnitude is expressed in millimeters.

The color scale represents the measured displacement magnitude, not the amplified displacement displayed on screen.

### Deformation Amplification

The deformation factor exaggerates the displayed movement to make small geometric changes visible.

For example, a measured displacement of 2 mm displayed with an amplification factor of 50× appears as a 100 mm displacement in the 3D visualization.

**Amplification only affects the visualization. It does not modify the measurement data.**

### Comparing Deployment States

For meaningful visual comparison between different deployment states:

- Use the same deformation amplification factor.
- Use identical minimum and maximum values for the color scale.
- Keep the camera orientation consistent.
- Compare measured displacement values rather than relying solely on visual appearance.

A fixed color scale ensures that the same color represents the same displacement magnitude in every image.

## Exporting Images

Use the viewer's PNG export function to save the current 3D visualization.

Before exporting, select the desired deployment state, deformation factor, color range and camera orientation.

Images can be used in technical reports, presentations and comparisons between deployment configurations.

## Important Limitations

The viewer provides a visual representation of measured geometric displacement. It is not a finite element analysis (FEA) tool.

- Deformation between measurement points is interpolated.
- Interpolated curves do not represent additional measured data.
- Local deformation between measurement locations may not be captured.
- The visualization does not calculate stress, strain, or structural safety.
- Measurement uncertainty, including possible errors caused by laser misalignment and frame rotation, must be considered when interpreting results.

The viewer is intended to support experimental analysis and comparison of MSR deployment configurations.

## Technologies

- HTML, CSS and JavaScript
- Plotly.js for interactive 3D visualization
- Browser-based Excel workbook processing
- GitHub Pages for website hosting

No Python installation or Streamlit server is required.

## Project

**MSR Frame Deflection Viewer**

Developed for visualizing and analyzing experimental geometric displacement measurements of a Mobile Showroom.
