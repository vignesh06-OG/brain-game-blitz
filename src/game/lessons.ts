/**
 * ONE takeaway per level.
 *
 * The victory card is not a textbook: each level closes with a single named
 * concept, one accurate sentence about it, and — only where the history is
 * genuinely attributable — who established it. Where a result has no honest
 * single author, the attribution is omitted rather than invented.
 */
export interface Lesson {
  concept: string;
  statement: string;
  /** Omitted when no single, verifiable attribution exists. */
  discoveredBy?: string;
}

const REFLECTION: Lesson = {
  concept: "Reflection",
  statement:
    "A ray leaves a mirror at the same angle it arrived, both measured from the line perpendicular to the surface.",
  discoveredBy: "Hero of Alexandria (1st c.), explained optically by Ibn al-Haytham (c. 1021)",
};

export const LESSONS: Record<string, Lesson> = {
  "1-1": REFLECTION,
  "1-2": {
    concept: "Law of reflection",
    statement:
      "The incoming ray, the reflected ray and the surface normal all lie in one plane — reflection never twists light out of its own plane.",
    discoveredBy: "Ibn al-Haytham, Book of Optics (c. 1021)",
  },
  "1-3": {
    concept: "Path reasoning",
    statement:
      "A beam's route is a chain: changing one element changes everything downstream of it, and nothing upstream.",
  },
  "2-1": {
    concept: "Partial transmission",
    statement:
      "A partly reflecting surface sends some light onward and reflects the rest, dividing the energy between two paths.",
    discoveredBy: "Quantified by Augustin-Jean Fresnel (1820s)",
  },
  "2-2": {
    concept: "Selective absorption",
    statement:
      "A colour filter transmits its own band and absorbs the rest. It can only remove light from a beam, never add to it.",
  },
  "2-3": {
    concept: "Dispersion",
    statement:
      "Refractive index depends on wavelength, so a prism sends each colour of white light off in a slightly different direction.",
    discoveredBy: "Isaac Newton's prism experiments (1660s)",
  },
  "3-1": {
    concept: "Additive colour mixing",
    statement:
      "Overlapping beams add: red and green make yellow, and all three primaries together make white.",
    discoveredBy: "Thomas Young (1801) and James Clerk Maxwell (1855–61)",
  },
  "3-2": {
    concept: "Additive colour mixing",
    statement: "Green and blue light landing together read as cyan — no pigment is involved.",
    discoveredBy: "James Clerk Maxwell (1855–61)",
  },
  "3-3": {
    concept: "Spectral order",
    statement:
      "Shorter wavelengths refract more, so violet always bends further than red through the same glass.",
    discoveredBy: "Isaac Newton (1660s)",
  },
  "4-1": {
    concept: "Total internal reflection",
    statement:
      "Beyond the critical angle, light meeting a less dense medium is reflected entirely — none of it escapes.",
    discoveredBy: "Demonstrated in guided water jets by Daniel Colladon (1842)",
  },
  "4-2": {
    concept: "Recombination",
    statement:
      "The colours split out of white light can be brought back together, and they reconstitute white.",
    discoveredBy: "Isaac Newton's second prism experiment (1660s)",
  },
  "4-3": {
    concept: "Colour channels as logic",
    statement:
      "Additive light behaves like an OR over red, green and blue: a channel is present if any beam supplies it.",
  },
  "5-1": {
    concept: "Optical reciprocity",
    statement:
      "Light paths run both ways. A device that splits one beam into several will combine those beams if you send them back along the same routes.",
    discoveredBy: "Hermann von Helmholtz (1856)",
  },
};


/**
 * Expansion lessons. Every statement below describes an effect that Prism's
 * tracer genuinely models, and attribution is given only where the history is
 * unambiguous — otherwise it is left out rather than invented.
 */
