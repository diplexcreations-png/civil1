import CalculatorPageShell from './CalculatorPageShell';

const TITLE = 'Concrete Column Design Calculator (ACI 318)';
const DESC = 'Free short reinforced concrete column axial capacity calculator per ACI 318-19. Computes nominal axial load capacity (Pn), factored design capacity (φPn), steel reinforcement ratio, and checks code limits for tied rectangular columns.';

export default function ColumnDesignPage() {
  return (
    <CalculatorPageShell
      calculatorId="structural-column"
      category="structural"
      path="/structural/column"
      title={TITLE}
      description={DESC}
      breadcrumbLabel="Column Design"
      faqs={[
        { question: 'What column types are supported?', answer: 'This calculator handles short rectangular tied columns under axial compression per ACI 318-19. It supports square and rectangular cross sections with any number of longitudinal bars.' },
        { question: 'How is the steel ratio verified?', answer: 'The reinforcement ratio ρ = Ast/Ag is calculated and checked against ACI code limits: minimum 1% and maximum 8%. Warnings are shown if the ratio falls outside these bounds.' },
        { question: 'What safety factors are applied?', answer: 'The design capacity φPn applies a strength reduction factor φ = 0.65 for tied columns with an additional 0.80 factor for axial-only loading per ACI 318-19 Section 22.4.2.' },
      ]}
    />
  );
}
