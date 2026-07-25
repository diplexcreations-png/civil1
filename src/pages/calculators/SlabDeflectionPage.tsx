import CalculatorPageShell from './CalculatorPageShell';

const TITLE = 'Slab Deflection Thickness Estimator';
const DESC = 'Free one-way concrete slab minimum thickness calculator per ACI code. Determines required slab depth for simply supported, continuous, and cantilever spans based on deflection control limits without complex structural analysis.';

export default function SlabDeflectionPage() {
  return (
    <CalculatorPageShell
      calculatorId="structural-slab"
      category="structural"
      path="/structural/slab"
      title={TITLE}
      description={DESC}
      breadcrumbLabel="Slab Deflection"
      faqs={[
        { question: 'What span conditions are supported?', answer: 'The calculator supports four boundary conditions: simply supported (span/20), one end continuous (span/24), both ends continuous (span/28), and cantilever (span/10).' },
        { question: 'How does steel grade affect the thickness?', answer: 'The minimum thickness formula includes a modification factor of (0.4 + fy/700) for ACI code compliance. Higher strength steel allows slightly thinner slabs.' },
        { question: 'Is this for one-way or two-way slabs?', answer: 'This calculator is designed for one-way slabs where the long-span to short-span ratio exceeds 2.0. For two-way slabs, both span directions should be considered.' },
      ]}
    />
  );
}