const EXPANSION_LESSONS: Record<string, Lesson> = {
  "1-4": {
    concept: "Rectilinear propagation",
    statement:
      "Between surfaces light does not curve: every stretch of a beam is a straight line, so a route is just a sequence of straight runs.",
    discoveredBy: "Euclid, Optica (c. 300 BCE)",
  },
  "1-5": REFLECTION,
  "1-6": {
    concept: "Angle of incidence",
    statement:
      "A 45-degree surface turns a beam through a right angle — which is why optical benches are built on square grids.",
  },
  "1-7": {
    concept: "Optical path",
    statement:
      "A multi-mirror route is one continuous optical path; its total length is the sum of its straight segments.",
  },
  "1-8": {
    concept: "Beam steering",
    statement:
      "Adding a mirror does not create light — it only redirects light that was already passing that point.",
  },
  "2-4": {
    concept: "Selective absorption",
    statement:
      "A filter passes its own band and absorbs the rest, so each branch of a split can be given a different colour.",
  },
  "2-5": {
    concept: "Dispersion",
    statement:
      "A prism deflects each wavelength by a different amount, fanning white light into its components.",
    discoveredBy: "Isaac Newton (1660s)",
  },
  "2-6": {
    concept: "Partial transmission",
    statement:
      "A beamsplitter divides incoming energy between a transmitted and a reflected path instead of choosing one.",
    discoveredBy: "Quantified by Augustin-Jean Fresnel (1820s)",
  },
  "2-7": {
    concept: "Degenerate solutions",
    statement:
      "Different optical layouts can deliver identical light to the same detector — the measurement cannot tell them apart.",
  },
  "2-8": {
    concept: "Subtractive colour",
    statement:
      "Filters only remove. Once a channel has been absorbed, nothing downstream can restore it.",
  },
  "2-9": {
    concept: "Spectral order",
    statement:
      "Dispersion sorts a beam by wavelength in a fixed order, so each component leaves on its own predictable path.",
    discoveredBy: "Isaac Newton (1660s)",
  },
  "3-4": {
    concept: "Equivalent optical paths",
    statement:
      "Two arrangements that deliver the same channel to the same point are optically equivalent, however different they look.",
  },
  "3-5": {
    concept: "Independent sources",
    statement:
      "Light from separate sources does not interact in transit — each beam propagates as if the other were not there.",
  },
  "3-6": {
    concept: "Shared optical elements",
    statement:
      "An element on a shared stretch of path affects every downstream branch at once — you cannot tune one without the others.",
  },
  "3-7": {
    concept: "Channel bookkeeping",
    statement:
      "A detector responds to the channels that actually arrive, so each colour obligation has to be tracked separately.",
  },
  "3-8": {
    concept: "Path dependency",
    statement:
      "Downstream optics inherit whatever upstream optics produced; the order of elements along a beam is part of the design.",
  },
  "3-9": {
    concept: "Parallel beam paths",
    statement:
      "Two routes can cross without exchanging energy — beams pass through one another undisturbed.",
  },
  "4-4": {
    concept: "Element placement",
    statement:
      "In real alignment, where a component sits matters more than how it is angled: position fixes the geometry, angle only finishes it.",
  },
  "4-5": {
    concept: "Minimal alignment",
    statement:
      "An optical setup has a minimum number of adjustments; extra ones move the system away from alignment, not towards it.",
  },
  "4-6": {
    concept: "Degrees of freedom",
    statement:
      "Each adjustable element adds one degree of freedom, and a well-posed alignment problem has exactly as many as it needs.",
  },
  "4-7": {
    concept: "Alignment order",
    statement:
      "Benches are aligned from the source outwards, because every adjustment invalidates the ones downstream of it.",
  },
  "4-8": {
    concept: "Constrained routing",
    statement:
      "When one branch has fewer possible routes than the other, it fixes the shared geometry for both.",
  },
  "4-9": {
    concept: "Optimality",
    statement:
      "The shortest solution is a property of the layout, not of the player — the same board always has the same minimum.",
  },
  "5-2": {
    concept: "Detector selectivity",
    statement:
      "A colour-selective detector ignores light of any other channel, so reaching it is not the same as satisfying it.",
  },
  "5-3": {
    concept: "Irreversible separation",
    statement:
      "A single dispersed branch carries only its own component; no downstream element can turn it back into white on its own.",
  },
  "5-4": {
    concept: "Backward ray tracing",
    statement:
      "Optical designers routinely trace rays from the detector back to the source — the geometry is the same in either direction.",
  },
  "5-5": {
    concept: "Source assignment",
    statement:
      "When two sources each reach only part of a system, the assignment of source to detector is fixed before any alignment begins.",
  },
  "5-6": {
    concept: "Path length versus complexity",
    statement:
      "A longer optical path is not a more complex one; complexity comes from the number of elements it has to satisfy.",
  },
  "6-1": {
    concept: "Additive colour mixing",
    statement:
      "Stage lighting mixes light, not pigment: overlapping red and green lamps read as yellow on the same surface.",
    discoveredBy: "Thomas Young (1801) and James Clerk Maxwell (1855-61)",
  },
  "6-2": {
    concept: "Spectroscopy",
    statement:
      "A spectrometer disperses light first and measures each component separately — separation always precedes measurement.",
    discoveredBy: "Joseph von Fraunhofer (1814)",
  },
  "6-3": {
    concept: "Independent sightlines",
    statement:
      "Two beacons on one coastline are aimed independently; neither can supply the other's sightline.",
  },
  "6-4": {
    concept: "Channel separation",
    statement:
      "Optical fibre links keep channels apart end to end, because a detector reads whatever mixture actually arrives.",
  },
  "6-5": {
    concept: "Line of sight",
    statement:
      "Optical surveying depends on an unobstructed straight line; obstacles are routed around, never through.",
  },
  "6-6": {
    concept: "Divided beams",
    statement:
      "An interferometer sends one source down two arms with a single splitter, so both arms carry light from the same beam.",
    discoveredBy: "Albert A. Michelson (1881)",
  },
  "7-1": {
    concept: "Full dispersion",
    statement:
      "Every component of a dispersed beam needs its own route; the fan does not steer itself.",
  },
  "7-2": {
    concept: "Simultaneous constraints",
    statement:
      "A system with several independent requirements has to be designed as a whole, not satisfied one requirement at a time.",
  },
  "7-3": {
    concept: "Shared upstream optics",
    statement:
      "Everything before the split is common cost: fixing it correctly is worth more than tuning either branch.",
  },
  "7-4": {
    concept: "Binding constraint",
    statement:
      "The hardest-to-reach detector determines the geometry of the whole layout.",
  },
  "7-5": {
    concept: "Spectral routing",
    statement:
      "Dispersion produces fixed, predictable directions — the design problem is delivery, not separation.",
  },
  "7-6": {
    concept: "Multi-source systems",
    statement:
      "Real benches often run several sources at once; each keeps its own path and its own budget of adjustments.",
  },
  "7-7": {
    concept: "Long optical paths",
    statement:
      "Folding a long path into a small bench is standard practice — mirrors buy length without buying space.",
  },
  "7-8": {
    concept: "Optical system design",
    statement:
      "A complete system combines separation, routing and detection, and every element has to serve the requirement at the end of the chain.",
  },
};

export const getLesson = (levelId: string): Lesson | undefined =>
  LESSONS[levelId] ?? EXPANSION_LESSONS[levelId];
