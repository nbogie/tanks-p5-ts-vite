# Tanks from openprocessing

This is a typescript version of my tanks sketch from openprocessing:
https://openprocessing.org/sketch/1981561
It is configured to use a Vite dev server.

In turn, the code was built on a sketch by Tom Owen, to demonstrate some further possibilities for the work:
https://openprocessing.org/sketch/1981232

I chose vite because my older parcer 2 starter for p5.js with TypeScript wouldn't allow loading either p5.sound OR tone.js. The vite version allows me to load tone.js.

### Stuff added:

-   infinite scroll
-   explosion on projectile impact (ground or tank), including bouncing particles which pay attention to the slope of the ground at that position
-   projectile flight audio (no explosion audio) with tone.js (was p5.sound)
-   barrel angle is affected by tank body rotation
-   show white sprite for some time after impact
-   cam shake
-   projectiles rotate in direction of movement
-   toggle transmit tank data on/off with t
-   dirt particles
-   gradient sky
-   cloud particles
    -   reflect flash of nearby tank-hits
    -   have a reflection according to sky colours
-   add a weapon system which limits fire rate and ammo (slow regen by default)
-   stars in the dark part of the sky
-   supply crates (that do nothing once shot open and collected!)
-   minimap
-   projectile kinds (initially: drunk & normal, eventually homing, though anything that's not deterministic from launch is currently problematic without network updates)
-   add rainbow-trail projectile. (eventually will heal what it passes over.)
-   added FBM for the terrain rather than a single perlin noise layer - optional with 'b'. It's not better for gameplay.
-   parallax clouds

minor additions:

-   alpha tint on the projectile arrow
-   centre projectile arrow rotation pivot correctly
-   fire from _outside_ of tank
-   Don't store image in tank as tank is transmitted. just index of tank image in array.
-   draw ground where ground level is!
-   group (non-tank) images into one images lookup dictionary

### TODO:

-   Rainbow projectile should heal what it passes over, and/or AoE splash healing on impact (for team, at least)
-   firing recoil
-   impacts jostle the recipient tank
-   parallax distant hills
-   arrows pointing in direction of other tank(s) when they're offscreen

### Credits

-   Tom Owen wrote the original tanks game code on openprocessing: https://openprocessing.org/sketch/1981232
-   Assets from kenney.nl (CC0 license)
    -   https://www.kenney.nl/assets/tanks
    -   https://www.kenney.nl/assets/shooting-gallery
