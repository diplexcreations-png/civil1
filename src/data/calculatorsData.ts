import { CalculatorDef, CalculatorCategory } from '../types';

export const CALCULATORS_LIST: CalculatorDef[] = [
  // Concrete
  {
    id: 'concrete-volume',
    name: 'Concrete Volume Estimator',
    category: 'concrete',
    description: 'Computes total materials (cement bags, sand weight, aggregate weight) and structural concrete costs with customizable shrinkage/waste offsets.',
    iconName: 'Layers',
    trending: true,
    featured: true,
  },
  // Structural
  {
    id: 'structural-beam',
    name: 'Beam Uniform/Point Load Analyst',
    category: 'structural',
    description: 'Calculates structural beam critical moments, shearing load thresholds, extreme deflection profiles, and serviceability (L/240) criteria limits.',
    iconName: 'GitCommit',
    trending: true,
    featured: true,
  },
  {
    id: 'structural-column',
    name: 'Short Concrete Column Design (ACI 318)',
    category: 'structural',
    description: 'Calculates the nominal axial load capacity (Pn) and factored design capacity (φPn) for rectangular and tied reinforced concrete short columns.',
    iconName: 'Grid',
    trending: false,
    featured: true,
  },
  {
    id: 'structural-slab',
    name: 'Slab Deflection Thickness Estimator',
    category: 'structural',
    description: 'Determines the minimum recommended slab height required for deflection limits under various boundary support arrangements according to ACI codes.',
    iconName: 'Server',
    trending: false,
    featured: false,
  },
  // Surveying
  {
    id: 'survey-hi',
    name: 'Surveying Height of Instrument Solver',
    category: 'survey',
    description: 'Solves leveling networks by evaluating the primary Heights of Instrument (HI) and Reduced Levels (RL) of target stations using backsights and foresights.',
    iconName: 'Compass',
    trending: true,
    featured: true,
  },
  {
    id: 'survey-coordinate',
    name: 'Surveying Coordinate Traverse Compass',
    category: 'survey',
    description: 'Calculates the bearing, horizontal distance, and 3D coordinates (Northing, Easting, Elevation) of surveying stations with closure checks.',
    iconName: 'Anchor',
    trending: true,
    featured: true,
  },
  {
    id: 'steel-calculator',
    name: 'Steel Section Weight Estimator',
    category: 'structural',
    description: 'Computes total weight, volume, and surface area of structural steel files (plates, Beams, Round Bars, Hollow Pipes) using density standards.',
    iconName: 'GitCommit',
    trending: true,
    featured: true,
  },
  {
    id: 'rebar-calculator',
    name: 'Reinforcing Rebar Quantity Calculator',
    category: 'concrete',
    description: 'Calculates the total rebar segment counts, unit weights, overlap margins, total rebar lengths, and concrete element spacing structures.',
    iconName: 'Grid',
    trending: true,
    featured: true,
  },
  {
    id: 'brick-calculator',
    name: 'Brick & Wall Mortar Estimator',
    category: 'concrete',
    description: 'Determines the number of bricks required, mortar cubic volume, and dry constituent quantities (sand, cement) for brick wall constructions.',
    iconName: 'Layers',
    trending: true,
    featured: true,
  },
  // Utilities
  {
    id: 'utility-convert',
    name: 'Engineering Unit Converter',
    category: 'utility',
    description: 'Easily converts professional measurements including length, volumetric structures, loading force, and soil pressures.',
    iconName: 'RefreshCw',
    trending: true,
    featured: false,
  },
  // BBS Category Modules
  {
    id: 'bbs-footing',
    name: 'Complete Footing BBS Solver',
    category: 'bbs',
    description: 'Bar Bending Schedule for isolated pad or sloped concrete footings, compiling steel schedules and cutting lengths.',
    iconName: 'Clipboard',
    trending: true,
    featured: true
  },
  {
    id: 'bbs-foundation',
    name: 'Foundation Mesh BBS Estimator',
    category: 'bbs',
    description: 'Computes multi-mesh bottom and top foundation reinforcement quantities with structural development hooks.',
    iconName: 'Clipboard',
    trending: false,
    featured: true
  },
  {
    id: 'bbs-column',
    name: 'Reinforced Column BBS Planner',
    category: 'bbs',
    description: 'Coordinates longitudinal main bars, floor laps, and transverse stirrup/tie schedules for columns.',
    iconName: 'Clipboard',
    trending: true,
    featured: true
  },
  {
    id: 'bbs-beam',
    name: 'Structural Beam BBS Designer',
    category: 'bbs',
    description: 'Generates detailed schedules for top hanger bars, bottom tensile reinforcements, stirrups, and side face bars.',
    iconName: 'Clipboard',
    trending: true,
    featured: true
  },
  {
    id: 'bbs-slab',
    name: 'One-Way / Two-Way Slab BBS Analyst',
    category: 'bbs',
    description: 'Calculates structural slab rebar mats, main bent-up crank curves, distribution bars, and chair supports.',
    iconName: 'Clipboard',
    trending: true,
    featured: true
  },
  {
    id: 'bbs-stair',
    name: 'Staircase Waist Slab BBS Estimator',
    category: 'bbs',
    description: 'Computes waist slab, riser steps, landings, and main inclined rebar bar markings and bending tables.',
    iconName: 'Clipboard',
    trending: false,
    featured: false
  },
  {
    id: 'bbs-tie-beam',
    name: 'Tie Beam Reinforcement BBS Solver',
    category: 'bbs',
    description: 'Schedules tie beams connecting foundations, optimizing anchor hooks, stirrup spacings, and tension laps.',
    iconName: 'Clipboard',
    trending: false,
    featured: false
  },
  {
    id: 'bbs-plinth-beam',
    name: 'Plinth Beam BBS Planner',
    category: 'bbs',
    description: 'Detailed bar schedules for plinth beams supporting superstructure brickworks, resolving lap zones and shear ties.',
    iconName: 'Clipboard',
    trending: false,
    featured: false
  },
  {
    id: 'bbs-lintel-beam',
    name: 'Lintel Beam Door-Opening BBS',
    category: 'bbs',
    description: 'Calculates opening clear span reinforcements, bearing configurations, hangers, and shear links.',
    iconName: 'Clipboard',
    trending: false,
    featured: false
  },
  {
    id: 'bbs-retaining-wall',
    name: 'Cantilever Retaining Wall BBS',
    category: 'bbs',
    description: 'Structural stem, heel slab, toe slab vertical dowels, and horizontal spacing schedules.',
    iconName: 'Clipboard',
    trending: true,
    featured: false
  },
  {
    id: 'bbs-pedestal',
    name: 'Column Pedestal BBS Planner',
    category: 'bbs',
    description: 'Compiles foundation pedestals with vertical main dowels, starter lacing ties, and anchorage hook calculations.',
    iconName: 'Clipboard',
    trending: false,
    featured: false
  },
  {
    id: 'bbs-combined-footing',
    name: 'Combined Column Footing BBS',
    category: 'bbs',
    description: 'Coordinates heavy top longitudinal steel, bottom mesh spacing, and main lateral column ties for double column loads.',
    iconName: 'Clipboard',
    trending: true,
    featured: true
  },
  {
    id: 'bbs-raft-foundation',
    name: 'Heavy Raft Foundation BBS Solver',
    category: 'bbs',
    description: 'Handles complete continuous raft sheets, including top/bottom heavy mats, shear chairs, and side perimeter bars.',
    iconName: 'Clipboard',
    trending: true,
    featured: true
  },
  {
    id: 'bbs-strip-footing',
    name: 'Continuous Strip Footing BBS',
    category: 'bbs',
    description: 'Designs continuous wall footings, generating longitudinal ties, lateral wraps, and starter joint schedules.',
    iconName: 'Clipboard',
    trending: false,
    featured: false
  }
];

