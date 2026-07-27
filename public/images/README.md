# Project image plan

Project records intentionally keep `thumbnail` and `thumbnailAlt` as `null`
until real media is available. The category artwork remains the fallback, so
missing photography never creates a broken card.

## Export sizes

- Cover: `2400 × 1600 px` landscape AVIF or WebP. Keep the subject inside the
  central 70% because the same file is cropped differently on cards, desktop
  heroes and narrow screens.
- Detail photograph or render: `1800 × 1200 px` landscape, or
  `1600 × 2000 px` when a portrait view explains the object better.
- Interface screenshot: native resolution where possible, at least `1600 px`
  wide. Export lossless WebP or PNG when text must remain sharp.
- Diagram or plot: prefer SVG; otherwise export PNG at least `1800 px` wide.

Store each set in `projects/<project-slug>/` and reference it from
`src/content/projects.json` using paths beginning `/images/projects/`.
Use descriptive filenames, reserve stable dimensions and write alt text for
every informative image.

## Recommended coverage

Each count includes one cover image. Digital-only projects should use clean
renders or screenshots instead of pretending a physical prototype exists.

| Project                            | Total | Cover subject                                        | Additional subjects                                                                                      |
| ---------------------------------- | ----: | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Dual Laser Triangulator            |     5 | Assembled optical module at a three-quarter angle    | PCB close-up; camera and laser geometry; two lines on a target; resulting surface profile                |
| Gigaplex                           |     5 | Finished console in hand with recognisable pixel art | PCB front; PCB back; controls and keychain scale; one game running                                       |
| Code-Less Dice                     |     4 | Lit final die showing one face                       | Circuit board; vibration-switch close-up; six-state roll sequence                                        |
| Lumen PnP Feeders                  |     4 | 8, 12, 16 and 24 mm feeder designs together          | Shared electronics; wider tape path; feeders fitted to the machine                                       |
| Filament Scale                     |     5 | Complete scale with a labelled spool                 | Load-cell mechanism; NFC interaction; device UI; Spoolman or logging view                                |
| Smart Reflow Oven                  |     4 | Finished oven and controller                         | PT100 placement; control electronics; measured reflow profile plot                                       |
| Chroma Klipper                     |     3 | Printer or control screen during a colour job        | Integration architecture; synchronised command or diagnostic view                                        |
| Chroma Slicer                      |     5 | Textured model visible in the slicer                 | UV import; colour-aware surface view; layer raster; generated output preview                             |
| ChromaDye                          |     5 | Cartridge and driver electronics on the test rig     | PCB detail; parallel waveform capture; nozzle test; printer integration                                  |
| Game Vault                         |     4 | Two players in one cooperative room                  | Lobby or room browser; active session; self-hosting deployment view                                      |
| Parametric EPaper Dashboard        |     4 | Complete generated dashboard image                   | JSON configuration; calendar module; weather module and composition layers                               |
| Lucid Gloves Alternate Battery PCB |     5 | Three board revisions arranged in order              | PH version; SH version; charging version; final board installed                                          |
| Box Turtle AFC BTIO                |     3 | Finished connector board                             | Connector routing close-up; board installed in the AFC                                                   |
| ESP32 Lamp                         |     6 | Complete tower-crane lamp in its workspace           | Mainboard; touch daughterboard; PCB rail contact; moving carriage; 2500 K and 6500 K lighting comparison |
| NFC Reader                         |     3 | Reader scanning a tag                                | PCB or enclosure; UID appearing in a text field                                                          |
| Custom Tool Changer                |     6 | Full printer with all five tools visible             | Tool lineup; latch and pins; docking sequence; CAN electronics; multi-material print                     |
| EPaper Calendar                    |     5 | Finished tri-colour calendar display                 | Original board; redesigned board; browser upload page; close view of the black/red/white panel           |
| Digital Signage                    |     5 | Several screens showing one managed campaign         | Admin interface; timed image queue; video playback; Ubuntu server or network overview                    |
| Tide Bound                         |     4 | Wide view of the generated island                    | Procedural forest; fishing interaction; rod-upgrade interface                                            |
| Celestial Feasts                   |     4 | Player and pizza station on the space dome           | Ingredient collection; pizza production; rocket escape objective                                         |
| Raspberry Pi Hologram              |     4 | Illuminated prism illusion in a dark setting         | Breakout PCB; display without prism; Raspberry Pi Zero and RTC assembly                                  |
| Automatic Chess Robot              |     4 | Clean CAD render of the complete concept             | Movement mechanism; reed-switch grid; path-planning or simulation view                                   |

Recommended complete set: **97 images**.
