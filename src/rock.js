'use strict';
/* Orbit · src/rock.js
   Era I, The Rock: torchlit limestone, and every mark on it struck by a hand rather than printed. */
// This era is not a colourway of the atlas and it does not take the atlas's whole frame away either.
// It registers a hand — a small set of painters, named in `defineHand` below — and the pipeline in
// frame.js reaches for each of them by name where it would otherwise have drawn the atlas's own. What
// this file does not name, the atlas still draws, which is the difference between an era and a
// sandbox: two hands can work into one frame, and the next century is another row in that registry
// rather than another question asked at every mark.
//
// See docs/eras/01-rock.md for what the era is, and docs/eras/PROTOTYPES.md for what its readability
// spike proved. The spike is the porting source for the language on this sheet; none of its physics
// comes with it, because the simulation is and stays OrbitWorld.

// ---------- The pigments ----------
// The whole palette this era has, and it is short by two on purpose. There is no gold — the reddest
// ochre stands in, and is spent as sparingly as gold ever was — and there is no blue at all, so what
// the atlas says in blue this era says in its black. Charcoal and manganese are both here and are
// never mixed on one panel, exactly as a real one never mixes them: charcoal is the warmer line,
// manganese the cooler, and each panel is worked in one of them.
definePlate('rock',{
  night:{redOchre:'156,59,34',ochre:'201,150,46',ochreDeep:'169,112,31',manganese:'33,31,30',charcoal:'44,38,34',
    kaolin:'234,225,207',ember:'255,201,122',emberCore:'255,247,225',flare:'228,90,32',
    stone:'158,143,118',shaft:'4,3,3',dark:'2,2,2'},
  paper:{redOchre:'156,59,34',ochre:'201,150,46',ochreDeep:'169,112,31',manganese:'33,31,30',charcoal:'44,38,34',
    kaolin:'234,225,207',ember:'255,201,122',emberCore:'255,247,225',flare:'228,90,32',
    stone:'158,143,118',shaft:'4,3,3',dark:'2,2,2'}
});