export interface FormulaReference {
  id: string;
  latex: string;
  explanation: string;
  steps: string[];
}

export const FORMULA_REFERENCES: Record<string, FormulaReference> = {
  'concrete-volume': {
    id: 'concrete-volume',
    latex: 'V_{total} = V_{raw} \\times (1 + \\frac{Waste\\%}{100})',
    explanation: 'Concrete Volume calculates the absolute three-dimensional space of structural casting and dry ingredients (cement, sand, aggregates) based on a dry shrinkage index of 1.54 multiplier.',
    steps: [
      'Raw Volume is computed: Length × Width × Thickness (depth).',
      'If Imperial, divide total cubic feet by 27 to obtain cubic yards.',
      'Waste margin is added to retrieve final concrete volume required.',
      'Dry material volume totals = Wet Vol × 1.54.',
      'Assuming M20 Grade (1:1.5:3, total parts = 5.5), Cement Bag content = Dry Vol / 5.5 × Density (1,440 kg/m³).'
    ]
  },
  'structural-beam': {
    id: 'structural-beam',
    latex: 'M_{max} = \\frac{w L^2}{8} \\quad , \\quad \\Delta_{max} = \\frac{5 w L^4}{384 E I}',
    explanation: 'Uniform loading bending mechanics determine maximum bending moments and shear load profiles. Servicability limits verify if elastic deflection exceeds span L/240 controls.',
    steps: [
      'Bending moment peaks at midspan: M_max = wL²/8 (UDL) or PL/4 (Point Load).',
      'Reaction Shear Force totals peak at boundaries: wL/2 or P/2.',
      'Structural deflection is evaluated from elastic modulus (E) and inertia (I).',
      'Deflection is validated against statutory safety margins.'
    ]
  },
  'structural-column': {
    id: 'structural-column',
    latex: 'P_n = 0.85 [0.85 f\'_c (A_g - A_{st}) + f_y A_{st}]',
    explanation: 'ACI 318 short column axial calculation covers steel reinforcement area contribution and core concrete compressive load carrying capacities.',
    steps: [
      'Gross Area Ag = Width × Depth.',
      'Total Longitudinal steel area Ast is summed from rebar counts.',
      'Steel percentage is checked against required bounds: 1% <= Rho <= 8%.',
      'Pn represents nominal maximum loading; design limits φPn add safety factors (0.65 × 0.80).'
    ]
  },
  'structural-slab': {
    id: 'structural-slab',
    latex: 'h_{min} = \\frac{L_{span}}{Factor} \\times [0.4 + \\frac{f_y}{700}]',
    explanation: 'Concrete slab thickness bounds are derived from boundary continuity to guarantee deflection control without calculating complex structural load paths.',
    steps: [
      'Spans and constraints set divisors: Simply supported (20), one end continuous (24), both ends (28), and cantilevers (10).',
      'Divisor is modified relative to reinforcing steel grades yields.',
      'Recommended specifications round values to standard dimensional forms.'
    ]
  },
  'survey-hi': {
    id: 'survey-hi',
    latex: 'HI = BM + BS \\quad , \\quad RL_{station} = HI - SIGHT',
    explanation: 'The Height of Instrument (HI) method establishes the elevation of the line of sight by referencing a known benchmark elevation (BM) and backsight (BS), allowing subsequent calculations of station Reduced Levels (RL) using Foresights or Intermediate Sights.',
    steps: [
      'Record the elevation of the known Benchmark (BM).',
      'Add the Backsight (BS) rod reading to obtain the Height of Instrument: HI = BM + BS.',
      'Obtain the Reduced Level (RL) of other locations by subtracting the station rod reading: RL = HI - FS (for Foresight) or RL = HI - IS (for Intermediate Sight).',
      'Determine the difference in elevation between stations or overall vertical elevation delta.'
    ]
  },
  'survey-coordinate': {
    id: 'survey-coordinate',
    latex: 'N_{new} = N_{start} + D \\cos(\\theta) \\quad , \\quad E_{new} = E_{start} + D \\sin(\\theta)',
    explanation: 'Compass layout traversing evaluates new coord positions based on baseline reference points, horizontal distance D, and bearing theta.',
    steps: [
      'Establish starting Northing (N) and Easting (E) benchmark coordinates.',
      'Input traverse bearing angle (theta) and horizontal distance (D).',
      'Evaluate Northing change (Latitude): dN = D * cos(theta).',
      'Evaluate Easting change (Departure): dE = D * sin(theta).',
      'Integrate the new position coordinates and calculate elevation changes with vertical curves.'
    ]
  },
  'steel-calculator': {
    id: 'steel-calculator',
    latex: 'Mass = Volume \\times Density \\quad [\\rho = 7850\\text{ kg/m}^3]',
    explanation: 'Estimates the weight of structural steel bars, plates, beams, or hollow tubes using accurate geometric equations and material density constants.',
    steps: [
      'Select steel profile section (Plate, Circular rod, Pipe, or H-Beam profile).',
      'Retrieve cross-sectional dimensions (thickness, width, outer diameter, web/flange structures).',
      'Find the sectional area and structural volume based on section length.',
      'Multiply by standard alloy steel density (7850 kg/m³ or 490 lbs/ft³) to calculate unit and total weights.'
    ]
  },
  'rebar-calculator': {
    id: 'rebar-calculator',
    latex: 'Weight_{total} = L_{total} \\times \\frac{\\pi d^2}{4} \\times \\rho_{steel}',
    explanation: 'Calculates the reinforcing steel requirements including spacing, splice overlap corrections, unit grade weights, and overall quantity.',
    steps: [
      'Input element overall structural span and clear concrete cover clearances.',
      'Determine layout direction bar spacing requirements.',
      'Add overlap lap ratios (typically 40D to 50D splice length) for spans exceeding raw rod lengths.',
      'Translate structural lengths into unit weights (kg/m or lbs/ft) based on nominal bar sizes.'
    ]
  },
  'brick-calculator': {
    id: 'brick-calculator',
    latex: 'Bricks = \\frac{V_{wall}}{V_{brick+joint}} \\times (1 + Waste\\%)',
    explanation: 'Estimates standard clay bricks, mortar volume, sand weight, and cement bags required for masonry wall assemblies.',
    steps: [
      'Find wall dimensions: length, height, and brick row thickness.',
      'Configure brick size inputs and mortar joint bedding thicknesses (typically 10mm or 0.4 inches).',
      'Calculate total wall volume and subtract raw brick content to isolate the mortar volume.',
      'Formulate required dry sand, dry cement bags (using typical density values) from mix ratios (e.g. 1:4).'
    ]
  }
};
